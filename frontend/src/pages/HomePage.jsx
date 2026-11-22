import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, ChevronDown, X, Plus, Minus, CheckCircle, Filter } from 'lucide-react'
import { TomatoIcon, JarIcon, BoxIcon } from '../components/TomatoIcon'
import { BADGE_MAP, getMeta, fmt } from '../data/products'
import { useCart } from '../context/CartContext'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import '../styles/globals.css'
import '../styles/home.css'

const ICON_MAP = { tomato: TomatoIcon, jar: JarIcon, box: BoxIcon }

/* ── Variantes Framer ── */
const cardVariants = {
  hidden:  { opacity: 0, y: 20, scale: .96 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * .07, duration: .38, ease: [.22, 1, .36, 1] } }),
}
const toastVariants = {
  initial: { opacity: 0, y: 32, scale: .95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: .3, ease: [.22, 1, .36, 1] } },
  exit:    { opacity: 0, y: 24, scale: .95, transition: { duration: .2 } },
}

/* ── Toast ── */
function Toast({ product }) {
  return (
    <motion.div
      className="cart-toast"
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="status"
      aria-live="polite"
    >
      <CheckCircle size={18} color="var(--tomato)" aria-hidden="true" />
      <span><strong>{product.name}</strong> ajouté au panier</span>
    </motion.div>
  )
}

/* ── Carte produit ── */
function HomeProductCard({ product, onAdd, index }) {
  const [qty, setQty] = useState(1)
  const Icon  = ICON_MAP[product.iconType] ?? TomatoIcon
  const badge = product.badge ? BADGE_MAP[product.badge] : null

  return (
    <motion.article
      className={`hp-card ${product.bg}`}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, transition: { duration: .2 } }}
    >
      {/* Lien vers la page détail */}
      <Link to={`/produits/${product.slug}`} className="hp-card-img" aria-label={`Voir ${product.name} ${product.volume}`}>
        <div className="hp-card-icon" aria-hidden="true">
          <Icon size={64} />
        </div>
        {badge && <span className={`badge ${badge.cls} hp-card-badge`}>{badge.label}</span>}
        {product.stock < 20 && (
          <span className="hp-stock-warn">Plus que {product.stock}</span>
        )}
      </Link>

      <div className="hp-card-body">
        <Link to={`/produits/${product.slug}`} className="hp-card-name-link">
          <div className="hp-card-name">{product.name}</div>
        </Link>
        <div className="hp-card-vol">{product.volume} · {product.format}</div>
        <div className="hp-card-price">{fmt(product.price)}</div>
        <div className="hp-card-qty-row">
          <div className="hp-qty-ctrl" role="group" aria-label={`Quantité pour ${product.name}`}>
            <button
              className="hp-qty-btn"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              aria-label="Diminuer la quantité"
              disabled={qty <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="hp-qty-num" aria-live="polite">{qty}</span>
            <button
              className="hp-qty-btn"
              onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              aria-label="Augmenter la quantité"
              disabled={qty >= product.stock}
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            className="btn btn-primary btn-sm hp-card-add"
            onClick={() => { onAdd(product, qty); setQty(1) }}
            aria-label={`Ajouter ${qty} ${product.name} au panier`}
          >
            <ShoppingBag size={14} /> Ajouter
          </button>
        </div>
      </div>
    </motion.article>
  )
}

/* ── Page HomePage ── */
export default function HomePage() {
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState('default')
  const [toasts, setToasts]   = useState([])
  const [products, setProducts] = useState([])
  const [loadingProd, setLoadingProd] = useState(true)

  const { addItem } = useCart()

  useEffect(() => {
    api.get('/products?per_page=12')
      .then(res => setProducts(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingProd(false))
  }, [])

  const enriched = products.map(p => ({ ...p, ...getMeta(p.slug) }))

  const addToCart = (product, qty = 1) => {
    addItem(product, qty)
    const id = Date.now()
    setToasts(ts => [...ts, { id, product }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000)
  }

  const filtered = enriched
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
                 (p.volume ?? '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc')  return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return 0
    })

  return (
    <>
      <Navbar currentPage="boutique" />

      <main className="hp-main">
        <div className="page-container">

          {/* ── Hero header ── */}
          <motion.div
            className="hp-page-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4 }}
          >
            <div>
              <h1 className="hp-page-title">Notre boutique</h1>
              <p className="hp-page-sub">Tomate concentrée 100% naturelle, livrée au Sénégal.</p>
            </div>
            <div className="hp-page-badge">
              <span className="badge badge-green">{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>

          {/* ── Chargement ── */}
          {loadingProd && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-muted)' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--tomato)', width: 32, height: 32 }} />
            </div>
          )}

          {/* ── Barre filtre ── */}
          {!loadingProd && <motion.div
            className="hp-filter-bar"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4, delay: .08 }}
          >
            <div className="hp-search-wrap">
              <Search size={16} className="hp-search-icon" aria-hidden="true" />
              <input
                type="search"
                className="field-input hp-search-input"
                placeholder="Rechercher un produit…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Rechercher un produit"
              />
              {search && (
                <button className="hp-search-clear" onClick={() => setSearch('')} aria-label="Effacer la recherche">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="hp-sort-wrap">
              <Filter size={15} className="hp-sort-icon" aria-hidden="true" />
              <select
                className="field-input hp-sort-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
                aria-label="Trier les produits"
              >
                <option value="default">Trier par défaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <ChevronDown size={14} className="hp-sort-chevron" aria-hidden="true" />
            </div>
          </motion.div>}

          {/* ── Grille produits ── */}
          {!loadingProd && (filtered.length > 0 ? (
            <div className="hp-grid" role="list">
              {filtered.map((p, i) => (
                <div key={p.id} role="listitem">
                  <HomeProductCard product={p} onAdd={addToCart} index={i} />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="hp-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="hp-empty-icon" aria-hidden="true">
                <TomatoIcon size={64} color="var(--border)" />
              </div>
              <div className="hp-empty-title">Aucun produit trouvé</div>
              <p className="hp-empty-sub">Essayez un autre terme de recherche.</p>
              <button className="btn btn-outline btn-sm" onClick={() => setSearch('')}>
                <X size={14} /> Réinitialiser
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── Toasts ── */}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        <AnimatePresence>
          {toasts.map(t => <Toast key={t.id} product={t.product} />)}
        </AnimatePresence>
      </div>
    </>
  )
}
