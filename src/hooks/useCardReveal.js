/**
 * hooks/useCardReveal.js
 *
 * Applies a GSAP ScrollTrigger fade + translateY animation to every
 * element matching `selector` inside `containerRef`.
 *
 * Cards start invisible (opacity:0, y:40px) and animate in as they
 * enter the viewport, staggered by 0.12s each.
 *
 * Usage:
 *   const gridRef = useCardReveal('.artwork-card')
 *   <div ref={gridRef}> ... </div>
 */

import { useEffect, useRef } from 'react'

export default function useCardReveal(selector = '.artwork-card') {
  const containerRef = useRef(null)

  useEffect(() => {
    const init = () => {
      if (!window.gsap || !window.ScrollTrigger) return
      const container = containerRef.current
      if (!container) return

      window.gsap.registerPlugin(window.ScrollTrigger)

      const cards = container.querySelectorAll(selector)
      if (!cards.length) return

      // Set initial hidden state
      window.gsap.set(cards, { opacity: 0, y: 44 })

      // Animate each card when it enters the viewport
      cards.forEach((card, i) => {
        window.gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
          delay: (i % 3) * 0.12, // stagger within each row
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,           // only play once
          },
        })
      })
    }

    if (window.gsap && window.ScrollTrigger) {
      init()
    } else {
      window.addEventListener('load', init, { once: true })
    }

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => t.kill())
      }
    }
  }, [selector])

  return containerRef
}
