import { useRef, useCallback } from 'react'
import { IMAGE_ROLES, IMAGE_QUESTIONS } from '../data/questions'
import { supabase } from '../lib/supabase'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

async function callGroq(system, user, temp = 0.75) {
  const key = import.meta.env.VITE_GROQ_KEY
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: GROQ_MODEL, temperature: temp, max_tokens: 2000,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) }
  catch { return null }
}

const IMAGE_SYSTEM_PROMPT = `Kamu adalah world-class image prompt engineer yang sangat memahami Midjourney v6, DALL-E 3, Stable Diffusion XL, dan Flux.

Tugasmu: buat satu IMAGE PROMPT yang PANJANG, KAYA, dan SIAP PAKAI di tool apapun.

ATURAN WAJIB:
- Prompt WAJIB dalam bahasa INGGRIS
- Minimal 150-200 kata / keyword
- Struktur: Subject detail → Style & medium → Environment & setting → Lighting → Color palette → Mood & atmosphere → Technical quality → Camera/composition → Parameters
- Setiap elemen harus SPESIFIK — bukan "beautiful lighting" tapi "golden hour backlight with soft volumetric rays piercing through morning fog"
- Sertakan negative prompt yang komprehensif
- Sertakan tips singkat cara pakai

Balas HANYA JSON (no backticks, no preamble):
{
  "main_prompt": "extremely detailed prompt minimal 150 kata...",
  "negative_prompt": "comprehensive list of what to avoid...",
  "tips": "1-2 tips singkat dalam bahasa Indonesia cara optimal pakai prompt ini"
}`

