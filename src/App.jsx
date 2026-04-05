import { useState, useRef, useEffect, useCallback } from 'react'
import './index.css'

const templates = {
  youtube: { role: '🎥 Content creator YouTube Indonesia', task: 'tulis script YouTube', context: '', output: 'dalam format script dengan timestamp [00:00]' },
  tiktok: { role: '📱 Content creator TikTok Gen Z', task: 'buat konten TikTok hook 3 detik', context: '', output: 'dalam format narasi pendek, max 300 kata' },
  code: { role: '👨‍💻 Senior Software Engineer Python', task: 'tulis kode Python yang bersih dan efisien', context: '', output: 'dalam format kode dengan komentar penjelasan' },
  analisis: { role: '🕵️ Detektif kriminal berpengalaman', task: 'analisis dan rangkum kasus', context: '', output: 'dalam format bullet points per fakta kunci' },
};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState('text');
  const [phase, setPhase] = useState('welcome');
  const [builderState, setBuilderState] = useState({
    role: '', task: '', context: '', output: '', stop: false
  });
  const [convHistory, setConvHistory] = useState([
    { icon: '✦', label: 'Sesi ini', active: true },
    { icon: '📹', label: 'Script Detektif Malam Ep12' },
    { icon: '📱', label: 'Hook InClipps soft skills' },
    { icon: '🐍', label: 'Python automation n8n' },
  ]);

  const chatInnerRef = useRef(null);
  const chatAreaRef = useRef(null);
  const inputRef = useRef(null);
  const toastRef = useRef(null);
  const genBtnRef = useRef(null);

  const scrollBottom = useCallback(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, []);

  const showToast = useCallback((msg) => {
    const t = toastRef.current;
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }, []);

  // ─── DOM manipulation helpers (matching vanilla JS behavior exactly) ───
  const appendMsg = useCallback((role, text) => {
    const inner = chatInnerRef.current;
    if (!inner) return;
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    inner.appendChild(div);
    scrollBottom();
  }, [scrollBottom]);

  const showTyping = useCallback(() => {
    const inner = chatInnerRef.current;
    if (!inner) return Promise.resolve();
    const el = document.createElement('div');
    el.className = 'msg bot';
    el.id = 'typing-indicator';
    el.innerHTML = `<div class="bubble" style="padding:10px 16px"><div class="dots"><span></span><span></span><span></span></div></div>`;
    inner.appendChild(el);
    scrollBottom();
    return new Promise(r => setTimeout(r, 900));
  }, [scrollBottom]);

  const removeTyping = useCallback(() => {
    document.getElementById('typing-indicator')?.remove();
  }, []);

  const removeYNRow = useCallback(() => {
    document.querySelectorAll('.yn-row').forEach(el => el.remove());
  }, []);

  // ─── INIT ───
  useEffect(() => {
    renderWelcome();
  }, []);

  const renderWelcome = () => {
    const inner = chatInnerRef.current;
    if (!inner) return;
    inner.innerHTML = `
      <div class="welcome-block">
        <div class="welcome-glyph">✦</div>
        <div class="welcome-q">Mau bikin prompt apa hari ini?</div>
        <div class="welcome-sub">Bantu lu ngobrol sama AI dengan cara yang bener.</div>
        <div class="quick-pills">
          <button class="quick-pill" data-quick="Script YouTube Detektif Malam">📹 Script YouTube</button>
          <button class="quick-pill" data-quick="Konten TikTok tentang soft skills">📱 TikTok / Reels</button>
          <button class="quick-pill" data-quick="Kode Python automation">🐍 Nulis Kode</button>
          <button class="quick-pill" data-quick="Analisis kasus atau dokumen">🔍 Analisis</button>
          <button class="quick-pill" data-quick="Caption Instagram yang engaging">📸 Caption IG</button>
          <button class="quick-pill" data-quick="Saya mau bikin prompt custom">✦ Lainnya...</button>
        </div>
      </div>
    `;
    // Attach click handlers
    inner.querySelectorAll('.quick-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-quick');
        if (inputRef.current) inputRef.current.value = text;
        handleSendMessage();
      });
    });
  };

  // Use a ref for phase since DOM manipulation callbacks need the latest value
  const phaseRef = useRef(phase);
  const builderRef = useRef(builderState);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { builderRef.current = builderState; }, [builderState]);

  const handleSendMessage = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';

    appendMsg('user', text);

    if (phaseRef.current === 'welcome') {
      phaseRef.current = 'asked';
      setPhase('asked');
      setBuilderState(prev => {
        const next = { ...prev, task: text };
        builderRef.current = next;
        return next;
      });
      showTyping().then(() => {
        removeTyping();
        askConfirm(text);
      });
    } else {
      showTyping().then(() => {
        removeTyping();
        appendMsg('bot', 'Oke! Klik "✦ Generate Prompt" di bawah kalau udah siap, atau tambahin detail dulu di form yang ada ya.');
      });
    }
    scrollBottom();
  }, [appendMsg, showTyping, removeTyping, scrollBottom]);

  const askConfirm = (task) => {
    const inner = chatInnerRef.current;
    if (!inner) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg bot';
    msgDiv.innerHTML = `
      <div class="bubble">Oke, jadi lu mau bikin prompt untuk: <strong>${task}</strong>.<br>Butuh bantuan gw isi framework-nya?</div>
      <div class="yn-row">
        <button class="yn-btn yes" data-action="yes">✓ Ya, bantu gw</button>
        <button class="yn-btn no" data-action="no">Gw isi sendiri</button>
        <button class="yn-btn" data-action="else">Mau topik lain...</button>
      </div>
    `;
    msgDiv.querySelector('[data-action="yes"]').addEventListener('click', handleYes);
    msgDiv.querySelector('[data-action="no"]').addEventListener('click', handleNo);
    msgDiv.querySelector('[data-action="else"]').addEventListener('click', handleElse);
    inner.appendChild(msgDiv);
    scrollBottom();
  };

  const handleYes = () => {
    removeYNRow();
    appendMsg('user', 'Ya, bantu gw');
    showTyping().then(() => {
      removeTyping();
      appendMsg('bot', 'Siap! Lengkapin framework RTCF di bawah ya. Makin detail makin bagus hasilnya 🔥');
      renderBuilder();
    });
  };

  const handleNo = () => {
    removeYNRow();
    appendMsg('user', 'Gw isi sendiri');
    showTyping().then(() => {
      removeTyping();
      appendMsg('bot', 'No worries! Isi aja langsung di builder ya. Kalau bingung, tanya aja ke gw.');
      renderBuilder();
    });
  };

  const handleElse = () => {
    removeYNRow();
    appendMsg('user', 'Mau topik lain...');
    showTyping().then(() => {
      removeTyping();
      appendMsg('bot', 'Oke, ketik topik atau tujuan lu, gw siap bantu!');
      phaseRef.current = 'welcome';
      setPhase('welcome');
    });
  };

  const renderBuilder = () => {
    phaseRef.current = 'builder';
    setPhase('builder');
    const inner = chatInnerRef.current;
    if (!inner) return;
    const bs = builderRef.current;
    const card = document.createElement('div');
    card.className = 'msg bot';
    card.id = 'builder-card-msg';
    card.innerHTML = `
      <div class="builder-card">
        <div>
          <div class="builder-section-label">🎭 ROLE — AI jadi siapa?</div>
          <div class="chips-row" id="bc-role-chips">
            ${['👨‍💻 Senior Dev','✍️ Copywriter','🕵️ Detektif','📊 Analyst','🎓 Dosen','🎥 YouTuber'].map(r =>
              `<button class="chip${bs.role===r?' sel':''}" data-field="role" data-val="${r}">${r}</button>`
            ).join('')}
          </div>
          <textarea class="mini-input" id="bc-role" placeholder="atau deskripsiin sendiri...">${bs.role&&!['👨‍💻 Senior Dev','✍️ Copywriter','🕵️ Detektif','📊 Analyst','🎓 Dosen','🎥 YouTuber'].includes(bs.role)?bs.role:''}</textarea>
        </div>
        <div>
          <div class="builder-section-label">🎯 TASK — Mau ngerjain apa?</div>
          <div class="chips-row">
            ${['Script YouTube','Script TikTok','Rangkum','Kode Python','Caption IG','Jelaskan'].map(t =>
              `<button class="chip" data-field="task" data-val="${t}">${t}</button>`
            ).join('')}
          </div>
          <textarea class="mini-input" id="bc-task" placeholder="atau tulis task-nya...">${bs.task||''}</textarea>
        </div>
        <div>
          <div class="builder-section-label">📋 CONTEXT — Background info</div>
          <textarea class="mini-input" id="bc-ctx" rows="3" placeholder="topik, angle, audiens target...">${bs.context||''}</textarea>
        </div>
        <div>
          <div class="builder-section-label">📤 OUTPUT FORMAT</div>
          <div class="chips-row">
            ${['Script timestamp','Bullet points','Tabel','JSON','Narasi'].map(o =>
              `<button class="chip${bs.output===o?' sel2':''}" data-field="output" data-val="${o}" data-type="output">${o}</button>`
            ).join('')}
          </div>
        </div>
        <div class="chips-row">
          <button class="chip" id="stop-chip">❓ Tanya 3 pertanyaan dulu</button>
        </div>
        <div class="build-row">
          <button class="build-btn" id="gen-btn">✦ Generate Prompt & Saran AI</button>
        </div>
      </div>
    `;

    // Attach event listeners
    card.querySelectorAll('.chip[data-field="role"]').forEach(el => {
      el.addEventListener('click', () => {
        el.closest('.chips-row').querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
        el.classList.add('sel');
        builderRef.current = { ...builderRef.current, role: el.dataset.val };
        setBuilderState(prev => ({ ...prev, role: el.dataset.val }));
        const roleInput = document.getElementById('bc-role');
        if (roleInput) roleInput.value = '';
      });
    });

    card.querySelectorAll('.chip[data-field="task"]').forEach(el => {
      el.addEventListener('click', () => {
        el.closest('.chips-row').querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
        el.classList.add('sel');
        builderRef.current = { ...builderRef.current, task: el.dataset.val };
        setBuilderState(prev => ({ ...prev, task: el.dataset.val }));
        const taskInput = document.getElementById('bc-task');
        if (taskInput) taskInput.value = '';
      });
    });

    card.querySelectorAll('.chip[data-type="output"]').forEach(el => {
      el.addEventListener('click', () => {
        el.closest('.chips-row').querySelectorAll('.chip').forEach(c => c.classList.remove('sel2'));
        el.classList.add('sel2');
        builderRef.current = { ...builderRef.current, output: el.dataset.val };
        setBuilderState(prev => ({ ...prev, output: el.dataset.val }));
      });
    });

    const roleInput = card.querySelector('#bc-role');
    if (roleInput) roleInput.addEventListener('input', (e) => {
      builderRef.current = { ...builderRef.current, role: e.target.value };
      setBuilderState(prev => ({ ...prev, role: e.target.value }));
    });

    const taskInput = card.querySelector('#bc-task');
    if (taskInput) taskInput.addEventListener('input', (e) => {
      builderRef.current = { ...builderRef.current, task: e.target.value };
      setBuilderState(prev => ({ ...prev, task: e.target.value }));
    });

    const ctxInput = card.querySelector('#bc-ctx');
    if (ctxInput) ctxInput.addEventListener('input', (e) => {
      builderRef.current = { ...builderRef.current, context: e.target.value };
      setBuilderState(prev => ({ ...prev, context: e.target.value }));
    });

    card.querySelector('#stop-chip')?.addEventListener('click', (e) => {
      builderRef.current = { ...builderRef.current, stop: !builderRef.current.stop };
      setBuilderState(prev => ({ ...prev, stop: !prev.stop }));
      e.target.classList.toggle('sel');
    });

    card.querySelector('#gen-btn')?.addEventListener('click', () => generatePrompt());

    inner.appendChild(card);
    scrollBottom();
  };

  const buildPrompt = () => {
    const bs = builderRef.current;
    // Grab latest from DOM inputs if available
    const roleVal = bs.role || document.getElementById('bc-role')?.value || '';
    const taskVal = bs.task || document.getElementById('bc-task')?.value || '';
    const ctxVal = document.getElementById('bc-ctx')?.value || bs.context;

    const parts = [];
    if (roleVal) parts.push(`[ROLE] Kamu adalah ${roleVal}.`);
    if (taskVal) parts.push(`[TASK] ${taskVal}.`);
    if (ctxVal) parts.push(`[CONTEXT] ${ctxVal}`);
    if (bs.output) parts.push(`[OUTPUT] Tulis hasilnya ${bs.output}.`);
    if (bs.stop) parts.push(`[ITERATE] Sebelum mulai, tanya saya 3 pertanyaan klarifikasi dulu.`);
    return parts.join('\n\n');
  };

  const generatePrompt = async () => {
    const btn = document.getElementById('gen-btn');
    const bs = builderRef.current;
    if (!bs.role && !bs.task && !document.getElementById('bc-task')?.value) {
      showToast('Isi minimal Role atau Task dulu!');
      return;
    }
    // Sync latest input values
    builderRef.current = {
      ...builderRef.current,
      role: builderRef.current.role || document.getElementById('bc-role')?.value || '',
      task: builderRef.current.task || document.getElementById('bc-task')?.value || '',
      context: document.getElementById('bc-ctx')?.value || builderRef.current.context,
    };

    if (btn) { btn.disabled = true; btn.textContent = 'Generating...'; }

    const promptText = buildPrompt();
    showTyping();

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Kamu adalah Inprompting AI — expert prompt engineer. User sudah membuat prompt dengan framework RTCF. Tugas kamu: berikan TEPAT 4 saran spesifik dan actionable untuk memperkuat prompt itu, dalam bahasa Indonesia informal/gaul. Balas HANYA JSON ini (no preamble, no backticks):
{"suggestions":[{"num":"01","text":"..."},{"num":"02","text":"..."},{"num":"03","text":"..."},{"num":"04","text":"..."}]}`,
          messages: [{ role: "user", content: `Prompt:\n${promptText}\n\nBerikan 4 saran spesifik.` }]
        })
      });
      const data = await res.json();
      const raw = data.content.map(i => i.text || '').join('');
      let sugs = [];
      try {
        sugs = JSON.parse(raw.replace(/```json|```/g, '').trim()).suggestions;
      } catch (e) {
        sugs = [
          { num: "01", text: "Tambahin detail persona role: berapa tahun pengalaman, spesialisasi apa?" },
          { num: "02", text: "Spesifikkan ukuran sukses — apa yang bikin output ini dianggap sempurna?" },
          { num: "03", text: "Tambah anti-pattern: bilang apa yang JANGAN dilakukan AI" },
          { num: "04", text: "Kasih contoh output singkat biar AI punya reference visual" }
        ];
      }
      removeTyping();
      renderResult(promptText, sugs);
    } catch (err) {
      removeTyping();
      renderResult(promptText, [
        { num: "01", text: "Tambahin detail persona role yang lebih spesifik" },
        { num: "02", text: "Definisikan ukuran sukses output yang lu mau" },
        { num: "03", text: "Tambah 'jangan lakukan X' biar AI nggak menyimpang" },
        { num: "04", text: "Sertakan contoh singkat format output yang ideal" }
      ]);
    }
    if (btn) { btn.disabled = false; btn.textContent = '✦ Generate Prompt & Saran AI'; }
  };

  const renderResult = (promptText, sugs) => {
    const inner = chatInnerRef.current;
    if (!inner) return;

    const pFormatted = promptText
      .replace(/\[ROLE\]/g, '<span class="tag">[ROLE]</span>')
      .replace(/\[TASK\]/g, '<span class="tag">[TASK]</span>')
      .replace(/\[CONTEXT\]/g, '<span class="tag">[CONTEXT]</span>')
      .replace(/\[OUTPUT\]/g, '<span class="tag">[OUTPUT]</span>')
      .replace(/\[ITERATE\]/g, '<span class="tag">[ITERATE]</span>');

    const sugCards = sugs.map(s => `
      <button class="sug-card" data-sug="${s.text.replace(/"/g, '&quot;')}">
        <span class="sug-num">${s.num}</span>
        <span class="sug-text">${s.text}</span>
      </button>
    `).join('');

    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = `
      <div class="prompt-result">
        <div class="pr-label">✦ PROMPT SIAP COPAS</div>
        <button class="pr-copy">Copy ⌘</button>
        <div class="pr-text" id="final-prompt">${pFormatted}</div>
      </div>
      <div class="suggest-cards">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;">💡 Saran dari AI buat nguatin prompt lu</div>
        ${sugCards}
        <button class="sug-card else-card" data-regen="true">
          <span class="sug-num">↻</span>
          <span class="sug-text">Nggak ada yang cocok? Generate saran baru...</span>
        </button>
      </div>
      <div class="yn-row" style="margin-top:4px;">
        <button class="yn-btn yes" data-action="newchat">✦ Buat prompt baru</button>
        <button class="yn-btn" data-action="edit">✎ Edit lagi</button>
      </div>
    `;

    // Attach events
    div.querySelector('.pr-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(buildPrompt()).then(() => showToast('✓ Prompt di-copy!'));
    });

    div.querySelectorAll('.sug-card[data-sug]').forEach(el => {
      el.addEventListener('click', () => {
        const text = el.dataset.sug;
        if (!builderRef.current.context) builderRef.current.context = text;
        else builderRef.current.context += '. ' + text;
        setBuilderState(prev => ({
          ...prev,
          context: prev.context ? prev.context + '. ' + text : text
        }));
        showToast('Saran ditambahkan! Klik Edit lagi buat update prompt.');
      });
    });

    div.querySelector('[data-regen]')?.addEventListener('click', () => generatePrompt());
    div.querySelector('[data-action="newchat"]')?.addEventListener('click', () => handleNewChat());
    div.querySelector('[data-action="edit"]')?.addEventListener('click', () => renderBuilder());

    inner.appendChild(div);

    // Add to conv history
    setConvHistory(prev => [
      { icon: '✦', label: builderRef.current.task || 'Prompt baru' },
      ...prev
    ]);

    scrollBottom();
    phaseRef.current = 'result';
    setPhase('result');
  };

  const handleNewChat = () => {
    builderRef.current = { role: '', task: '', context: '', output: '', stop: false };
    setBuilderState({ role: '', task: '', context: '', output: '', stop: false });
    if (inputRef.current) inputRef.current.value = '';
    phaseRef.current = 'welcome';
    setPhase('welcome');
    renderWelcome();
  };

  const handleLoadTemplate = (tpl) => {
    const t = templates[tpl];
    if (!t) return;
    builderRef.current = { ...t, stop: false };
    setBuilderState({ ...t, stop: false });
    handleNewChat();
    setTimeout(() => {
      appendMsg('user', `Pakai template: ${tpl}`);
      renderBuilder();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAutoResize = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleModeClick = (el, m) => {
    setMode(m);
  };

  return (
    <>
      {/* ── SIDEBAR ── */}
      <div className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`} id="sidebar">
        <div className="sidebar-top">
          <div className="logo">In<span>prompting</span></div>
          <button className="icon-btn-sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle sidebar">☰</button>
        </div>

        <div className="sb-section">
          <button className="sb-item new-chat" onClick={handleNewChat}>
            <span className="sb-icon">✦</span>
            <span className="sb-label">New Chat</span>
          </button>
          <button className="sb-item">
            <span className="sb-icon">⌕</span>
            <span className="sb-label">Search</span>
          </button>
        </div>

        <div className="sb-section">
          <div className="sb-section-label">MODE</div>
          <button className={`sb-item${mode === 'text' ? ' active' : ''}`} onClick={() => setMode('text')}>
            <span className="sb-icon">✦</span>
            <span className="sb-label">Text Prompting</span>
          </button>
          <button className={`sb-item${mode === 'image' ? ' active' : ''}`} onClick={() => setMode('image')}>
            <span className="sb-icon">🖼</span>
            <span className="sb-label">Image Prompting</span>
            <span className="sb-badge">soon</span>
          </button>
          <button className={`sb-item${mode === 'video' ? ' active' : ''}`} onClick={() => setMode('video')}>
            <span className="sb-icon">🎬</span>
            <span className="sb-label">Video Prompting</span>
            <span className="sb-badge">soon</span>
          </button>
        </div>

        <div className="sb-section">
          <div className="sb-section-label">TEMPLATES</div>
          <button className="sb-item" onClick={() => handleLoadTemplate('youtube')}>
            <span className="sb-icon">📹</span>
            <span className="sb-label">Script YouTube</span>
          </button>
          <button className="sb-item" onClick={() => handleLoadTemplate('tiktok')}>
            <span className="sb-icon">📱</span>
            <span className="sb-label">Script TikTok</span>
          </button>
          <button className="sb-item" onClick={() => handleLoadTemplate('code')}>
            <span className="sb-icon">🐍</span>
            <span className="sb-label">Kode Python</span>
          </button>
          <button className="sb-item" onClick={() => handleLoadTemplate('analisis')}>
            <span className="sb-icon">🔍</span>
            <span className="sb-label">Analisis Kasus</span>
          </button>
        </div>

        <div className="sb-section" style={{ flex: 1 }}>
          <div className="sb-section-label">RIWAYAT</div>
        </div>
        <div className="conv-list" id="conv-list">
          {convHistory.map((item, i) => (
            <div key={i} className={`conv-item${item.active ? ' active' : ''}`}>
              <span className="conv-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN PANEL ── */}
      <div className="main">
        <div className="chat-header">
          <div className="chat-title">TEXT PROMPT BUILDER</div>
          <div className="mode-pills">
            <button className="mode-pill active">✦ Text</button>
            <button className="mode-pill soon">🖼 Image <span className="pill-badge">soon</span></button>
            <button className="mode-pill soon">🎬 Video <span className="pill-badge">soon</span></button>
          </div>
        </div>

        <div className="chat-area" id="chat-area" ref={chatAreaRef}>
          <div className="chat-inner" id="chat-inner" ref={chatInnerRef}>
            {/* welcome state rendered by JS */}
          </div>
        </div>

        <div className="input-bar">
          <div className="input-wrap">
            <textarea
              id="main-input"
              ref={inputRef}
              placeholder="Ketik tujuan lu di sini..."
              rows="1"
              onKeyDown={handleKeyDown}
              onInput={handleAutoResize}
            />
            <button className="send-btn" id="send-btn" onClick={handleSendMessage}>↑</button>
          </div>
        </div>
      </div>

      <div className="toast" id="toast" ref={toastRef}>✓ Tersalin!</div>
    </>
  );
}

export default App
