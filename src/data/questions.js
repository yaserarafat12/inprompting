// ─── ROLES ───
export const ROLES = [
  { id: 'creator',    icon: '🎥', label: 'Content Creator',      desc: 'YouTube, TikTok, IG, Podcast',          formula: 'CREATE' },
  { id: 'copywriter', icon: '✍️', label: 'Copywriter',           desc: 'Ads, Email, Landing Page, Social',      formula: 'RISEN'  },
  { id: 'developer',  icon: '🐍', label: 'Developer / Tech',     desc: 'Python, Web, Automation, AI',           formula: 'RTF'    },
  { id: 'analyst',    icon: '🔍', label: 'Researcher / Analyst',  desc: 'Kasus, Bisnis, Akademik',               formula: 'RISEN'  },
  { id: 'universal',  icon: '🤖', label: 'Asisten Universal',    desc: 'Rangkum, jelaskan, terjemahkan, brainstorm', formula: 'CREATE' },
]

// ─── CABANG PERTANYAAN PER ROLE ───
export const ROLE_QUESTIONS = {

  creator: [
    {
      id: 'platform',
      ask: () => 'Konten ini buat platform mana?',
      options: [
        { label: '📹 YouTube — video panjang', value: 'youtube' },
        { label: '📱 TikTok / Reels — video pendek', value: 'tiktok' },
        { label: '📸 Instagram — feed / carousel', value: 'instagram' },
        { label: '🎙️ Podcast — audio / narasi', value: 'podcast' },
      ],
      placeholder: 'atau platform lain, e.g. "Twitter thread"',
    },
    {
      id: 'genre',
      ask: (ans) => `Buat ${ans.platform}. Genre kontennya apa?`,
      optionsFn: (ans) => {
        const map = {
          youtube:   [{ label: '🕵️ True crime / investigasi', value: 'true crime dan investigasi' }, { label: '🎓 Edukasi / explainer', value: 'edukasi dan explainer' }, { label: '😂 Entertainment / vlog', value: 'entertainment dan vlog' }, { label: '💰 Bisnis / finansial', value: 'bisnis dan finansial' }],
          tiktok:    [{ label: '⚡ Hook viral / trending', value: 'hook viral dan trending' }, { label: '🎓 Edukasi singkat', value: 'edukasi singkat' }, { label: '😂 Comedy / relatable', value: 'comedy dan relatable' }, { label: '💪 Motivasi / inspirasi', value: 'motivasi dan inspirasi' }],
          instagram: [{ label: '📊 Carousel informatif', value: 'carousel informatif' }, { label: '📸 Caption storytelling', value: 'caption storytelling' }, { label: '🛍️ Promosi produk', value: 'promosi produk' }, { label: '💬 Engagement / pertanyaan', value: 'engagement' }],
          podcast:   [{ label: '🎙️ Interview / talkshow', value: 'interview dan talkshow' }, { label: '📖 Narasi / storytelling', value: 'narasi storytelling' }, { label: '🔍 Deep dive topik', value: 'deep dive' }, { label: '📰 News / current events', value: 'news dan current events' }],
        }
        return map[ans.platform] || map.youtube
      },
      placeholder: 'atau deskripsiin genre konten lu',
    },
    {
      id: 'topic',
      ask: () => 'Topik spesifik yang mau dibahas?',
      options: null,
      placeholder: 'e.g. "kasus kriminal Vina Cirebon dari sudut pandang keluarga korban"',
    },
    {
      id: 'duration',
      ask: (ans) => ans.platform === 'tiktok' ? 'Target durasi videonya?' : 'Target panjang kontennya?',
      optionsFn: (ans) => {
        if (ans.platform === 'tiktok') return [{ label: '⚡ 15-30 detik', value: '15-30 detik' }, { label: '📱 30-60 detik', value: '30-60 detik' }, { label: '📹 1-3 menit', value: '1-3 menit' }]
        if (ans.platform === 'youtube') return [{ label: '🎬 5-10 menit', value: '5-10 menit' }, { label: '📽️ 10-20 menit', value: '10-20 menit' }, { label: '🎥 20+ menit', value: '20+ menit' }]
        return [{ label: '📝 Singkat < 300 kata', value: 'singkat kurang dari 300 kata' }, { label: '📄 Sedang 300-600 kata', value: 'sedang 300-600 kata' }, { label: '📚 Panjang 600+ kata', value: 'panjang lebih dari 600 kata' }]
      },
      placeholder: 'atau tulis target durasi sendiri',
    },
    {
      id: 'audience',
      ask: () => 'Target audiens utamanya siapa?',
      options: [
        { label: '📱 Gen Z (15-25 tahun)', value: 'Gen Z 15-25 tahun' },
        { label: '🧑 Milenial (25-35 tahun)', value: 'Milenial 25-35 tahun' },
        { label: '👨💼 Profesional / pekerja', value: 'profesional dan pekerja' },
        { label: '🎓 Pelajar / mahasiswa', value: 'pelajar dan mahasiswa' },
      ],
      placeholder: 'e.g. "ibu rumah tangga yang suka true crime"',
    },
  ],

  copywriter: [
    {
      id: 'medium',
      ask: () => 'Copy ini buat medium apa?',
      options: [
        { label: '📧 Email marketing / cold email', value: 'email' },
        { label: '🎯 Iklan (Meta Ads / Google Ads)', value: 'ads' },
        { label: '🌐 Landing page / sales page', value: 'landing_page' },
        { label: '📱 Caption sosial media', value: 'social' },
        { label: '📝 Artikel / blog SEO', value: 'artikel' },
      ],
      placeholder: 'atau medium lain, e.g. "WhatsApp blast"',
    },
    {
      id: 'product',
      ask: () => 'Produk / jasa / ide yang mau dipromosiin?',
      options: null,
      placeholder: 'e.g. "kursus online desain grafis untuk pemula seharga 299rb"',
    },
    {
      id: 'goal',
      ask: (ans) => `Goal utama copy ini untuk ${ans.medium}?`,
      optionsFn: (ans) => {
        const map = {
          email:       [{ label: '📬 Dapat reply / respon', value: 'dapat reply' }, { label: '🔗 Klik link / CTA', value: 'klik CTA' }, { label: '📅 Book meeting', value: 'book meeting' }],
          ads:         [{ label: '🛍️ Langsung beli / checkout', value: 'konversi pembelian' }, { label: '🔗 Klik ke landing page', value: 'klik ke landing page' }, { label: '👤 Lead generation', value: 'lead generation' }],
          landing_page:[{ label: '💰 Purchase / sign up', value: 'purchase atau sign up' }, { label: '📞 Hubungi / konsultasi', value: 'hubungi atau konsultasi' }, { label: '📥 Download / freemium', value: 'download' }],
          social:      [{ label: '💬 Komentar & engagement', value: 'engagement' }, { label: '🔄 Share / viral', value: 'viral dan share' }, { label: '👤 Tambah followers', value: 'tambah followers' }],
          artikel:     [{ label: '🔍 Rank di Google (SEO)', value: 'ranking SEO' }, { label: '📖 Edukasi pembaca', value: 'edukasi' }, { label: '🏷️ Brand authority', value: 'brand authority' }],
        }
        return map[ans.medium] || map.social
      },
      placeholder: 'atau deskripsiin goal-nya',
    },
    {
      id: 'tone',
      ask: () => 'Tone / gaya bahasa?',
      options: [
        { label: '🔥 Urgensi & FOMO', value: 'urgensi tinggi dengan FOMO' },
        { label: '🤝 Conversational & personal', value: 'conversational dan personal' },
        { label: '💼 Profesional & credible', value: 'profesional dan credible' },
        { label: '😄 Fun & relatable', value: 'fun dan relatable' },
      ],
      placeholder: 'e.g. "seperti teman yang excited kasih rekomendasi"',
    },
    {
      id: 'audience',
      ask: () => 'Target audiensnya siapa?',
      options: [
        { label: '🆕 Cold — belum tau produknya', value: 'audiens cold yang belum kenal produk' },
        { label: '🤔 Warm — tau tapi belum beli', value: 'audiens warm yang sudah tau tapi belum beli' },
        { label: '💝 Hot — siap beli, tinggal didorong', value: 'audiens hot yang siap beli' },
        { label: '🔄 Existing — pelanggan lama', value: 'pelanggan lama untuk retention' },
      ],
      placeholder: 'e.g. "pemilik UMKM usia 30-45 yang kesulitan marketing online"',
    },
  ],

  developer: [
    {
      id: 'project_type',
      ask: () => 'Mau bikin apa?',
      options: [
        { label: '🌐 Website / Web App', value: 'website' },
        { label: '🎮 Game', value: 'game' },
        { label: '🤖 Bot / Automation', value: 'bot_automation' },
        { label: '📊 Data / AI / ML', value: 'data_ai' },
        { label: '📱 Mobile App', value: 'mobile' },
        { label: '🔌 API / Backend', value: 'api_backend' },
      ],
      placeholder: 'atau deskripsiin project lu, e.g. "sistem inventory untuk toko"',
    },
    {
      id: 'sub_type',
      ask: (ans) => {
        const map = {
          website: 'Website yang kayak gimana?',
          game: 'Game yang kayak gimana?',
          bot_automation: 'Bot / automation untuk apa?',
          data_ai: 'Project data / AI-nya spesifik apa?',
          mobile: 'App mobile untuk apa?',
          api_backend: 'API / backend untuk sistem apa?',
        }
        return map[ans.project_type] || 'Lebih spesifik lagi?'
      },
      optionsFn: (ans) => {
        const map = {
          website: [
            { label: '🏢 Landing page / company profile', value: 'landing page atau company profile' },
            { label: '🛍️ E-commerce / toko online', value: 'e-commerce dan toko online' },
            { label: '📰 Blog / portal berita', value: 'blog atau portal berita' },
            { label: '📊 Dashboard / admin panel', value: 'dashboard dan admin panel' },
            { label: '🎨 Portfolio / showcase', value: 'portfolio dan showcase' },
            { label: '💬 Platform komunitas / forum', value: 'platform komunitas dan forum' },
          ],
          game: [
            { label: '🎯 Casual / browser game (JS/HTML5)', value: 'casual browser game dengan HTML5 dan JavaScript' },
            { label: '🗡️ RPG / adventure (Unity/Godot)', value: 'RPG atau adventure game dengan Unity atau Godot' },
            { label: '🧩 Puzzle / strategy', value: 'puzzle atau strategy game' },
            { label: '🏃 Platformer / action', value: 'platformer atau action game' },
            { label: '🃏 Card / board game digital', value: 'card atau board game digital' },
            { label: '🌍 Multiplayer / online game', value: 'multiplayer dan online game' },
          ],
          bot_automation: [
            { label: '🤖 Discord / Telegram bot', value: 'Discord atau Telegram bot' },
            { label: '🌐 Web scraper / data collector', value: 'web scraper dan data collector' },
            { label: '📧 Email / notif automation', value: 'email dan notifikasi automation' },
            { label: '🔄 Workflow automation (n8n/Zapier logic)', value: 'workflow automation' },
            { label: '📱 Social media automation', value: 'social media automation' },
          ],
          data_ai: [
            { label: '🧠 LLM / chatbot integration', value: 'LLM dan chatbot integration' },
            { label: '📈 Data analysis & visualization', value: 'data analysis dan visualisasi' },
            { label: '🤖 ML model training', value: 'machine learning model training' },
            { label: '🔍 RAG / vector search', value: 'RAG dan vector search' },
            { label: '📊 Data pipeline / ETL', value: 'data pipeline dan ETL' },
          ],
          mobile: [
            { label: '📱 React Native (cross-platform)', value: 'React Native cross-platform' },
            { label: '🦋 Flutter (cross-platform)', value: 'Flutter cross-platform' },
            { label: '🍎 Native iOS (Swift)', value: 'native iOS dengan Swift' },
            { label: '🤖 Native Android (Kotlin)', value: 'native Android dengan Kotlin' },
          ],
          api_backend: [
            { label: '🚀 REST API', value: 'REST API' },
            { label: '⚡ GraphQL API', value: 'GraphQL API' },
            { label: '🔐 Auth system (JWT/OAuth)', value: 'authentication system dengan JWT atau OAuth' },
            { label: '💳 Payment integration', value: 'payment gateway integration' },
            { label: '📡 Realtime (WebSocket)', value: 'realtime system dengan WebSocket' },
          ],
        }
        return map[ans.project_type] || map.website
      },
      placeholder: 'atau deskripsiin lebih detail',
    },
    {
      id: 'stack',
      ask: (ans) => `Stack / bahasa yang mau dipakai untuk ${ans.sub_type || ans.project_type}?`,
      optionsFn: (ans) => {
        const map = {
          website: [
            { label: '⚛️ React / Next.js', value: 'React dan Next.js' },
            { label: '💚 Vue / Nuxt', value: 'Vue dan Nuxt' },
            { label: '🐍 Python (Flask / Django / FastAPI)', value: 'Python dengan Flask Django atau FastAPI' },
            { label: '🟨 JavaScript / Node.js + Express', value: 'JavaScript Node.js dan Express' },
            { label: '🔴 Laravel (PHP)', value: 'Laravel PHP' },
            { label: '🎯 HTML CSS JS murni', value: 'HTML CSS dan JavaScript vanilla' },
          ],
          game: [
            { label: '🎮 Unity (C#)', value: 'Unity dengan C#' },
            { label: '🤖 Godot (GDScript)', value: 'Godot dengan GDScript' },
            { label: '🌐 Phaser.js (browser)', value: 'Phaser.js untuk browser game' },
            { label: '🐍 Pygame (Python)', value: 'Pygame Python' },
            { label: '🎯 HTML5 Canvas + JS', value: 'HTML5 Canvas dan JavaScript' },
          ],
          bot_automation: [
            { label: '🐍 Python', value: 'Python' },
            { label: '🟨 JavaScript / Node.js', value: 'JavaScript dan Node.js' },
          ],
          data_ai: [
            { label: '🐍 Python (pandas, sklearn, torch)', value: 'Python dengan pandas sklearn dan PyTorch' },
            { label: '🦜 LangChain / LlamaIndex', value: 'LangChain atau LlamaIndex' },
            { label: '☁️ Cloud (AWS/GCP/Azure)', value: 'cloud platform AWS GCP atau Azure' },
          ],
          mobile: [
            { label: '📱 React Native', value: 'React Native' },
            { label: '🦋 Flutter / Dart', value: 'Flutter dan Dart' },
            { label: '🍎 Swift', value: 'Swift' },
            { label: '🤖 Kotlin', value: 'Kotlin' },
          ],
          api_backend: [
            { label: '🐍 Python (FastAPI / Django)', value: 'Python FastAPI atau Django' },
            { label: '🟨 Node.js + Express', value: 'Node.js dan Express' },
            { label: '☕ Java Spring Boot', value: 'Java Spring Boot' },
            { label: '🦀 Go (Golang)', value: 'Golang' },
          ],
        }
        return map[ans.project_type] || [
          { label: '🐍 Python', value: 'Python' },
          { label: '⚛️ JavaScript / TypeScript', value: 'JavaScript atau TypeScript' },
          { label: '☕ Java', value: 'Java' },
          { label: '🦀 Go / Rust', value: 'Go atau Rust' },
        ]
      },
      placeholder: 'atau sebutkan stack lain, e.g. "Supabase + Next.js + TypeScript"',
    },
    {
      id: 'complexity',
      ask: () => 'Level kompleksitas yang diinginkan?',
      options: [
        { label: '🟢 MVP / prototype — cepat jalan dulu', value: 'MVP dan prototype yang cepat jalan' },
        { label: '🟡 Solid — ada error handling, struktur yang baik', value: 'solid dengan error handling dan struktur yang baik' },
        { label: '🔴 Production-ready — scalable, tested, documented', value: 'production-ready scalable dengan tests dan dokumentasi lengkap' },
      ],
      placeholder: 'atau deskripsiin kebutuhan spesifiknya',
    },
    {
      id: 'context',
      ask: () => 'Ada requirement atau constraint khusus?',
      options: [
        { label: '⚡ Harus cepat / performa tinggi', value: 'prioritaskan performa dan kecepatan' },
        { label: '🔒 Ada kebutuhan security / auth', value: 'ada kebutuhan security dan authentication' },
        { label: '🗄️ Butuh database (sebutkan di input)', value: 'butuh database integration' },
        { label: '🔗 Integrate dengan API / sistem lain', value: 'harus terintegrasi dengan API atau sistem existing' },
        { label: '✅ Tidak ada constraint khusus', value: 'tidak ada constraint khusus' },
      ],
      placeholder: 'e.g. "pakai Supabase, deploy ke Vercel, budget hosting gratis"',
    },
  ],

  analyst: [
    {
      id: 'domain',
      ask: () => 'Riset / analisis di bidang apa?',
      options: [
        { label: '🔍 Investigasi kasus / kriminal', value: 'investigasi kasus' },
        { label: '📊 Analisis bisnis / market', value: 'analisis bisnis dan market' },
        { label: '📚 Riset akademik / literatur', value: 'riset akademik' },
        { label: '📰 Analisis media / konten', value: 'analisis media dan konten' },
        { label: '💹 Analisis finansial / investasi', value: 'analisis finansial' },
      ],
      placeholder: 'atau domain lain, e.g. "analisis kebijakan publik"',
    },
    {
      id: 'depth',
      ask: (ans) => `Untuk ${ans.domain}, sebundle dalam analisisnya?`,
      options: [
        { label: '📋 Overview / ringkasan eksekutif', value: 'ringkasan eksekutif yang padat' },
        { label: '🔬 Analisis mendalam dengan breakdown', value: 'analisis mendalam dengan breakdown detail' },
        { label: '⚖️ Komparatif — bandingkan beberapa opsi', value: 'analisis komparatif' },
        { label: '🎯 Actionable — fokus ke rekomendasi', value: 'fokus rekomendasi actionable' },
      ],
      placeholder: 'deskripsiin kedalaman yang dibutuhkan',
    },
    {
      id: 'subject',
      ask: () => 'Subjek / topik spesifik yang mau dianalisis?',
      options: null,
      placeholder: 'e.g. "perbandingan strategi growth Tokopedia vs Shopee 2024"',
    },
    {
      id: 'output_format',
      ask: () => 'Format output yang diinginkan?',
      options: [
        { label: '📄 Laporan naratif mengalir', value: 'laporan naratif' },
        { label: '• Bullet points per poin kunci', value: 'bullet points terstruktur' },
        { label: '📊 Tabel perbandingan', value: 'tabel perbandingan' },
        { label: '🗂️ Framework SWOT / Canvas', value: 'framework SWOT atau Business Model Canvas' },
      ],
      placeholder: 'atau deskripsiin format yang kamu butuhkan',
    },
  ],

  universal: [
    {
      id: 'task_type',
      ask: () => 'Mau AI-nya bantuin ngapain?',
      options: [
        { label: '📝 Nulis / membuat konten', value: 'menulis dan membuat konten' },
        { label: '📖 Rangkum / simplifikasi', value: 'merangkum dan menyederhanakan' },
        { label: '🌐 Terjemahkan / adaptasi bahasa', value: 'menerjemahkan dan adaptasi bahasa' },
        { label: '💡 Brainstorm / generate ide', value: 'brainstorming dan generate ide' },
        { label: '✅ Review / koreksi', value: 'review dan koreksi' },
        { label: '❓ Jelaskan konsep', value: 'menjelaskan konsep dengan mudah' },
      ],
      placeholder: 'atau deskripsiin tugas lain',
    },
    {
      id: 'subject',
      ask: (ans) => `Oke, AI mau ${ans.task_type}. Tentang apa?`,
      options: null,
      placeholder: 'e.g. "artikel tentang perubahan iklim" atau "ide konten Ramadan"',
    },
    {
      id: 'style',
      ask: () => 'Gaya output yang diinginkan?',
      options: [
        { label: '💬 Santai & conversational', value: 'santai dan conversational' },
        { label: '📝 Formal & profesional', value: 'formal dan profesional' },
        { label: '🎓 Edukatif & terstruktur', value: 'edukatif dan terstruktur' },
        { label: '⚡ Singkat & padat', value: 'singkat dan padat' },
      ],
      placeholder: 'e.g. "seperti guru yang sabar menjelaskan ke anak SD"',
    },
    {
      id: 'constraint',
      ask: () => 'Ada batasan atau hal yang TIDAK boleh dilakukan AI?',
      options: [
        { label: '📏 Maksimal 300 kata', value: 'maksimal 300 kata' },
        { label: '🚫 Jangan pakai jargon teknis', value: 'hindari jargon teknis' },
        { label: '🌐 Output harus bahasa Inggris', value: 'output dalam bahasa Inggris' },
        { label: '✅ Tidak ada batasan khusus', value: 'tidak ada batasan khusus' },
      ],
      placeholder: 'e.g. "jangan gunakan kata-kata terlalu formal"',
    },
  ],
}

