import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Truck, Shield, Star, ChevronRight,
  MapPin, Clock, Leaf, ArrowRight, Menu, X
} from 'lucide-react'
import ProductImage from '../components/ProductImage'
import '../styles/globals.css'
import '../styles/landing.css'

/* ── Produits vitrine ── */
const PRODUCTS = [
  {
    id: 1,
    slug: 'double-concentre-70g',
    name: 'Le sachet du quotidien',
    volume: '70g · Sachet nomade',
    price: '300 F',
    badge: { label: 'Populaire', cls: 'badge-gold' },
    iconType: 'tomato',
    bg: 'grad-a',
    desc: 'Toujours prêt dans votre placard. Parfait pour improviser un thiéboudienne ou un yassa sans avoir à y penser.',
  },
  {
    id: 2,
    slug: 'double-concentre-400g',
    name: 'Le préféré des familles',
    volume: '400g · Boîte métal',
    price: '1 200 F',
    badge: { label: 'Best-seller', cls: 'badge-red' },
    iconType: 'jar',
    bg: 'grad-b',
    desc: 'La référence Tomat\'chef. Le format idéal pour les grandes tablées et les plats qui mijotent longuement.',
  },
  {
    id: 3,
    slug: 'double-concentre-2kg',
    name: 'Le format des pros',
    volume: '2,2kg · Grand format',
    price: '5 500 F',
    badge: { label: 'Promo −10%', cls: 'badge-green' },
    iconType: 'box',
    bg: 'grad-c',
    desc: 'Pour les restaurateurs, traiteurs et grandes familles. Jusqu\'à 10% d\'économies sur chaque commande.',
  },
]

const FEATURES = [
  { icon: Leaf,       title: '100% naturel',       desc: 'Sans conservateur ni colorant artificiel. Pur concentré de tomate sénégalaise.' },
  { icon: Truck,      title: 'Livraison partout',   desc: 'Dakar, Thiès, Saint-Louis… Nous livrons dans tout le Sénégal sous 48h.' },
  { icon: Shield,     title: 'Paiement sécurisé',   desc: 'Carte bancaire avec validation Luhn, transaction chiffrée de bout en bout.' },
  { icon: Star,       title: 'Qualité certifiée',   desc: 'Fabriqué selon les normes ISO, contrôle qualité à chaque production.' },
  { icon: Clock,      title: 'Fraîcheur garantie',  desc: 'Produit dans les 72h suivant la récolte. Goût authentique préservé.' },
  { icon: MapPin,     title: 'Made in Sénégal',     desc: 'Tomates cultivées localement. Soutien direct aux agriculteurs sénégalais.' },
]

/* ── Variantes Framer ── */
const fadeUp   = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: .5, ease: [.22, 1, .36, 1] } } }
const stagger  = { visible: { transition: { staggerChildren: .08 } } }
const scaleIn  = { hidden: { opacity: 0, scale: .92 }, visible: { opacity: 1, scale: 1, transition: { duration: .45, ease: [.22, 1, .36, 1] } } }

/* ── Composant ProductCard ── */
function ProductCard({ product, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.article
      ref={ref}
      className={`product-card ${product.bg}`}
      variants={scaleIn}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay: index * .1 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(69,10,10,.18)' }}
    >
      <div className="pc-image">
        <ProductImage
          slug={product.slug}
          iconType={product.iconType}
          size={72}
          className="pc-svg-icon"
          alt={product.name}
        />
        <span className={`badge ${product.badge.cls} pc-badge`}>{product.badge.label}</span>
      </div>
      <div className="pc-body">
        <div className="pc-name">{product.name}</div>
        <div className="pc-vol">{product.volume}</div>
        <div className="pc-desc">{product.desc}</div>
        <div className="pc-foot">
          <span className="pc-price">{product.price}</span>
          <Link to="/auth" className="btn btn-primary btn-sm pc-cta">
            Commander <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

/* ── Composant FeatureCard ── */
function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const Icon = feature.icon
  return (
    <motion.div
      ref={ref}
      className="feature-card"
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay: index * .07 }}
      whileHover={{ y: -4 }}
    >
      <div className="feature-icon">
        <Icon size={22} strokeWidth={2} />
      </div>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-desc">{feature.desc}</p>
    </motion.div>
  )
}

