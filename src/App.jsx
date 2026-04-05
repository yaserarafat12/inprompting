import { useState, useRef, useEffect, useCallback } from 'react'
import './index.css'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

async function callGroq(systemPrompt, userPrompt) {
  const key = import.meta.env.VITE_GROQ_KEY
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: GROQ_MODEL, temperature: 0.75, max_tokens: 2000,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ─── TEMPLATE LIBRARY ───
const TEMPLATE_LIBRARY = [
  { id: 'yt-detective', icon: '🕵️', cat: 'YouTube', name: 'Script YouTube — True Crime', desc: 'Narasi investigatif yang bikin penonton gabisa skip', prompt: 'Kamu adalah narator true crime berpengalaman dengan gaya penceritaan yang sinematik dan menegangkan. Tugasmu adalah menulis script YouTube untuk episode Detektif Malam yang membahas kasus kriminal nyata. Mulai dengan hook yang langsung menarik perhatian dalam 10 detik pertama — jangan basa-basi. Gunakan ritme narasi yang naik-turun: tegang, lalu ada momen refleksi, lalu twist. Bahasa harus vivid, bikin penonton bisa "ngebayangin" kejadiannya. Sertakan transisi antar segmen yang natural. Target durasi 10-15 menit, format script dengan timestamp setiap 2-3 menit.' },
  { id: 'yt-edutainment', icon: '🎓', cat: 'YouTube', name: 'Script YouTube — Edutainment', desc: 'Bikin konten edukatif yang ga ngebosenin', prompt: 'Kamu adalah content creator edutainment yang ahli mengubah topik kompleks menjadi konten yang mudah dicerna dan menghibur. Tugasmu adalah menulis script YouTube yang menjelaskan konsep dengan analogi sehari-hari, humor ringan, dan storytelling yang engaging. Struktur: hook 15 detik → setup masalah → penjelasan step-by-step dengan analogi → kesimpulan actionable → CTA. Gunakan bahasa yang conversational, seperti ngobrol dengan teman yang pintar. Hindari jargon tanpa penjelasan.' },
  { id: 'tiktok-hook', icon: '⚡', cat: 'TikTok', name: 'Hook TikTok 3 Detik', desc: 'Opening yang bikin orang berhenti scroll', prompt: 'Kamu adalah spesialis hook konten pendek yang memahami psikologi scroll-stopping. Tugasmu adalah membuat opening 3-5 detik pertama yang membuat siapapun berhenti scroll. Gunakan salah satu formula: pertanyaan provokatif, statement kontroversial, atau reveal mengejutkan. Setelah hook, tulis body konten max 45 detik yang deliver value atau entertainment. Tutup dengan CTA yang terasa natural bukan memaksa. Bahasa Gen Z Indonesia yang gaul tapi informatif.' },
  { id: 'tiktok-storytelling', icon: '📖', cat: 'TikTok', name: 'TikTok Storytelling', desc: 'Format cerita yang bikin orang nonton sampai habis', prompt: 'Kamu adalah storyteller konten pendek yang ahli membangun ketegangan dalam format vertikal 60-90 detik. Gunakan struktur: setup (10 detik) → konflik/masalah (20 detik) → rising action (30 detik) → resolusi atau cliffhanger (10 detik). Setiap kalimat harus earn the next one — tidak ada kata yang terbuang. Tone disesuaikan dengan cerita. Untuk cliffhanger, arahkan ke part 2.' },
  { id: 'ig-caption', icon: '📸', cat: 'Instagram', name: 'Caption Instagram Engaging', desc: 'Caption yang bikin orang stop, baca, dan comment', prompt: 'Kamu adalah copywriter Instagram yang memahami algoritma engagement dan psikologi pembaca. Tugasmu adalah menulis caption yang: baris pertama harus memaksa orang klik "more", body yang deliver value atau cerita relatable, dan closing dengan pertanyaan yang mendorong komentar organik. Gunakan spacing yang enak dibaca (bukan wall of text), emoji strategis bukan berlebihan, dan hashtag yang relevan di bagian paling bawah. Tone yang terasa authentic, bukan corporate.' },
  { id: 'copywriting-sales', icon: '💰', cat: 'Marketing', name: 'Copywriting Sales Page', desc: 'Copy yang convert visitor jadi buyer', prompt: 'Kamu adalah direct response copywriter kelas dunia yang memahami psikologi pembeli. Tugasmu adalah menulis sales copy menggunakan framework AIDA (Attention, Interest, Desire, Action) dengan sentuhan storytelling. Mulai dengan headline yang memukul pain point langsung. Bangun trust dengan social proof dan spesifisitas. Tangani objeksi sebelum pembaca sempat berpikir. Tutup dengan urgency yang genuine bukan manipulatif. Bahasa yang conversational dan human, hindari hyperbole yang tidak credible.' },
  { id: 'email-cold', icon: '📧', cat: 'Marketing', name: 'Cold Email yang Dibuka', desc: 'Email yang tidak langsung dibuang ke spam', prompt: 'Kamu adalah spesialis cold outreach dengan track record reply rate tinggi. Tugasmu adalah menulis cold email yang terasa personal bukan blast. Struktur: subject line yang spesifik dan curious-inducing → opening yang tunjukkan riset tentang mereka (bukan pujian generik) → value proposition dalam 1-2 kalimat yang jelas → social proof singkat → satu CTA yang low-commitment. Total maksimal 150 kata. Tone: percaya diri tapi tidak arrogant, helpful bukan needy.' },
  { id: 'python-clean', icon: '🐍', cat: 'Coding', name: 'Kode Python — Clean Code', desc: 'Kode yang bisa dibaca manusia, bukan hanya mesin', prompt: 'Kamu adalah senior Python engineer dengan standar code quality tinggi. Tugasmu adalah menulis kode Python yang bersih, efisien, dan maintainable. Ikuti prinsip: meaningful variable names, functions yang single-responsibility, error handling yang proper, dan komentar yang menjelaskan "mengapa" bukan "apa". Sertakan type hints, docstrings untuk fungsi utama, dan contoh penggunaan di bagian bawah. Jika ada pilihan antara clever dan clear, selalu pilih clear.' },
  { id: 'python-automation', icon: '🤖', cat: 'Coding', name: 'Script Python Automation', desc: 'Automasi tugas repetitif yang actually works', prompt: 'Kamu adalah Python automation specialist yang suka membuat hidup lebih efisien. Tugasmu adalah membuat script automation yang robust: handle edge cases, punya logging yang informatif, bisa di-run ulang tanpa masalah (idempotent), dan mudah di-modify orang lain. Sertakan config section di bagian atas yang mudah di-edit tanpa harus baca seluruh kode. Tambahkan progress indicator untuk task yang lama. Code harus production-ready, bukan prototype.' },
  { id: 'analyst-report', icon: '📊', cat: 'Analisis', name: 'Laporan Analisis Bisnis', desc: 'Insight yang actionable bukan sekedar data dump', prompt: 'Kamu adalah business analyst berpengalaman yang pandai mengubah data mentah menjadi insight strategis. Tugasmu adalah menulis laporan analisis yang: executive summary di awal (max 3 poin kunci), analisis mendalam dengan visualisasi data yang disarankan, identifikasi pattern dan anomali, serta rekomendasi yang spesifik dan dapat diimplementasikan. Bahasa yang presisi, hindari ambiguitas. Setiap klaim didukung data. Akhiri dengan next steps yang jelas.' },
  { id: 'detective-case', icon: '🔍', cat: 'Analisis', name: 'Analisis Kasus Investigatif', desc: 'Breakdown kasus dengan logika detektif', prompt: 'Kamu adalah investigator forensik berpengalaman dengan kemampuan analytical yang tajam. Tugasmu adalah menganalisis kasus atau situasi secara sistematis: identifikasi fakta yang confirmed vs assumed, susun timeline kejadian, analisis motif dan opportunity (jika relevan), identifikasi inconsistency atau red flags, dan buat conclusion berdasarkan evidence yang ada. Presentasikan seperti brief investigasi: terstruktur, objektif, dan setiap kesimpulan terhubung ke evidence spesifik.' },
  { id: 'image-prompt-realistic', icon: '🎨', cat: 'Image Prompt', name: 'Prompt Image — Realistic', desc: 'Untuk Midjourney, DALL-E, Stable Diffusion', prompt: 'Generate a photorealistic [subject] with cinematic lighting, shot on Sony A7 III, 85mm lens, f/1.8 aperture, golden hour lighting, ultra-detailed, 8K resolution, RAW photo quality, no artifacts, sharp focus on subject, bokeh background, color graded with slight warm tones, professional photography style.' },
  { id: 'image-prompt-anime', icon: '🌸', cat: 'Image Prompt', name: 'Prompt Image — Anime/Manhwa', desc: 'Style anime, manhwa, atau ilustrasi digital', prompt: 'High-quality 2D digital illustration, [character description] in the style of Solo Leveling manhwa crossed with Makoto Shinkai cinematic backgrounds, vibrant color palette with deep blues and warm oranges, detailed lineart, dynamic lighting with rim light effect, ethereal atmosphere, cel-shaded with subtle gradients, expressive eyes, intricate clothing details, epic composition, anime masterpiece quality.' },
]

const QUESTIONS = [
  { id: 'role', ask: (ctx) => `Oke, jadi lu mau <strong>${ctx.goal}</strong>.<br>Pertama — AI-nya lu mau jadi siapa?`, options: ['👨‍💻 Senior Developer', '✍️ Copywriter Pro', '🕵️ Detektif / Investigator', '📊 Business Analyst', '🎓 Dosen / Guru', '🎥 Content Creator'], placeholder: 'e.g. "fotografer profesional dengan 10 tahun pengalaman"' },
  { id: 'audience', ask: () => 'Siapa target audiens yang bakal baca atau terima output ini?', options: ['👶 Orang awam / pemula', '🧑‍💼 Profesional / expert', '🎓 Pelajar / mahasiswa', '📱 Gen Z / anak muda', '🏢 Tim bisnis / perusahaan'], placeholder: 'e.g. "ibu rumah tangga usia 30-45 tahun"' },
  { id: 'tone', ask: () => 'Tone / gaya bahasa yang lu pengen gimana?', options: ['💬 Santai & gaul', '📝 Formal & profesional', '🔥 Energik & persuasif', '🧘 Tenang & edukatif', '😄 Humoris & entertaining'], placeholder: 'e.g. "seperti teman ngobrol yang pintar"' },
  { id: 'constraint', ask: () => 'Ada batasan atau instruksi khusus?', options: ['📏 Maksimal 500 kata', '🚫 Jangan pakai jargon', '🔢 Sertakan data & angka', '❓ Tanya balik dulu sebelum nulis', '✅ Bebas, tidak ada batasan'], placeholder: 'e.g. "jangan pakai kata utilize, selalu pakai contoh nyata"' },
  { id: 'output', ask: () => 'Format output-nya lu mau gimana?', options: ['📄 Narasi mengalir', '• Bullet points', '🎬 Script + timestamp', '📊 Tabel perbandingan', '{ } JSON / terstruktur'], placeholder: 'e.g. "3 paragraf dengan heading dan sub-poin"' },
]

// Pertanyaan lanjutan per variasi
const VARIANT_QUESTIONS = {
  detailed: [
    { id: 'specifics', ask: () => 'Seberapa spesifik instruksinya? Tambah detail apa yang penting?', options: ['Sebutkan nama tools/platform spesifik', 'Tambah instruksi step-by-step', 'Sertakan contoh output yang ideal', 'Definisikan standar kualitas yang diinginkan'], placeholder: 'e.g. "gunakan React 18, TailwindCSS, dan pastikan accessible"' },
    { id: 'antipattern', ask: () => 'Apa yang TIDAK boleh dilakukan AI? (anti-pattern)', options: ['Jangan terlalu panjang / bertele-tele', 'Jangan pakai template generik', 'Jangan asumsikan tanpa konfirmasi', 'Jangan gunakan bahasa terlalu formal'], placeholder: 'e.g. "jangan pakai kata-kata hype yang tidak substantif"' },
  ],
  short: [
    { id: 'core', ask: () => 'Apa satu hal terpenting yang harus ada di output?', options: ['Hook yang kuat di awal', 'CTA yang jelas di akhir', 'Data / angka yang credible', 'Cerita / analogi yang relatable'], placeholder: 'e.g. "pastikan ada satu insight unik yang tidak semua orang tahu"' },
  ],
  creative: [
    { id: 'angle', ask: () => 'Angle kreatif apa yang mau lu eksplor?', options: ['Sudut pandang yang tidak biasa / counterintuitive', 'Gabungkan dua topik yang tidak terduga', 'Gunakan metafora atau dunia imajinatif', 'Provokasi / challenge conventional wisdom'], placeholder: 'e.g. "bahas dari perspektif villain atau antagonis"' },
    { id: 'boldness', ask: () => 'Seberapa bold dan eksperimental AI boleh berkreasi?', options: ['Sedikit bold — masih dalam zona aman', 'Cukup bold — surprise me tapi tetap relevan', 'Sangat bold — push the boundaries, gw siap dikejutkan'], placeholder: 'e.g. "boleh sangat eksperimental asal tetap deliver value"' },
  ],
}

function App() {
  const [view, setView] = useState('chat') // 'chat' | 'templates'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [templateCat, setTemplateCat] = useState('Semua')
  const [convHistory, setConvHistory] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)

  const sessionRef = useRef({ goal: '', answers: {}, step: -1, mainPrompt: '', variantType: null, variantStep: 0 })
  const chatInnerRef = useRef(null)
  const chatAreaRef = useRef(null)
  const inputRef = useRef(null)
  const toastRef = useRef(null)
  const phaseRef = useRef('welcome')
  const lastPromptRef = useRef('')
  const convIdRef = useRef(null)

  const cats = ['Semua', ...new Set(TEMPLATE_LIBRARY.map(t => t.cat))]

  const scrollBottom = useCallback(() => {
    setTimeout(() => { if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight }, 50)
  }, [])

  const showToast = useCallback((msg, color = 'var(--accent2)') => {
    const t = toastRef.current; if (!t) return
    t.textContent = msg; t.style.borderColor = color; t.style.color = color
    t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500)
  }, [])

  const appendMsg = useCallback((role, html) => {
    const inner = chatInnerRef.current; if (!inner) return
    const div = document.createElement('div')
    div.className = `msg ${role}`
    div.innerHTML = `<div class="bubble">${html}</div>`
    inner.appendChild(div); scrollBottom()
  }, [scrollBottom])

  const showTyping = useCallback((delay = 750) => {
    const inner = chatInnerRef.current; if (!inner) return Promise.resolve()
    const el = document.createElement('div')
    el.className = 'msg bot'; el.id = 'typing-indicator'
    el.innerHTML = `<div class="bubble tp"><div class="dots"><span></span><span></span><span></span></div></div>`
    inner.appendChild(el); scrollBottom()
    return new Promise(r => setTimeout(r, delay))
  }, [scrollBottom])

  const removeTyping = useCallback(() => { document.getElementById('typing-indicator')?.remove() }, [])

  const saveToHistory = useCallback((goal, prompt) => {
    const id = Date.now()
    convIdRef.current = id
    setActiveConvId(id)
    setConvHistory(prev => [{ id, icon: '✦', label: goal || 'Prompt baru', preview: prompt?.slice(0, 60) + '...', prompt, ts: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }, ...prev.slice(0, 19)])
  }, [])

  // ─── WELCOME ───
  const renderWelcome = useCallback(() => {
    phaseRef.current = 'welcome'
    sessionRef.current = { goal: '', answers: {}, step: -1, mainPrompt: '', variantType: null, variantStep: 0 }
    const inner = chatInnerRef.current; if (!inner) return
    inner.innerHTML = `
      <div class="welcome-block">
        <div class="welcome-glyph">✦</div>
        <div class="welcome-q">Mau bikin prompt apa hari ini?</div>
        <div class="welcome-sub">Gw bakal tanya beberapa hal — makin lengkap jawabannya, makin tajam promptnya.</div>
        <div class="quick-pills">
          <button class="quick-pill" data-q="script YouTube Detektif Malam">📹 Script YouTube</button>
          <button class="quick-pill" data-q="konten TikTok tentang soft skills">📱 TikTok / Reels</button>
          <button class="quick-pill" data-q="kode Python automation">🐍 Nulis Kode</button>
          <button class="quick-pill" data-q="analisis kasus kriminal">🔍 Analisis Kasus</button>
          <button class="quick-pill" data-q="caption Instagram yang engaging">📸 Caption IG</button>
          <button class="quick-pill" data-q="prompt image generator 2D high quality">🎨 Image Prompt</button>
        </div>
      </div>`
    inner.querySelectorAll('.quick-pill').forEach(btn => {
      btn.addEventListener('click', () => { if (inputRef.current) inputRef.current.value = btn.dataset.q; handleSend() })
    })
  }, [])

  useEffect(() => { renderWelcome() }, [])

  // ─── RENDER QUESTION ───
  const renderQuestion = useCallback((stepIdx, questions = QUESTIONS) => {
    const inner = chatInnerRef.current; if (!inner) return
    const q = questions[stepIdx]
    const ctx = sessionRef.current

    document.querySelectorAll('.qa-options .qa-btn').forEach(b => { b.disabled = true; b.style.opacity = '0.3'; b.style.cursor = 'default' })

    showTyping(650).then(() => {
      removeTyping()
      const msgDiv = document.createElement('div')
      msgDiv.className = 'msg bot'
      const optHtml = q.options.map((opt, i) =>
        `<button class="sug-card qa-btn" data-opt="${opt}" data-step="${stepIdx}">
          <span class="sug-num">0${i + 1}</span>
          <span class="sug-text">${opt}</span>
        </button>`
      ).join('')
      msgDiv.innerHTML = `
        <div class="bubble">${q.ask(ctx)}</div>
        <div class="qa-options suggest-cards">
          ${optHtml}
          <button class="sug-card else-card qa-btn" data-opt="__else__" data-step="${stepIdx}">
            <span class="sug-num">✎</span>
            <span class="sug-text">Tulis sendiri...</span>
          </button>
        </div>`
      msgDiv.querySelectorAll('.qa-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.opt === '__else__') {
            if (inputRef.current) { inputRef.current.placeholder = q.placeholder; inputRef.current.focus() }
            phaseRef.current = 'awaiting_custom'
          } else { handleOptionSelected(btn.dataset.opt, stepIdx, msgDiv, questions) }
        })
      })
      inner.appendChild(msgDiv); scrollBottom()
    })
  }, [showTyping, removeTyping, scrollBottom])

  const handleOptionSelected = useCallback((value, stepIdx, msgDiv, questions = QUESTIONS) => {
    msgDiv.querySelectorAll('.qa-btn').forEach(b => {
      b.disabled = true; b.style.cursor = 'default'
      b.style.opacity = b.dataset.opt === value ? '1' : '0.3'
      if (b.dataset.opt === value) { b.style.borderColor = 'var(--accent)'; b.style.background = 'rgba(124,106,247,0.12)' }
    })
    const qId = questions[stepIdx].id
    sessionRef.current.answers[qId] = value
    appendMsg('user', value)
    const nextStep = stepIdx + 1
    if (nextStep < questions.length) {
      sessionRef.current.step = nextStep
      renderQuestion(nextStep, questions)
    } else {
      if (sessionRef.current.variantType) {
        generateVariant(sessionRef.current.variantType)
      } else {
        finishAndGenerate()
      }
    }
  }, [appendMsg, renderQuestion])

  // ─── MAIN GENERATE ───
  const finishAndGenerate = useCallback(async () => {
    phaseRef.current = 'generating'
    const s = sessionRef.current
    await showTyping(500); removeTyping()
    appendMsg('bot', 'Mantap! Semua info udah gw dapet. Sekarang gw lagi nge-reasoning pakai Llama 3.3... ✦')
    await showTyping(1200); removeTyping()

    const ctx = `Tujuan: ${s.goal}\nRole: ${s.answers.role || '-'}\nAudiens: ${s.answers.audience || '-'}\nTone: ${s.answers.tone || '-'}\nBatasan: ${s.answers.constraint || '-'}\nFormat: ${s.answers.output || '-'}`
    const sys = `Kamu adalah expert prompt engineer kelas dunia. Buat PROMPT SIAP PAKAI yang kaya dan spesifik berdasarkan brief user. WAJIB:
- Tulis dalam paragraf mengalir, BUKAN tag [ROLE][TASK] yang kering
- Minimal 120 kata, kaya detail, terasa human-to-human
- Bahasa Indonesia sesuai tone yang dipilih
- Actionable dan langsung bisa di-copy ke AI manapun
Balas HANYA JSON (no backticks): {"main_prompt":"...","short":"versi ringkas 40-60 kata tapi tetap punch...","creative":"versi kreatif yang push boundaries, unexpected angle..."}`

    try {
      const raw = await callGroq(sys, ctx)
      const result = JSON.parse(raw.replace(/```json|```/g, '').trim())
      sessionRef.current.mainPrompt = result.main_prompt
      lastPromptRef.current = result.main_prompt
      renderFinalResult(result, s.goal)
    } catch (e) {
      const fallback = `Kamu adalah ${s.answers.role || 'asisten'} berpengalaman. Tugasmu adalah ${s.goal} untuk ${s.answers.audience || 'target audiens yang tepat'}. Gunakan gaya bahasa ${s.answers.tone || 'yang sesuai'}. ${s.answers.constraint !== '✅ Bebas, tidak ada batasan' ? 'Perhatikan: ' + s.answers.constraint + '.' : ''} Format output: ${s.answers.output || 'narasi mengalir'}.`
      sessionRef.current.mainPrompt = fallback
      lastPromptRef.current = fallback
      renderFinalResult({ main_prompt: fallback, short: fallback, creative: fallback }, s.goal)
    }
  }, [showTyping, removeTyping, appendMsg])

  // ─── GENERATE VARIANT dengan flow ───
  const startVariantFlow = useCallback((type) => {
    sessionRef.current.variantType = type
    sessionRef.current.variantStep = 0
    const questions = VARIANT_QUESTIONS[type]
    if (!questions || questions.length === 0) { generateVariant(type); return }

    const labels = { detailed: '🔬 Super Detail', short: '⚡ Singkat & Tajam', creative: '🎨 Kreatif & Eksploratif' }
    appendMsg('bot', `Oke, lu pilih variasi <strong>${labels[type]}</strong>. Gw perlu tau beberapa hal lagi biar hasilnya beneran sesuai ✦`)
    sessionRef.current.step = 0
    renderQuestion(0, questions)
    phaseRef.current = 'variant_questioning'
  }, [appendMsg, renderQuestion])

  const generateVariant = useCallback(async (type) => {
    phaseRef.current = 'generating'
    const s = sessionRef.current
    await showTyping(500); removeTyping()
    appendMsg('bot', 'Generating variasi yang lebih spesifik sesuai instruksi lu... ✦')
    await showTyping(1200); removeTyping()

    const basePrompt = lastPromptRef.current
    const extraAnswers = Object.entries(s.answers).filter(([k]) => !['role','audience','tone','constraint','output'].includes(k)).map(([k,v]) => `${k}: ${v}`).join('\n')

    const sysMap = {
      detailed: `Kamu adalah prompt engineer. Enhance prompt ini menjadi versi yang SANGAT DETAIL dan spesifik. Tambahkan: instruksi step-by-step, anti-pattern yang harus dihindari, standar kualitas yang jelas, dan contoh konkret. Minimal 200 kata. Balas HANYA JSON: {"variant_prompt":"...","variant_label":"🔬 Versi Super Detail"}`,
      short: `Kamu adalah prompt engineer. Buat versi SUPER RINGKAS dari prompt ini — maksimal 60 kata tapi tetap punch dan actionable. Setiap kata harus earn its place. Balas HANYA JSON: {"variant_prompt":"...","variant_label":"⚡ Versi Singkat & Tajam"}`,
      creative: `Kamu adalah prompt engineer yang suka eksplor angle tidak terduga. Buat versi KREATIF dari prompt ini dengan: sudut pandang unik, metafora yang kuat, atau pendekatan counterintuitive. Push the boundaries sambil tetap deliver value. Minimal 100 kata. Balas HANYA JSON: {"variant_prompt":"...","variant_label":"🎨 Versi Kreatif & Eksploratif"}`,
    }

    try {
      const raw = await callGroq(sysMap[type], `Prompt dasar:\n${basePrompt}\n\nInstruksi tambahan dari user:\n${extraAnswers || 'Tidak ada instruksi tambahan'}`)
      const result = JSON.parse(raw.replace(/```json|```/g, '').trim())
      renderVariantResult(result.variant_prompt, result.variant_label)
    } catch (e) {
      renderVariantResult(basePrompt, 'Variasi')
    }
    sessionRef.current.variantType = null
  }, [showTyping, removeTyping, appendMsg])

  const renderVariantResult = useCallback((prompt, label) => {
    const inner = chatInnerRef.current; if (!inner) return
    const div = document.createElement('div')
    div.className = 'msg bot'
    div.innerHTML = `
      <div class="bubble">✦ Ini <strong>${label}</strong> yang udah gw enhance:</div>
      <div class="prompt-result">
        <div class="pr-label">${label}</div>
        <button class="pr-copy">Copy ⌘</button>
        <div class="pr-text">${prompt}</div>
      </div>
      <div class="yn-row" style="margin-top:10px">
        <button class="yn-btn yes" id="newchat-v">✦ Prompt baru</button>
        <button class="yn-btn" id="back-main">← Kembali ke prompt utama</button>
      </div>`
    div.querySelector('.pr-copy')?.addEventListener('click', () => navigator.clipboard.writeText(prompt).then(() => showToast('✓ Variasi di-copy!')))
    div.querySelector('#newchat-v')?.addEventListener('click', () => renderWelcome())
    div.querySelector('#back-main')?.addEventListener('click', () => {
      appendMsg('bot', 'Oke, kita balik ke prompt utama. Mau refine atau buat yang baru?')
      phaseRef.current = 'done'
    })
    inner.appendChild(div); scrollBottom()
    phaseRef.current = 'done'
  }, [showToast, scrollBottom, renderWelcome, appendMsg])

  // ─── RENDER FINAL RESULT ───
  const renderFinalResult = useCallback((result, goal) => {
    const inner = chatInnerRef.current; if (!inner) return
    saveToHistory(goal, result.main_prompt)

    const div = document.createElement('div')
    div.className = 'msg bot'
    div.innerHTML = `
      <div class="bubble">✦ Done! Prompt siap dipakai — tinggal copas ke AI manapun:</div>
      <div class="prompt-result">
        <div class="pr-label">✦ PROMPT UTAMA</div>
        <button class="pr-copy">Copy ⌘</button>
        <div class="pr-text">${result.main_prompt}</div>
      </div>
      <div class="variant-section">
        <div class="variant-label">🎲 Mau versi yang berbeda? Pilih variasi:</div>
        <div class="variant-cards">
          <button class="variant-card" data-type="short">
            <span class="vc-icon">⚡</span>
            <div class="vc-body">
              <div class="vc-title">Singkat & Tajam</div>
              <div class="vc-desc">Max 60 kata, langsung to the point</div>
            </div>
            <span class="vc-arrow">→</span>
          </button>
          <button class="variant-card" data-type="detailed">
            <span class="vc-icon">🔬</span>
            <div class="vc-body">
              <div class="vc-title">Super Detail</div>
              <div class="vc-desc">Step-by-step, anti-pattern, standar kualitas</div>
            </div>
            <span class="vc-arrow">→</span>
          </button>
          <button class="variant-card" data-type="creative">
            <span class="vc-icon">🎨</span>
            <div class="vc-body">
              <div class="vc-title">Kreatif & Eksploratif</div>
              <div class="vc-desc">Angle tidak terduga, push the boundaries</div>
            </div>
            <span class="vc-arrow">→</span>
          </button>
        </div>
      </div>
      <div class="yn-row" style="margin-top:4px">
        <button class="yn-btn yes" id="newchat-btn">✦ Prompt baru</button>
        <button class="yn-btn" id="refine-btn">✎ Refine prompt ini</button>
      </div>`

    div.querySelector('.pr-copy')?.addEventListener('click', () => navigator.clipboard.writeText(result.main_prompt).then(() => showToast('✓ Prompt di-copy!')))
    div.querySelectorAll('.variant-card').forEach(btn => {
      btn.addEventListener('click', () => startVariantFlow(btn.dataset.type))
    })
    div.querySelector('#newchat-btn')?.addEventListener('click', () => renderWelcome())
    div.querySelector('#refine-btn')?.addEventListener('click', () => {
      appendMsg('bot', 'Oke, mau direfine gimana? Ketik instruksi perbaikannya — e.g. <em>"buat lebih singkat"</em>, <em>"tambah instruksi bahasa Inggris"</em>, atau <em>"fokus ke hook yang lebih kuat"</em>')
      phaseRef.current = 'refine'
    })

    inner.appendChild(div); scrollBottom()
    phaseRef.current = 'done'
  }, [showToast, scrollBottom, saveToHistory, startVariantFlow, renderWelcome, appendMsg])

  // ─── HANDLE SEND ───
  const handleSend = useCallback(() => {
    const input = inputRef.current; if (!input) return
    const text = input.value.trim(); if (!text) return
    input.value = ''; input.style.height = 'auto'
    input.placeholder = 'Ketik tujuan lu di sini...'
    appendMsg('user', text)
    const phase = phaseRef.current

    if (phase === 'welcome') {
      sessionRef.current.goal = text; sessionRef.current.step = 0
      phaseRef.current = 'questioning'; renderQuestion(0)
    } else if (phase === 'awaiting_custom') {
      const step = sessionRef.current.step
      const isVariant = sessionRef.current.variantType !== null
      const questions = isVariant ? VARIANT_QUESTIONS[sessionRef.current.variantType] : QUESTIONS
      const qId = questions[step].id
      sessionRef.current.answers[qId] = text
      phaseRef.current = isVariant ? 'variant_questioning' : 'questioning'
      const nextStep = step + 1
      if (nextStep < questions.length) { sessionRef.current.step = nextStep; renderQuestion(nextStep, questions) }
      else { isVariant ? generateVariant(sessionRef.current.variantType) : finishAndGenerate() }
    } else if (phase === 'refine') {
      phaseRef.current = 'generating'
      showTyping(900).then(async () => {
        removeTyping()
        try {
          const raw = await callGroq(`Kamu adalah prompt engineer. Perbaiki prompt sesuai instruksi user. Tetap kaya dan natural, minimal 80 kata. Balas HANYA JSON (no backticks): {"main_prompt":"...","short":"...","creative":"..."}`, `Prompt:\n${lastPromptRef.current}\n\nInstruksi: ${text}`)
          const result = JSON.parse(raw.replace(/```json|```/g, '').trim())
          lastPromptRef.current = result.main_prompt
          renderFinalResult(result, sessionRef.current.goal)
        } catch { appendMsg('bot', 'Error nih Ser, coba lagi ya!'); phaseRef.current = 'refine' }
      })
    } else {
      appendMsg('bot', 'Mau bikin prompt baru? Klik <strong>✦ Prompt baru</strong> atau ketik tujuan lu!')
    }
  }, [appendMsg, renderQuestion, finishAndGenerate, generateVariant, showTyping, removeTyping, renderFinalResult])

  const loadHistory = useCallback((item) => {
    setView('chat')
    const inner = chatInnerRef.current; if (!inner) return
    inner.innerHTML = ''
    setActiveConvId(item.id)
    setTimeout(() => {
      appendMsg('bot', `📂 Memuat riwayat: <strong>${item.label}</strong>`)
      const div = document.createElement('div')
      div.className = 'msg bot'
      div.innerHTML = `
        <div class="prompt-result">
          <div class="pr-label">✦ PROMPT TERSIMPAN</div>
          <button class="pr-copy">Copy ⌘</button>
          <div class="pr-text">${item.prompt || item.preview}</div>
        </div>
        <div class="yn-row" style="margin-top:10px">
          <button class="yn-btn yes" id="hist-new">✦ Prompt baru</button>
          <button class="yn-btn" id="hist-refine">✎ Refine ini</button>
        </div>`
      div.querySelector('.pr-copy')?.addEventListener('click', () => navigator.clipboard.writeText(item.prompt || '').then(() => showToast('✓ Di-copy!')))
      div.querySelector('#hist-new')?.addEventListener('click', () => renderWelcome())
      div.querySelector('#hist-refine')?.addEventListener('click', () => {
        lastPromptRef.current = item.prompt || ''
        appendMsg('bot', 'Oke, mau direfine gimana?'); phaseRef.current = 'refine'
      })
      inner.appendChild(div); scrollBottom()
      phaseRef.current = 'done'
    }, 100)
  }, [appendMsg, showToast, renderWelcome, scrollBottom])

  return (
    <>
      <div className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="logo">In<span>prompting</span></div>
          <button className="icon-btn-sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>☰</button>
        </div>
        <div className="sb-section">
          <button className="sb-item new-chat" onClick={() => { setView('chat'); renderWelcome() }}>
            <span className="sb-icon">✦</span><span className="sb-label">New Chat</span>
          </button>
        </div>
        <div className="sb-section">
          <div className="sb-section-label">MODE</div>
          <button className="sb-item active"><span className="sb-icon">✦</span><span className="sb-label">Text Prompting</span></button>
          <button className="sb-item"><span className="sb-icon">🖼</span><span className="sb-label">Image Prompting</span><span className="sb-badge">soon</span></button>
          <button className="sb-item"><span className="sb-icon">🎬</span><span className="sb-label">Video Prompting</span><span className="sb-badge">soon</span></button>
        </div>
        <div className="sb-section">
          <div className="sb-section-label">LIBRARY</div>
          <button className={`sb-item${view === 'templates' ? ' active' : ''}`} onClick={() => setView('templates')}>
            <span className="sb-icon">📚</span><span className="sb-label">Templates & Skills</span>
          </button>
        </div>
        <div className="sb-section" style={{ flex: 1, minHeight: 0 }}>
          <div className="sb-section-label">RIWAYAT</div>
          <div className="conv-scroll">
            {convHistory.length === 0
              ? <div className="conv-empty">Belum ada riwayat</div>
              : convHistory.map(item => (
                  <div key={item.id} className={`conv-item${activeConvId === item.id ? ' active' : ''}`} onClick={() => loadHistory(item)}>
                    <span className="conv-icon">{item.icon}</span>
                    <div className="conv-body">
                      <div className="conv-label">{item.label}</div>
                      <div className="conv-time">{item.ts}</div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      <div className="main">
        {view === 'templates' ? (
          <>
            <div className="chat-header">
              <div className="chat-title">📚 TEMPLATES & SKILLS</div>
              <button className="yn-btn" onClick={() => setView('chat')} style={{ fontSize: '11px', padding: '5px 14px' }}>← Kembali ke Chat</button>
            </div>
            <div className="templates-page">
              <div className="tpl-hero">
                <div className="tpl-hero-title">Skill Templates Siap Pakai</div>
                <div className="tpl-hero-sub">Klik template → copas prompt-nya langsung ke AI manapun</div>
              </div>
              <div className="tpl-cats">
                {cats.map(c => (
                  <button key={c} className={`tpl-cat-btn${templateCat === c ? ' active' : ''}`} onClick={() => setTemplateCat(c)}>{c}</button>
                ))}
              </div>
              <div className="tpl-grid">
                {TEMPLATE_LIBRARY.filter(t => templateCat === 'Semua' || t.cat === templateCat).map(t => (
                  <div key={t.id} className="tpl-card">
                    <div className="tpl-card-top">
                      <span className="tpl-icon">{t.icon}</span>
                      <span className="tpl-cat-tag">{t.cat}</span>
                    </div>
                    <div className="tpl-name">{t.name}</div>
                    <div className="tpl-desc">{t.desc}</div>
                    <div className="tpl-preview">{t.prompt.slice(0, 100)}...</div>
                    <div className="tpl-actions">
                      <button className="tpl-copy-btn" onClick={() => { navigator.clipboard.writeText(t.prompt); showToast('✓ Template di-copy!') }}>Copy Prompt ⌘</button>
                      <button className="tpl-use-btn" onClick={() => {
                        setView('chat')
                        sessionRef.current = { goal: t.name, answers: {}, step: -1, mainPrompt: t.prompt, variantType: null, variantStep: 0 }
                        lastPromptRef.current = t.prompt
                        setTimeout(() => {
                          renderWelcome()
                          setTimeout(() => {
                            const inner = chatInnerRef.current; if (!inner) return
                            inner.innerHTML = ''
                            appendMsg('bot', `Template <strong>${t.name}</strong> dimuat ✦`)
                            const div = document.createElement('div'); div.className = 'msg bot'
                            div.innerHTML = `<div class="prompt-result"><div class="pr-label">✦ TEMPLATE PROMPT</div><button class="pr-copy">Copy ⌘</button><div class="pr-text">${t.prompt}</div></div>
                            <div class="yn-row" style="margin-top:10px">
                              <button class="yn-btn yes" id="tpl-new">✦ Prompt baru</button>
                              <button class="yn-btn" id="tpl-refine">✎ Refine & customize</button>
                            </div>`
                            div.querySelector('.pr-copy')?.addEventListener('click', () => navigator.clipboard.writeText(t.prompt).then(() => showToast('✓ Di-copy!')))
                            div.querySelector('#tpl-new')?.addEventListener('click', () => renderWelcome())
                            div.querySelector('#tpl-refine')?.addEventListener('click', () => { appendMsg('bot', 'Oke, mau diubah / ditambahin apa?'); phaseRef.current = 'refine' })
                            inner.appendChild(div); scrollBottom()
                            phaseRef.current = 'done'
                          }, 150)
                        }, 50)
                      }}>Pakai & Customize →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-title">TEXT PROMPT BUILDER</div>
              <div className="mode-pills">
                <button className="mode-pill active">✦ Text</button>
                <button className="mode-pill soon">🖼 Image <span className="pill-badge">soon</span></button>
                <button className="mode-pill soon">🎬 Video <span className="pill-badge">soon</span></button>
              </div>
            </div>
            <div className="chat-area" ref={chatAreaRef}>
              <div className="chat-inner" ref={chatInnerRef} />
            </div>
            <div className="input-bar">
              <div className="input-wrap">
                <textarea ref={inputRef} id="main-input" placeholder="Ketik tujuan lu di sini..." rows="1"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }} />
                <button className="send-btn" onClick={handleSend}>↑</button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="toast" ref={toastRef}>✓ Tersalin!</div>
    </>
  )
}

export default App