// ─── FORMULA SYSTEM PROMPTS ───
export const getSystemPrompt = (role, answers, mode = 'text') => {
  const ctx = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n')
  
  if (mode === 'image') {
    return `Kamu adalah expert AI image prompt engineer (Midjourney, Stable Diffusion, DALL-E).
Buat prompt gambar yang SANGAT DETAIL dan DESKRIPTIF dalam BAHASA INGGRIS.
Prompt harus berupa tag/keywords deskriptif panjang dipisahkan koma, atau paragraf deskriptif dalam bahasa Inggris. Sertakan pencahayaan, angle, style artis, resolusi (8k, masterpiece). Jangan banyak berbincang, berikan promptnya saja.

Info dari user:
Style: ${role.label} (${role.desc})
${ctx}

Balas HANYA JSON (no backticks, no preamble):
{"main_prompt":"(your highly detailed english discord/midjourney style prompt here)"}`
  }

  const formulas = {
    CREATE: `Kamu adalah expert prompt engineer kelas dunia. Buat prompt SIAP PAKAI menggunakan framework CREATE (Character, Request, Examples, Adjustment, Type of Output, Extras). Prompt harus natural mengalir dalam paragraf, minimal 120 kata, bahasa Indonesia, actionable langsung di AI manapun. Bukan template kering — tulis seperti instruksi manusia ke manusia yang sangat spesifik.`,
    RISEN:  `Kamu adalah expert prompt engineer kelas dunia. Buat prompt SIAP PAKAI menggunakan framework RISEN (Role, Instructions step-by-step, Steps yang harus dilalui AI, Expectation hasil akhir, Narrowing/batasan). Minimal 150 kata, kaya detail, bahasa Indonesia. Sertakan anti-pattern yang harus dihindari AI.`,
    RTF:    `Kamu adalah expert prompt engineer kelas dunia. Buat prompt SIAP PAKAI menggunakan framework RTF (Role yang sangat spesifik, Task yang measurable, Format yang jelas). Padat dan langsung actionable, minimal 80 kata tapi setiap kata harus earn its place. Bahasa Indonesia.`,
  }
  const formula = formulas[role.formula] || formulas.CREATE
  return `${formula}\n\nInfo dari user:\nRole yang dipilih: ${role.label} (${role.desc})\n${ctx}\n\nBalas HANYA JSON (no backticks, no preamble):\n{"main_prompt":"prompt utama di sini..."}`
}

