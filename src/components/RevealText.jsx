/**
 * components/RevealText.jsx
 *
 * Convenience wrapper around useScrollReveal.
 *
 * Usage:
 *   <RevealText as="h2" color="#1a1a1a">Mon titre</RevealText>
 *   <RevealText as="p"  color="#2d2d2d" start="top 90%">Sous-titre</RevealText>
 */

import useScrollReveal from '../hooks/useScrollReveal'

export default function RevealText({
  as: Tag        = 'span',
  color          = '#1a1a1a',
  startColor     = '#cccccc',
  start          = 'top 82%',
  end            = 'top 28%',
  style          = {},
  className      = '',
  children,
}) {
  const ref = useScrollReveal({ targetColor: color, startColor, start, end })

  return (
    <Tag ref={ref} style={style} className={className}>
      {children}
    </Tag>
  )
}
