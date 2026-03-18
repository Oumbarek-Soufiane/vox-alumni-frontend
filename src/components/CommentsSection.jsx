/**
 * components/CommentsSection.jsx
 *
 * Full comment panel for a single artwork:
 *  • Loads and displays comments with threaded replies
 *  • Top-level comment form (uses visitor name from UserContext)
 *  • Passes artworkId down for reactions & reply API calls
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useUser } from '../context/UserContext'
import { apiGet, apiPost } from '../hooks/useApi'
import useProfanityCheck from '../hooks/useProfanityCheck'
import CommentItem from './CommentItem'

// ── Skeleton row ─────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={s.skelRow}>
      <div style={s.skelAvatar} />
      <div style={{ flex: 1 }}>
        <div style={{ ...s.skelLine, width: '30%', marginBottom: 6 }} />
        <div style={{ ...s.skelLine, width: '85%', marginBottom: 4 }} />
        <div style={{ ...s.skelLine, width: '60%' }} />
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CommentsSection({ artworkId }) {
  const { name } = useUser()

  // Comments state
  const [comments,  setComments]  = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [fetchErr,  setFetchErr]  = useState(null)

  // New comment form
  const [body,      setBody]      = useState('')
  const [posting,   setPosting]   = useState(false)
  const [postErr,   setPostErr]   = useState(null)
  const [open,      setOpen]      = useState(false)

  // Profanity guard — runs on every keystroke, no API call needed
  const { isBad: bodyIsBad, warning: bodyWarning } = useProfanityCheck(body)

  const listRef = useRef(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setFetchErr(null)
    try {
      const data = await apiGet(`/artworks/${artworkId}/comments`)
      // Support both paginated { data, total } and plain arrays
      const rows = data.data ?? data
      setComments(rows)
      setTotal(data.total ?? rows.length)
    } catch (err) {
      setFetchErr(err.message)
    } finally {
      setLoading(false)
    }
  }, [artworkId])

  useEffect(() => { load() }, [load])

  // ── Post top-level comment ─────────────────────────────────────────────────
  async function handlePost(e) {
    e.preventDefault()
    if (!body.trim() || !name || bodyIsBad) return
    setPosting(true); setPostErr(null)
    try {
      const comment = await apiPost(`/artworks/${artworkId}/comments`, {
        author_name: name,
        body:        body.trim(),
      })
      // Prepend new comment and scroll to top
      setComments(prev => [{ ...comment, replies: [] }, ...prev])
      setTotal(n => n + 1)
      setBody('')
      setOpen(false)
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setPostErr(err.message)
    } finally {
      setPosting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>

      {/* ── Header ── */}
      <div style={s.header}>
        <span style={s.countLabel}>
          <ChatIcon />
          {total} commentaire{total !== 1 ? 's' : ''}
        </span>
        <button
          className="vox-toggle-btn"
          style={{ ...s.toggleBtn, ...(open ? s.toggleBtnOpen : {}) }}
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
        >
          {open ? '✕ Annuler' : 'Commenter'}
        </button>
      </div>

      {/* ── Comment form ── */}
      {open && (
        <form onSubmit={handlePost} style={s.form} noValidate>
          <div style={s.formAuthor}>
            <AvatarMini name={name} />
            <span style={s.formName}>{name}</span>
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Partagez vos réflexions sur cette œuvre…"
            rows={3}
            maxLength={1000}
            style={{ ...s.textarea, ...(bodyIsBad ? s.textareaBad : {}) }}
            autoFocus
            required
          />
          {/* Profanity warning — shows live while typing */}
          {bodyIsBad && (
            <div style={s.profanityWarn}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: 7 }} />
              {bodyWarning}
            </div>
          )}
          {postErr && <p style={s.errMsg}>⚠️ {postErr}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="vox-submit-btn"
              type="submit"
              disabled={posting || !body.trim() || bodyIsBad}
              style={{ ...s.submitBtn, ...(posting || !body.trim() || bodyIsBad ? s.submitOff : {}) }}
            >
              {posting ? <Spinner /> : 'Publier →'}
            </button>
          </div>
        </form>
      )}

      {/* ── List ── */}
      <div style={s.list} ref={listRef}>
        {loading ? (
          <><Skeleton /><Skeleton /></>
        ) : fetchErr ? (
          <p style={s.errMsg}>Impossible de charger les commentaires. {fetchErr}</p>
        ) : comments.length === 0 ? (
          <p style={s.empty}>Soyez le premier à commenter ✨</p>
        ) : (
          comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              artworkId={artworkId}
              onDeleted={id => {
                setComments(prev => prev.filter(x => x.id !== id))
                setTotal(n => Math.max(0, n - 1))
              }}
            />
          ))
        )}
      </div>

    </div>
  )
}

