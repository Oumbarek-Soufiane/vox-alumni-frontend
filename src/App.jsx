import { useUser }       from './context/UserContext'
import NameGate          from './components/NameGate'
import CommentsSection   from './components/CommentsSection'
import Carousel          from './components/Carousel'
import RevealText        from './components/RevealText'
import useCardReveal     from './hooks/useCardReveal'
import './styles/global.css'

// ── Static artwork data ───────────────────────────────────────────────────────

const ARTWORKS = [
  // Abdallah Bourhine
  {
    id:          'bilmawn',
    title:       'Bilmawn',
    student:     'Abdallah Bourhine',
    initials:    'AB',
    medium:      'Digitale',
    year:        2024,
    category:    'Illustration',
    description: "Une illustration vibrante d'un personnage à la peau bleue portant une coiffe à cornes, encadré par des instruments traditionnels.",
    imageUrl:    '/img/art1.jpeg',
  },
  {
    id:          'free-palestine',
    title:       'Free Palestine',
    student:     'Abdallah Bourhine',
    initials:    'AB',
    medium:      'Digitale',
    year:        2023,
    category:    'Illustration',
    description: "Un personnage solennel vêtu de vert et coiffé d'un keffieh, tenant délicatement une fleur orange sur fond noir.",
    imageUrl:    '/img/bourhine2.jpeg',
  },
  {
    id:          'bourhine-3',
    title:       'Œuvre III',
    student:     'Abdallah Bourhine',
    initials:    'AB',
    medium:      'Digitale',
    year:        2024,
    category:    'Illustration',
    description: "Troisième création digitale d'Abdallah Bourhine, explorant forme et couleur.",
    imageUrl:    '/img/bourhine3.jpeg',
  },

  // Zyati Walid
  {
    id:          'le-zouphri',
    title:       'Le Zouphri',
    student:     'Zyati Walid',
    initials:    'ZW',
    medium:      'Digitale',
    year:        2024,
    category:    'Portrait',
    description: "Un jeune homme aux cheveux bruns bouclés, vêtu d'un gilet marron, avec une expression candide.",
    imageUrl:    '/img/walid1.jpeg',
  },
  {
    id:          'iben-batota',
    title:       'Iben Batota',
    student:     'Zyati Walid',
    initials:    'ZW',
    medium:      'Digitale',
    year:        2024,
    category:    'Portrait',
    description: "Un voyageur barbu coiffé d'un turban vert, portant un parchemin dans le dos et tenant un livre rouge.",
    imageUrl:    '/img/walid2.jpeg',
  },
  {
    id:          'lgazar',
    title:       'LGAZAR',
    student:     'Zyati Walid',
    initials:    'ZW',
    medium:      'Digitale',
    year:        2024,
    category:    'Character Design',
    description: "Planche de conception d'un personnage cartoonesque bedonnant au gros nez rose et à la casquette rouge.",
    imageUrl:    '/img/walid3.jpeg',
  },

  // Nabil Mimouni
  {
    id:          'ellie-tlou',
    title:       'Ellie (TLOU)',
    student:     'Nabil Mimouni',
    initials:    'NM',
    medium:      'Papier',
    year:        2024,
    category:    'Dessin Traditionnel',
    description: "Portrait réaliste au crayon d'Ellie, personnage principal du jeu The Last of Us.",
    imageUrl:    '/img/nabil1.jpeg',
  },
  {
    id:          'nabil-2',
    title:       'Dessin II',
    student:     'Nabil Mimouni',
    initials:    'NM',
    medium:      'Papier',
    year:        2024,
    category:    'Dessin Traditionnel',
    description: "Deuxième œuvre sur papier de Nabil Mimouni, maîtrise du trait et des ombres.",
    imageUrl:    '/img/nabil2.jpeg',
  },
  {
    id:          'tuk-ilu',
    title:       'Tuk & Ilu (Avatar)',
    student:     'Nabil Mimouni',
    initials:    'NM',
    medium:      'Papier',
    year:        2025,
    category:    'Dessin Traditionnel',
    description: "Un dessin à l'encre représentant un personnage aux cheveux tentaculaires parmi des poissons volants.",
    imageUrl:    '/img/nabil3.jpeg',
  },

  // Yebda Nada
  {
    id:          'metamorphose',
    title:       'Métamorphose du Regard',
    student:     'Yebda Nada',
    initials:    'YN',
    medium:      'Papier',
    year:        2024,
    category:    'Illustration',
    description: "Illustration expressive où le regard se transforme, mêlant réalisme et abstraction.",
    imageUrl:    '/img/nada1.jpeg',
  },
  {
    id:          'nada-2',
    title:       'Illustration II',
    student:     'Yebda Nada',
    initials:    'YN',
    medium:      'Papier',
    year:        2024,
    category:    'Illustration',
    description: "Deuxième illustration de Nada, jouant sur les contrastes et la composition.",
    imageUrl:    '/img/nada2.jpeg',
  },
  {
    id:          'nada-3',
    title:       'Illustration III',
    student:     'Yebda Nada',
    initials:    'YN',
    medium:      'Papier',
    year:        2024,
    category:    'Illustration',
    description: "Troisième œuvre de Nada, exploration des formes organiques et de la ligne.",
    imageUrl:    '/img/nada3.jpeg',
  },
]

// ── Gallery ───────────────────────────────────────────────────────────────────