export function useImageChat({ chatInnerRef, chatAreaRef, inputRef, toastRef, setConvHistory, setActiveConvId, user, saveHistoryToSupabase }) {
  const sessionRef    = useRef({ goal: '', role: null, answers: {}, step: 0 })
  const phaseRef      = useRef('welcome')
  const lastPromptRef = useRef('')

  const scrollBottom = useCallback(() => {
    setTimeout(() => { if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight }, 60)
  }, [chatAreaRef])

  const showToast = useCallback((msg) => {
    const t = toastRef.current; if (!t) return
    t.textContent = msg; t.classList.add('show')
    setTimeout(() => t.classList.remove('show'), 2500)
  }, [toastRef])

  const appendMsg = useCallback((role, html) => {
    const inner = chatInnerRef.current; if (!inner) return
    const div = document.createElement('div')
    div.className = `msg ${role}`
    div.innerHTML = `<div class="bubble">${html}</div>`
    inner.appendChild(div); scrollBottom()
  }, [chatInnerRef, scrollBottom])

  const showTyping = useCallback((delay = 750) => {
    const inner = chatInnerRef.current; if (!inner) return Promise.resolve()
    const el = document.createElement('div')
    el.className = 'msg bot'; el.id = 'typing-indicator'
    el.innerHTML = `<div class="bubble tp"><div class="dots"><span></span><span></span><span></span></div></div>`
    inner.appendChild(el); scrollBottom()
    return new Promise(r => setTimeout(r, delay))
  }, [chatInnerRef, scrollBottom])

  const removeTyping = useCallback(() => { document.getElementById('typing-indicator')?.remove() }, [])

  const disableOptions = useCallback(() => {
    document.querySelectorAll('.qa-btn:not([disabled])').forEach(b => {
      b.disabled = true; b.style.opacity = '0.3'; b.style.cursor = 'default'
    })
  }, [])

  // ─── WELCOME ───
  const renderWelcome = useCallback(() => {
    phaseRef.current = 'welcome'
    sessionRef.current = { goal: '', role: null, answers: {}, step: 0 }
    lastPromptRef.current = ''
    const inner = chatInnerRef.current; if (!inner) return
    inner.innerHTML = `
      <div class="welcome-block">
        <div class="welcome-q">Mau bikin prompt gambar apa hari ini?</div>
        <div class="welcome-hook">
          <span class="hook-stat">Prompt gambar yang buruk = hasil yang jauh dari ekspektasi.</span>
          Gw bantu lu bikin prompt yang <strong>detail, terstruktur, dan siap pakai</strong> di Midjourney, DALL-E, atau Stable Diffusion.
        </div>
        <div class="quick-pills">
          <button class="quick-pill" data-role="anime">Anime</button>
          <button class="quick-pill" data-role="realistic">Realistic</button>
          <button class="quick-pill" data-role="threed">3D Art Style</button>
          <button class="quick-pill" data-role="pemandangan">Pemandangan</button>
          <button class="quick-pill" data-role="kartun">Kartun</button>
          <button class="quick-pill" data-role="custom">Custom Style</button>
        </div>
      </div>`

    inner.querySelectorAll('.quick-pill[data-role]').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = IMAGE_ROLES.find(r => r.id === btn.dataset.role)
        if (!role) return
        sessionRef.current.role = role
        appendMsg('user', role.label)
        renderQuestion(0)
      })
    })
  }, [chatInnerRef, appendMsg])

  // ─── RENDER QUESTION ───
  const renderQuestion = useCallback((stepIdx) => {
    const inner = chatInnerRef.current; if (!inner) return
    const role = sessionRef.current.role
    const questions = IMAGE_QUESTIONS[role?.id] || IMAGE_QUESTIONS.custom
    if (stepIdx >= questions.length) { finishAndGenerate(); return }

    const q = questions[stepIdx]
    sessionRef.current.step = stepIdx
    disableOptions()

    const options = q.optionsFn ? q.optionsFn(sessionRef.current.answers) : q.options

    showTyping(600).then(() => {
      removeTyping()
      const msgDiv = document.createElement('div')
      msgDiv.className = 'msg bot'
      phaseRef.current = options ? 'questioning' : 'awaiting_manual'

      let optHtml = ''
      if (options) {
        optHtml = options.map((opt, i) => {
          const parts = opt.label.split(' \u2014 ')
          let title = parts[0] || opt.label
          title = title.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
          const sub   = parts[1] || ''
          return `<button class="sug-card qa-btn" data-val="${opt.value}" data-step="${stepIdx}">
            <span class="sug-num">0${i + 1}</span>
            <span class="sug-text">
              <span class="sug-title">${title}</span>
              ${sub ? `<span class="sug-sub">${sub}</span>` : ''}
            </span>
          </button>`
        }).join('')
        optHtml += `<button class="sug-card else-card qa-btn" data-val="__else__" data-step="${stepIdx}">
          <span class="sug-num">?</span>
          <span class="sug-text">Tulis sendiri...</span>
        </button>`
      }

      msgDiv.innerHTML = `
        <div class="bubble">${q.ask(sessionRef.current.answers)}</div>
        ${options ? `<div class="suggest-cards qa-options">${optHtml}</div>` : ''}`

      if (options) {
        msgDiv.querySelectorAll('.qa-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            if (btn.dataset.val === '__else__') {
              if (inputRef.current) { inputRef.current.placeholder = q.placeholder; inputRef.current.focus() }
              phaseRef.current = 'awaiting_manual'
            } else {
              msgDiv.querySelectorAll('.qa-btn').forEach(b => {
                b.disabled = true
                b.style.opacity = b === btn ? '1' : '0.3'
                b.style.cursor = 'default'
                if (b === btn) { b.style.borderColor = 'var(--accent)'; b.style.background = 'var(--accent-dim)' }
              })
              sessionRef.current.answers[q.id] = btn.dataset.val
              appendMsg('user', btn.dataset.val)
              renderQuestion(stepIdx + 1)
            }
          })
        })
      } else {
        if (inputRef.current) { inputRef.current.placeholder = q.placeholder; inputRef.current.focus() }
        phaseRef.current = 'awaiting_manual'
      }

      inner.appendChild(msgDiv); scrollBottom()
    })
  }, [chatInnerRef, scrollBottom, showTyping, removeTyping, disableOptions, inputRef, appendMsg])

  // ─── GENERATE IMAGE PROMPT ───
  const finishAndGenerate = useCallback(async () => {
    phaseRef.current = 'generating'
    const s = sessionRef.current

    await showTyping(500); removeTyping()
    appendMsg('bot', `Style <strong>${s.role?.label}</strong> terpilih! Gw lagi nge-reasoning prompt image terbaik pakai Llama 3.3...`)
    await showTyping(1400); removeTyping()

    const answersCtx = Object.entries(s.answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')

    const userCtx = `
Style yang dipilih: ${s.role?.label} (${s.role?.desc})
Tujuan/deskripsi awal: ${s.goal || 'tidak ada deskripsi awal'}
Detail jawaban:
${answersCtx}
    `.trim()

    try {
      const raw = await callGroq(IMAGE_SYSTEM_PROMPT, userCtx)
      const result = parseJSON(raw)
      if (result?.main_prompt) {
        lastPromptRef.current = result.main_prompt
        renderResult(result, s.goal || s.role?.label)
      } else {
        throw new Error('invalid result')
      }
    } catch {
      const fallback = buildFallbackPrompt(s)
      lastPromptRef.current = fallback
      renderResult({ main_prompt: fallback, negative_prompt: 'blurry, low quality, watermark, text', tips: 'Paste prompt ini langsung ke Midjourney atau DALL-E 3', for_tools: {} }, s.goal || s.role?.label)
    }
  }, [showTyping, removeTyping, appendMsg])

  const buildFallbackPrompt = (s) => {
    const a = s.answers
    return `${a.subject || 'beautiful scene'}, ${a.sub_style || s.role?.label + ' style'}, ${a.mood || 'cinematic atmosphere'}, ${a.lighting || 'dramatic lighting'}, ${a.quality || 'ultra detailed, 8K, masterpiece'}, ${a.ratio || '--ar 16:9'}`
  }

  // ─── RENDER RESULT ───
  const renderResult = useCallback((result, goal) => {
    const inner = chatInnerRef.current; if (!inner) return

    const id = Date.now()
    const ts = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const item = {
      id, icon: '🎨',
      label: goal || 'Image prompt',
      prompt: result.main_prompt,
      ts
    }
    
    setConvHistory(prev => [item, ...prev.slice(0, 19)])
    setActiveConvId(id)

    if (user && saveHistoryToSupabase) {
      saveHistoryToSupabase(item)
    }

    const div = document.createElement('div')
    div.className = 'msg bot'
    div.innerHTML = `
      <div class="bubble">Done! Prompt image siap — tinggal copas ke Midjourney, DALL-E, atau SD:</div>

      <div class="prompt-result">
        <div class="pr-label">IMAGE PROMPT — SIAP COPAS</div>
        <button class="pr-copy" id="copy-main">Copy ⌘</button>
        <div class="pr-text">${result.main_prompt}</div>
      </div>

      ${result.negative_prompt ? `
        <div class="prompt-result neg-prompt">
          <div class="pr-label">NEGATIF PROMPT</div>
          <button class="pr-copy" id="copy-neg">Copy ⌘</button>
          <div class="pr-text" style="color:var(--text-3);font-size:12px">${result.negative_prompt}</div>
        </div>` : ''}

      ${result.tips ? `
        <div class="img-tips">
          <span>${result.tips}</span>
        </div>` : ''}

      <div class="variant-section">
        <div class="variant-label">Mau variasi?</div>
        <div class="variant-cards">
          <button class="variant-card" id="var-enhance">
            <div class="vc-body"><div class="vc-title">Lebih Detail & Epic</div><div class="vc-desc">Tambah visual keywords, lighting lebih dramatis</div></div>
            <span class="vc-arrow">→</span>
          </button>
          <button class="variant-card" id="var-minimal">
            <div class="vc-body"><div class="vc-title">Versi Minimalis</div><div class="vc-desc">Esensial saja, max 30 kata tapi tetap punch</div></div>
            <span class="vc-arrow">→</span>
          </button>
          <button class="variant-card" id="var-different">
            <div class="vc-body"><div class="vc-title">Angle / Mood Berbeda</div><div class="vc-desc">Interpretasi yang unexpected tapi relevan</div></div>
            <span class="vc-arrow">→</span>
          </button>
        </div>
      </div>

      <div class="yn-row">
        <button class="yn-btn yes" id="img-new">Prompt baru</button>
        <button class="yn-btn" id="img-refine">Refine ini</button>
      </div>`

    div.querySelector('#copy-main')?.addEventListener('click', () =>
      navigator.clipboard.writeText(result.main_prompt).then(() => showToast('✓ Prompt di-copy!'))
    )
    div.querySelector('#copy-neg')?.addEventListener('click', () =>
      navigator.clipboard.writeText(result.negative_prompt || '').then(() => showToast('✓ Negative prompt di-copy!'))
    )
    div.querySelector('#var-enhance')?.addEventListener('click', () => generateVariant('enhance'))
    div.querySelector('#var-minimal')?.addEventListener('click', () => generateVariant('minimal'))
    div.querySelector('#var-different')?.addEventListener('click', () => generateVariant('different'))
    div.querySelector('#img-new')?.addEventListener('click', () => renderWelcome())
    div.querySelector('#img-refine')?.addEventListener('click', () => {
      appendMsg('bot', 'Mau direfine gimana? e.g. <em>"buat lebih gelap"</em> atau <em>"ganti jadi landscape"</em>')
      phaseRef.current = 'refine'
    })

    inner.appendChild(div); scrollBottom()
    phaseRef.current = 'done'
  }, [chatInnerRef, scrollBottom, showToast, setConvHistory, setActiveConvId, appendMsg])

  // ─── VARIANT GENERATOR ───
  const generateVariant = useCallback(async (type) => {
    phaseRef.current = 'generating'
    await showTyping(500); removeTyping()

    const labels = { enhance: 'Lebih Detail & Epic', minimal: 'Versi Minimalis', different: 'Angle Berbeda' }
    appendMsg('bot', `Generating variasi <strong>${labels[type]}</strong>...`)
    await showTyping(1200); removeTyping()

    const base = lastPromptRef.current
    const sysMap = {
      enhance:   `Kamu adalah image prompt engineer. Enhance prompt ini jadi jauh lebih detail, visual keywords lebih kaya, lighting lebih dramatis, detail environment dan texture yang spesifik. Minimal 2x lebih panjang. Balas HANYA JSON: {"prompt":"...","negative_prompt":"..."}`,
      minimal:   `Kamu adalah image prompt engineer. Buat versi MINIMALIS dari prompt ini — ambil elemen paling esensial saja, maksimal 30 kata, tapi tetap punch dan vivid. Balas HANYA JSON: {"prompt":"...","negative_prompt":"..."}`,
      different: `Kamu adalah image prompt engineer yang kreatif. Buat interpretasi BERBEDA dari prompt ini — angle tidak terduga, mood yang berkebalikan, atau style yang surprising tapi masih relevan. Balas HANYA JSON: {"prompt":"...","negative_prompt":"..."}`,
    }

    try {
      const raw = await callGroq(sysMap[type], `Base prompt:\n${base}`)
      const result = parseJSON(raw)
      const vp = result?.prompt || base
      lastPromptRef.current = vp

      const inner = chatInnerRef.current; if (!inner) return
      const div = document.createElement('div')
      div.className = 'msg bot'
      div.innerHTML = `
        <div class="bubble">✦ Ini <strong>${labels[type]}</strong>:</div>
        <div class="prompt-result">
          <div class="pr-label">${labels[type]}</div>
          <button class="pr-copy" id="vc">Copy ⌘</button>
          <div class="pr-text">${vp}</div>
        </div>
        ${result?.negative_prompt ? `
          <div class="prompt-result neg-prompt" style="margin-top:8px">
            <div class="pr-label">🚫 NEGATIVE PROMPT</div>
            <button class="pr-copy" id="vnc">Copy ⌘</button>
            <div class="pr-text" style="color:var(--text-3);font-size:12px">${result.negative_prompt}</div>
          </div>` : ''}
        <div class="yn-row" style="margin-top:10px">
          <button class="yn-btn yes" id="vn">Prompt baru</button>
          <button class="yn-btn" id="vr">Refine ini</button>
        </div>`
      div.querySelector('#vc')?.addEventListener('click', () => navigator.clipboard.writeText(vp).then(() => showToast('✓ Di-copy!')))
      div.querySelector('#vnc')?.addEventListener('click', () => navigator.clipboard.writeText(result?.negative_prompt || '').then(() => showToast('✓ Di-copy!')))
      div.querySelector('#vn')?.addEventListener('click', () => renderWelcome())
      div.querySelector('#vr')?.addEventListener('click', () => { appendMsg('bot', 'Mau diubah gimana?'); phaseRef.current = 'refine' })
      inner.appendChild(div); scrollBottom()
      phaseRef.current = 'done'
    } catch {
      appendMsg('bot', 'Error generating variasi, coba lagi!'); phaseRef.current = 'done'
    }
  }, [showTyping, removeTyping, appendMsg, chatInnerRef, scrollBottom, showToast])

  // ─── MAIN SEND ───
  const handleSend = useCallback(async () => {
    const input = inputRef.current; if (!input) return
    const text = input.value.trim(); if (!text) return
    input.value = ''; input.style.height = 'auto'
    input.placeholder = 'Ketik style atau deskripsi gambar lu...'
    appendMsg('user', text)
    const phase = phaseRef.current

    if (phase === 'welcome') {
      // cek apakah direct role id
      const directRole = IMAGE_ROLES.find(r => r.id === text)
      if (directRole) {
        sessionRef.current.role = directRole
        renderQuestion(0)
      } else {
        // free text → classify
        sessionRef.current.goal = text
        phaseRef.current = 'classifying'
        await showTyping(500); removeTyping()
        appendMsg('bot', 'Gw analisis style yang paling cocok... 🎨')
        await showTyping(800); removeTyping()
        try {
          const sys = `Classify teks user ke salah satu image style id: anime, realistic, threed, pemandangan, kartun, custom. Balas HANYA JSON: {"role_id":"..."}`
          const raw = await callGroq(sys, text, 0.3)
          const result = parseJSON(raw)
          const role = IMAGE_ROLES.find(r => r.id === result?.role_id) || IMAGE_ROLES[5]
          sessionRef.current.role = role
          appendMsg('bot', `Style yang cocok: <strong>${role.label}</strong>. Gw tanya beberapa hal dulu ya`)
          renderQuestion(0)
        } catch {
          sessionRef.current.role = IMAGE_ROLES[5] // custom
          renderQuestion(0)
        }
      }

    } else if (phase === 'awaiting_manual') {
      const role = sessionRef.current.role
      const questions = IMAGE_QUESTIONS[role?.id] || IMAGE_QUESTIONS.custom
      const q = questions[sessionRef.current.step]
      sessionRef.current.answers[q.id] = text
      disableOptions()
      renderQuestion(sessionRef.current.step + 1)

    } else if (phase === 'refine') {
      phaseRef.current = 'generating'
      const base = lastPromptRef.current
      await showTyping(900); removeTyping()
      try {
        const raw = await callGroq(
          `Kamu adalah image prompt engineer. Perbaiki prompt sesuai instruksi user. Tetap dalam bahasa Inggris, tetap vivid dan detail. Balas HANYA JSON: {"main_prompt":"...","negative_prompt":"...","tips":"...","for_tools":{}}`,
          `Prompt:\n${base}\n\nInstruksi: ${text}`
        )
        const result = parseJSON(raw)
        if (result?.main_prompt) {
          lastPromptRef.current = result.main_prompt
          renderResult(result, sessionRef.current.goal)
        } else throw new Error()
      } catch { appendMsg('bot', 'Error, coba lagi!'); phaseRef.current = 'refine' }

    } else {
      appendMsg('bot', 'Mau bikin image prompt baru? Klik <strong>🎨 Prompt baru</strong> atau ketik style yang lu mau!')
    }
  }, [inputRef, appendMsg, showTyping, removeTyping, disableOptions])

  // ─── LOAD HISTORY ───
  const loadHistory = useCallback((item) => {
    const inner = chatInnerRef.current; if (!inner) return
    inner.innerHTML = ''
    setActiveConvId(item.id)
    lastPromptRef.current = item.prompt || ''
    setTimeout(() => {
      appendMsg('bot', `Riwayat: <strong>${item.label}</strong> — ${item.ts}`)
      const div = document.createElement('div')
      div.className = 'msg bot'
      div.innerHTML = `
        <div class="prompt-result">
          <div class="pr-label">🎨 IMAGE PROMPT TERSIMPAN</div>
          <button class="pr-copy" id="hc">Copy ⌘</button>
          <div class="pr-text">${item.prompt || '-'}</div>
        </div>
        <div class="yn-row">
          <button class="yn-btn yes" id="hn">Prompt baru</button>
          <button class="yn-btn" id="hr">Refine ini</button>
        </div>`
      div.querySelector('#hc')?.addEventListener('click', () => navigator.clipboard.writeText(item.prompt || '').then(() => showToast('✓ Di-copy!')))
      div.querySelector('#hn')?.addEventListener('click', () => renderWelcome())
      div.querySelector('#hr')?.addEventListener('click', () => { appendMsg('bot', 'Mau diubah gimana?'); phaseRef.current = 'refine' })
      inner.appendChild(div); scrollBottom()
      phaseRef.current = 'done'
    }, 100)
  }, [chatInnerRef, scrollBottom, showToast, setActiveConvId, appendMsg])

  return { handleSend, renderWelcome, loadHistory, showToast }
}
