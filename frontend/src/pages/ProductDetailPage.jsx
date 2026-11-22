import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Plus, Minus, ShoppingBag, ArrowLeft, CheckCircle, Package, Leaf, Clock, Shield, MapPin } from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductImage from '../components/ProductImage'
import { getMeta, BADGE_MAP, fmt } from '../data/products'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import '../styles/globals.css'
import '../styles/product-detail.css'

const SPECS = [
  { icon: Package, label: 'Poids net',      key: 'weight' },
  { icon: Clock,   label: 'Conservation',   key: 'conservation' },
  { icon: Leaf,    label: 'Origine',         key: 'origine' },
  { icon: Shield,  label: 'Certification',  value: 'Sans additif' },
]

export default function ProductDetailPage() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty]  = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true); setNotFound(false)
    api.get(`/products/${slug}`)
      .then(res => {
        const p = res.data ?? res
        setProduct({ ...p, ...getMeta(p.slug) })
        return api.get('/products?per_page=4')
      })
      .then(res => {
        const others = (res.data ?? []).filter(p => p.slug !== slug).slice(0, 3)
        setRelated(others.map(p => ({ ...p, ...getMeta(p.slug) })))
      })
      .catch(err => { if (err.status === 404) setNotFound(true) })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <>
      <Navbar currentPage="boutique" />
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <span className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--tomato)' }} />
      </div>
    </>
  )

  if (notFound || !product) return (
    <>
      <Navbar currentPage="boutique" />
      <div className="pd-not-found">
        <TomatoIcon size={64} color="var(--border)" />
        <h1>Produit introuvable</h1>
        <Link to="/home" className="btn btn-primary">Retour à la boutique</Link>
      </div>
    </>
  )

  const badge = product.badge ? BADGE_MAP[product.badge] : null

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <>
      <Navbar currentPage="boutique" />

      <main className="pd-main">
        <div className="page-container">

          {/* ── Breadcrumb ── */}
          <nav className="pd-breadcrumb" aria-label="Fil d'Ariane">
            <Link to="/"     className="pd-crumb">Accueil</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link to="/home" className="pd-crumb">Boutique</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="pd-crumb pd-crumb-current" aria-current="page">
              {product.name} {product.volume}
            </span>
          </nav>

          {/* ── Split layout ── */}
          <div className="pd-split">

            {/* ── Gauche — Visuel ── */}
            <motion.div
              className={`pd-visual ${product.bg}`}
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
            >
              {badge && (
                <span className={`badge ${badge.cls} pd-visual-badge`}>{badge.label}</span>
              )}
              <motion.div
                className="pd-icon-wrap"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ProductImage
                  images={product.images}
                  slug={product.slug}
                  iconType={product.iconType}
                  size={160}
                  alt={product.name}
                />
              </motion.div>

              {/* Cercles déco */}
              <div className="pd-deco-ring ring-outer" aria-hidden="true" />
              <div className="pd-deco-ring ring-inner" aria-hidden="true" />

              {/* Spec chips */}
              <div className="pd-visual-chips">
                <span className="pd-chip"><Leaf size={11} /> Sans additif</span>
                <span className="pd-chip"><MapPin size={11} /> Made in Sénégal</span>
              </div>
            </motion.div>

            {/* ── Droite — Infos ── */}
            <motion.div
              className="pd-info"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: .5, delay: .08, ease: [.22, 1, .36, 1] }}
            >
              <div className="pd-info-top">
                <div className="pd-format-tag">{product.format}</div>
                <h1 className="pd-title">
                  {product.name}
                  <span className="pd-volume"> · {product.volume}</span>
                </h1>
                <div className="pd-price">{fmt(product.price)}</div>

                {/* Stock */}
                <div className="pd-stock">
                  <span className={`pd-stock-dot ${product.stock > 20 ? 'in' : 'low'}`} aria-hidden="true" />
                  {product.stock > 20
                    ? `En stock (${product.stock} disponibles)`
                    : `Stock limité — Plus que ${product.stock}`
                  }
                </div>
              </div>

              {/* Description */}
              <p className="pd-description">{product.description}</p>

              {/* Specs */}
              <div className="pd-specs">
                {SPECS.map(s => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="pd-spec">
                      <Icon size={14} aria-hidden="true" />
                      <span className="pd-spec-label">{s.label}</span>
                      <span className="pd-spec-val">{s.value ?? product[s.key]}</span>
                    </div>
                  )
                })}
              </div>

              {/* Quantity + CTA */}
              <div className="pd-actions">
                <div className="pd-qty-group" role="group" aria-label="Quantité">
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Diminuer"
                    disabled={qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="pd-qty-num" aria-live="polite">{qty}</span>
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    aria-label="Augmenter"
                    disabled={qty >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <motion.button
                  className={`btn btn-primary btn-lg pd-add-btn${added ? ' added' : ''}`}
                  onClick={handleAdd}
                  whileTap={{ scale: .97 }}
                  disabled={product.stock === 0}
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span
                        key="ok"
                        className="pd-add-inner"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: .2 }}
                      >
                        <CheckCircle size={18} /> Ajouté !
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        className="pd-add-inner"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: .2 }}
                      >
                        <ShoppingBag size={18} /> Ajouter au panier
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="pd-total-line">
                Total : <strong>{fmt(product.price * qty)}</strong>
              </div>

              <Link to="/panier" className="btn btn-outline pd-view-cart">
                <ShoppingBag size={16} /> Voir le panier
              </Link>
            </motion.div>
          </div>

          {/* ── Produits similaires ── */}
          <section className="pd-related" aria-labelledby="related-title">
            <h2 className="pd-related-title" id="related-title">Vous pourriez aussi aimer</h2>
            <div className="pd-related-grid">
              {related.map((p, i) => {
                const b = p.badge ? BADGE_MAP[p.badge] : null
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * .08, duration: .4 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/produits/${p.slug}`} className={`pd-related-card ${p.bg}`}>
                      <div className="pd-related-img">
                        <ProductImage
                          images={p.images}
                          slug={p.slug}
                          iconType={p.iconType}
                          size={56}
                          alt={p.name}
                        />
                        {b && <span className={`badge ${b.cls} pd-related-badge`}>{b.label}</span>}
                      </div>
                      <div className="pd-related-body">
                        <div className="pd-related-name">{p.name}</div>
                        <div className="pd-related-vol">{p.volume} · {p.format}</div>
                        <div className="pd-related-price">{fmt(p.price)}</div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