function Gallery() {
  const { name, clearName } = useUser()
  const gridRef = useCardReveal('.artwork-card')

  return (
    <>
      <nav style={s.nav}>
        <div style={s.navInner}>
          <img src="/img/Artboard 1@4x.png" alt="VOX Alumni" style={s.navLogo} />
          <div style={s.navRight}>
            <span style={s.navName}>
              <i className="fa-solid fa-circle-user" style={{ color: '#3369E8', marginRight: 6 }} />
              {name}
            </span>
            <button className="nav-change-btn" style={s.changeBtn} onClick={clearName} title="Changer de nom">
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        </div>
      </nav>

      <Carousel artworks={ARTWORKS} />

      <section style={s.gallerySection} id="gallery">
        <div style={s.sectionHeader}>
          <RevealText as="h2" color="#1a1a1a" startColor="#cccccc" start="top 80%" end="top 30%" style={s.sectionTitle}>
            La Galerie des Étudiants
          </RevealText>
          <RevealText as="p" color="#666666" startColor="#cccccc" start="top 82%" end="top 38%" style={s.sectionSubtitle}>
            Explorez ces travaux créatifs et partagez vos réflexions
          </RevealText>
        </div>

        <div style={s.grid} ref={gridRef}>
          {ARTWORKS.map((art, i) => (
            <ArtworkCard key={art.id} art={art} index={i} />
          ))}
        </div>
      </section>

      <footer style={s.footer}>
        <img
          src="/img/Artboard 1@4x.png"
          alt="VOX Alumni"
          style={{ height: 140, width: 'auto', marginBottom: 10, objectFit: 'contain', opacity: 0.6 }}
        />
        <p style={s.footerText}>© {new Date().getFullYear()} VOX Alumni — Tous droits réservés</p>
      </footer>
    </>
  )
}

// ── ArtworkCard ───────────────────────────────────────────────────────────────

function ArtworkCard({ art }) {
  return (
    <article className="artwork-card" style={s.card}>
      <div style={s.imageWrap}>
        {art.imageUrl
          ? <img src={art.imageUrl} alt={art.title} style={s.image} loading="lazy" />
          : (
            <div style={s.placeholder}>
              <span style={s.placeholderLetter}>{art.title[0]}</span>
              <span style={s.placeholderHint}>image non trouvée</span>
            </div>
          )
        }
        <span style={s.categoryBadge}>{art.category}</span>
      </div>

      <div style={s.cardBody}>
        <div style={s.cardHeader}>
          <div style={{ ...s.avatar, background: avatarColor(art.student) }}>
            {art.initials}
          </div>
          <div>
            <p style={s.studentName}>{art.student}</p>
            <p style={s.meta}>{art.medium} · {art.year}</p>
          </div>
        </div>

        <RevealText as="h3" color="#1a1a1a" startColor="#bbbbbb" start="top 90%" end="top 60%" style={s.artTitle}>
          {art.title}
        </RevealText>

        <RevealText as="p" color="#777777" startColor="#cccccc" start="top 92%" end="top 65%" style={s.artDesc}>
          {art.description}
        </RevealText>

        <CommentsSection artworkId={art.id} />
      </div>
    </article>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { name } = useUser()
  if (!name) return <NameGate />
  return <Gallery />
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avatarColor(name) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 35%, 28%)`
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  nav: { background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 16px rgba(0,0,0,.25)' },
  navInner: { maxWidth: 1400, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLogo: { height: 65, width: 'auto', display: 'block', objectFit: 'contain' },
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  navName: { fontFamily: "'Work Sans', sans-serif", fontSize: '.85rem', color: '#ccc', display: 'flex', alignItems: 'center' },
  changeBtn: { background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 7, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4f1ea', cursor: 'pointer', fontSize: '0.85rem', transition: 'background .15s' },
  gallerySection: { background: '#f4f1ea', paddingBottom: 72 },
  sectionHeader: { textAlign: 'center', padding: '80px 24px 48px' },
  sectionTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.9rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, display: 'block', marginBottom: 14 },
  sectionSubtitle: { fontFamily: "'Work Sans', sans-serif", fontSize: '1rem', lineHeight: 1.65, display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28, padding: '0 32px', maxWidth: 1400, margin: '0 auto' },
  card: { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,.07)', transition: 'transform .2s ease, box-shadow .2s ease' },
  imageWrap: { position: 'relative', overflow: 'hidden', background: '#1a1a1a', aspectRatio: '4 / 3' },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s ease' },
  placeholder: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderLetter: { fontFamily: "'Playfair Display', serif", fontSize: '5rem', fontWeight: 900, color: 'rgba(255,255,255,.1)' },
  placeholderHint: { fontFamily: "'Work Sans', sans-serif", fontSize: '.72rem', color: 'rgba(255,255,255,.22)', letterSpacing: '.06em' },
  categoryBadge: { position: 'absolute', top: 12, right: 12, background: '#3369E8', backdropFilter: 'blur(4px)', color: '#f4f1ea', fontSize: '.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, fontFamily: "'Work Sans', sans-serif" },
  cardBody: { padding: '16px 18px 18px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.72rem', fontWeight: 700, fontFamily: "'Work Sans', sans-serif", flexShrink: 0 },
  studentName: { fontWeight: 600, fontSize: '.88rem', color: '#1a1a1a', fontFamily: "'Work Sans', sans-serif" },
  meta: { fontSize: '.72rem', color: '#aaa', fontFamily: "'Work Sans', sans-serif" },
  artTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.18rem', fontWeight: 700, marginBottom: 6, display: 'block' },
  artDesc: { fontFamily: "'Work Sans', sans-serif", fontSize: '.82rem', lineHeight: 1.55, marginBottom: 14, display: 'block' },
  footer: { textAlign: 'center', padding: '48px 24px 36px', background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  footerText: { fontFamily: "'Work Sans', sans-serif", fontSize: '.78rem', color: 'rgba(255,255,255,.3)' },
}