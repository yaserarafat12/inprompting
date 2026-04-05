import { useState, useRef, useEffect } from 'react'
import { useChat } from './hooks/useChat'
import { useImageChat } from './hooks/useImageChat'
import { useVideoChat } from './hooks/useVideoChat'
import { TEMPLATE_LIBRARY } from './data/templates'
import { supabase } from './lib/supabase'
import AuthModal from './components/AuthModal'
import './index.css'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMode, setActiveMode]   = useState(() => localStorage.getItem('inprompting_active_mode') || 'text') // 'text' | 'image' | 'video'
  const [view, setView]               = useState('chat') // 'chat' | 'templates'
  const [templateCat, setTemplateCat] = useState('Semua')

  // Auth state
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  // Persist activeMode
  useEffect(() => { localStorage.setItem('inprompting_active_mode', activeMode) }, [activeMode])


  // separate history per mode
  const [textHistory, setTextHistory]   = useState(() => {
    try { const s = localStorage.getItem('inprompting_text_history'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [imageHistory, setImageHistory] = useState(() => {
    try { const s = localStorage.getItem('inprompting_image_history'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [videoHistory, setVideoHistory] = useState(() => {
    try { const s = localStorage.getItem('inprompting_video_history'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [activeConvId, setActiveConvId] = useState(null)

  useEffect(() => { localStorage.setItem('inprompting_text_history', JSON.stringify(textHistory)) }, [textHistory])
  useEffect(() => { localStorage.setItem('inprompting_image_history', JSON.stringify(imageHistory)) }, [imageHistory])
  useEffect(() => { localStorage.setItem('inprompting_video_history', JSON.stringify(videoHistory)) }, [videoHistory])

  // separate refs per mode
  const textInnerRef  = useRef(null)
  const imageInnerRef = useRef(null)
  const videoInnerRef = useRef(null)
  const textAreaRef   = useRef(null)
  const imageAreaRef  = useRef(null)
  const videoAreaRef  = useRef(null)
  const inputRef      = useRef(null)
  const toastRef      = useRef(null)

  // Auth setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) loadUserHistory()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) loadUserHistory()
      else {
        // Clear history on logout if you want, or keep local
        setActiveConvId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserHistory = async () => {
    console.log('Syncing with Supabase...')
    const { data, error } = await supabase.from('prompt_history').select('*').order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase Fetch Error:', error)
      return
    }

    if (data) {
      console.log('Found', data.length, 'items in cloud.')
      
      const mapper = (h) => ({
        id: h.id,
        mode: h.mode,
        label: h.label,
        prompt: h.prompt,
        negative_prompt: h.negative_prompt,
        icon: h.icon || (h.mode === 'image' ? '🎨' : h.mode === 'video' ? '🎬' : '✦'),
        ts: h.ts || (h.created_at ? new Date(h.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '')
      })

      const cloudText = data.filter(h => h.mode === 'text').map(mapper)
      const cloudImg  = data.filter(h => h.mode === 'image').map(mapper)
      const cloudVid  = data.filter(h => h.mode === 'video').map(mapper)

      // Merge strategy: Cloud items are primary, but don't clear everything if cloud is empty but local has data
      setTextHistory(prev => {
        const merged = [...cloudText]
        prev.forEach(p => {
          if (!merged.find(m => m.prompt === p.prompt)) merged.push(p)
        })
        return merged.slice(0, 20)
      })

      setImageHistory(prev => {
        const merged = [...cloudImg]
        prev.forEach(p => {
          if (!merged.find(m => m.prompt === p.prompt)) merged.push(p)
        })
        return merged.slice(0, 20)
      })

      setVideoHistory(prev => {
        const merged = [...cloudVid]
        prev.forEach(p => {
          if (!merged.find(m => m.prompt === p.prompt)) merged.push(p)
        })
        return merged.slice(0, 20)
      })
    }
  }

  const convHistory = activeMode === 'text' ? textHistory : activeMode === 'image' ? imageHistory : videoHistory

  const textChat = useChat({
    chatInnerRef: textInnerRef, chatAreaRef: textAreaRef,
    inputRef, toastRef,
    setConvHistory: setTextHistory, setActiveConvId,
    mode: 'text',
    user
  })

  const imageChat = useImageChat({
    chatInnerRef: imageInnerRef, chatAreaRef: imageAreaRef,
    inputRef, toastRef,
    setConvHistory: setImageHistory, setActiveConvId,
    user
  })

  const videoChat = useVideoChat({
    chatInnerRef: videoInnerRef, chatAreaRef: videoAreaRef,
    inputRef, toastRef,
    setConvHistory: setVideoHistory, setActiveConvId,
    user
  })

  const activeChat = activeMode === 'text' ? textChat : activeMode === 'image' ? imageChat : videoChat

  // init both modes
  useEffect(() => {
    textChat.renderWelcome()
  }, [])

  useEffect(() => {
    if (activeMode === 'image' && imageInnerRef.current && !imageInnerRef.current.innerHTML.trim()) {
      imageChat.renderWelcome()
    }
    if (activeMode === 'video' && videoInnerRef.current && !videoInnerRef.current.innerHTML.trim()) {
      videoChat.renderWelcome()
    }
  }, [activeMode])

  const switchMode = (mode) => {
    if (mode === activeMode) return
    setActiveMode(mode)
    setView('chat')
    if (inputRef.current) {
      if (mode === 'image') inputRef.current.placeholder = 'Ketik style atau deskripsi gambar lu...'
      else if (mode === 'video') inputRef.current.placeholder = 'Ketik style atau deskripsi video lu...'
      else inputRef.current.placeholder = 'Ketik tujuan lu di sini...'
    }
  }

  const cats = ['Semua', ...new Set(TEMPLATE_LIBRARY.map(t => t.cat))]

  const handleTemplateUse = (t) => {
    setView('chat')
    setActiveMode('text')
    setTimeout(() => {
      const inner = textInnerRef.current; if (!inner) return
      inner.innerHTML = ''
      const div = document.createElement('div')
      div.className = 'msg bot'
      div.innerHTML = `
        <div class="bubble">Template <strong>${t.name}</strong> dimuat ✦</div>
        <div class="prompt-result">
          <div class="pr-label">✦ TEMPLATE PROMPT</div>
          <button class="pr-copy" id="tc">Copy ⌘</button>
          <div class="pr-text">${t.prompt}</div>
        </div>
        <div class="yn-row">
          <button class="yn-btn yes" id="tn">✦ Prompt baru</button>
          <button class="yn-btn" id="tr">✎ Customize</button>
        </div>`
      div.querySelector('#tc')?.addEventListener('click', () =>
        navigator.clipboard.writeText(t.prompt).then(() => textChat.showToast('✓ Template di-copy!'))
      )
      div.querySelector('#tn')?.addEventListener('click', () => textChat.renderWelcome())
      div.querySelector('#tr')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('inprompting:refine', { detail: { prompt: t.prompt } }))
      })
      inner.appendChild(div)
    }, 80)
  }

  return (
    <>
      {/* ── SIDEBAR ── */}
      <div className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="logo">In<span>prompting</span></div>
          <button className="icon-btn-sm" onClick={() => setSidebarCollapsed(c => !c)}>☰</button>
        </div>

        <div className="sb-section">
          <button className="sb-item new-chat" onClick={() => { setView('chat'); activeChat.renderWelcome() }}>
            <span className="sb-icon">✦</span><span className="sb-label">New Chat</span>
          </button>
        </div>

        <div className="sb-section">
          <div className="sb-section-label">MODE</div>
          <button
            className={`sb-item${activeMode === 'text' && view !== 'templates' ? ' active' : ''}`}
            onClick={() => { switchMode('text'); setView('chat') }}
          >
            <span className="sb-icon">✦</span><span className="sb-label">Text Prompting</span>
          </button>
          <button
            className={`sb-item${activeMode === 'image' && view !== 'templates' ? ' active' : ''}`}
            onClick={() => { switchMode('image'); setView('chat') }}
          >
            <span className="sb-icon">🖼</span><span className="sb-label">Image Prompting</span>
          </button>
          <button
            className={`sb-item${activeMode === 'video' && view !== 'templates' ? ' active' : ''}`}
            onClick={() => { switchMode('video'); setView('chat') }}
          >
            <span className="sb-icon">🎬</span><span className="sb-label">Video Prompting</span>
          </button>
        </div>

        <div className="sb-section">
          <div className="sb-section-label">LIBRARY</div>
          <button
            className={`sb-item${view === 'templates' ? ' active' : ''}`}
            onClick={() => setView('templates')}
          >
            <span className="sb-icon">📚</span><span className="sb-label">Templates & Skills</span>
          </button>
        </div>

        <div className="sb-section" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="sb-section-label">RIWAYAT {activeMode === 'image' ? '🎨' : activeMode === 'video' ? '🎬' : ''}</div>
          <div className="conv-scroll">
            {convHistory.length === 0
              ? <div className="conv-empty">Belum ada riwayat</div>
              : convHistory.map(item => (
                  <div
                    key={item.id}
                    className={`conv-item${activeConvId === item.id ? ' active' : ''}`}
                    onClick={() => { setView('chat'); activeChat.loadHistory(item) }}
                  >
                    <span className="conv-icon">{item.icon}</span>
                    <div className="conv-body">
                      <div className="conv-label">{item.label}</div>
                      <div className="conv-time">{item.ts || item.created_at?.slice(0, 10)}</div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile">
              <div className="user-info">
                <div className="user-email">{user.email}</div>
                <button className="logout-btn" onClick={() => supabase.auth.signOut()}>Logout</button>
              </div>
            </div>
          ) : (
            <button className="sb-item login-trigger" onClick={() => setShowAuth(true)}>
              <span className="sb-icon">👤</span><span className="sb-label">Login / Daftar ✦</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main">
        {view === 'templates' ? (
          <>
            <div className="chat-header">
              <div className="chat-title">📚 TEMPLATES & SKILLS</div>
              <button className="yn-btn" onClick={() => setView('chat')} style={{ fontSize: '11px', padding: '5px 14px' }}>← Kembali</button>
            </div>
            <div className="templates-page">
              <div className="tpl-hero">
                <div className="tpl-hero-title">Skill Templates Siap Pakai</div>
                <div className="tpl-hero-sub">Klik template → copas langsung, atau customize sesuai kebutuhan lu</div>
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
                    <div className="tpl-preview">{t.prompt.slice(0, 110)}...</div>
                    <div className="tpl-actions">
                      <button className="tpl-copy-btn" onClick={() => { navigator.clipboard.writeText(t.prompt); textChat.showToast('✓ Di-copy!') }}>Copy ⌘</button>
                      <button className="tpl-use-btn" onClick={() => handleTemplateUse(t)}>Pakai & Customize →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-title">
                {activeMode === 'text' ? 'TEXT PROMPT BUILDER' : activeMode === 'image' ? 'IMAGE PROMPT BUILDER' : 'VIDEO PROMPT BUILDER'}
              </div>
              <div className="mode-pills">
                <button
                  className={`mode-pill${activeMode === 'text' ? ' active' : ''}`}
                  onClick={() => switchMode('text')}
                >✦ Text</button>
                <button
                  className={`mode-pill${activeMode === 'image' ? ' active' : ''}`}
                  onClick={() => switchMode('image')}
                >🖼 Image</button>
                <button
                  className={`mode-pill${activeMode === 'video' ? ' active' : ''}`}
                  onClick={() => switchMode('video')}
                >🎬 Video</button>
              </div>
            </div>

            {/* TEXT chat area */}
            <div
              className="chat-area"
              ref={textAreaRef}
              style={{ display: activeMode === 'text' ? 'flex' : 'none' }}
            >
              <div className="chat-inner" ref={textInnerRef} />
            </div>

            {/* IMAGE chat area */}
            <div
              className="chat-area"
              ref={imageAreaRef}
              style={{ display: activeMode === 'image' ? 'flex' : 'none' }}
            >
              <div className="chat-inner" ref={imageInnerRef} />
            </div>

            {/* VIDEO chat area */}
            <div
              className="chat-area"
              ref={videoAreaRef}
              style={{ display: activeMode === 'video' ? 'flex' : 'none' }}
            >
              <div className="chat-inner" ref={videoInnerRef} />
            </div>

            <div className="input-bar">
              <div className="input-wrap">
                <textarea
                  ref={inputRef}
                  id="main-input"
                  placeholder={activeMode === 'image' ? 'Ketik style atau deskripsi gambar lu...' : activeMode === 'video' ? 'Ketik style atau deskripsi video lu...' : 'Ketik tujuan lu di sini...'}
                  rows="1"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); activeChat.handleSend() } }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
                />
                <button className="send-btn" onClick={() => activeChat.handleSend()}>↑</button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="toast" ref={toastRef}>✓ Tersalin!</div>
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onAuthSuccess={loadUserHistory}
      />

      <style>{`
        .sidebar-footer {
          padding: 12px;
          border-top: var(--glass-border);
          background: rgba(0,0,0,0.2);
        }
        .user-profile {
          display: flex; flex-direction: column; gap: 8px;
        }
        .user-email {
          font-size: 11px; color: var(--text-3); word-break: break-all;
          margin-bottom: 4px; padding: 0 4px;
        }
        .logout-btn {
          width: 100%; padding: 6px; border-radius: 6px;
          border: var(--glass-border); background: var(--surface);
          color: var(--text-4); font-family: 'DM Mono', monospace;
          font-size: 10px; cursor: pointer; transition: all 0.2s;
        }
        .logout-btn:hover { background: var(--accent3); color: white; border-color: transparent; }
      `}</style>
    </>
  )
}

export default App