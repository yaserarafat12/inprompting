import { useRef, useCallback } from 'react'
import { ROLES, ROLE_QUESTIONS, getSystemPrompt, CLASSIFY_PROMPT, IMAGE_ROLES, IMAGE_QUESTIONS, IMAGE_CLASSIFY_PROMPT } from '../data/questions'
import { supabase } from '../lib/supabase'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

async function callGroq(system, user, temp = 0.7) {
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

export function useChat({ chatInnerRef, chatAreaRef, inputRef, toastRef, setConvHistory, setActiveConvId, mode = 'text', user, saveHistoryToSupabase }) {
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
    const isImg = mode === 'image'
    
    inner.innerHTML = `
      <div class="welcome-block">
        <div class="welcome-q">Mau bikin prompt ${isImg ? 'gambar' : 'chat'} apa hari ini?</div>
        <div class="welcome-hook">
          <span class="hook-stat">Prompt yang buruk = output yang mengecewakan.</span>
          Riset menunjukkan prompt yang terstruktur menghasilkan output <strong>10× lebih relevan</strong>. Gw di sini buat bantu lu bikin yang terbaik.
        </div>
        <div class="quick-pills">
          ${isImg ? `
          <button class="quick-pill" data-q="Pemandangan alam epik cinematic">Pemandangan Epik</button>
          <button class="quick-pill" data-q="Karakter anime style Ghibli">Anime Ghibli</button>
          <button class="quick-pill" data-q="Foto portrait realistis 8k">Portrait Realistis</button>
          <button class="quick-pill" data-q="Render 3D cute clay style">3D Clay Art</button>
          ` : `
          <button class="quick-pill" data-q="bikin script YouTube">Script YouTube</button>
          <button class="quick-pill" data-q="bikin script TikTok">Script TikTok</button>
          <button class="quick-pill" data-q="tulis kode Python automation">Kode & Automation</button>
          <button class="quick-pill" data-q="analisis data atau kasus secara mendalam">Analisis Data & Kasus</button>
          <button class="quick-pill" data-q="copywriting untuk iklan atau email marketing">Iklan & Email Copy</button>
          <button class="quick-pill" data-q="rangkum atau jelaskan sesuatu dengan sederhana">Rangkum & Jelaskan</button>
          `}
        </div>
      </div>`
    inner.querySelectorAll('.quick-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        if (inputRef.current) inputRef.current.value = btn.dataset.q
        handleSend()
      })
    })
  }, [chatInnerRef, inputRef, mode])

  // ─── ROLE SELECTOR ───
  const renderRoleSelector = useCallback((suggestedId = null) => {
    phaseRef.current = 'role_select'
    const inner = chatInnerRef.current; if (!inner) return
    const activeRoles = mode === 'image' ? IMAGE_ROLES : ROLES

    const cardsHtml = activeRoles.map(r => `
      <button class="role-card${suggestedId === r.id ? ' suggested' : ''}" data-role="${r.id}">
        <div class="role-body">
          <div class="role-name">${r.label}</div>
          <div class="role-desc">${r.desc}</div>
        </div>
        ${suggestedId === r.id ? '<span class="role-badge">Disarankan</span>' : ''}
      </button>`).join('')

    const msgDiv = document.createElement('div')
    msgDiv.className = 'msg bot'
    msgDiv.innerHTML = `
      <div class="bubble">Pilih <strong>peran AI / style</strong> yang paling sesuai tujuan lu:</div>
      <div class="role-grid">${cardsHtml}</div>
      <div class="manual-hint">atau ketik peran/style custom di input bawah ↓</div>`

    msgDiv.querySelectorAll('.role-card').forEach(btn => {
      btn.addEventListener('click', () => {
        msgDiv.querySelectorAll('.role-card').forEach(b => { b.disabled = true; b.style.opacity = '0.3'; b.style.cursor = 'default' })
        btn.style.opacity = '1'; btn.style.borderColor = 'var(--accent)'; btn.style.background = 'var(--accent-dim)'
        const role = activeRoles.find(r => r.id === btn.dataset.role)
        sessionRef.current.role = role
        appendMsg('user', role.label)
        renderQuestion(0)
      })
    })
    inner.appendChild(msgDiv); scrollBottom()
  }, [chatInnerRef, scrollBottom, appendMsg, mode])

  // ─── RENDER QUESTION ───
  const renderQuestion = useCallback((stepIdx) => {
    const inner = chatInnerRef.current; if (!inner) return
    const role = sessionRef.current.role
    const activeQuestions = mode === 'image' ? IMAGE_QUESTIONS : ROLE_QUESTIONS
    const universalFallback = activeQuestions.universal || activeQuestions.custom || []
    const questions = activeQuestions[role?.id] || universalFallback

    if (stepIdx >= questions.length) { finishAndGenerate(); return }

    const q = questions[stepIdx]
    sessionRef.current.step = stepIdx
    disableOptions()

    const options = q.optionsFn ? q.optionsFn(sessionRef.current.answers) : q.options

    showTyping(650).then(() => {
      removeTyping()
      phaseRef.current = options ? 'questioning' : 'awaiting_manual'
      const msgDiv = document.createElement('div')
      msgDiv.className = 'msg bot'

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
          <span class="sug-num">?</span><span class="sug-text">Tulis sendiri...</span>
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
    const formulaStr = s.role?.formula ? `formula <strong>${s.role?.formula}</strong>` : `pendekatan <strong>Detailing</strong>`;
    appendMsg('bot', `Semua info lengkap! Reasoning dengan ${formulaStr} via Llama 3.3...`)
    await showTyping(1300); removeTyping()

    const activeRoles = mode === 'image' ? IMAGE_ROLES : ROLES
    const sysPrompt = getSystemPrompt(s.role || activeRoles[4], s.answers, mode)
    const userCtx = `Tujuan: "${s.goal}"\nRole/Style: ${s.role?.label}\n${Object.entries(s.answers).map(([k,v]) => `${k}: ${v}`).join('\n')}`

    try {
      const raw = await callGroq(sysPrompt, userCtx)
      const result = parseJSON(raw)
      const prompt = result?.main_prompt || buildFallback(s)
      lastPromptRef.current = prompt
      renderResult(prompt, s.goal)
    } catch {
      const prompt = buildFallback(s)
      lastPromptRef.current = prompt
      renderResult(prompt, s.goal)
    }
  }, [showTyping, removeTyping, appendMsg, mode])

  const buildFallback = (s) => {
    return `Kamu adalah ${s.role?.label || 'asisten'} profesional berpengalaman. Tugasmu adalah ${s.goal}. ${Object.values(s.answers).filter(Boolean).join('. ')}.`
  }

  // ─── RESULT ───
  const renderResult = useCallback((prompt, goal) => {
    const inner = chatInnerRef.current; if (!inner) return
    const id = Date.now()
    const ts = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const item = { id, icon: '✦', label: goal || 'Prompt baru', prompt, ts }

    setConvHistory(prev => [item, ...prev.slice(0, 19)])
    setActiveConvId(id)

    if (user && saveHistoryToSupabase) {
      saveHistoryToSupabase(item)
    }

    const div = document.createElement('div')
    div.className = 'msg bot'
    div.innerHTML = `
      <div class="bubble">Done! Prompt siap — copas ke AI manapun:</div>
      <div class="prompt-result">
        <div class="pr-label">PROMPT SIAP PAKAI</div>
        <button class="pr-copy">Copy ⌘</button>
        <div class="pr-text">${prompt}</div>
      </div>
      <div class="variant-section">
        <div class="variant-label">Mau versi berbeda?</div>
        <div class="variant-cards">
          <button class="variant-card" data-type="short"><div class="vc-body"><div class="vc-title">Singkat & Tajam</div><div class="vc-desc">Max 60 kata, to the point</div></div><span class="vc-arrow">→</span></button>
          <button class="variant-card" data-type="detailed"><div class="vc-body"><div class="vc-title">Super Detail</div><div class="vc-desc">Step-by-step, anti-pattern, standar kualitas</div></div><span class="vc-arrow">→</span></button>
          <button class="variant-card" data-type="creative"><div class="vc-body"><div class="vc-title">Kreatif & Eksploratif</div><div class="vc-desc">Angle tidak terduga, push the boundaries</div></div><span class="vc-arrow">→</span></button>
        </div>
      </div>
      <div class="yn-row">
        <button class="yn-btn yes" id="r-new">Prompt baru</button>
        <button class="yn-btn" id="r-refine">Refine ini</button>
      </div>`

    div.querySelector('.pr-copy')?.addEventListener('click', () =>
      navigator.clipboard.writeText(prompt).then(() => showToast('✓ Di-copy!'))
    )
    div.querySelectorAll('.variant-card').forEach(btn => {
      btn.addEventListener('click', () => generateVariant(btn.dataset.type))
    })
    div.querySelector('#r-new')?.addEventListener('click', () => renderWelcome())
    div.querySelector('#r-refine')?.addEventListener('click', () => {
      appendMsg('bot', 'Mau diubah gimana? Ketik instruksinya — e.g. <em>"buat lebih singkat"</em> atau <em>"tambah contoh konkret"</em>')
      phaseRef.current = 'refine'
    })
    inner.appendChild(div); scrollBottom()
    phaseRef.current = 'done'
  }, [chatInnerRef, scrollBottom, showToast, setConvHistory, setActiveConvId, appendMsg])

  // ─── VARIANT ───
  const generateVariant = useCallback(async (type) => {
    phaseRef.current = 'generating'
    await showTyping(500); removeTyping()
    const labels = { short: 'Singkat', detailed: 'Super Detail', creative: 'Kreatif' }
    appendMsg('bot', `Generating variasi <strong>${labels[type]}</strong>...`)
    await showTyping(1200); removeTyping()

    const base = lastPromptRef.current
    const sysMap = {
      short:    `Buat versi SUPER RINGKAS — maksimal 60 kata, setiap kata earn its place, tetap actionable. Balas HANYA JSON: {"prompt":"..."}`,
      detailed: `Enhance prompt ini jadi SUPER DETAIL: instruksi step-by-step, anti-pattern yang harus dihindari, standar kualitas, contoh konkret. Minimal 200 kata. Balas HANYA JSON: {"prompt":"..."}`,
      creative: `Buat versi KREATIF dengan angle tidak terduga, metafora kuat, atau pendekatan counterintuitive. Minimal 100 kata. Balas HANYA JSON: {"prompt":"..."}`,
    }
    try {
      const raw = await callGroq(sysMap[type], `Prompt dasar:\n${base}`)
      const result = parseJSON(raw)
      const vp = result?.prompt || base
      lastPromptRef.current = vp
      renderVariantResult(vp, type)
    } catch { renderVariantResult(base, type) }
  }, [showTyping, removeTyping, appendMsg])

  const renderVariantResult = useCallback((prompt, type) => {
    const inner = chatInnerRef.current; if (!inner) return
    const labels = { short: 'Versi Singkat', detailed: 'Versi Super Detail', creative: 'Versi Kreatif' }
    const div = document.createElement('div')
    div.className = 'msg bot'
    div.innerHTML = `
      <div class="bubble">Ini <strong>${labels[type]}</strong>:</div>
      <div class="prompt-result">
        <div class="pr-label">${labels[type]}</div>
        <button class="pr-copy">Copy ⌘</button>
        <div class="pr-text">${prompt}</div>
      </div>
      <div class="yn-row">
        <button class="yn-btn yes" id="vr-new">Prompt baru</button>
        <button class="yn-btn" id="vr-refine">Refine ini</button>
      </div>`
    div.querySelector('.pr-copy')?.addEventListener('click', () =>
      navigator.clipboard.writeText(prompt).then(() => showToast('✓ Di-copy!'))
    )
    div.querySelector('#vr-new')?.addEventListener('click', () => renderWelcome())
    div.querySelector('#vr-refine')?.addEventListener('click', () => {
      lastPromptRef.current = prompt
      appendMsg('bot', 'Mau diubah gimana?')
      phaseRef.current = 'refine'
    })
    inner.appendChild(div); scrollBottom()
    phaseRef.current = 'done'
  }, [chatInnerRef, scrollBottom, showToast, appendMsg])

  // ─── MAIN SEND ───
  const handleSend = useCallback(async () => {
    const input = inputRef.current; if (!input) return
    const text = input.value.trim(); if (!text) return
    input.value = ''; input.style.height = 'auto'
    input.placeholder = 'Ketik tujuan lu di sini...'
    appendMsg('user', text)
    const phase = phaseRef.current

    if (phase === 'welcome') {
      sessionRef.current.goal = text
      phaseRef.current = 'classifying'
      await showTyping(400); removeTyping()
      appendMsg('bot', 'Gw analisis tujuan lu...')
      await showTyping(900); removeTyping()
      
      const activeRoles = mode === 'image' ? IMAGE_ROLES : ROLES
      const activeClassifyPrompt = mode === 'image' ? IMAGE_CLASSIFY_PROMPT : CLASSIFY_PROMPT

      const classified = await callGroq(activeClassifyPrompt, text, 0.3).then(r => parseJSON(r)).catch(() => null)
      if (classified?.role_id && classified.confidence !== 'low') {
        if (classified.pre_answers) Object.assign(sessionRef.current.answers, classified.pre_answers)
        const found = activeRoles.find(r => r.id === classified.role_id)
        if (found) appendMsg('bot', `${classified.reasoning || ''} Gw saranin role/style <strong>${found.label}</strong>.`)
        renderRoleSelector(classified.role_id)
      } else {
        renderRoleSelector(null)
      }

    } else if (phase === 'awaiting_manual') {
      const role = sessionRef.current.role
      const activeQuestions = mode === 'image' ? IMAGE_QUESTIONS : ROLE_QUESTIONS
      const universalFallback = activeQuestions.universal || activeQuestions.custom || []
      const questions = activeQuestions[role?.id] || universalFallback
      const q = questions[sessionRef.current.step]
      sessionRef.current.answers[q.id] = text
      disableOptions()
      renderQuestion(sessionRef.current.step + 1)

    } else if (phase === 'role_select') {
      const customRole = { id: 'universal', icon: '✦', label: text, desc: 'Custom', formula: 'CREATE' }
      sessionRef.current.role = customRole
      appendMsg('bot', `Oke, AI jadi <strong>${text}</strong>!`)
      renderQuestion(0)

    } else if (phase === 'refine') {
      phaseRef.current = 'generating'
      const base = lastPromptRef.current
      await showTyping(900); removeTyping()
      try {
        const raw = await callGroq(
          `Prompt engineer. Perbaiki prompt sesuai instruksi. Tetap kaya dan natural, minimal 80 kata. Balas HANYA JSON: {"main_prompt":"..."}`,
          `Prompt:\n${base}\n\nInstruksi: ${text}`
        )
        const result = parseJSON(raw)
        const refined = result?.main_prompt || base
        lastPromptRef.current = refined
        renderResult(refined, sessionRef.current.goal)
      } catch { appendMsg('bot', 'Error nih, coba lagi!'); phaseRef.current = 'refine' }

    } else {
      appendMsg('bot', 'Mau bikin prompt baru? Klik <strong>✦ Prompt baru</strong> atau ketik tujuan lu!')
    }
  }, [inputRef, appendMsg, showTyping, removeTyping, disableOptions, mode])

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
          <div class="pr-label">PROMPT TERSIMPAN</div>
          <button class="pr-copy">Copy ⌘</button>
          <div class="pr-text">${item.prompt || '-'}</div>
        </div>
        <div class="yn-row">
          <button class="yn-btn yes" id="hl-new">Prompt baru</button>
          <button class="yn-btn" id="hl-refine">Refine ini</button>
        </div>`
      div.querySelector('.pr-copy')?.addEventListener('click', () =>
        navigator.clipboard.writeText(item.prompt || '').then(() => showToast('✓ Di-copy!'))
      )
      div.querySelector('#hl-new')?.addEventListener('click', () => renderWelcome())
      div.querySelector('#hl-refine')?.addEventListener('click', () => {
        appendMsg('bot', 'Mau diubah gimana?'); phaseRef.current = 'refine'
      })
      inner.appendChild(div); scrollBottom()
      phaseRef.current = 'done'
    }, 100)
  }, [chatInnerRef, scrollBottom, showToast, setActiveConvId, appendMsg])

  return { handleSend, renderWelcome, loadHistory, showToast, sessionRef, phaseRef, lastPromptRef, appendMsg }
}
