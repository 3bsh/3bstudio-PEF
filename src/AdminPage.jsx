import React, { useState, useEffect } from 'react';
import logo3B from './assets/logo.svg';
import { LogOut, Download, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Inbox, Shield } from 'lucide-react';

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || '3Bstudio@2024';

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminPage() {
  const [authed,      setAuthed]      = useState(false);
  const [pw,          setPw]          = useState('');
  const [pwError,     setPwError]     = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [expandedId,  setExpandedId]  = useState(null);
  const [filter,      setFilter]      = useState('all'); // all | new | viewed

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  const loadData = () => {
    try {
      const data = JSON.parse(localStorage.getItem('brandBriefSubmissions_3b') || '[]');
      setSubmissions(data);
    } catch { setSubmissions([]); }
  };

  const persist = (list) => {
    setSubmissions(list);
    localStorage.setItem('brandBriefSubmissions_3b', JSON.stringify(list));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PW) { setAuthed(true); setPwError(''); }
    else { setPwError('Incorrect password.'); setPw(''); }
  };

  const toggleExpand = (id) => {
    const sub = submissions.find(s => s.id === id);
    if (sub && !sub.viewed) {
      persist(submissions.map(s => s.id === id ? { ...s, viewed: true } : s));
    }
    setExpandedId(prev => prev === id ? null : id);
  };

  const deleteItem = (id) => {
    if (!window.confirm('Delete this brief permanently?')) return;
    persist(submissions.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const download = (sub) => {
    const blob = new Blob([sub.formatted], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `brief_${sub.companyName.replace(/\s+/g, '_')}_${sub.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const markAllViewed = () => {
    persist(submissions.map(s => ({ ...s, viewed: true })));
  };

  const filtered = submissions.filter(s =>
    filter === 'all'    ? true :
    filter === 'new'    ? !s.viewed :
    filter === 'viewed' ? s.viewed : true
  );

  const newCount = submissions.filter(s => !s.viewed).length;

  /* ── Login screen ──────────────────────────────────── */
  if (!authed) return (
    <div className="admin-root">
      <style>{adminCSS}</style>
      <div className="login-wrap">
        <img src={logo3B} alt="3B Studio" className="login-logo" />
        <div className="login-card">
          <div className="login-icon"><Shield size={22} /></div>
          <h2>Admin Access</h2>
          <p className="login-sub">This area is restricted to 3B Studio only.</p>
          <form onSubmit={handleLogin}>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwError && <p className="pw-error">{pwError}</p>}
            <button type="submit" className="btn-login">Enter Dashboard</button>
          </form>
        </div>
      </div>
    </div>
  );

  /* ── Dashboard ─────────────────────────────────────── */
  return (
    <div className="admin-root">
      <style>{adminCSS}</style>

      {/* Top bar */}
      <div className="admin-header">
        <img src={logo3B} alt="3B Studio" className="admin-logo" />
        <div className="header-right">
          {newCount > 0 && <span className="badge">{newCount} new</span>}
          <button className="btn-ghost" onClick={() => setAuthed(false)}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <div className="admin-body">
        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{submissions.length}</div>
            <div className="stat-lbl">Total Briefs</div>
          </div>
          <div className="stat-card">
            <div className="stat-num new">{newCount}</div>
            <div className="stat-lbl">Unread</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{submissions.length - newCount}</div>
            <div className="stat-lbl">Reviewed</div>
          </div>
        </div>

        {/* Filter + actions */}
        <div className="toolbar">
          <div className="filter-tabs">
            {['all','new','viewed'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {newCount > 0 && (
            <button className="btn-ghost-sm" onClick={markAllViewed}>Mark all as read</button>
          )}
        </div>

        {/* Submissions list */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Inbox size={40} />
            <p>No briefs here yet.</p>
          </div>
        ) : (
          <div className="submissions-list">
            {filtered.map(sub => (
              <div key={sub.id} className={`submission-card ${!sub.viewed ? 'unread' : ''}`}>
                {/* Card header — click to expand */}
                <div className="card-header" onClick={() => toggleExpand(sub.id)}>
                  <div className="card-meta">
                    {!sub.viewed && <span className="dot" />}
                    <div>
                      <div className="card-company">{sub.companyName}</div>
                      <div className="card-info">
                        {sub.contactEmail && <span>{sub.contactEmail}</span>}
                        <span className="sep">·</span>
                        <span>{formatDate(sub.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button className="action-btn" title="Download .txt" onClick={() => download(sub)}>
                      <Download size={15} />
                    </button>
                    <button className="action-btn danger" title="Delete" onClick={() => deleteItem(sub.id)}>
                      <Trash2 size={15} />
                    </button>
                    <div className="expand-icon">
                      {expandedId === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded brief content */}
                {expandedId === sub.id && (
                  <div className="brief-body">
                    <pre className="brief-text">{sub.formatted}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const adminCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow-x: hidden; }

  .admin-root {
    min-height: 100vh;
    background: #0D0820;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #EDE9FF;
    position: relative;
  }
  .admin-root::before {
    content: ''; position: fixed; top: -15%; left: -15%;
    width: 50vw; height: 50vw;
    background: radial-gradient(circle, rgba(168,156,255,0.1) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .admin-root::after {
    content: ''; position: fixed; bottom: -15%; right: -15%;
    width: 55vw; height: 55vw;
    background: radial-gradient(circle, rgba(67,33,150,0.2) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* ── Login ── */
  .login-wrap {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 40px 20px;
    position: relative; z-index: 1;
  }
  .login-logo { width: 160px; margin-bottom: 36px; filter: drop-shadow(0 4px 20px rgba(168,156,255,0.35)); }
  .login-card {
    width: 100%; max-width: 400px;
    background: rgba(24,14,68,0.55); border: 1px solid rgba(168,156,255,0.1);
    border-radius: 20px; padding: 40px; backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4); text-align: center;
  }
  .login-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: rgba(67,33,150,0.4); border: 1px solid rgba(168,156,255,0.2);
    display: flex; align-items: center; justify-content: center;
    color: #A89CFF; margin: 0 auto 20px;
  }
  .login-card h2 { font-size: 22px; font-weight: 800; color: #FFF; margin-bottom: 6px; }
  .login-sub { font-size: 13px; color: #9B8FCC; margin-bottom: 28px; }
  .pw-wrap { position: relative; margin-bottom: 12px; }
  .pw-wrap input {
    width: 100%; padding: 14px 48px 14px 18px;
    border: 1px solid rgba(168,156,255,0.12); border-radius: 12px;
    background: rgba(168,156,255,0.05); color: #FFF;
    font-family: inherit; font-size: 14px; outline: none;
    transition: all 0.25s;
  }
  .pw-wrap input:focus { border-color: #A89CFF; box-shadow: 0 0 0 4px rgba(168,156,255,0.12); }
  .pw-wrap input::placeholder { color: #6B5FA0; }
  .pw-toggle {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #9B8FCC; cursor: pointer; display: flex;
  }
  .pw-error { font-size: 12px; color: #f87171; margin-bottom: 12px; }
  .btn-login {
    width: 100%; padding: 14px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #A89CFF 0%, #432196 100%);
    color: #FFF; font-family: inherit; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(168,156,255,0.3);
  }
  .btn-login:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(168,156,255,0.45); }

  /* ── Dashboard ── */
  .admin-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,8,32,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(168,156,255,0.08);
    padding: 16px 32px; display: flex; align-items: center; justify-content: space-between;
  }
  .admin-logo { width: 120px; }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .badge {
    background: rgba(168,156,255,0.15); border: 1px solid rgba(168,156,255,0.3);
    color: #A89CFF; font-size: 12px; font-weight: 700;
    padding: 4px 10px; border-radius: 20px;
  }
  .btn-ghost {
    display: flex; align-items: center; gap: 8px;
    background: rgba(168,156,255,0.06); border: 1px solid rgba(168,156,255,0.1);
    color: #9B8FCC; font-family: inherit; font-size: 13px; font-weight: 600;
    padding: 8px 16px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { color: #FFF; background: rgba(168,156,255,0.12); }

  .admin-body { max-width: 900px; margin: 0 auto; padding: 40px 24px 100px; position: relative; z-index: 1; }

  /* Stats */
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat-card {
    background: rgba(24,14,68,0.45); border: 1px solid rgba(168,156,255,0.08);
    border-radius: 16px; padding: 24px; text-align: center;
    backdrop-filter: blur(10px);
  }
  .stat-num { font-size: 36px; font-weight: 800; color: #FFF; margin-bottom: 4px; }
  .stat-num.new { color: #A89CFF; }
  .stat-lbl { font-size: 12px; color: #9B8FCC; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

  /* Toolbar */
  .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
  .filter-tabs { display: flex; gap: 8px; }
  .filter-tab {
    padding: 8px 18px; border-radius: 10px; font-family: inherit; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    background: rgba(168,156,255,0.05); border: 1px solid rgba(168,156,255,0.08); color: #9B8FCC;
  }
  .filter-tab.active { background: #432196; border-color: #A89CFF; color: #FFF; }
  .btn-ghost-sm {
    background: none; border: none; color: #9B8FCC; font-family: inherit;
    font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 8px; border-radius: 6px;
    transition: color 0.2s;
  }
  .btn-ghost-sm:hover { color: #A89CFF; }

  /* Empty state */
  .empty-state {
    text-align: center; padding: 80px 20px; color: #6B5FA0;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  }
  .empty-state p { font-size: 15px; }

  /* Submissions */
  .submissions-list { display: flex; flex-direction: column; gap: 12px; }

  .submission-card {
    background: rgba(24,14,68,0.4); border: 1px solid rgba(168,156,255,0.07);
    border-radius: 16px; overflow: hidden; transition: border-color 0.2s;
    backdrop-filter: blur(10px);
  }
  .submission-card.unread { border-color: rgba(168,156,255,0.2); }
  .submission-card:hover { border-color: rgba(168,156,255,0.15); }

  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 22px; cursor: pointer; gap: 12px;
  }
  .card-meta { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #A89CFF; flex-shrink: 0; }
  .card-company { font-size: 15px; font-weight: 700; color: #FFF; margin-bottom: 3px; }
  .card-info { font-size: 12px; color: #9B8FCC; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .sep { color: rgba(168,156,255,0.3); }

  .card-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .action-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(168,156,255,0.1);
    background: rgba(168,156,255,0.05); color: #9B8FCC;
    display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
  }
  .action-btn:hover { background: rgba(168,156,255,0.12); color: #FFF; border-color: rgba(168,156,255,0.2); }
  .action-btn.danger:hover { background: rgba(248,113,113,0.1); color: #f87171; border-color: rgba(248,113,113,0.2); }
  .expand-icon { color: #9B8FCC; padding: 4px; }

  .brief-body {
    border-top: 1px solid rgba(168,156,255,0.08);
    padding: 24px 22px;
    background: rgba(13,8,32,0.4);
  }
  .brief-text {
    font-family: 'Plus Jakarta Sans', monospace; font-size: 13px; line-height: 1.8;
    color: #C4B8FF; white-space: pre-wrap; word-break: break-word;
  }

  @media (max-width: 600px) {
    .stats-row { grid-template-columns: 1fr; }
    .admin-header { padding: 14px 16px; }
    .admin-body { padding: 24px 14px 80px; }
    .card-header { padding: 16px; }
    .toolbar { flex-direction: column; align-items: flex-start; }
  }
`;
