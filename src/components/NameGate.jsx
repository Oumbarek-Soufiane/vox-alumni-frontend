/**
 * components/NameGate.jsx
 *
 * Full-screen welcome screen shown on the very first visit.
 * The visitor types their name and clicks enter — the name is
 * stored in UserContext / localStorage and shown on all comments.
 */

import { useState, useRef, useEffect } from 'react'
import { useUser } from '../context/UserContext'

export default function NameGate() {
  const { setName } = useUser()
  const [input, setInput]   = useState('')
  const [shaking, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (input.trim().length < 2) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    setName(input.trim())
  }

  return (
    <div style={styles.overlay}>
      {/* Decorative grain texture */}
      <div style={styles.grain} />

      <div style={styles.card}>
        {/* Logo / wordmark */}
        <img
          src="/img/Artboard 1@4x.png"
          alt="VOX Alumni"
          style={{ height: 140, width: 'auto', marginBottom: 24, objectFit: 'contain' }}
        />
        <h1 style={styles.heading}>
          Bienvenue dans<br />
          <em>la galerie</em>
        </h1>
        <p style={styles.sub}>
          Pour commenter et réagir aux œuvres,<br />
          dites-nous d'abord votre prénom.
        </p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={{ ...styles.inputWrap, ...(shaking ? styles.shake : {}) }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Votre prénom…"
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={60}
              autoComplete="given-name"
              style={styles.input}
            />
          </div>
          <button
            className="namegate-btn"
            type="submit"
            disabled={input.trim().length < 2}
            style={{
              ...styles.btn,
              ...(input.trim().length >= 2 ? styles.btnActive : {})
            }}
          >
            Entrer dans la galerie →
          </button>
        </form>

        {/* Decorative corner marks */}
        <span style={{ ...styles.corner, top: 16, left: 16,  borderTop: '2px solid', borderLeft:  '2px solid' }} />
        <span style={{ ...styles.corner, top: 16, right: 16, borderTop: '2px solid', borderRight: '2px solid' }} />
        <span style={{ ...styles.corner, bottom: 16, left: 16,  borderBottom: '2px solid', borderLeft:  '2px solid' }} />
        <span style={{ ...styles.corner, bottom: 16, right: 16, borderBottom: '2px solid', borderRight: '2px solid' }} />
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: '#1a1a1a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn .4s ease',
    fontFamily: "'Work Sans', sans-serif",
  },
  grain: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    opacity: 0.5,
  },
  card: {
    position: 'relative',
    background: '#222220ff',
    borderRadius: 16,
    padding: '56px 52px 48px',
    width: '100%', maxWidth: 460,
    margin: '0 16px',
    animation: 'scaleIn .35s ease',
    textAlign: 'center',
  },
  eyebrow: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '0.72rem', fontWeight: 600,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    color: '#3369E8', marginBottom: 20,
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(2rem, 5vw, 2.6rem)',
    fontWeight: 900, lineHeight: 1.15,
    color: '#d1d1d1ff', marginBottom: 16,
  },
  sub: {
    fontSize: '0.9rem', color: '#e0e0e0ff', lineHeight: 1.65, marginBottom: 36,
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%', padding: '14px 18px',
    border: '2px solid rgba(26,26,26,0.12)',
    borderRadius: 10,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '1rem', color: '#1a1a1a',
    background: '#fff', outline: 'none',
    transition: 'border-color .18s',
  },
  shake: {
    animation: 'shake .5s ease',
  },
  btn: {
    padding: '14px 28px',
    background: '#3369E8',
    border: 'none', borderRadius: 10,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '0.9rem', fontWeight: 600,
    letterSpacing: '0.04em',
    color: '#f7f7f7ff', cursor: 'not-allowed',
    transition: 'background .2s, transform .15s, box-shadow .2s',
  },
  btnActive: {
    background: '#3369E8', color: '#fff', cursor: 'pointer',
  },
  corner: {
    position: 'absolute', width: 14, height: 14,
    borderColor: 'rgba(26,26,26,0.15)',
  },
}
