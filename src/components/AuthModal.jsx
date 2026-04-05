import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  if (!isOpen) return null

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        alert('Cek email lu buat verifikasi pendaftaran!')
      }
      onAuthSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >Login</button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >Daftar</button>
        </div>

        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-title">{isLogin ? 'Selamat Datang Kembali' : 'Gabung ke Inprompting'}</div>
            <div className="auth-sub">{isLogin ? 'Masuk buat akses riwayat prompt lu' : 'Daftar buat simpan prompt lu selamanya'}</div>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            <div className="auth-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="email@contoh.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="auth-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <div className="dots"><span></span><span></span><span></span></div>
              ) : (
                isLogin ? 'Masuk Sekarang' : 'Buat Akun Baru'
              )}
            </button>
          </form>

          <div className="auth-separator">
            <span>atau pakai</span>
          </div>

          <div className="auth-social">
            <button className="social-btn google" onClick={() => handleOAuth('google')}>
               Google
            </button>
            <button className="social-btn apple" onClick={() => handleOAuth('apple')}>
               Apple
            </button>
          </div>
        </div>

        <button className="auth-close" onClick={onClose}>×</button>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .auth-modal {
          width: 100%; max-width: 400px;
          background: var(--sidebar);
          border: var(--glass-border);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: var(--glow-lg);
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .auth-tabs {
          display: flex; background: rgba(255,255,255,0.03);
          border-bottom: var(--glass-border);
        }
        .auth-tab {
          flex: 1; padding: 14px; border: none; background: transparent;
          color: var(--text-4); font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 13px; cursor: pointer;
          transition: all 0.2s;
        }
        .auth-tab.active {
          color: var(--accent);
          background: var(--accent-dim);
          border-bottom: 2px solid var(--accent);
        }
        .auth-content { padding: 32px; }
        .auth-header { margin-bottom: 24px; text-align: center; }
        .auth-title { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 24px; color: var(--text); }
        .auth-sub { font-size: 12px; color: var(--text-3); margin-top: 4px; }

        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-group { display: flex; flex-direction: column; gap: 6px; }
        .auth-group label { font-size: 11px; color: var(--text-4); letter-spacing: 1px; text-transform: uppercase; }
        .auth-group input {
          background: var(--surface); border: var(--glass-border);
          border-radius: 10px; padding: 12px; color: var(--text);
          font-family: 'DM Mono', monospace; font-size: 13px;
          outline: none; transition: border-color 0.2s;
        }
        .auth-group input:focus { border-color: var(--accent); }

        .auth-error { font-size: 11px; color: #ff6b6b; background: rgba(255,107,107,0.1); padding: 8px; border-radius: 6px; }

        .auth-submit-btn {
          margin-top: 8px; padding: 12px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #7c6af7, #6358d4);
          color: white; font-family: 'DM Mono', monospace; font-weight: 600;
          cursor: pointer; transition: transform 0.15s;
          box-shadow: 0 4px 14px rgba(124,106,247,0.4);
        }
        .auth-submit-btn:hover { transform: scale(1.02); }
        .auth-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .auth-separator {
          display: flex; align-items: center; gap: 10px; margin: 24px 0;
          font-size: 10px; color: var(--text-4); text-transform: uppercase; letter-spacing: 2px;
        }
        .auth-separator::before, .auth-separator::after { content: ''; flex: 1; height: 1px; background: var(--border2); }

        .auth-social { display: flex; gap: 10px; }
        .social-btn {
          flex: 1; padding: 10px; border-radius: 10px; border: var(--glass-border);
          background: var(--surface); color: var(--text-2);
          font-family: 'DM Mono', monospace; font-size: 12px; cursor: pointer;
          transition: all 0.2s;
        }
        .social-btn:hover { background: var(--surface2); border-color: var(--accent); color: var(--text); }

        .auth-close {
          position: absolute; top: 12px; right: 12px;
          width: 24px; height: 24px; border-radius: 50%;
          border: none; background: rgba(255,255,255,0.05);
          color: var(--text-4); font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .auth-close:hover { background: rgba(255,255,255,0.1); color: var(--text); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
