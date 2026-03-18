/**
 * components/CommentItem.jsx
 *
 * Features:
 *  • Emoji reactions (React-state picker, optimistic updates)
 *  • Reply (only OTHER users, 1 level deep)
 *  • Edit   (only YOUR OWN comments — inline textarea)
 *  • Delete (only YOUR OWN comments — confirm step)
 */

import { useState, useRef, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { apiPost, apiPatch, apiDelete } from '../hooks/useApi'
import useProfanityCheck from '../hooks/useProfanityCheck'

// ── Constants ─────────────────────────────────────────────────────────────────

const EMOJIS = [
  { key: 'heart', glyph: '❤️', label: "J'adore"    },
  { key: 'fire',  glyph: '🔥', label: 'Incroyable' },
  { key: 'wow',   glyph: '😮', label: 'Waouh'      },
  { key: 'clap',  glyph: '👏', label: 'Bravo'      },
  { key: 'laugh', glyph: '😂', label: 'Drôle'      },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function avatarColor(name) {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 38%, 32%)`
}

// ── ReactionBar ───────────────────────────────────────────────────────────────

function ReactionBar({ commentId, initialCounts, initialMine }) {
  const [counts,     setCounts]  = useState(initialCounts ?? {})
  const [mine,       setMine]    = useState(initialMine   ?? [])
  const [pending,    setPending] = useState(null)
  const [pickerOpen, setPicker]  = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!pickerOpen) return
    const handler = e => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  async function toggle(key) {
    if (pending) return
    setPicker(false)
    setPending(key)
    const was = mine.includes(key)
    setMine(p  => was ? p.filter(k => k !== key) : [...p, key])
    setCounts(p => ({ ...p, [key]: Math.max(0, (p[key] ?? 0) + (was ? -1 : 1)) }))
    try {
      const data = await apiPost(`/comments/${commentId}/reactions/${key}`)
      setCounts(data.counts); setMine(data.mine)
    } catch {
      setMine(p  => was ? [...p, key] : p.filter(k => k !== key))
      setCounts(p => ({ ...p, [key]: Math.max(0, (p[key] ?? 0) + (was ? 1 : -1)) }))
    } finally { setPending(null) }
  }

  return (
    <div style={s.reactionBar}>
      {EMOJIS.map(em => {
        const count = counts[em.key] ?? 0
        const active = mine.includes(em.key)
        if (count === 0 && !active) return null
        return (
          <button key={em.key} className="reaction-pill" onClick={() => toggle(em.key)}
            disabled={pending === em.key} title={em.label} aria-pressed={active}
            style={{ ...s.pill, ...(active ? s.pillActive : s.pillInactive) }}>
            <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>{em.glyph}</span>
            {count > 0 && <span style={s.pillCount}>{count}</span>}
          </button>
        )
      })}

      {/* Picker trigger */}
      <div style={{ position: 'relative' }} ref={pickerRef}>
        <button
          className="vox-add-reaction"
          style={{ ...s.addBtn, ...(pickerOpen ? s.addBtnOpen : {}) }}
          onClick={() => setPicker(v => !v)}
          title="Réagir" aria-label="Ajouter une réaction"
        >
          {pickerOpen ? '✕' : '＋'} 😀
        </button>
        {pickerOpen && (
          <div style={s.picker}>
            {EMOJIS.map(em => (
              <button key={em.key} className="vox-picker-btn" onClick={() => toggle(em.key)}
                disabled={pending === em.key} title={em.label}
                style={{ ...s.pickerBtn, ...(mine.includes(em.key) ? s.pickerBtnActive : {}) }}>
                {em.glyph}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── EditForm — inline textarea to edit an existing comment ────────────────────

function EditForm({ comment, onSaved, onCancel }) {
  const { name }           = useUser()
  const [body,  setBody]   = useState(comment.body)
  const [saving, setSave]  = useState(false)
  const [error,  setError] = useState(null)
  const ref = useRef(null)

  const { isBad, warning } = useProfanityCheck(body)

  useEffect(() => {
    ref.current?.focus()
    const len = ref.current?.value.length
    ref.current?.setSelectionRange(len, len)
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (!body.trim() || body.trim() === comment.body || isBad) { onCancel(); return }
    setSave(true); setError(null)
    try {
      const updated = await apiPatch(`/comments/${comment.id}`, {
        body:        body.trim(),
        author_name: name,
      })
      onSaved(updated)
    } catch (err) {
      setError(err.message)
      setSave(false)
    }
  }

  return (
    <form onSubmit={submit} style={s.editForm} noValidate>
      <textarea
        ref={ref}
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
        style={{ ...s.editTextarea, ...(isBad ? { borderColor: '#3369E8', background: '#f0f4fe' } : {}) }}
        required
      />
      {isBad && (
        <div style={s.profanityWarn}>
          <i className="fa-solid fa-shield-halved" style={{ marginRight: 7 }} />
          {warning}
        </div>
      )}
      {error && <p style={s.errMsg}>⚠️ {error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="vox-cancel-btn" type="button" onClick={onCancel} style={s.cancelBtn}>Annuler</button>
        <button
          className="vox-submit-btn"
          type="submit"
          disabled={saving || !body.trim() || body.trim() === comment.body || isBad}
          style={{ ...s.saveBtn, ...(saving || !body.trim() || body.trim() === comment.body || isBad ? s.btnOff : {}) }}
        >
          {saving ? <Spinner /> : <><i className="fa-solid fa-check" /> Enregistrer</>}
        </button>
      </div>
    </form>
  )
}

// ── DeleteConfirm — two-step confirm bar ──────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel, deleting }) {
  return (
    <div style={s.deleteConfirm}>
      <span style={s.deleteQuestion}>Supprimer ce commentaire ?</span>
      <button className="vox-cancel-btn" onClick={onCancel} style={s.cancelBtn}>Annuler</button>
      <button className="vox-delete-confirm-btn" onClick={onConfirm} disabled={deleting}
        style={{ ...s.deleteConfirmBtn, ...(deleting ? s.btnOff : {}) }}>
        {deleting ? <Spinner /> : <><i className="fa-solid fa-trash-can" /> Supprimer</>}
      </button>
    </div>
  )
}

// ── ReplyForm ─────────────────────────────────────────────────────────────────

function ReplyForm({ parentId, artworkId, onReplyPosted, onCancel }) {
  const { name }           = useUser()
  const [body,  setBody]   = useState('')
  const [posting, setPost] = useState(false)
  const [error,   setErr]  = useState(null)
  const ref = useRef(null)

  const { isBad, warning } = useProfanityCheck(body)

  useEffect(() => { ref.current?.focus() }, [])

  async function submit(e) {
    e.preventDefault()
    if (!body.trim() || isBad) return
    setPost(true); setErr(null)
    try {
      const c = await apiPost(`/artworks/${artworkId}/comments`, {
        author_name: name, body: body.trim(), parent_id: parentId,
      })
      onReplyPosted(c); setBody('')
    } catch (err) { setErr(err.message) }
    finally { setPost(false) }
  }

  return (
    <form onSubmit={submit} style={s.replyForm} noValidate>
      <div style={s.replyAuthorRow}>
        <div style={{ ...s.miniAvatar, background: avatarColor(name) }}>{initials(name)}</div>
        <span style={s.replyingAs}>Réponse de <strong>{name}</strong></span>
      </div>
      <textarea
        ref={ref}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Écrivez votre réponse…"
        rows={2} maxLength={800}
        style={{ ...s.textarea, ...(isBad ? { borderColor: '#3369E8', background: '#f0f4fe' } : {}) }}
        required
      />
      {isBad && (
        <div style={s.profanityWarn}>
          <i className="fa-solid fa-shield-halved" style={{ marginRight: 7 }} />
          {warning}
        </div>
      )}
      {error && <p style={s.errMsg}>⚠️ {error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="vox-cancel-btn" type="button" onClick={onCancel} style={s.cancelBtn}>Annuler</button>
        <button className="vox-submit-btn" type="submit" disabled={posting || !body.trim() || isBad}
          style={{ ...s.submitBtn, ...(posting || !body.trim() || isBad ? s.btnOff : {}) }}>
          {posting ? <Spinner /> : 'Répondre →'}
        </button>
      </div>
    </form>
  )
}

// ── CommentItem ───────────────────────────────────────────────────────────────

export default function CommentItem({ comment, artworkId, isReply = false, onDeleted }) {
  const { name } = useUser()

  const [body,        setBody]     = useState(comment.body)
  const [timeAgo,     setTimeAgo]  = useState(comment.time_ago)
  const [edited,      setEdited]   = useState(false)
  const [replies,     setReplies]  = useState(comment.replies ?? [])

  // UI state
  const [mode,        setMode]     = useState('view')  // 'view' | 'edit' | 'confirmDelete'
  const [deleting,    setDeleting] = useState(false)
  const [showReply,   setReply]    = useState(false)

  const isOwn    = name === comment.author_name
  const canReply = !isReply && !isOwn

  // ── Edit saved ─────────────────────────────────────────────────────────────
  function handleSaved(updated) {
    setBody(updated.body)
    setTimeAgo(updated.time_ago)
    setEdited(true)
    setMode('view')
  }

  // ── Delete confirmed ───────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleting(true)
    try {
      await apiDelete(`/comments/${comment.id}`, { author_name: name })
      onDeleted?.(comment.id)
    } catch (err) {
      alert(err.message)
      setDeleting(false)
      setMode('view')
    }
  }

  // ── Reply posted ───────────────────────────────────────────────────────────
  function handleReplyPosted(newReply) {
    setReplies(prev => [...prev, newReply])
    setReply(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...s.item, ...(isReply ? s.itemReply : {}) }}>
      {isReply && <div style={s.threadLine} />}

      {/* Avatar */}
      <div style={{ ...s.avatar, background: avatarColor(comment.author_name) }} aria-hidden>
        {initials(comment.author_name)}
      </div>

      <div style={s.bubble}>
        {/* ── Header ── */}
        <div style={s.bubbleHead}>
          <span style={s.authorName}>{comment.author_name}</span>
          {isOwn && !isReply && <span style={s.youBadge}>vous</span>}
          <span style={s.timestamp}>
            {timeAgo}
            {edited && <span style={s.editedBadge}> · modifié</span>}
          </span>

          {/* Edit / Delete buttons — only for own comments */}
          {isOwn && mode === 'view' && (
            <div style={s.ownerActions}>
              <button
                className="vox-icon-edit"
                style={s.iconBtn}
                onClick={() => setMode('edit')}
                title="Modifier"
                aria-label="Modifier ce commentaire"
              >
                <i className="fa-solid fa-pen-to-square" />
              </button>
              <button
                className="vox-icon-delete"
                style={{ ...s.iconBtn, ...s.iconBtnDelete }}
                onClick={() => setMode('confirmDelete')}
                title="Supprimer"
                aria-label="Supprimer ce commentaire"
              >
                <i className="fa-solid fa-trash-can" />
              </button>
            </div>
          )}

          {/* Cancel edit/delete from header */}
          {isOwn && mode !== 'view' && (
            <button
              className="vox-icon-edit"
              style={{ ...s.iconBtn, marginLeft: 'auto', color: '#aaa' }}
              onClick={() => setMode('view')}
              title="Annuler"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* ── Body or Edit form ── */}
        {mode === 'edit' ? (
          <EditForm
            comment={{ ...comment, body }}
            onSaved={handleSaved}
            onCancel={() => setMode('view')}
          />
        ) : (
          <p style={s.body}>{body}</p>
        )}

        {/* ── Delete confirm bar ── */}
        {mode === 'confirmDelete' && (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setMode('view')}
            deleting={deleting}
          />
        )}

        {/* ── Reactions (always visible) ── */}
        {mode === 'view' && (
          <ReactionBar
            commentId={comment.id}
            initialCounts={comment.reaction_counts ?? {}}
            initialMine={comment.my_reactions     ?? []}
          />
        )}

        {/* ── Reply button — other users only ── */}
        {mode === 'view' && canReply && (
          <button className="vox-reply-btn" style={s.replyBtn} onClick={() => setReply(v => !v)}>
            {showReply
              ? '✕ Annuler'
              : `↩ Répondre${replies.length > 0 ? ` (${replies.length})` : ''}`}
          </button>
        )}

        {/* Reply count for own comment (read-only) */}
        {isOwn && !isReply && replies.length > 0 && mode === 'view' && (
          <span style={s.replyCount}>
            {replies.length} réponse{replies.length > 1 ? 's' : ''}
          </span>
        )}

        {/* Reply form */}
        {showReply && (
          <ReplyForm
            parentId={comment.id}
            artworkId={artworkId}
            onReplyPosted={handleReplyPosted}
            onCancel={() => setReply(false)}
          />
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <div style={s.repliesList}>
            {replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                artworkId={artworkId}
                isReply
                onDeleted={id => setReplies(prev => prev.filter(r => r.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 12, height: 12,
      border: '2px solid rgba(255,255,255,.4)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin .6s linear infinite',
    }} />
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  item:       { display: 'flex', gap: 10, animation: 'fadeUp .25s ease', position: 'relative' },
  itemReply:  { marginTop: 10, paddingLeft: 4 },
  threadLine: { position: 'absolute', left: -18, top: 0, bottom: 0, width: 2, background: 'rgba(26,26,26,0.07)', borderRadius: 1 },
  avatar:     { flexShrink: 0, width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', marginTop: 2 },
  bubble:     { flex: 1, background: '#fff', border: '1px solid rgba(26,26,26,0.08)', borderRadius: '2px 10px 10px 10px', padding: '10px 14px' },

  bubbleHead: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  authorName: { fontWeight: 600, fontSize: '0.82rem', color: '#1a1a1a' },
  youBadge:   { fontSize: '0.65rem', fontWeight: 600, background: '#f4f1ea', color: '#999', padding: '1px 6px', borderRadius: 999, letterSpacing: '0.04em', textTransform: 'uppercase' },
  timestamp:  { fontSize: '0.72rem', color: '#bbb' },
  editedBadge:{ color: '#bbb', fontStyle: 'italic' },

  // Owner action buttons (✏️ 🗑)
  ownerActions: { display: 'flex', gap: 2, marginLeft: 'auto' },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.82rem', padding: '4px 6px', borderRadius: 5,
    opacity: 0.55, transition: 'opacity .15s, background .15s, color .15s, transform .12s',
    lineHeight: 1,
  },
  iconBtnDelete: { color: '#3369E8' },

  body: { fontSize: '0.88rem', lineHeight: 1.55, color: '#2d2d2d', wordBreak: 'break-word', marginBottom: 8 },

  // Edit form
  editForm:     { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8, animation: 'fadeUp .18s ease' },
  editTextarea: { width: '100%', padding: '9px 12px', border: '1.5px solid #3369E8', borderRadius: 8, resize: 'vertical', fontFamily: "'Work Sans', sans-serif", fontSize: '0.88rem', color: '#1a1a1a', background: '#fffaf9', outline: 'none', minHeight: 68 },
  saveBtn:      { background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 16px', fontFamily: "'Work Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'background .18s' },

  // Delete confirm
  deleteConfirm:    { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#fef2f2', borderRadius: 8, marginBottom: 8, flexWrap: 'wrap', animation: 'fadeUp .18s ease' },
  deleteQuestion:   { fontSize: '0.82rem', color: '#dc2626', fontWeight: 500, flex: 1 },
  deleteConfirmBtn: { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 14px', fontFamily: "'Work Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'background .18s, transform .15s, box-shadow .18s' },

  // Reactions
  reactionBar:   { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 6 },
  pill:          { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 999, border: '1.5px solid transparent', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', transition: 'all .18s ease', fontFamily: "'Work Sans', sans-serif", background: 'none' },
  pillActive:    { background: '#EAF0FC', borderColor: '#3369E8', color: '#3369E8' },
  pillInactive:  { background: '#f4f1ea', borderColor: 'rgba(26,26,26,.1)', color: '#666' },
  pillCount:     { fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' },
  addBtn:        { background: 'none', border: '1.5px dashed rgba(26,26,26,.15)', borderRadius: 999, padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', color: '#aaa', transition: 'all .18s ease', fontFamily: "'Work Sans', sans-serif" },
  addBtnOpen:    { background: '#EAF0FC', borderColor: '#3369E8', borderStyle: 'solid', color: '#3369E8' },
  picker:        { position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, background: '#fff', border: '1px solid rgba(26,26,26,.1)', borderRadius: 10, padding: '6px 8px', display: 'flex', gap: 2, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,.12)', animation: 'fadeUp .15s ease' },
  pickerBtn:     { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 5px', borderRadius: 6, transition: 'background .15s, transform .15s', lineHeight: 1 },
  pickerBtnActive: { background: '#EAF0FC' },

  // Reply
  replyBtn:   { background: 'none', border: 'none', fontSize: '0.75rem', color: '#aaa', cursor: 'pointer', padding: 0, fontFamily: "'Work Sans', sans-serif", fontWeight: 500, display: 'block', marginTop: 2, transition: 'color .18s ease' },
  replyCount: { fontSize: '0.72rem', color: '#bbb', display: 'block', marginTop: 2 },
  replyForm:  { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeUp .2s ease', borderTop: '1px solid rgba(26,26,26,.06)', paddingTop: 10 },
  replyAuthorRow: { display: 'flex', alignItems: 'center', gap: 8 },
  miniAvatar: { width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 },
  replyingAs: { fontSize: '0.75rem', color: '#888' },
  textarea:   { width: '100%', padding: '9px 12px', border: '1.5px solid rgba(26,26,26,.1)', borderRadius: 8, resize: 'vertical', fontFamily: "'Work Sans', sans-serif", fontSize: '0.85rem', color: '#1a1a1a', background: '#fafaf8', outline: 'none', transition: 'border-color .18s', minHeight: 56 },
  cancelBtn:  { background: 'none', border: '1.5px solid rgba(26,26,26,.12)', borderRadius: 7, padding: '6px 14px', fontFamily: "'Work Sans', sans-serif", fontSize: '0.78rem', cursor: 'pointer', color: '#666', transition: 'background .18s, border-color .18s, transform .12s' },
  submitBtn:  { background: '#3369E8', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 18px', fontFamily: "'Work Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .18s, transform .15s, box-shadow .18s' },
  btnOff:     { opacity: 0.45, cursor: 'not-allowed' },
  errMsg:     { fontSize: '0.78rem', color: '#3369E8', background: '#EAF0FC', borderRadius: 6, padding: '4px 10px' },
  profanityWarn: {
    display: 'flex', alignItems: 'center',
    background: '#EAF0FC', border: '1px solid #b3c9f7',
    borderRadius: 7, padding: '6px 10px',
    fontSize: '0.78rem', fontWeight: 500,
    color: '#1d4ed8', fontFamily: "'Work Sans', sans-serif",
    animation: 'fadeUp .18s ease',
  },
  repliesList:{ marginTop: 10, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 10 },
}
