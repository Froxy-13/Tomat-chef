import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Package, ChevronRight, Eye } from 'lucide-react'
import { TomatoIcon, JarIcon, BoxIcon } from '../components/TomatoIcon'
import { fmt } from '../data/products'
import { useCart } from '../context/CartContext'
import '../styles/globals.css'
import '../styles/orders.css'

const ICON_MAP = { tomato: TomatoIcon, jar: JarIcon, box: BoxIcon }

const STATUS_LABEL = {
  received:  'Reçue',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

/* ── Mock commandes ── */
const MOCK_ORDERS = [
  {
    number: 'TC-261122-4871',
    date: '2026-11-22',
    status: 'received',
    deliveryZone: 'Dakar Centre',
    deliveryFee: 1000,
    items: [
      { id: 2, name: 'Double concentré', volume: '400g', format: 'Boîte métal', iconType: 'jar', price: 1200, quantity: 2 },
      { id: 1, name: 'Double concentré', volume: '70g', format: 'Sachet', iconType: 'tomato', price: 300, quantity: 3 },
    ],
  },
  {
    number: 'TC-261115-2345',
    date: '2026-11-15',
    status: 'delivered',
    deliveryZone: 'Dakar Banlieue',
    deliveryFee: 1500,
    items: [
      { id: 6, name: 'Pack famille', volume: '6 × 400g', format: 'Économique', iconType: 'box', price: 6000, quantity: 1 },
    ],
  },
  {
    number: 'TC-261108-7892',
    date: '2026-11-08',
    status: 'cancelled',
    deliveryZone: 'Régions',
    deliveryFee: 3000,
    items: [
      { id: 4, name: 'Triple concentré', volume: '400g', format: 'Premium', iconType: 'tomato', price: 1800, quantity: 1 },
      { id: 5, name: 'Double concentré', volume: '200g', format: 'Bocal verre', iconType: 'jar', price: 750, quantity: 2 },
    ],
  },
  {
    number: 'TC-261102-1133',
    date: '2026-11-02',
    status: 'shipped',
    deliveryZone: 'Dakar Centre',
    deliveryFee: 1000,
    items: [
      { id: 3, name: 'Double concentré', volume: '2,2kg', format: 'Grand format', iconType: 'box', price: 5500, quantity: 1 },
    ],
  },
]

function orderTotal(order) {
  return order.items.reduce((s, i) => s + i.price * i.quantity, 0) + order.deliveryFee
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

export default function OrdersPage() {
  const [filter, setFilter] = useState('all')
  const { count }           = useCart()

  const filtered = MOCK_ORDERS.filter(o => matchFilter(o, filter))

  const tabCount = (key) => MOCK_ORDERS.filter(o => matchFilter(o, key)).length

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo"><span className="nav-logo-dot" />Tomat'chef</Link>
          <nav className="nav-links desktop-nav">
            <Link to="/home" className="nav-link">Boutique</Link>
            <Link to="/mes-commandes" className="nav-link" aria-current="page">Mes commandes</Link>
          </nav>
          <Link to="/panier" className="hp-cart-btn" aria-label={`Panier, ${count} article${count !== 1 ? 's' : ''}`}>
            <ShoppingBag size={20} color="#fff" />
            {count > 0 && (
              <motion.span className="hp-cart-count" key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                {count}
              </motion.span>
            )}
          </Link>
        </div>
      </header>

      <main className="ord-main">
        <div className="page-container">

          <div className="ord-header">
            <div>
              <h1 className="ord-title">Mes commandes</h1>
              <p className="ord-sub">{MOCK_ORDERS.length} commande{MOCK_ORDERS.length !== 1 ? 's' : ''} au total</p>
            </div>
          </div>

          {/* ── Filtres ── */}
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

          {/* ── Liste ── */}
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
            <div className="ord-list" role="list">
              <AnimatePresence mode="popLayout">
                {filtered.map((order, i) => {
                  const total     = orderTotal(order)
                  const previewItems = order.items.slice(0, 2)
                  const extra     = order.items.length - 2

                  return (
                    <motion.div
                      key={order.number}
                      role="listitem"
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: .97 }}
                      transition={{ delay: i * .05, duration: .35 }}
                    >
                      <div className="ord-card">

                        {/* Infos commande */}
                        <div className="ord-card-left">
                          <div className="ord-card-num">{order.number}</div>
                          <div className="ord-card-date">{formatDate(order.date)}</div>
                          <div className={`ord-status ${order.status}`}>
                            <span className="ord-status-dot" aria-hidden="true" />
                            {STATUS_LABEL[order.status]}
                          </div>
                        </div>

                        {/* Articles */}
                        <div className="ord-card-items">
                          {previewItems.map(item => {
                            const Icon = ICON_MAP[item.iconType] ?? TomatoIcon
                            return (
                              <span key={item.id} className="ord-item-chip">
                                <Icon size={16} />
                                {item.name} {item.volume} ×{item.quantity}
                              </span>
                            )
                          })}
                          {extra > 0 && (
                            <span className="ord-item-more">+{extra} article{extra > 1 ? 's' : ''}</span>
                          )}
                        </div>

                        {/* Total + action */}
                        <div className="ord-card-right">
                          <div className="ord-card-total">{fmt(total)}</div>
                          <div className="ord-card-actions">
                            <Link
                              to={`/mes-commandes/${order.number}`}
                              className="btn btn-outline btn-sm"
                              aria-label={`Voir la commande ${order.number}`}
                            >
                              <Eye size={14} /> Détail
                            </Link>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
