/**
 * hooks/useScrollReveal.js
 *
 * Wraps every character in a <span> and animates its color from
 * light gray → target color as the element scrolls into view.
 * Uses window.gsap / window.ScrollTrigger loaded via CDN in index.html.
 *
 * Usage:
 *   const ref = useScrollReveal({ targetColor: '#1a1a1a' })
 *   <h2 ref={ref}>Mon titre</h2>
 */

import { useEffect, useRef } from 'react'

export default function useScrollReveal({
  targetColor  = '#1a1a1a',
  startColor   = '#cccccc',
  start        = 'top 82%',
  end          = 'top 28%',
  scrub        = 1,
} = {}) {
  const elRef = useRef(null)

  useEffect(() => {
    // Wait for GSAP to load from CDN (it's deferred)
    const init = () => {
      const el = elRef.current
      if (!el || !window.gsap || !window.ScrollTrigger) return

      window.gsap.registerPlugin(window.ScrollTrigger)

      // ── Wrap each character in a span ──────────────────────────────────────
      const originalText = el.textContent
      el.innerHTML = ''
      const spans = []

      for (const char of originalText) {
        const span = document.createElement('span')
        span.textContent = char
        span.style.color = startColor
        span.style.transition = 'color 0.05s ease'
        // preserve whitespace
        if (char === ' ') span.style.whiteSpace = 'pre'
        el.appendChild(span)
        spans.push(span)
      }

      // ── ScrollTrigger ──────────────────────────────────────────────────────
      window.ScrollTrigger.create({
        trigger: el,
        start,
        end,
        scrub,
        onUpdate(self) {
          const progress = self.progress
          const total    = spans.length

          // Parse hex colors to rgb for interpolation
          const from = hexToRgb(startColor)
          const to   = hexToRgb(targetColor)

          spans.forEach((span, i) => {
            const charStart = i / total
            const charEnd   = (i + 1) / total

            let r, g, b
            if (progress >= charEnd) {
              ;[r, g, b] = to
            } else if (progress >= charStart) {
              const t = (progress - charStart) / (charEnd - charStart)
              r = Math.round(from[0] + t * (to[0] - from[0]))
              g = Math.round(from[1] + t * (to[1] - from[1]))
              b = Math.round(from[2] + t * (to[2] - from[2]))
            } else {
              ;[r, g, b] = from
            }
            span.style.color = `rgb(${r},${g},${b})`
          })
        },
      })
    }

    // GSAP might not be loaded yet (deferred script)
    if (window.gsap && window.ScrollTrigger) {
      init()
    } else {
      window.addEventListener('load', init, { once: true })
    }

    return () => {
      // Cleanup ScrollTrigger on unmount
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => {
          if (t.trigger === elRef.current) t.kill()
        })
      }
    }
  }, [targetColor, startColor, start, end, scrub])

  return elRef
}

// ── Helper ────────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full  = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}
