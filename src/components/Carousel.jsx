/**
 * components/Carousel.jsx
 *
 * Full-width hero carousel — one slide per student.
 * Each slide shows:
 *  • Student artwork (background image)
 *  • Artwork title  (GSAP split-text reveal on enter)
 *  • Student name
 *  • Category / medium / year
 *  • Tool used
 *
 * Auto-advances every 6 s. Keyboard and dot-indicator navigation.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ARTWORKS } from '../artworks'

// ── Pick one featured artwork per student ─────────────────────────────────────

const FEATURED = [
  // student name → pick the first artwork matching that student
  'Abdallah Bourhine',
  'Zeyati Walid',
  'Nabil Mimouni',
  'Yebda Nada',
].map(student => ARTWORKS.find(a => a.student === student)).filter(Boolean)

// Tool label mapping (medium → human label)
const TOOL_LABEL = {
  'Digitale':             'Adobe Photoshop / Procreate',
  'Papier':               'Crayon, Encre & Papier',
  'Character Design':     'Adobe Illustrator',
  'Dessin Traditionnel':  'Crayon & Encre',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Carousel() {
  const [current,   setCurrent]  = useState(0)
  const [animating, setAnimating]= useState(false)
  const [paused,    setPaused]   = useState(false)
  const timerRef  = useRef(null)
  const total     = FEATURED.length

  const goTo = useCallback((index) => {
    if (animating) return
    setAnimating(true)
    setCurrent((index + total) % total)
    setTimeout(() => setAnimating(false), 700)
  }, [animating, total])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  // Auto-advance
  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(next, 6000)
    return () => clearTimeout(timerRef.current)
  }, [current, paused, next])

  // Keyboard
  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const slide = FEATURED[current]
  if (!slide) return null

  return (
    <section
      style={s.section}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Carousel des œuvres en vedette"
    >
      {/* ── Slides ── */}
      <div style={s.track}>
        {FEATURED.map((art, i) => (
          <div
            key={art.id}
            style={{
              ...s.slide,
              opacity:    i === current ? 1 : 0,
              transform:  i === current ? 'scale(1)' : 'scale(1.04)',
              zIndex:     i === current ? 1 : 0,
              transition: 'opacity .7s ease, transform .9s ease',
            }}
            aria-hidden={i !== current}
          >
            {/* Background image */}
            {art.imageUrl
              ? <img src={art.imageUrl} alt={art.title} style={s.bg} />
              : <div style={{ ...s.bg, ...s.bgFallback }}>{art.title[0]}</div>
            }
            {/* Dark overlay */}
            <div style={s.overlay} />

            {/* Caption */}
            <div style={{ ...s.caption, opacity: i === current ? 1 : 0, transition: 'opacity .5s ease .3s' }}>
              <p style={s.captionEyebrow}>Œuvre en vedette</p>
              <h2 style={s.captionTitle}>{art.title}</h2>
              <div style={s.captionDivider} />
              <div style={s.captionMeta}>
                <MetaRow icon="fa-solid fa-user"       text={art.student}    />
                <MetaRow icon="fa-solid fa-tag"        text={art.category}   />
                <MetaRow icon="fa-solid fa-screwdriver-wrench"
                  text={TOOL_LABEL[art.medium] ?? art.medium} />
                <MetaRow icon="fa-solid fa-calendar"   text={String(art.year)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Prev / Next arrows ── */}
      <button className="carousel-arrow" style={{ ...s.arrow, ...s.arrowLeft }}  onClick={prev} aria-label="Précédent">
        <i className="fa-solid fa-chevron-left" />
      </button>
      <button className="carousel-arrow" style={{ ...s.arrow, ...s.arrowRight }} onClick={next} aria-label="Suivant">
        <i className="fa-solid fa-chevron-right" />
      </button>

      {/* ── Dot indicators ── */}
      <div style={s.dots} role="tablist" aria-label="Diapositives">
        {FEATURED.map((art, i) => (
          <button
            key={art.id}
            className="carousel-dot"
            role="tab"
            aria-selected={i === current}
            aria-label={`Diapositive ${i + 1} : ${art.title}`}
            style={{ ...s.dot, ...(i === current ? s.dotActive : {}) }}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      {!paused && (
        <div style={s.progressWrap}>
          <div
            key={current} // remount to restart animation
            style={s.progressBar}
          />
        </div>
      )}
    </section>
  )
}

// ── MetaRow helper ────────────────────────────────────────────────────────────

function MetaRow({ icon, text }) {
  return (
    <div style={s.metaRow}>
      <i className={icon} style={s.metaIcon} />
      <span style={s.metaText}>{text}</span>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  section: {
    position: 'relative', width: '100%',
    height: 'clamp(480px, 70vh, 760px)',
    overflow: 'hidden', background: '#0d0d0d',
    userSelect: 'none',
  },
  track: { position: 'absolute', inset: 0 },
  slide: { position: 'absolute', inset: 0 },
  bg: {
    width: '100%', height: '100%',
    objectFit: 'cover', display: 'block',
  },
  bgFallback: {
    background: '#1a1a1a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Playfair Display', serif",
    fontSize: '12rem', fontWeight: 900,
    color: 'rgba(255,255,255,.06)',
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(105deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.35) 55%, rgba(0,0,0,.1) 100%)',
  },

  // Caption
  caption: {
    position: 'absolute', bottom: '14%', left: '6%',
    maxWidth: 480,
  },
  captionEyebrow: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '.72rem', fontWeight: 600,
    letterSpacing: '.2em', textTransform: 'uppercase',
    color: '#3369E8', marginBottom: 14,
  },
  captionTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(2rem, 5vw, 3.6rem)',
    fontWeight: 900, lineHeight: 1.1,
    color: '#ffffff', marginBottom: 20,
    textShadow: '0 2px 20px rgba(0,0,0,.4)',
  },
  captionDivider: {
    width: 48, height: 3,
    background: '#3369E8',
    borderRadius: 2,
    marginBottom: 20,
  },
  captionMeta: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  metaRow: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  metaIcon: {
    width: 16, textAlign: 'center',
    color: '#3369E8', fontSize: '.82rem', flexShrink: 0,
  },
  metaText: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '.88rem', color: 'rgba(255,255,255,.85)',
    fontWeight: 400,
  },

  // Arrows
  arrow: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    zIndex: 10, background: 'rgba(255,255,255,.1)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,.15)',
    color: '#fff', width: 46, height: 46,
    borderRadius: '50%', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.9rem',
    transition: 'background .2s, transform .15s',
  },
  arrowLeft:  { left: '3%' },
  arrowRight: { right: '3%' },

  // Dots
  dots: {
    position: 'absolute', bottom: '5%', left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', gap: 8, zIndex: 10,
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'rgba(255,255,255,.35)',
    border: 'none', cursor: 'pointer',
    transition: 'background .3s, transform .3s',
    padding: 0,
  },
  dotActive: {
    background: '#3369E8',
    transform: 'scale(1.4)',
  },

  // Progress bar
  progressWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, background: 'rgba(255,255,255,.1)', zIndex: 10,
  },
  progressBar: {
    height: '100%', background: '#3369E8',
    animation: 'carouselProgress 6s linear forwards',
    transformOrigin: 'left',
  },
}