// ─── CLASSIFY INTENT TEXT ───
export const CLASSIFY_PROMPT = `Kamu adalah intent classifier untuk prompt builder. Analisis teks user, tentukan role terbaik dari: creator, copywriter, developer, analyst, universal. Juga ekstrak jawaban yang sudah bisa disimpulkan dari teksnya.

Balas HANYA JSON (no backticks):
{"role_id":"creator|copywriter|developer|analyst|universal","pre_answers":{},"confidence":"high|medium|low","reasoning":"1 kalimat singkat"}`

// ─── CLASSIFY INTENT IMAGE ───
export const IMAGE_CLASSIFY_PROMPT = `Kamu adalah intent classifier untuk image prompt builder. Analisis deskripsi gambar dari user, tentukan style terbaik dari: anime, realistic, threed, pemandangan, kartun, custom.
Juga ekstrak context (subject, mood, camera dll) ke dalam pre_answers jika ada.

Balas HANYA JSON (no backticks):
{"role_id":"anime|realistic|threed|pemandangan|kartun|custom","pre_answers":{},"confidence":"high|medium|low","reasoning":"1 kalimat singkat"}
`

// ─── IMAGE ROLES ───
export const IMAGE_ROLES = [
  { id: 'anime',       icon: '🌸', label: 'Anime / Manga',      desc: 'Style Jepang, manhwa, ilustrasi 2D'     },
  { id: 'realistic',   icon: '📷', label: 'Realistic / Photo',  desc: 'Foto realistis, sinematik, portrait'    },
  { id: 'threed',      icon: '🎮', label: '3D / CGI',           desc: 'Render 3D, game art, clay, figurine'    },
  { id: 'pemandangan', icon: '🏔️', label: 'Pemandangan',        desc: 'Landscape, alam, arsitektur, cityscape'  },
  { id: 'kartun',      icon: '🎠', label: 'Kartun / Ilustrasi', desc: 'Cartoon, comic, flat design, sticker'   },
  { id: 'custom',      icon: '✦',  label: 'Tulis Manual',       desc: 'Deskripsiin style yang kamu mau sendiri' },
]