// ── Mini helpers ─────────────────────────────────────────────────────────────

function avatarColor(name) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 35%, 30%)`
}

function AvatarMini({ name }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: avatarColor(name),
      color: '#fff', fontSize: '0.6rem', fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function ChatIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function Spinner() {
  return <span style={{
    display: 'inline-block', width: 13, height: 13,
    border: '2px solid rgba(255,255,255,.4)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin .6s linear infinite',
  }} />
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  root: {
    borderTop: '1px solid rgba(26,26,26,.08)',
    paddingTop: '1.1rem',
    fontFamily: "'Work Sans', sans-serif",
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '.75rem',
  },
  countLabel: {
    display: 'flex', alignItems: 'center', gap: '.4rem',
    fontSize: '.78rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '.06em',
    color: '#888',
  },
  toggleBtn: {
    background: 'none',
    border: '1.5px solid rgba(110, 109, 109, 0.12)',
    borderRadius: 8, padding: '4px 12px',
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '.78rem', fontWeight: 500,
    color: '#3369E8', cursor: 'pointer',
    transition: 'background .15s, border-color .15s',
    padding: "8px 12px"
  },
  toggleBtnOpen: {
    background: '#EAF0FC', borderColor: '#3369E8',
  },

  /* Form */
  form: {
    display: 'flex', flexDirection: 'column', gap: 10,
    marginBottom: '1rem',
    animation: 'fadeUp .2s ease',
    background: '#fff',
    border: '1px solid rgba(26,26,26,.08)',
    borderRadius: 10, padding: '12px 14px',
  },
  formAuthor: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  formName: {
    fontSize: '.82rem', fontWeight: 600, color: '#1a1a1a',
  },
  textarea: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid rgba(26,26,26,.1)',
    borderRadius: 8, resize: 'vertical',
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '.88rem', color: '#1a1a1a',
    background: '#fafaf8', outline: 'none',
    transition: 'border-color .18s', minHeight: 72,
  },
  textareaBad: {
    borderColor: '#3369E8',
    background: '#f0f4fe',
  },
  profanityWarn: {
    display: 'flex', alignItems: 'center',
    background: '#EAF0FC',
    border: '1px solid #b3c9f7',
    borderRadius: 8, padding: '8px 12px',
    fontSize: '.8rem', fontWeight: 500,
    color: '#1d4ed8',
    fontFamily: "'Work Sans', sans-serif",
    animation: 'fadeUp .18s ease',
  },
  submitBtn: {
    background: '#3369E8', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '8px 20px',
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '.82rem', fontWeight: 600,
    cursor: 'pointer', letterSpacing: '.03em',
    display: 'flex', alignItems: 'center', gap: 6,
    transition: 'background .18s',
  },
  submitOff: { opacity: .45, cursor: 'not-allowed' },
  errMsg: {
    fontSize: '.78rem', color: '#3369E8',
    background: '#EAF0FC', borderRadius: 6,
    padding: '4px 10px',
  },

  /* List */
  list: {
    display: 'flex', flexDirection: 'column', gap: '.9rem',
    maxHeight: 400, overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(26,26,26,.1) transparent',
    paddingRight: 2,
  },
  empty: {
    textAlign: 'center', fontSize: '.85rem',
    color: '#aaa', padding: '1.5rem 0',
  },

  /* Skeleton */
  skelRow: {
    display: 'flex', gap: 10,
  },
  skelAvatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(90deg,#e8e4dc 25%,#f0ece4 50%,#e8e4dc 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    flexShrink: 0,
  },
  skelLine: {
    height: 11, borderRadius: 4,
    background: 'linear-gradient(90deg,#e8e4dc 25%,#f0ece4 50%,#e8e4dc 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  },
}
