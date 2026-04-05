import { useRef, useCallback } from 'react'
import { VIDEO_ROLES, VIDEO_QUESTIONS } from '../data/questions'
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

const VIDEO_SYSTEM_PROMPT = `Kamu adalah world-class video prompt engineer yang sangat memahami Sora, Runway Gen-3, Kling AI, Pika Labs, dan Stable Video Diffusion.

Tugasmu: buat VIDEO PROMPT yang PANJANG, DETAIL, dan SIAP PAKAI di semua tool AI video generation.

ATURAN WAJIB:
- Prompt WAJIB dalam bahasa INGGRIS
- Minimal 150-200 kata
- Struktur wajib:
  1. Shot type & camera movement (specific, e.g. "slow dolly push-in")
  2. Subject & action (detailed character/object description + what they're doing)
  3. Environment & setting (specific location, time, weather)
  4. Lighting & color grade (specific lighting setup)
  5. Mood & atmosphere (emotional quality)
  6. Visual style & reference (film/director/aesthetic reference)
  7. Motion characteristics (speed, fluidity, energy)
  8. Technical specs (duration hint, fps feel, quality)
- Sertakan negative prompt
- Sertakan tips cara pakai di tool tertentu (Sora, Runway, Kling)

Balas HANYA JSON (no backticks):
{
  "main_prompt": "extremely detailed video prompt minimal 150 kata dalam bahasa Inggris...",
  "negative_prompt": "comprehensive list of what to avoid in the video...",
  "tips": "tips singkat dalam bahasa Indonesia cara optimal pakai prompt ini di Sora/Runway/Kling"
}`