// ─── IMAGE QUESTIONS ───
export const IMAGE_QUESTIONS = {
  anime: [
    {
      id: 'sub_style',
      ask: () => 'Style anime yang lu mau?',
      options: [
        { label: '🌸 Ghibli-esque — warm, painterly, magical', value: 'Studio Ghibli style warm painterly magical soft lighting' },
        { label: '⚔️ Shonen epic — Solo Leveling, JJK, dynamic action', value: 'shonen anime style dynamic action Solo Leveling Jujutsu Kaisen epic' },
        { label: '🌙 Dark / seinen — gritty, mature, detailed', value: 'seinen dark anime style gritty mature detailed Berserk Vinland' },
        { label: '💖 Kawaii / slice of life — cute, pastel, cozy', value: 'kawaii cute anime slice of life pastel colors soft aesthetic' },
        { label: '🎌 Manhwa / webtoon — clean lineart, vibrant, digital', value: 'manhwa webtoon style clean lineart vibrant colors digital illustration' },
        { label: '🖌️ 90s retro anime — vintage cel, Evangelion, Cowboy Bebop', value: '90s retro anime style vintage cel animation Evangelion Cowboy Bebop aesthetic' },
      ],
      placeholder: 'e.g. "seperti Makoto Shinkai tapi lebih gelap"',
    },
    {
      id: 'subject',
      ask: () => 'Karakter atau scene-nya apa?',
      options: null,
      placeholder: 'e.g. "seorang samurai wanita berambut perak, duduk di bawah pohon sakura di malam hari"',
    },
    {
      id: 'mood',
      ask: () => 'Mood / atmosfernya?',
      options: [
        { label: '⚡ Epic & intense — dramatis, penuh energi', value: 'epic intense dramatic energetic powerful atmosphere' },
        { label: '🌸 Peaceful & dreamy — tenang, lembut, indah', value: 'peaceful dreamy serene beautiful soft atmosphere' },
        { label: '🌙 Dark & mysterious — gelap, misterius, gothic', value: 'dark mysterious gothic moody atmospheric' },
        { label: '💕 Romantic & warm — hangat, emosional, intimate', value: 'romantic warm emotional intimate heartfelt atmosphere' },
        { label: '😄 Fun & colorful — ceria, vibrant, playful', value: 'fun colorful vibrant playful cheerful energetic' },
      ],
      placeholder: 'e.g. "melankolis tapi indah, seperti ending Violet Evergarden"',
    },
    {
      id: 'quality',
      ask: () => 'Level kualitas?',
      options: [
        { label: '🏆 Masterpiece — ultra detail, anime wallpaper quality', value: 'masterpiece best quality ultra detailed anime wallpaper 8K' },
        { label: '✨ High quality — bersih, detail, profesional', value: 'high quality detailed clean professional anime illustration' },
        { label: '🎨 Stylized — prioritas style unik dan ekspresi', value: 'stylized unique art style expressive illustration' },
      ],
      placeholder: 'atau deskripsiin level detail spesifik',
    },
    {
      id: 'ratio',
      ask: () => 'Aspect ratio?',
      options: [
        { label: '🖼️ Square 1:1 — profile / avatar', value: '--ar 1:1' },
        { label: '📱 Portrait 9:16 — wallpaper HP', value: '--ar 9:16' },
        { label: '🖥️ Landscape 16:9 — desktop wallpaper', value: '--ar 16:9' },
        { label: '📐 2:3 — poster / print', value: '--ar 2:3' },
      ],
      placeholder: 'atau tulis ratio custom',
    },
  ],

  realistic: [
    {
      id: 'sub_style',
      ask: () => 'Tipe foto realistis yang lu mau?',
      options: [
        { label: '📸 Portrait — close-up wajah, bokeh, emosional', value: 'portrait photography close-up face bokeh background emotional' },
        { label: '🎬 Cinematic — movie still, dramatic lighting', value: 'cinematic photography movie still dramatic lighting film grain' },
        { label: '📰 Editorial / fashion — high fashion, magazine cover', value: 'editorial fashion photography high fashion magazine cover vogue' },
        { label: '🍕 Product / food — clean, studio lighting, commercial', value: 'product photography studio lighting clean background commercial' },
        { label: '🏙️ Street photography — candid, urban, real life', value: 'street photography candid urban real life documentary' },
        { label: '🌄 Landscape photo — alam, wide angle, epic', value: 'landscape photography wide angle epic scenery nature' },
      ],
      placeholder: 'e.g. "street photography di Tokyo malam hari, neon lights"',
    },
    {
      id: 'subject',
      ask: () => 'Subject utamanya?',
      options: null,
      placeholder: 'e.g. "wanita Asia berusia 25 tahun, rambut pendek, jaket kulit, berdiri di bawah hujan"',
    },
    {
      id: 'lighting',
      ask: () => 'Tipe pencahayaan?',
      options: [
        { label: '🌅 Golden hour — warm, soft, romantic', value: 'golden hour warm soft natural lighting romantic glow' },
        { label: '💡 Studio lighting — clean, professional, controlled', value: 'studio lighting professional softbox controlled dramatic' },
        { label: '🌃 Neon / artificial — urban night, colorful, cyberpunk', value: 'neon artificial lighting urban night colorful cyberpunk atmosphere' },
        { label: '☁️ Overcast / diffused — soft, even, moody', value: 'overcast diffused soft even lighting moody atmosphere' },
        { label: '🔦 Dramatic / chiaroscuro — extreme contrast, shadows', value: 'dramatic chiaroscuro extreme contrast deep shadows Rembrandt lighting' },
      ],
      placeholder: 'e.g. "backlit silhouette dengan rim light oranye"',
    },
    {
      id: 'camera',
      ask: () => 'Simulasi kamera / lens?',
      options: [
        { label: '📷 Sony A7 III + 85mm f/1.4 — portrait king', value: 'shot on Sony A7 III 85mm f/1.4 shallow depth of field' },
        { label: '📷 Canon 5D + 35mm — versatile, natural', value: 'shot on Canon 5D Mark IV 35mm lens natural perspective' },
        { label: '📷 Fujifilm X100V — film-like colors, vintage', value: 'shot on Fujifilm X100V film simulation vintage color science' },
        { label: '📷 iPhone 15 Pro — casual, realistic, everyday', value: 'shot on iPhone 15 Pro natural smartphone photography' },
        { label: '📷 Hasselblad medium format — ultra sharp, editorial', value: 'shot on Hasselblad medium format ultra sharp high resolution editorial' },
      ],
      placeholder: 'e.g. "Leica M10 + 50mm Summilux, black and white"',
    },
    {
      id: 'ratio',
      ask: () => 'Aspect ratio?',
      options: [
        { label: '📐 3:2 — standard foto', value: '--ar 3:2' },
        { label: '🖼️ Square 1:1 — Instagram feed', value: '--ar 1:1' },
        { label: '📱 Portrait 4:5 — Instagram portrait', value: '--ar 4:5' },
        { label: '🖥️ Landscape 16:9 — cinematic wide', value: '--ar 16:9' },
      ],
      placeholder: 'atau tulis ratio custom',
    },
  ],

  threed: [
    {
      id: 'sub_style',
      ask: () => 'Tipe 3D art yang lu mau?',
      options: [
        { label: '🧸 Clay / plasticine — lucu, tactile, Aardman', value: 'clay render plasticine style cute tactile Aardman stop motion' },
        { label: '🎮 Game art — Unreal Engine, AAA quality', value: 'game art Unreal Engine 5 AAA quality real-time render PBR' },
        { label: '🏠 Isometric / diorama — mini world, tilt-shift', value: 'isometric 3D diorama miniature world tilt-shift cute detailed' },
        { label: '🤖 Hard surface — mechanical, robot, sci-fi', value: 'hard surface 3D modeling mechanical robot sci-fi detailed metal' },
        { label: '👤 Character design — stylized, figurine, collectible', value: 'stylized 3D character design figurine collectible Pixar Disney' },
        { label: '🏗️ Architectural viz — interior/exterior, photorealistic', value: 'architectural visualization 3D render interior exterior photorealistic' },
      ],
      placeholder: 'e.g. "low poly forest scene dengan gaya Monument Valley"',
    },
    {
      id: 'subject',
      ask: () => 'Subject / scene-nya apa?',
      options: null,
      placeholder: 'e.g. "robot kecil berbentuk bulat yang sedang berkebun di planet Mars, dengan greenhouse kecil"',
    },
    {
      id: 'material',
      ask: () => 'Material / texture dominan?',
      options: [
        { label: '✨ Glossy / shiny — reflective, polished, candy-like', value: 'glossy shiny reflective polished smooth candy-like material' },
        { label: '🧱 Matte / rough — natural, textured, realistic', value: 'matte rough natural textured realistic material PBR' },
        { label: '🫧 Translucent / glass — tembus cahaya, ethereal', value: 'translucent glass material subsurface scattering ethereal glow' },
        { label: '🪵 Mixed organic — kayu, batu, tanaman, natural', value: 'organic materials wood stone plants moss natural environment' },
        { label: '🔩 Metallic / industrial — besi, chrome, mechanical', value: 'metallic chrome industrial steel mechanical brushed metal' },
      ],
      placeholder: 'e.g. "ceramic matte dengan aksen emas"',
    },
    {
      id: 'mood',
      ask: () => 'Mood / atmosfer yang diinginkan?',
      options: [
        { label: '⚡ Epic & powerful — heroik, megah, overwhelming', value: 'epic powerful heroic overwhelming grand atmosphere' },
        { label: '🌙 Dark & melancholic — sedih, sunyi, introspektif', value: 'dark melancholic sad lonely introspective somber atmosphere' },
        { label: '✨ Magical & whimsical — ajaib, dreamy, enchanting', value: 'magical whimsical dreamy enchanting fantastical atmosphere' },
        { label: '😊 Warm & cozy — hangat, nyaman, cheerful', value: 'warm cozy cheerful comfortable inviting atmosphere' },
        { label: '😨 Eerie & unsettling — creepy, tense, mysterious', value: 'eerie unsettling creepy tense mysterious ominous atmosphere' },
        { label: '🌅 Nostalgic & bittersweet — melankolis indah, kenangan', value: 'nostalgic bittersweet wistful memories golden age atmosphere' },
      ],
      placeholder: 'e.g. "seperti adegan perpisahan yang menyentuh"',
    },
    {
      id: 'lighting',
      ask: () => 'Tipe lighting?',
      options: [
        { label: '🌤️ Soft studio — clean, even, product-like', value: 'soft studio lighting clean even product photography 3-point light' },
        { label: '🌅 Warm golden — sunset feels, cozy, inviting', value: 'warm golden lighting sunset atmosphere cozy inviting glow' },
        { label: '💜 Neon / colored — vibrant color lights, dramatic', value: 'neon colored lighting vibrant dramatic purple blue pink glow' },
        { label: '🌙 Rim light / backlit — silhouette edges, dramatic', value: 'rim lighting backlit dramatic edge glow cinematic' },
      ],
      placeholder: 'e.g. "volumetric fog dengan cahaya biru misterius"',
    },
    {
      id: 'ratio',
      ask: () => 'Aspect ratio?',
      options: [
        { label: '🖼️ Square 1:1 — clean showcase', value: '--ar 1:1' },
        { label: '🖥️ Landscape 16:9 — scene / environment', value: '--ar 16:9' },
        { label: '📱 Portrait 9:16 — mobile wallpaper', value: '--ar 9:16' },
        { label: '📐 4:3 — classic render', value: '--ar 4:3' },
      ],
      placeholder: 'atau tulis ratio custom',
    },
  ],

  pemandangan: [
    {
      id: 'sub_style',
      ask: () => 'Tipe pemandangan yang lu mau?',
      options: [
        { label: '🏔️ Alam epik — gunung, hutan, air terjun megah', value: 'epic nature landscape mountains forest waterfall majestic' },
        { label: '🌆 Cityscape — kota modern, skyline, urban night', value: 'cityscape urban skyline modern city night lights' },
        { label: '🌅 Golden hour — matahari terbenam dramatis', value: 'dramatic golden hour sunset landscape warm light' },
        { label: '❄️ Winter / salju — pemandangan beku, sunyi, bersih', value: 'winter snow landscape frozen peaceful pristine' },
        { label: '🌊 Ocean / pantai — laut, ombak, tebing pantai', value: 'ocean beach coastal landscape waves cliffs' },
        { label: '🌌 Malam / galaksi — langit berbintang, Milky Way', value: 'night sky galaxy milky way stars astrophotography landscape' },
      ],
      placeholder: 'e.g. "hutan bambu Jepang saat hujan rintik"',
    },
    {
      id: 'mood',
      ask: () => 'Mood / atmosfernya?',
      options: [
        { label: '🌿 Peaceful & serene — tenang, healing, breathtaking', value: 'peaceful serene tranquil healing breathtaking atmosphere' },
        { label: '⚡ Epic & dramatic — dramatis, megah, menakjubkan', value: 'epic dramatic majestic awe-inspiring powerful atmosphere' },
        { label: '🌙 Mysterious & dark — gelap, misterius, foggy', value: 'mysterious dark moody foggy ethereal atmosphere' },
        { label: '🌸 Dreamy & soft — lembut, pastel, fairytale', value: 'dreamy soft pastel fairytale magical atmosphere' },
      ],
      placeholder: 'e.g. "seperti adegan dari film Studio Ghibli"',
    },
    {
      id: 'time',
      ask: () => 'Waktu / kondisi cahaya?',
      options: [
        { label: '🌅 Golden hour — 1 jam sebelum matahari terbenam', value: 'golden hour warm orange pink sky long shadows' },
        { label: '🌄 Blue hour — tepat setelah matahari terbenam', value: 'blue hour cool blue purple twilight soft glow' },
        { label: '☀️ Midday — cahaya terik, kontras tinggi', value: 'bright midday sunlight high contrast harsh shadows' },
        { label: '🌫️ Misty morning — kabut pagi, lembut, dingin', value: 'misty morning fog soft diffused light cool atmosphere' },
        { label: '⛈️ Dramatic storm — awan gelap, petir, dramatis', value: 'dramatic stormy sky dark clouds lightning epic atmosphere' },
      ],
      placeholder: 'e.g. "setelah hujan dengan pelangi samar"',
    },
    {
      id: 'style_ref',
      ask: () => 'Gaya rendering / referensi visual?',
      options: [
        { label: '📸 Hyperrealistic photo — seperti foto asli 8K', value: 'hyperrealistic photography 8K ultra detailed RAW photo' },
        { label: '🎨 Digital painting — seperti lukisan digital artis', value: 'digital painting concept art detailed brushwork artistic' },
        { label: '🌸 Ghibli-esque — hangat, painterly, magical', value: 'Studio Ghibli style painterly warm magical illustrated' },
        { label: '🖼️ Oil painting — tekstur cat, klasik, museum quality', value: 'oil painting textured classic museum quality traditional art' },
      ],
      placeholder: 'e.g. "seperti cover album Bon Iver"',
    },
    {
      id: 'ratio',
      ask: () => 'Aspect ratio?',
      options: [
        { label: '🖥️ Landscape 16:9 — wallpaper / YouTube thumbnail', value: '--ar 16:9' },
        { label: '📺 Cinematic 21:9 — ultra wide sinematik', value: '--ar 21:9' },
        { label: '🖼️ Square 1:1 — feed Instagram', value: '--ar 1:1' },
        { label: '📱 Portrait 9:16 — story / TikTok', value: '--ar 9:16' },
      ],
      placeholder: 'atau tulis ratio custom',
    },
  ],

  kartun: [
    {
      id: 'sub_style',
      ask: () => 'Tipe kartun / ilustrasi yang lu mau?',
      options: [
        { label: '📺 Cartoon Network / Disney — bold outline, vibrant', value: 'Cartoon Network Disney style bold outlines vibrant colors flat shading' },
        { label: '🎨 Flat design / vector — clean, modern, minimalist', value: 'flat design vector illustration clean modern minimalist geometric' },
        { label: '📚 Comic book / Marvel — dynamic, halftone, heroic', value: 'comic book Marvel DC style dynamic halftone heroic bold' },
        { label: '🖍️ Crayon / hand-drawn — childlike, warm, playful', value: 'crayon hand-drawn childlike warm playful textured illustration' },
        { label: '🌈 Sticker / emoji style — cute, rounded, expressive', value: 'sticker style cute rounded expressive emoji-like illustration' },
        { label: '🕹️ Pixel art / retro game — 8bit, 16bit, nostalgic', value: 'pixel art retro game 8bit 16bit nostalgic style' },
      ],
      placeholder: 'e.g. "seperti ilustrasi buku anak-anak Eropa tahun 70an"',
    },
    {
      id: 'subject',
      ask: () => 'Subject / karakter / scene-nya?',
      options: null,
      placeholder: 'e.g. "karakter anjing corgi lucu yang pakai jas dan bawa koper, berdiri di kota mini"',
    },
    {
      id: 'palette',
      ask: () => 'Palet warna yang diinginkan?',
      options: [
        { label: '🌈 Vibrant & bold — warna-warni cerah, pop', value: 'vibrant bold colorful bright saturated palette' },
        { label: '🍂 Earthy & warm — coklat, oranye, kuning, natural', value: 'earthy warm tones brown orange yellow natural palette' },
        { label: '🌸 Pastel & soft — lembut, dreamy, kawaii', value: 'soft pastel colors dreamy kawaii gentle palette' },
        { label: '🌙 Dark & moody — gelap, deep color, dramatic', value: 'dark moody deep colors dramatic limited palette' },
        { label: '⬛ Monochrome — hitam putih atau satu warna dominan', value: 'monochrome black and white or single dominant color' },
      ],
      placeholder: 'e.g. "dominan biru teal dengan aksen kuning mustard"',
    },
    {
      id: 'mood',
      ask: () => 'Vibe / feel keseluruhan?',
      options: [
        { label: '😄 Fun & playful — ceria, energik, menggemaskan', value: 'fun playful cheerful energetic adorable' },
        { label: '🌿 Cozy & wholesome — hangat, nyaman, heartwarming', value: 'cozy wholesome warm comfortable heartwarming' },
        { label: '⚡ Action & dynamic — bergerak, penuh energi, epic', value: 'action dynamic movement energetic epic pose' },
        { label: '🌙 Mysterious & whimsical — aneh, ajaib, surreal', value: 'mysterious whimsical magical surreal fantastical' },
      ],
      placeholder: 'e.g. "feel seperti ilustrasi cover buku anak yang adventurous"',
    },
    {
      id: 'ratio',
      ask: () => 'Aspect ratio?',
      options: [
        { label: '🖼️ Square 1:1 — feed Instagram / profile picture', value: '--ar 1:1' },
        { label: '📱 Portrait 9:16 — story / poster vertikal', value: '--ar 9:16' },
        { label: '🖥️ Landscape 16:9 — banner / thumbnail', value: '--ar 16:9' },
        { label: '📐 4:3 — format klasik, ilustrasi buku', value: '--ar 4:3' },
      ],
      placeholder: 'atau tulis ratio custom',
    },
  ],

  custom: [
    {
      id: 'style_desc',
      ask: () => 'Deskripsiin style yang lu mau — sebebas mungkin!',
      options: null,
      placeholder: 'e.g. "dark fantasy portrait seorang ksatria wanita dengan armor retak, cahaya biru dari matanya, background reruntuhan kastil"',
    },
    {
      id: 'reference',
      ask: () => 'Ada referensi visual atau artis yang jadi acuan?',
      options: [
        { label: '🎮 Game art — God of War, Elden Ring, Genshin Impact', value: 'inspired by game art like God of War Elden Ring Genshin Impact' },
        { label: '🎬 Sinematik — film Hollywood atau anime movie', value: 'cinematic movie quality inspired by Hollywood or anime film' },
        { label: '🖼️ Fine art — gaya pelukis terkenal', value: 'fine art style inspired by classical or contemporary masters' },
        { label: '📱 Social media aesthetic — trending, Instagram-worthy', value: 'trending social media aesthetic Instagram-worthy viral style' },
        { label: '✦ Tidak ada referensi — AI bebas berkreasi', value: 'original creative interpretation no specific reference' },
      ],
      placeholder: 'e.g. "seperti artwork Greg Rutkowski tapi dengan sentuhan Yoji Shinkawa"',
    },
    {
      id: 'mood',
      ask: () => 'Mood / atmosfer keseluruhan?',
      options: [
        { label: '⚡ Epic & powerful', value: 'epic powerful heroic overwhelming atmosphere' },
        { label: '🌙 Dark & melancholic — sedih, sunyi', value: 'dark melancholic sad lonely somber atmosphere' },
        { label: '✨ Magical & dreamy', value: 'magical dreamy ethereal enchanting atmosphere' },
        { label: '😊 Warm & cheerful', value: 'warm cheerful cozy inviting atmosphere' },
        { label: '😨 Eerie & mysterious', value: 'eerie mysterious ominous unsettling atmosphere' },
        { label: '🌅 Nostalgic & bittersweet', value: 'nostalgic bittersweet wistful melancholic atmosphere' },
      ],
      placeholder: 'e.g. "perasaan kesepian di tengah keramaian kota"',
    },
    {
      id: 'quality',
      ask: () => 'Kualitas & detail yang diinginkan?',
      options: [
        { label: '🏆 Masterpiece — ultra detailed, award winning', value: 'masterpiece award winning ultra detailed best quality' },
        { label: '✨ High quality — detail bagus, clean, profesional', value: 'high quality detailed professional clean render' },
        { label: '🎨 Artistic — prioritaskan feel dan ekspresi', value: 'artistic expressive prioritize feel and emotion over detail' },
      ],
      placeholder: 'atau deskripsiin level detail spesifik yang kamu mau',
    },
    {
      id: 'ratio',
      ask: () => 'Aspect ratio?',
      options: [
        { label: '🖼️ Square 1:1', value: '--ar 1:1' },
        { label: '📱 Portrait 9:16', value: '--ar 9:16' },
        { label: '🖥️ Landscape 16:9', value: '--ar 16:9' },
        { label: '📺 Cinematic 21:9', value: '--ar 21:9' },
      ],
      placeholder: 'atau tulis ratio custom',
    },
  ],
};