/* ── Page principale ── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      {/* ── Navbar ── */}
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-dot" aria-hidden="true" />
            Tomat'chef
          </Link>

          {/* Desktop nav */}
          <nav className="nav-links desktop-nav" aria-label="Navigation principale">
            <a href="#produits" className="nav-link">Produits</a>
            <a href="#avantages" className="nav-link">Pourquoi nous</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/auth" className="nav-btn">
              <ShoppingBag size={15} /> Acheter
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: .28, ease: [.22, 1, .36, 1] }}
          >
            <nav className="mobile-nav-links" aria-label="Navigation mobile">
              <a href="#produits" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Produits</a>
              <a href="#avantages" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Pourquoi nous</a>
              <a href="#contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Contact</a>
              <Link to="/auth" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                <ShoppingBag size={16} /> Acheter maintenant
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* ── Hero ── */}
        <section className="hero" ref={heroRef} aria-labelledby="hero-title">
          {/* Background déco */}
          <div className="hero-bg-deco" aria-hidden="true">
            <div className="hero-blob blob-1" />
            <div className="hero-blob blob-2" />
            <svg className="hero-tomato-svg" viewBox="0 0 400 400" fill="none">
              <circle cx="200" cy="200" r="180" fill="#DC2626" opacity=".06" />
              <circle cx="200" cy="200" r="120" fill="#DC2626" opacity=".04" />
              <circle cx="200" cy="200" r="40"  fill="#DC2626" opacity=".06" />
              <line x1="200" y1="20"  x2="200" y2="380" stroke="#DC2626" strokeWidth="3" opacity=".04" />
              <line x1="20"  y1="200" x2="380" y2="200" stroke="#DC2626" strokeWidth="3" opacity=".04" />
              <line x1="80"  y1="80"  x2="320" y2="320" stroke="#DC2626" strokeWidth="2" opacity=".03" />
              <line x1="320" y1="80"  x2="80"  y2="320" stroke="#DC2626" strokeWidth="2" opacity=".03" />
            </svg>
          </div>

          <div className="page-container hero-content">
            <motion.div
              className="hero-text"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={stagger}
            >
              <motion.p className="hero-eyebrow" variants={fadeUp}>
                <Leaf size={14} aria-hidden="true" /> 100% Sénégalais · Sans conservateur
              </motion.p>
              <motion.h1 className="hero-title" id="hero-title" variants={fadeUp}>
                La tomate concentrée<br />
                <em className="hero-title-accent">de qualité</em><br />
                livrée chez vous.
              </motion.h1>
              <motion.p className="hero-sub" variants={fadeUp}>
                Né d'une passion pour le goût authentique et les plats qui mijotent avec amour,
                Tomat'Chef sélectionne les plus belles tomates gorgées de soleil pour créer
                un concentré double sans aucun additif. Une couleur rubis envoûtante,
                une onctuosité royale et des bienfaits nutritionnels exceptionnels.
              </motion.p>
              <motion.div className="hero-ctas" variants={fadeUp}>
                <Link to="/auth" className="btn btn-primary btn-lg">
                  <ShoppingBag size={18} /> Commander maintenant
                </Link>
                <a href="#produits" className="btn btn-outline btn-lg">
                  Voir nos produits <ChevronRight size={18} />
                </a>
              </motion.div>

              <motion.div className="hero-stats" variants={fadeUp}>
                <div className="hero-stat">
                  <span className="stat-num">500+</span>
                  <span className="stat-label">Clients satisfaits</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="stat-num">14</span>
                  <span className="stat-label">Régions livrées</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="stat-num">48h</span>
                  <span className="stat-label">Délai de livraison</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, x: 48, scale: .95 }}
              animate={heroInView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: .7, delay: .2, ease: [.22, 1, .36, 1] }}
              aria-hidden="true"
            >
              <div className="hero-card-float">
                <div className="hf-icon"><TomatoIcon size={32} /></div>
                <div className="hf-text">
                  <span className="hf-name">Double concentré 400g</span>
                  <span className="hf-price">1 200 F CFA</span>
                </div>
                <div className="hf-badge badge badge-green">En stock</div>
              </div>
              <div className="hero-tomato-visual">
                <div className="tomato-ring ring-1" />
                <div className="tomato-ring ring-2" />
                <div className="tomato-core">
                  <TomatoIcon size={80} />
                </div>
              </div>
              <div className="hero-card-float hero-card-float-2">
                <div className="hf-icon"><Truck size={28} color="var(--gold)" /></div>
                <div className="hf-text">
                  <span className="hf-name">Livraison en cours</span>
                  <span className="hf-price" style={{ color: 'var(--gold)' }}>Dakar → Thiès</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Ruban confiance ── */}
        <div className="trust-strip" aria-label="Marques de confiance">
          <div className="trust-inner">
            {['Sans OGM', 'Certifié ISO', 'Produit au Sénégal', 'Livraison 48h', 'Paiement sécurisé', 'Qualité artisanale'].map(t => (
              <span key={t} className="trust-item">
                <span className="trust-dot" aria-hidden="true" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Produits ── */}
        <section className="section-block" id="produits" aria-labelledby="sec-products">
          <div className="page-container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .5 }}
            >
              <span className="section-eyebrow">Nos produits</span>
              <h2 className="section-title" id="sec-products">Choisissez votre format</h2>
              <p className="section-desc">
                Trois formats adaptés à tous les besoins, du sachet quotidien au grand format économique.
              </p>
            </motion.div>

            <div className="products-grid">
              {PRODUCTS.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>

            <div className="products-cta">
              <Link to="/auth" className="btn btn-outline">
                Voir tous les produits <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Avantages ── */}
        <section className="section-block section-muted" id="avantages" aria-labelledby="sec-features">
          <div className="page-container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .5 }}
            >
              <span className="section-eyebrow">Pourquoi nous</span>
              <h2 className="section-title" id="sec-features">La différence Tomat'chef</h2>
              <p className="section-desc">
                Bien plus qu'une simple boutique en ligne — un engagement envers la qualité et le terroir sénégalais.
              </p>
            </motion.div>

            <div className="features-grid">
              {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="cta-banner" aria-labelledby="cta-title">
          <div className="cta-banner-bg" aria-hidden="true">
            <div className="cta-blob" />
          </div>
          <div className="page-container cta-content">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .5 }}
            >
              <h2 className="cta-title" id="cta-title">
                Prête à commander ?
              </h2>
              <p className="cta-sub">
                Créez votre compte en 30 secondes et recevez votre concentré de tomate directement chez vous.
              </p>
              <div className="cta-actions">
                <Link to="/auth?tab=register" className="btn btn-gold btn-lg">
                  Créer mon compte gratuit
                </Link>
                <Link to="/auth" className="btn btn-ghost btn-lg">
                  J'ai déjà un compte
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="footer" id="contact">
          <div className="page-container footer-inner">
            <div className="footer-brand">
              <div className="nav-logo footer-logo">
                <span className="nav-logo-dot" aria-hidden="true" style={{ background: 'var(--gold)' }} />
                Tomat'chef
              </div>
              <p className="footer-tagline">La saveur authentique du Sénégal.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <div className="footer-col-title">Boutique</div>
                <Link to="/auth" className="footer-link">Nos produits</Link>
                <Link to="/auth" className="footer-link">Commander</Link>
                <a href="#avantages" className="footer-link">Livraison</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Contact</div>
                <a href="mailto:diallofatimata353@gmail.com" className="footer-link">Email</a>
                <span className="footer-link-muted">+221 77 000 00 00</span>
                <span className="footer-link-muted">Dakar, Sénégal</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Tomat'chef · Dakar, Sénégal</span>
          </div>
        </footer>
      </main>
    </>
  )
}