export function useVideoChat({ chatInnerRef, chatAreaRef, inputRef, toastRef, setConvHistory, setActiveConvId, user }) {
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
        <div class="welcome-glyph">🎬</div>
        <div class="welcome-q">Mau bikin prompt video apa hari ini?</div>
        <div class="welcome-hook">
          <span class="hook-stat">Video AI butuh prompt yang sangat spesifik.</span>
          Gw bantu lu bikin prompt yang <strong>detail & siap pakai</strong> di Sora, Runway Gen-3, Kling AI, dan Pika Labs.
        </div>
        <div class="quick-pills">
          <button class="quick-pill" data-role="cinematic">🎬 Cinematic</button>
          <button class="quick-pill" data-role="anime_vid">🌸 Anime / Animated</button>
          <button class="quick-pill" data-role="music_vid">🎵 Music Video</button>
          <button class="quick-pill" data-role="nature_vid">🏔️ Nature / Timelapse</button>
          <button class="quick-pill" data-role="abstract">🌀 Abstract / Motion</button>
          <button class="quick-pill" data-role="custom_vid">✦ Custom / Bebas</button>
        </div>
      </div>`

    inner.querySelectorAll('.quick-pill[data-role]').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = VIDEO_ROLES.find(r => r.id === btn.dataset.role)
        if (!role) return
        sessionRef.current.role = role
        appendMsg('user', `${role.icon} ${role.label}`)
        renderQuestion(0)
      })
    })
  }, [chatInnerRef, appendMsg])

  // ─── RENDER QUESTION ───
  const renderQuestion = useCallback((stepIdx) => {
    const inner = chatInnerRef.current; if (!inner) return
    const role = sessionRef.current.role
    const questions = VIDEO_QUESTIONS[role?.id] || VIDEO_QUESTIONS.custom_vid
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
        optHtml = options.map((opt, i) =>
          `<button class="sug-card qa-btn" data-val="${opt.value}" data-step="${stepIdx}">
            <span class="sug-num">0${i + 1}</span>
            <span class="sug-text">${opt.label}</span>
          </button>`
        ).join('')
        optHtml += `<button class="sug-card else-card qa-btn" data-val="__else__" data-step="${stepIdx}">
          <span class="sug-num">✎</span>
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

  // ─── GENERATE ───
  const finishAndGenerate = useCallback(async () => {
    phaseRef.current = 'generating'
    const s = sessionRef.current

    await showTyping(500); removeTyping()
    appendMsg('bot', `Style <strong>${s.role?.icon} ${s.role?.label}</strong> terpilih! Gw lagi nge-reasoning video prompt terbaik pakai Llama 3.3... 🎬`)
    await showTyping(1400); removeTyping()

    const answersCtx = Object.entries(s.answers).map(([k, v]) => `${k}: ${v}`).join('\n')
    const userCtx = `
Video style: ${s.role?.label} (${s.role?.desc})
Deskripsi awal: ${s.goal || 'tidak ada'}
Detail:
${answersCtx}`.trim()

    try {
      const raw = await callGroq(VIDEO_SYSTEM_PROMPT, userCtx)
      const result = parseJSON(raw)
      if (result?.main_prompt) {
        lastPromptRef.current = result.main_prompt
        renderResult(result, s.goal || s.role?.label)
      } else throw new Error('invalid')
    } catch {
      const fallback = `${s.answers.shot_type || 'cinematic shot'}, ${s.answers.subject || 'beautiful scene'}, ${s.answers.mood || 'dramatic atmosphere'}, ${s.answers.lighting || 'cinematic lighting'}, ${s.role?.label || 'video'} style, ultra detailed, high quality, professional cinematography, 4K resolution, smooth camera movement`
      lastPromptRef.current = fallback
      renderResult({ main_prompt: fallback, negative_prompt: 'blurry, shaky, low quality, watermark, text overlay, static', tips: 'Paste prompt ini ke Runway Gen-3 atau Kling AI untuk hasil terbaik.' }, s.goal || s.role?.label)
    }
  }, [showTyping, removeTyping, appendMsg])

  // ─── RENDER RESULT ───
  const renderResult = useCallback((result, goal) => {
    const inner = chatInnerRef.current; if (!inner) return

    const id = Date.now()
    const ts = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const item = {
      id, icon: '🎬',
      label: goal || 'Video prompt',
      prompt: result.main_prompt,
      ts
    }

    setConvHistory(prev => [item, ...prev.slice(0, 19)])
    setActiveConvId(id)

    // Save to Supabase if logged in
    if (user) {
      supabase.from('prompt_history').insert({
        user_id: user.id,
        mode: 'video',
        label: item.label,
        prompt: item.prompt,
        icon: item.icon
      }).then(({ error }) => {
        if (error) console.error('Error saving to Supabase:', error)
      })
    }

    const div = document.createElement('div')
    div.className = 'msg bot'
    div.innerHTML = `
      <div class="bubble">✦ Done! Video prompt siap — tinggal copas ke Sora, Runway, Kling, atau Pika:</div>

      <div class="prompt-result">
        <div class="pr-label">🎬 VIDEO PROMPT — SIAP COPAS</div>
        <button class="pr-copy" id="copy-main">Copy ⌘</button>
        <div class="pr-text">${result.main_prompt}</div>
      </div>

      ${result.negative_prompt ? `
        <div class="prompt-result neg-prompt">
          <div class="pr-label">🚫 NEGATIVE PROMPT</div>
          <button class="pr-copy" id="copy-neg">Copy ⌘</button>
          <div class="pr-text" style="color:var(--text-3);font-size:12px">${result.negative_prompt}</div>
        </div>` : ''}

      ${result.tips ? `
        <div class="img-tips">
          <span class="tips-icon">💡</span>
          <span>${result.tips}</span>
        </div>` : ''}

      <div class="variant-section">
        <div class="variant-label">🎲 Mau variasi?</div>
        <div class="variant-cards">
          <button class="variant-card" id="var-enhance">
            <span class="vc-icon">✨</span>
            <div class="vc-body"><div class="vc-title">Lebih Sinematik & Detail</div><div class="vc-desc">Tambah camera movement, lighting lebih dramatis</div></div>
            <span class="vc-arrow">→</span>
          </button>
          <button class="variant-card" id="var-short">
            <span class="vc-icon">⚡</span>
            <div class="vc-body"><div class="vc-title">Versi Pendek & Padat</div><div class="vc-desc">Untuk clip 5-15 detik, esensial saja</div></div>
            <span class="vc-arrow">→</span>
          </button>
          <button class="variant-card" id="var-different">
            <span class="vc-icon">🔄</span>
            <div class="vc-body"><div class="vc-title">Angle / Mood Berbeda</div><div class="vc-desc">Interpretasi kreatif yang unexpected</div></div>
            <span class="vc-arrow">→</span>
          </button>
        </div>
      </div>

      <div class="yn-row">
        <button class="yn-btn yes" id="vid-new">🎬 Prompt baru</button>
        <button class="yn-btn" id="vid-refine">✎ Refine ini</button>
      </div>`

    div.querySelector('#copy-main')?.addEventListener('click', () =>
      navigator.clipboard.writeText(result.main_prompt).then(() => showToast('✓ Prompt di-copy!'))
    )
    div.querySelector('#copy-neg')?.addEventListener('click', () =>
      navigator.clipboard.writeText(result.negative_prompt || '').then(() => showToast('✓ Negative prompt di-copy!'))
    )
    div.querySelector('#var-enhance')?.addEventListener('click', () => generateVariant('enhance'))
    div.querySelector('#var-short')?.addEventListener('click', () => generateVariant('short'))
    div.querySelector('#var-different')?.addEventListener('click', () => generateVariant('different'))
    div.querySelector('#vid-new')?.addEventListener('click', () => renderWelcome())
    div.querySelector('#vid-refine')?.addEventListener('click', () => {
      appendMsg('bot', 'Mau direfine gimana? e.g. <em>"buat lebih melankolis"</em> atau <em>"ganti jadi POV shot"</em>')
      phaseRef.current = 'refine'
    })

    inner.appendChild(div); scrollBottom()
    phaseRef.current = 'done'
  }, [chatInnerRef, scrollBottom, showToast, setConvHistory, setActiveConvId, appendMsg, renderWelcome])

  // ─── VARIANT ───
  const generateVariant = useCallback(async (type) => {
    phaseRef.current = 'generating'
    await showTyping(500); removeTyping()
    const labels = { enhance: '✨ Lebih Sinematik', short: '⚡ Versi Pendek', different: '🔄 Angle Berbeda' }
    appendMsg('bot', `Generating variasi <strong>${labels[type]}</strong>... 🎬`)
    await showTyping(1200); removeTyping()

    const base = lastPromptRef.current
    const sysMap = {
      enhance:   `Video prompt engineer. Enhance prompt ini jadi lebih sinematik: tambah camera movement spesifik, lighting setup detail, color grade reference, dan visual storytelling yang kuat. Minimal 2x lebih panjang. Balas HANYA JSON: {"prompt":"...","negative_prompt":"..."}`,
      short:     `Video prompt engineer. Buat versi PENDEK dari prompt ini untuk clip 5-15 detik — ambil elemen paling esensial dan visual yang paling impactful, max 50 kata tapi tetap specific. Balas HANYA JSON: {"prompt":"...","negative_prompt":"..."}`,
      different: `Video prompt engineer yang kreatif. Buat interpretasi BERBEDA — ubah shot type, mood yang berkebalikan, atau gaya sinematografi yang tidak terduga tapi masih relevan dengan tema. Balas HANYA JSON: {"prompt":"...","negative_prompt":"..."}`,
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
          <button class="yn-btn yes" id="vn">🎬 Prompt baru</button>
          <button class="yn-btn" id="vr">✎ Refine ini</button>
        </div>`
      div.querySelector('#vc')?.addEventListener('click', () => navigator.clipboard.writeText(vp).then(() => showToast('✓ Di-copy!')))
      div.querySelector('#vnc')?.addEventListener('click', () => navigator.clipboard.writeText(result?.negative_prompt || '').then(() => showToast('✓ Di-copy!')))
      div.querySelector('#vn')?.addEventListener('click', () => renderWelcome())
      div.querySelector('#vr')?.addEventListener('click', () => { appendMsg('bot', 'Mau diubah gimana?'); phaseRef.current = 'refine' })
      inner.appendChild(div); scrollBottom()
      phaseRef.current = 'done'
    } catch {
      appendMsg('bot', 'Error, coba lagi!'); phaseRef.current = 'done'
    }
  }, [showTyping, removeTyping, appendMsg, chatInnerRef, scrollBottom, showToast, renderWelcome])

  // ─── MAIN SEND ───
  const handleSend = useCallback(async () => {
    const input = inputRef.current; if (!input) return
    const text = input.value.trim(); if (!text) return
    input.value = ''; input.style.height = 'auto'
    input.placeholder = 'Ketik style atau deskripsi video lu...'
    appendMsg('user', text)
    const phase = phaseRef.current

    if (phase === 'welcome') {
      const directRole = VIDEO_ROLES.find(r => r.id === text)
      if (directRole) {
        sessionRef.current.role = directRole
        renderQuestion(0)
      } else {
        sessionRef.current.goal = text
        phaseRef.current = 'classifying'
        await showTyping(500); removeTyping()
        appendMsg('bot', 'Gw analisis style video yang paling cocok... 🎬')
        await showTyping(800); removeTyping()
        try {
          const sys = `Classify ke salah satu video style id: cinematic, anime_vid, music_vid, nature_vid, abstract, custom_vid. Balas HANYA JSON: {"role_id":"..."}`
          const raw = await callGroq(sys, text, 0.3)
          const result = parseJSON(raw)
          const role = VIDEO_ROLES.find(r => r.id === result?.role_id) || VIDEO_ROLES[5]
          sessionRef.current.role = role
          appendMsg('bot', `Style yang cocok: <strong>${role.icon} ${role.label}</strong> ✦`)
          renderQuestion(0)
        } catch {
          sessionRef.current.role = VIDEO_ROLES[5]
          renderQuestion(0)
        }
      }

    } else if (phase === 'awaiting_manual') {
      const role = sessionRef.current.role
      const questions = VIDEO_QUESTIONS[role?.id] || VIDEO_QUESTIONS.custom_vid
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
          `Video prompt engineer. Perbaiki prompt sesuai instruksi. Tetap English, tetap detail dan cinematic. Balas HANYA JSON: {"main_prompt":"...","negative_prompt":"...","tips":"..."}`,
          `Prompt:\n${base}\n\nInstruksi: ${text}`
        )
        const result = parseJSON(raw)
        if (result?.main_prompt) {
          lastPromptRef.current = result.main_prompt
          renderResult(result, sessionRef.current.goal)
        } else throw new Error()
      } catch { appendMsg('bot', 'Error, coba lagi!'); phaseRef.current = 'refine' }

    } else {
      appendMsg('bot', 'Mau bikin video prompt baru? Klik <strong>🎬 Prompt baru</strong> atau ketik style yang lu mau!')
    }
  }, [inputRef, appendMsg, showTyping, removeTyping, renderQuestion, disableOptions, renderResult, renderWelcome])

  // ─── LOAD HISTORY ───
  const loadHistory = useCallback((item) => {
    const inner = chatInnerRef.current; if (!inner) return
    inner.innerHTML = ''
    setActiveConvId(item.id)
    lastPromptRef.current = item.prompt || ''
    setTimeout(() => {
      appendMsg('bot', `📂 Riwayat: <strong>${item.label}</strong> — ${item.ts}`)
      const div = document.createElement('div')
      div.className = 'msg bot'
      div.innerHTML = `
        <div class="prompt-result">
          <div class="pr-label">🎬 VIDEO PROMPT TERSIMPAN</div>
          <button class="pr-copy" id="hc">Copy ⌘</button>
          <div class="pr-text">${item.prompt || '-'}</div>
        </div>
        <div class="yn-row">
          <button class="yn-btn yes" id="hn">🎬 Prompt baru</button>
          <button class="yn-btn" id="hr">✎ Refine ini</button>
        </div>`
      div.querySelector('#hc')?.addEventListener('click', () => navigator.clipboard.writeText(item.prompt || '').then(() => showToast('✓ Di-copy!')))
      div.querySelector('#hn')?.addEventListener('click', () => renderWelcome())
      div.querySelector('#hr')?.addEventListener('click', () => { appendMsg('bot', 'Mau diubah gimana?'); phaseRef.current = 'refine' })
      inner.appendChild(div); scrollBottom()
      phaseRef.current = 'done'
    }, 100)
  }, [chatInnerRef, scrollBottom, showToast, setActiveConvId, appendMsg, renderWelcome])

  return { handleSend, renderWelcome, loadHistory, showToast }
}