// ─── VIDEO ROLES ───
export const VIDEO_ROLES = [
  { id: 'cinematic',  icon: '🎬', label: 'Cinematic / Film',     desc: 'Shot film, sinematografi, dramatic scene'    },
  { id: 'anime_vid',  icon: '🌸', label: 'Anime / Animated',     desc: 'Animasi 2D, motion manga, anime sequence'    },
  { id: 'music_vid',  icon: '🎵', label: 'Music Video',          desc: 'Visual musik, lyric video, concert vibes'    },
  { id: 'nature_vid', icon: '🏔️', label: 'Nature / Timelapse',   desc: 'Alam, timelapse, drone footage vibes'        },
  { id: 'abstract',   icon: '🌀', label: 'Abstract / Motion',    desc: 'Motion graphics, visual efek, glitch art'    },
  { id: 'custom_vid', icon: '✦',  label: 'Custom / Bebas',       desc: 'Deskripsiin sendiri video yang lu mau'       },
]

export const VIDEO_QUESTIONS = {

  cinematic: [
    {
      id: 'shot_type',
      ask: () => 'Tipe shot / angle kamera?',
      options: [
        { label: '🎥 Establishing shot — lebar, tunjukkan lokasi', value: 'wide establishing shot showing the full environment and setting' },
        { label: '👤 Close-up — ekspresi, detail wajah / objek', value: 'extreme close-up intimate shot capturing emotion and detail' },
        { label: '🚁 Drone / aerial — dari atas, sweeping', value: 'aerial drone shot sweeping across the landscape from above' },
        { label: '🏃 Tracking shot — kamera ikutin subjek bergerak', value: 'smooth tracking shot following the subject in motion' },
        { label: '🔄 360 rotation — putar mengelilingi subjek', value: 'slow 360 degree rotation around the subject' },
        { label: '📍 POV shot — sudut pandang orang pertama', value: 'immersive first person POV shot from the character perspective' },
      ],
      placeholder: 'e.g. "slow push-in ke wajah karakter sambil hujan turun"',
    },
    {
      id: 'subject',
      ask: () => 'Subjek / isi scene-nya?',
      options: null,
      placeholder: 'e.g. "seorang pria berjalan sendirian di jalanan kota yang sepi saat malam hujan, lampu-lampu neon memantul di genangan air"',
    },
    {
      id: 'mood',
      ask: () => 'Mood / atmosfer scene?',
      options: [
        { label: '🌧️ Melancholic & lonely — sedih, sunyi, sendirian', value: 'melancholic lonely somber emotional heavy atmosphere' },
        { label: '⚡ Epic & intense — dramatis, adrenalin, klimaks', value: 'epic intense dramatic adrenaline-pumping climactic atmosphere' },
        { label: '🌅 Hopeful & uplifting — penuh harapan, inspiratif', value: 'hopeful uplifting inspiring emotional triumphant atmosphere' },
        { label: '😨 Tense & suspenseful — tegang, mencekam, thriller', value: 'tense suspenseful eerie thriller horror atmosphere' },
        { label: '🌸 Romantic & tender — lembut, intim, hangat', value: 'romantic tender intimate warm soft emotional atmosphere' },
        { label: '🌀 Surreal & dreamlike — seperti mimpi, abstrak', value: 'surreal dreamlike abstract ethereal otherworldly atmosphere' },
      ],
      placeholder: 'e.g. "perasaan kehilangan yang dalam tapi ada acceptance di akhir"',
    },
    {
      id: 'lighting',
      ask: () => 'Pencahayaan / color grade?',
      options: [
        { label: '🌅 Golden hour — sinematik hangat, magic hour', value: 'golden hour cinematic warm orange glow magic hour lighting' },
        { label: '🌧️ Overcast blue — dingin, desaturated, moody', value: 'overcast cold blue desaturated moody cinematic grade' },
        { label: '🌃 Neon noir — warna neon, malam, kontras tinggi', value: 'neon noir night city lights high contrast colorful reflections' },
        { label: '⚡ High contrast — bayangan kuat, dramatic chiaroscuro', value: 'dramatic chiaroscuro high contrast deep shadows cinematic' },
        { label: '🕯️ Candle / fire light — hangat, flicker, intimate', value: 'warm candlelight flickering fire intimate low key lighting' },
      ],
      placeholder: 'e.g. "teal and orange color grade seperti film Christopher Nolan"',
    },
    {
      id: 'movement',
      ask: () => 'Pergerakan kamera / tempo?',
      options: [
        { label: '🐌 Extremely slow — hyper slow motion, setiap detail terlihat', value: 'hyper slow motion ultra slow detailed movement 1000fps' },
        { label: '🦶 Slow & deliberate — tenang, sinematik, thoughtful', value: 'slow deliberate cinematic movement thoughtful pacing' },
        { label: '⚡ Dynamic & fast — energetik, quick cuts, action', value: 'dynamic fast movement energetic quick camera work action' },
        { label: '📷 Static / locked — kamera diam, subjek bergerak', value: 'static locked camera movement within the frame' },
      ],
      placeholder: 'e.g. "mulai lambat terus accelerate saat musik naik"',
    },
    {
      id: 'reference',
      ask: () => 'Referensi film / sinematografer?',
      options: [
        { label: '🎬 Christopher Nolan — epic, complex, IMAX scale', value: 'Christopher Nolan style epic complex large scale cinematic' },
        { label: '🌊 Denis Villeneuve — minimalist, vast, philosophical', value: 'Denis Villeneuve style minimalist vast atmospheric philosophical' },
        { label: '🌸 Wong Kar-wai — romantic, dreamy, handheld blur', value: 'Wong Kar-wai style romantic dreamy blurred motion melancholic' },
        { label: '⚡ Zack Snyder — slow-mo, desaturated, mythic', value: 'Zack Snyder style slow motion desaturated mythic heroic' },
        { label: '🎨 Wes Anderson — symmetric, pastel, quirky', value: 'Wes Anderson style symmetric pastel deadpan quirky composed' },
        { label: '✦ Tidak ada referensi — freestyle', value: 'original cinematic style no specific reference' },
      ],
      placeholder: 'e.g. "seperti opening sequence film A24"',
    },
  ],

  anime_vid: [
    {
      id: 'style',
      ask: () => 'Style animasi yang diinginkan?',
      options: [
        { label: '🗡️ Action sequence — pertarungan, combat, sakuga', value: 'high quality anime action sequence sakuga animation fluid movement' },
        { label: '🌸 Slice of life — kehidupan sehari-hari, tenang, cozy', value: 'slice of life anime peaceful daily life warm cozy animation' },
        { label: '🌌 Epic cinematic — opening sequence, dramatic reveal', value: 'epic anime cinematic opening sequence dramatic reveal animation' },
        { label: '😭 Emotional scene — tangis, perpisahan, reuni', value: 'emotional anime scene dramatic tears farewell reunion animation' },
        { label: '🎵 AMV style — sync dengan musik, dynamic cuts', value: 'anime music video AMV style dynamic cuts music synchronized' },
      ],
      placeholder: 'e.g. "transformation sequence seorang magical girl dengan partikel cahaya"',
    },
    {
      id: 'subject',
      ask: () => 'Konten / scene yang mau dianimasikan?',
      options: null,
      placeholder: 'e.g. "dua karakter berlari di pantai saat matahari terbenam, rambut mereka berkibar terbawa angin"',
    },
    {
      id: 'mood',
      ask: () => 'Mood scene-nya?',
      options: [
        { label: '⚡ Hype & energik — bikin merinding, goosebumps', value: 'hype energetic goosebumps exciting pumped up atmosphere' },
        { label: '😭 Emotional & tearjerker — bikin nangis', value: 'deeply emotional tearjerker heartbreaking bittersweet atmosphere' },
        { label: '🌸 Wholesome & warm — hangat, comforting', value: 'wholesome warm comfortable heartwarming healing atmosphere' },
        { label: '😨 Tense & dramatic — ketegangan, konflik', value: 'tense dramatic high stakes conflict intense atmosphere' },
        { label: '🌟 Triumphant — kemenangan, bangkit, epic ending', value: 'triumphant victorious rising up epic conclusion atmosphere' },
      ],
      placeholder: 'e.g. "perasaan nostalgia dan rindu seperti ending Clannad"',
    },
    {
      id: 'studio_ref',
      ask: () => 'Referensi studio / series?',
      options: [
        { label: '🌸 Studio Ghibli — painterly, magical, Miyazaki', value: 'Studio Ghibli style painterly magical whimsical Miyazaki animation' },
        { label: '⚡ MAPPA — dark, detailed, intense (Jujutsu Kaisen)', value: 'MAPPA studio style dark detailed intense fluid Jujutsu Kaisen' },
        { label: '🌅 Makoto Shinkai — cinematic sky, emotional, Your Name', value: 'Makoto Shinkai style hyper detailed sky emotional cinematic Your Name' },
        { label: '🗡️ Ufotable — fluid effects, god rays, Demon Slayer', value: 'Ufotable style fluid effects god rays breathtaking Demon Slayer' },
        { label: '✦ Original style — tidak ada referensi', value: 'original unique anime animation style' },
      ],
      placeholder: 'e.g. "seperti battle sequence dari Attack on Titan season 4"',
    },
  ],

  music_vid: [
    {
      id: 'genre',
      ask: () => 'Genre musiknya?',
      options: [
        { label: '🎸 Rock / metal — raw, dark, energetik', value: 'rock metal music video raw dark energetic concert atmosphere' },
        { label: '🌊 Lo-fi / chill — aesthetic, cozy, dreamy', value: 'lo-fi chill aesthetic cozy dreamy relaxing music video' },
        { label: '💜 Pop / K-pop — colorful, choreography, glossy', value: 'pop kpop music video colorful choreography high production glossy' },
        { label: '🌙 R&B / Soul — moody, intimate, emotional', value: 'rnb soul music video moody intimate emotional low light aesthetic' },
        { label: '⚡ EDM / Electronic — visual effects, neon, rave', value: 'edm electronic music video neon rave light effects visual spectacle' },
        { label: '🎻 Orchestral / cinematic — epic, emotional, grand', value: 'orchestral cinematic music video grand emotional sweeping visuals' },
      ],
      placeholder: 'e.g. "indie folk acoustic dengan visual alam terbuka"',
    },
    {
      id: 'visual_style',
      ask: () => 'Style visual yang diinginkan?',
      options: [
        { label: '🎞️ Film grain / analog — retro, vintage, 8mm feel', value: 'film grain analog retro vintage 8mm super8 aesthetic' },
        { label: '✨ Hyper glossy — clean, high production, futuristic', value: 'hyper glossy clean high production value futuristic sleek' },
        { label: '🎨 Artistic / painted — ilustrasi, watercolor, unique', value: 'artistic painted illustration watercolor unique visual style' },
        { label: '🌀 Glitch / digital — error, matrix, cyberpunk', value: 'glitch digital distortion cyberpunk matrix error aesthetic' },
        { label: '🌿 Natural / organic — outdoor, genuine, documentary', value: 'natural organic outdoor genuine documentary feel raw' },
      ],
      placeholder: 'e.g. "visual seperti MV BTS Fake Love yang dark dan cinematic"',
    },
    {
      id: 'mood',
      ask: () => 'Vibe / perasaan yang ingin disampaikan?',
      options: [
        { label: '💔 Heartbreak & longing — patah hati, rindu', value: 'heartbreak longing melancholic sad yearning emotional atmosphere' },
        { label: '🔥 Hype & celebration — semangat, pesta, euphoria', value: 'hype celebration euphoric energy party festival atmosphere' },
        { label: '🌙 Introspective — merenung, contemplative, deep', value: 'introspective contemplative deep thoughtful quiet atmosphere' },
        { label: '💪 Empowerment — kuat, bangkit, confident', value: 'empowerment strong rising up confident powerful atmosphere' },
        { label: '🌸 Romantic — cinta, tender, sweet', value: 'romantic tender sweet loving warm intimate atmosphere' },
      ],
      placeholder: 'e.g. "perasaan nostalgia summer yang udah berlalu"',
    },
  ],

  nature_vid: [
    {
      id: 'type',
      ask: () => 'Tipe footage alam yang diinginkan?',
      options: [
        { label: '⏱️ Timelapse — awan bergerak, matahari terbit/benam', value: 'dramatic timelapse clouds moving sun rising setting time compression' },
        { label: '🚁 Drone aerial — landscape dari atas, sweeping', value: 'aerial drone footage sweeping landscape birds eye view' },
        { label: '🌊 Macro / extreme close-up — detail tersembunyi alam', value: 'macro extreme close-up hidden details nature insects dewdrops' },
        { label: '🦁 Wildlife — hewan di habitat aslinya', value: 'wildlife animals in natural habitat documentary style' },
        { label: '🌋 Epic landscape — gunung, laut, hutan megah', value: 'epic landscape cinematic mountains ocean forest vast scale' },
        { label: '🌧️ Weather event — badai, petir, aurora', value: 'dramatic weather event storm lightning aurora borealis' },
      ],
      placeholder: 'e.g. "timelapse Milky Way di atas gunung berapi aktif"',
    },
    {
      id: 'location',
      ask: () => 'Lokasi / setting?',
      options: null,
      placeholder: 'e.g. "hutan hujan tropis Indonesia saat golden hour dengan sungai mengalir jernih"',
    },
    {
      id: 'mood',
      ask: () => 'Mood / feel yang diinginkan?',
      options: [
        { label: '😌 Peaceful & meditative — tenang, healing, mindful', value: 'peaceful meditative tranquil healing mindful serene atmosphere' },
        { label: '😮 Awe-inspiring — takjub, overwhelming beauty', value: 'awe-inspiring overwhelming beautiful humbling grand atmosphere' },
        { label: '🌙 Mysterious — gelap, unknown, primordial', value: 'mysterious dark unknown ancient primordial wild atmosphere' },
        { label: '⚡ Raw & powerful — kekuatan alam, dramatis', value: 'raw powerful dramatic force of nature intense atmosphere' },
      ],
      placeholder: 'e.g. "seperti dokumenter BBC Planet Earth yang membuat merinding"',
    },
    {
      id: 'camera_style',
      ask: () => 'Gaya sinematografi?',
      options: [
        { label: '📽️ Documentary — natural, authentic, David Attenborough', value: 'documentary natural authentic BBC style David Attenborough cinematic' },
        { label: '🎨 Artistic / experimental — tidak konvensional, unik', value: 'artistic experimental unconventional unique visual approach' },
        { label: '🌅 Hyper cinematic — color grade kuat, dramatic', value: 'hyper cinematic strong color grade dramatic composition epic scale' },
      ],
      placeholder: 'e.g. "seperti National Geographic tapi lebih artistic"',
    },
  ],

  abstract: [
    {
      id: 'style',
      ask: () => 'Tipe visual abstrak / motion graphics?',
      options: [
        { label: '🌀 Fluid simulation — cairan, smoke, lava lamp', value: 'fluid simulation liquid smoke morphing organic flowing abstract' },
        { label: '⚡ Glitch / databend — error digital, corrupted beauty', value: 'glitch databend corrupted digital error aesthetic vaporwave' },
        { label: '🌐 Geometric / 3D — bentuk geometris bergerak, minimalis', value: 'geometric 3D shapes moving minimalist motion design clean' },
        { label: '✨ Particle system — ribuan partikel membentuk pola', value: 'particle system thousands of points forming patterns generative art' },
        { label: '🎨 Paint / ink — cat mengalir, tinta menyebar', value: 'paint ink bleeding spreading mixing organic abstract expressionism' },
        { label: '🌌 Cosmic / nebula — luar angkasa, galaksi, stellar', value: 'cosmic nebula galaxy stellar space abstract colorful deep space' },
      ],
      placeholder: 'e.g. "warna-warna neon yang meleleh seperti lilin saat musik jazz"',
    },
    {
      id: 'color_mood',
      ask: () => 'Palet warna / mood visual?',
      options: [
        { label: '🌈 Vibrant & psychedelic — warna-warni intens', value: 'vibrant psychedelic intense saturated colorful neon palette' },
        { label: '🌙 Dark & monochromatic — hitam putih atau satu warna', value: 'dark monochromatic minimal single color deep shadows' },
        { label: '🌸 Pastel & dreamy — lembut, soft, romantic', value: 'soft pastel dreamy romantic gentle muted palette' },
        { label: '🔥 Fire & earth — merah, oranye, gold, hangat', value: 'fire earth tones warm red orange gold amber palette' },
        { label: '🌊 Ocean & cool — biru, teal, hijau, sejuk', value: 'ocean cool tones blue teal cyan green cold palette' },
      ],
      placeholder: 'e.g. "gradien dari deep purple ke electric blue dengan partikel emas"',
    },
    {
      id: 'tempo',
      ask: () => 'Tempo / kecepatan visual?',
      options: [
        { label: '🐌 Slow & hypnotic — pelan, meditative, ASMR', value: 'slow hypnotic meditative ASMR calming gentle movement' },
        { label: '🎵 Music-driven — mengikuti beat dan ritme', value: 'music driven beat synchronized rhythmic pulsing movement' },
        { label: '⚡ Fast & intense — cepat, overwhelming, sensory', value: 'fast intense overwhelming sensory overload rapid movement' },
      ],
      placeholder: 'e.g. "mulai lambat lalu eksplosi di menit ke-2"',
    },
  ],

  custom_vid: [
    {
      id: 'description',
      ask: () => 'Deskripsiin video yang lu mau — sebebas mungkin!',
      options: null,
      placeholder: 'e.g. "video pendek 30 detik tentang seorang astronaut yang menemukan bunga yang tumbuh di Mars, sinematik, melankolis tapi hopeful"',
    },
    {
      id: 'mood',
      ask: () => 'Mood / atmosfer utama?',
      options: [
        { label: '🌧️ Melancholic & sad — sedih, rindu, berat', value: 'melancholic sad heavy nostalgic longing atmosphere' },
        { label: '⚡ Epic & powerful — megah, goosebumps, intense', value: 'epic powerful intense dramatic goosebumps atmosphere' },
        { label: '🌸 Warm & hopeful — hangat, harapan, healing', value: 'warm hopeful healing uplifting comforting atmosphere' },
        { label: '😨 Dark & tense — gelap, mencekam, thriller', value: 'dark tense eerie suspenseful unsettling atmosphere' },
        { label: '🌀 Surreal & dreamlike — mimpi, tidak nyata', value: 'surreal dreamlike abstract otherworldly liminal atmosphere' },
        { label: '✨ Magical & wonder — ajaib, wonder, childhood', value: 'magical wonder childlike awe inspiring fantastical atmosphere' },
      ],
      placeholder: 'e.g. "seperti video yang bikin nangis tanpa alasan yang jelas"',
    },
    {
      id: 'reference',
      ask: () => 'Ada referensi visual atau film yang jadi acuan?',
      options: [
        { label: '🎬 Film pendek A24 — artistic, emotional, indie', value: 'A24 film style artistic emotional indie cinematic quality' },
        { label: '📺 Iklan sinematik — Nike, Apple, Coca-Cola vibes', value: 'cinematic commercial advertisement style Nike Apple emotional' },
        { label: '🎵 Music video artistik — Billie Eilish, The Weeknd', value: 'artistic music video style Billie Eilish The Weeknd dark aesthetic' },
        { label: '🌍 Dokumenter sinematik — BBC, NatGeo style', value: 'cinematic documentary BBC National Geographic style' },
        { label: '✦ Original — tidak ada referensi', value: 'original creative vision no specific reference' },
      ],
      placeholder: 'e.g. "seperti iklan parfum mewah yang surreal dan artistik"',
    },
    {
      id: 'duration_feel',
      ask: () => 'Durasi dan pacing yang diinginkan?',
      options: [
        { label: '⚡ Short & punchy — 15-30 detik, padat berisi', value: '15-30 seconds short punchy impactful every second counts' },
        { label: '🎬 Medium — 1-3 menit, ada arc cerita', value: '1-3 minutes medium length with narrative arc progression' },
        { label: '🌊 Long form — 5+ menit, immersive experience', value: '5+ minutes long form immersive atmospheric experience' },
      ],
      placeholder: 'e.g. "60 detik yang terasa seperti perjalanan emosional yang lengkap"',
    },
  ],
}
