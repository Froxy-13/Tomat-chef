import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, ChevronLeft, Package, MapPin, Phone,
  User, Truck, CheckCircle, Clock, XCircle, AlertTriangle
} from 'lucide-react'
import { TomatoIcon, JarIcon, BoxIcon } from '../components/TomatoIcon'
import { fmt } from '../data/products'
import { useCart } from '../context/CartContext'
import '../styles/globals.css'
import '../styles/order-detail.css'

const ICON_MAP = { tomato: TomatoIcon, jar: JarIcon, box: BoxIcon }

const STATUS_LABEL = {
  received:  'Reçue',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped:   'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const STATUS_STEPS = ['received', 'confirmed', 'preparing', 'shipped', 'delivered']
const STEP_ICONS = {
  received:  Clock,
  confirmed: CheckCircle,
  preparing: Package,
  shipped:   Truck,
  delivered: CheckCircle,
}

/* ── Mock data (même que OrdersPage) ── */
const MOCK_ORDERS = [
  {
    number: 'TC-261122-4871',
    date: '2026-11-22',
    status: 'received',
    deliveryZone: 'Dakar Centre',
    deliveryFee: 1000,
    address: { name: 'Fatimata Diallo', phone: '77 123 45 67', address: '12 Avenue Cheikh Anta Diop', city: 'Dakar', quartier: 'Plateau' },
    items: [
      { id: 2, name: 'Double concentré', volume: '400g', format: 'Boîte métal', iconType: 'jar', price: 1200, quantity: 2 },
      { id: 1, name: 'Double concentré', volume: '70g',  format: 'Sachet',      iconType: 'tomato', price: 300, quantity: 3 },
    ],
  },
  {
    number: 'TC-261115-2345',
    date: '2026-11-15',
    status: 'delivered',
    deliveryZone: 'Dakar Banlieue',
    deliveryFee: 1500,
    address: { name: 'Fatimata Diallo', phone: '77 123 45 67', address: '12 Avenue Cheikh Anta Diop', city: 'Dakar', quartier: 'Plateau' },
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
    address: { name: 'Fatimata Diallo', phone: '77 123 45 67', address: '12 Avenue Cheikh Anta Diop', city: 'Dakar', quartier: 'Plateau' },
    items: [
      { id: 4, name: 'Triple concentré', volume: '400g', format: 'Premium',     iconType: 'tomato', price: 1800, quantity: 1 },
      { id: 5, name: 'Double concentré', volume: '200g', format: 'Bocal verre', iconType: 'jar',    price: 750,  quantity: 2 },
    ],
  },
  {
    number: 'TC-261102-1133',
    date: '2026-11-02',
    status: 'shipped',
    deliveryZone: 'Dakar Centre',
    deliveryFee: 1000,
    address: { name: 'Fatimata Diallo', phone: '77 123 45 67', address: '12 Avenue Cheikh Anta Diop', city: 'Dakar', quartier: 'Plateau' },
    items: [
      { id: 3, name: 'Double concentré', volume: '2,2kg', format: 'Grand format', iconType: 'box', price: 5500, quantity: 1 },
    ],
  },
]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function stepState(step, currentStatus) {
  if (currentStatus === 'cancelled') return step === 'received' ? 'done' : 'cancelled'
  const currentIdx = STATUS_STEPS.indexOf(currentStatus)
  const stepIdx    = STATUS_STEPS.indexOf(step)
  if (stepIdx < currentIdx)  return 'done'
  if (stepIdx === currentIdx) return 'active'
  return 'pending'
}

export default function OrderDetailPage() {
  const { number }  = useParams()
  const navigate    = useNavigate()
  const { count }   = useCart()
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled]   = useState(false)

  const order = MOCK_ORDERS.find(o => o.number === number)

  if (!order) {
    return (
      <>
        <header className="nav"><div className="nav-inner">
          <Link to="/" className="nav-logo"><span className="nav-logo-dot" />Tomat'chef</Link>
        </div></header>
        <main className="od-main"><div className="page-container">
          <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Package size={56} strokeWidth={1.5} color="var(--border)" />
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', color: 'var(--fg)' }}>Commande introuvable</h1>
            <Link to="/mes-commandes" className="btn btn-primary">Retour aux commandes</Link>
          </div>
        </div></main>
      </>
    )
  }

  const currentStatus = cancelled ? 'cancelled' : order.status
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const total    = subtotal + order.deliveryFee
  const canCancel = currentStatus === 'received'

  const handleCancel = () => {
    setCancelling(true)
    setTimeout(() => { setCancelling(false); setCancelled(true) }, 800)
  }

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo"><span className="nav-logo-dot" />Tomat'chef</Link>
          <nav className="nav-links desktop-nav">
            <Link to="/home" className="nav-link">Boutique</Link>
            <Link to="/mes-commandes" className="nav-link">Mes commandes</Link>
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

      <main className="od-main">
        <div className="page-container">

          <Link to="/mes-commandes" className="od-back">
            <ChevronLeft size={16} /> Retour à mes commandes
          </Link>

          {/* ── Header ── */}
          <div className="od-header">
            <div className="od-header-left">
              <h1 className="od-number">{order.number}</h1>
              <div className="od-date">Passée le {formatDate(order.date)}</div>
            </div>
            <div className={`ord-status ${currentStatus}`} style={{ alignSelf: 'flex-start' }}>
              <span className="ord-status-dot" />
              {STATUS_LABEL[currentStatus]}
            </div>
          </div>

          {/* ── Timeline ── */}
          <motion.div
            className="od-timeline"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4 }}
          >
            <div className="od-timeline-title">Suivi de commande</div>
            <div className="od-steps" role="list">
              {currentStatus === 'cancelled' ? (
                <div className="od-step active" role="listitem" style={{ flex: 'none' }}>
                  <div className="od-step-dot"><XCircle size={16} /></div>
                  <div className="od-step-label">Annulée</div>
                </div>
              ) : STATUS_STEPS.map(step => {
                const state   = stepState(step, currentStatus)
                const StepIcon = STEP_ICONS[step]
                return (
                  <div key={step} className={`od-step ${state}`} role="listitem">
                    <div className="od-step-dot">
                      {state === 'done' ? <CheckCircle size={14} /> : <StepIcon size={14} />}
                    </div>
                    <div className="od-step-label">{STATUS_LABEL[step]}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <div className="od-layout">

            {/* ── Colonne gauche ── */}
            <div>
              {/* Articles */}
              <motion.div
                className="od-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4, delay: .07 }}
              >
                <div className="od-card-title"><Package size={18} /> Articles commandés</div>
                <div className="od-items">
                  {order.items.map(item => {
                    const Icon = ICON_MAP[item.iconType] ?? TomatoIcon
                    return (
                      <div key={item.id} className="od-item">
                        <div className="od-item-icon"><Icon size={48} /></div>
                        <div className="od-item-info">
                          <div className="od-item-name">{item.name}</div>
                          <div className="od-item-vol">{item.volume} · {item.format}</div>
                        </div>
                        <div className="od-item-right">
                          <div className="od-item-qty">×{item.quantity}</div>
                          <div className="od-item-price">{fmt(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Livraison */}
              <motion.div
                className="od-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4, delay: .12 }}
              >
                <div className="od-card-title"><Truck size={18} /> Informations de livraison</div>
                <div className="od-delivery-rows">
                  <div className="od-delivery-row">
                    <User size={15} />
                    <span className="od-delivery-label">Destinataire</span>
                    <span className="od-delivery-val">{order.address.name}</span>
                  </div>
                  <div className="od-delivery-row">
                    <Phone size={15} />
                    <span className="od-delivery-label">Téléphone</span>
                    <span className="od-delivery-val">{order.address.phone}</span>
                  </div>
                  <div className="od-delivery-row">
                    <MapPin size={15} />
                    <span className="od-delivery-label">Adresse</span>
                    <span className="od-delivery-val">
                      {order.address.address}{order.address.quartier ? `, ${order.address.quartier}` : ''}, {order.address.city}
                    </span>
                  </div>
                  <div className="od-delivery-row">
                    <Truck size={15} />
                    <span className="od-delivery-label">Zone</span>
                    <span className="od-delivery-val">{order.deliveryZone}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Résumé sidebar ── */}
            <motion.aside
              className="od-summary"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: .4, delay: .1 }}
            >
              <div className="od-card">
                <div className="od-card-title">Récapitulatif</div>
                <div className="od-sum-lines">
                  <div className="od-sum-line">
                    <span>Sous-total ({order.items.reduce((s, i) => s + i.quantity, 0)} articles)</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="od-sum-line">
                    <span>Livraison</span>
                    <span>{fmt(order.deliveryFee)}</span>
                  </div>
                </div>
                <div className="od-divider" style={{ margin: '12px 0' }} />
                <div className="od-sum-total">
                  <span>Total payé</span>
                  <span className="od-sum-total-amt">{fmt(total)}</span>
                </div>
              </div>

              {canCancel && (
                <div className="od-card">
                  <div className="od-card-title" style={{ color: 'var(--tomato)' }}>
                    <AlertTriangle size={18} /> Annuler la commande
                  </div>
                  <p style={{ fontSize: '.82rem', color: 'var(--fg-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                    Votre commande n'a pas encore été confirmée. Vous pouvez l'annuler gratuitement.
                  </p>
                  <motion.button
                    className="btn btn-outline btn-lg od-cancel-btn"
                    style={{ borderColor: 'var(--tomato)', color: 'var(--tomato)' }}
                    onClick={handleCancel}
                    disabled={cancelling}
                    whileTap={{ scale: .98 }}
                  >
                    {cancelling
                      ? <><span className="spinner" style={{ borderTopColor: 'var(--tomato)', borderColor: 'rgba(220,38,38,.2)' }} /> Annulation…</>
                      : <><XCircle size={16} /> Annuler la commande</>
                    }
                  </motion.button>
                </div>
              )}

              <Link to="/home" className="btn btn-primary" style={{ justifyContent: 'center', display: 'flex', gap: 8 }}>
                <ShoppingBag size={16} /> Commander à nouveau
              </Link>
            </motion.aside>

          </div>
        </div>
      </main>
    </>
  )
}
