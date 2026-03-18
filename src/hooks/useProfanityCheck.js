/**
 * hooks/useProfanityCheck.js
 *
 * Client-side profanity guard — mirrors the backend list so the user
 * gets instant feedback while typing, before any API call is made.
 *
 * Usage:
 *   const { isBad, warning } = useProfanityCheck(text)
 *
 *   isBad   — boolean, true if offensive content detected
 *   warning — string | null, human-readable warning message
 */

import { useMemo } from 'react'

// ── Word list (same as backend ProfanityFilter.php) ───────────────────────────

const BAD_WORDS = [
  // English
  'fuck','fucking','fucker','fucked','fck',
  'shit','shitty','bullshit',
  'bitch','bitches','bastard',
  'asshole','ass','arse',
  'dick','cock','cunt',
  'whore','slut','hoe',
  'nigger','nigga',
  'faggot','fag',
  'retard','retarded',
  'idiot','moron','imbecile',
  'kill yourself','kys',
  'rape','rapist',
  'nazi','terrorist',
  // French
  'merde','putain','pute','salope',
  'connard','connasse','con',
  'enculé','encule','enculer',
  'bâtard','batard',
  'nique','niquer','niqué',
  'fdp','fils de pute',
  'ta gueule','ferme la',
  'crétin','cretin',
  'abruti','débile','debile',
  'raciste',
  'terroriste',
  'suicid',
  'tue toi','tue-toi',
  'va mourir','crève','creve',
  'mongol','gogol',
  'pédophile','pedophile',
  'violer','viol',
  'salopard','ordure',
  'déchet','dechet',
]

// ── Leet-speak normaliser (mirrors backend) ───────────────────────────────────

const LEET = { '@':'a','4':'a','3':'e','€':'e','1':'i','!':'i','0':'o','5':'s','$':'s','7':'t','+':'t' }

function normalize(text) {
  let s = text.toLowerCase()
  for (const [k, v] of Object.entries(LEET)) s = s.split(k).join(v)
  // strip zero-width chars
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, '')
  return s
}

function containsBadWord(text) {
  if (!text) return false
  const norm = normalize(text)
  for (const word of BAD_WORDS) {
    // word-boundary match
    const pattern = new RegExp(`(?<![a-z0-9])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'i')
    if (pattern.test(norm)) return word
  }
  return false
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export default function useProfanityCheck(text) {
  return useMemo(() => {
    const match = containsBadWord(text)
    if (!match) return { isBad: false, warning: null }

    return {
      isBad: true,
      warning: '🚫 Langage inapproprié détecté. Merci de rester respectueux.',
    }
  }, [text])
}
