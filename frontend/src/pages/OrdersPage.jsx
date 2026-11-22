import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Eye, ShoppingBag, Star, ArrowUpDown } from 'lucide-react'
import { fmt } from '../data/products'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import ReviewForm from '../components/ReviewForm'
import '../styles/globals.css'
import '../styles/orders.css'
import '../styles/reviews.css'

const STATUS_LABEL = {
  pending_payment: 'En attente de paiement',
  received:        'Reçue',
  confirmed:       'Confirmée',
  preparing:       'En préparation',
  shipped:         'Expédiée',
  delivered:       'Livrée',
  cancelled:       'Annulée',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const FILTER_TABS = [
  { key: 'all',      label: 'Toutes' },
  { key: 'active',   label: 'En cours' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
]

function matchFilter(order, filter) {
  if (filter === 'all')       return true
  if (filter === 'active')    return !['delivered', 'cancelled'].includes(order.status)
  if (filter === 'delivered') return order.status === 'delivered'
  if (filter === 'cancelled') return order.status === 'cancelled'
  return true
}

const SORT_OPTIONS = [
  { value: 'date_desc',  label: 'Plus récent' },
  { value: 'date_asc',   label: 'Plus ancien' },
  { value: 'total_desc', label: 'Total décroissant' },
  { value: 'total_asc',  label: 'Total croissant' },
]

function applySort(list, sort) {
  return [...list].sort((a, b) => {
    if (sort === 'date_desc')  return new Date(b.created_at) - new Date(a.created_at)
    if (sort === 'date_asc')   return new Date(a.created_at) - new Date(b.created_at)
    if (sort === 'total_desc') return b.total - a.total
    if (sort === 'total_asc')  return a.total - b.total
    return 0
  })
}

export default function OrdersPage() {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [sort, setSort]             = useState('date_desc')
  const [reviewOpen, setReviewOpen] = useState(null)
  const [reviewed, setReviewed]     = useState(new Set())

  useEffect(() => {
    api.get('/orders?per_page=50')
      .then(res => setOrders(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = applySort(orders.filter(o => matchFilter(o, filter)), sort)
  const tabCount = (key) => orders.filter(o => matchFilter(o, key)).length

  return (
    <>
      <Navbar currentPage="commandes" />

      <main className="ord-main">
        <div className="page-container">

          <div className="ord-header">
            <div>
              <h1 className="ord-title">Mes commandes</h1>
              {!loading && (
                <p className="ord-sub">{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--tomato)', width: 32, height: 32 }} />
            </div>
          ) : (
            <>
              {/* ── Toolbar ── */}
              <div className="ord-toolbar">
                <div className="ord-tabs" role="tablist" aria-label="Filtrer les commandes">
                  {FILTER_TABS.map(tab => (
                    <button
                      key={tab.key}
                      role="tab"
                      aria-selected={filter === tab.key}
                      className={`ord-tab${filter === tab.key ? ' active' : ''}`}
                      onClick={() => setFilter(tab.key)}
                    >
                      {tab.label}
                      <span className="ord-tab-count">{tabCount(tab.key)}</span>
                    </button>
                  ))}
                </div>
                <div className="ord-sort-wrap">
                  <ArrowUpDown size={13} color="var(--fg-muted)" />
                  <span className="ord-sort-label">Trier par</span>
                  <select
                    className="field-input ord-sort-select"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Table ── */}
              {filtered.length === 0 ? (
                <motion.div
                  className="ord-empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="ord-empty-icon"><Package size={56} strokeWidth={1.5} /></div>
                  <div className="ord-empty-title">Aucune commande</div>
                  <p className="ord-empty-sub">Vous n'avez pas encore de commande dans cette catégorie.</p>
                  <Link to="/home" className="btn btn-primary">
                    <ShoppingBag size={16} /> Découvrir nos produits
                  </Link>
                </motion.div>
              ) : (
                <div className="ord-table-wrap">
                  <div className="ord-table">
                    <div className="ord-table-head">
                      <div className="ord-th">Commande</div>
                      <div className="ord-th">Date</div>
                      <div className="ord-th">Articles</div>
                      <div className="ord-th">Total</div>
                      <div className="ord-th">Statut</div>
                      <div className="ord-th">Actions</div>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {filtered.map((order, i) => {
                        const previewItems = (order.items ?? []).slice(0, 2)
                        const extra = (order.items ?? []).length - 2

                        return (
                          <motion.div
                            key={order.number}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * .03, duration: .25 }}
                          >
                            <div className="ord-row">
                              <div className="ord-cell-num">{order.number}</div>
                              <div className="ord-cell-date">{formatDate(order.created_at)}</div>
                              <div className="ord-cell-items">
                                {previewItems.map((item, idx) => (
                                  <span key={idx} className="ord-item-chip">
                                    {item.product_name} ×{item.quantity}
                                  </span>
                                ))}
                                {extra > 0 && (
                                  <span className="ord-item-more">+{extra}</span>
                                )}
                              </div>
                              <div className="ord-cell-total">{fmt(order.total)}</div>
                              <div>
                                <span className={`ord-status ${order.status}`}>
                                  <span className="ord-status-dot" aria-hidden="true" />
                                  {STATUS_LABEL[order.status] ?? order.status}
                                </span>
                              </div>
                              <div className="ord-cell-actions">
                                {order.status === 'delivered' && !reviewed.has(order.number) && (
                                  <button
                                    className="rvw-btn"
                                    onClick={() => setReviewOpen(reviewOpen === order.number ? null : order.number)}
                                  >
                                    <Star size={13} /> Avis
                                  </button>
                                )}
                                <Link
                                  to={`/mes-commandes/${order.number}`}
                                  className="btn btn-outline btn-sm"
                                  aria-label={`Voir la commande ${order.number}`}
                                >
                                  <Eye size={14} /> Détail
                                </Link>
                              </div>
                            </div>

                            {/* ── Formulaire avis ── */}
                            <AnimatePresence>
                              {reviewOpen === order.number && !reviewed.has(order.number) && (
                                <motion.div
                                  key="rvw"
                                  className="ord-review-panel"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <ReviewForm
                                    orderNumber={order.number}
                                    onDone={() => {
                                      setReviewed(s => new Set([...s, order.number]))
                                      setReviewOpen(null)
                                    }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </>
  )
}
