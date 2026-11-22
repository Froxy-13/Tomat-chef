import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Package, MapPin, Phone, Truck, CheckCircle, Clock, XCircle, AlertTriangle, ShoppingBag } from 'lucide-react'
import { fmt } from '../data/products'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import '../styles/globals.css'
import '../styles/order-detail.css'

const STATUS_LABEL = {
  pending_payment: 'En attente de paiement',
  received:        'Reçue',
  confirmed:       'Confirmée',
  preparing:       'En préparation',
  shipped:         'Expédiée',
  delivered:       'Livrée',
  cancelled:       'Annulée',
}

const STATUS_STEPS = ['received', 'confirmed', 'preparing', 'shipped', 'delivered']
const STEP_ICONS = {
  received:  Clock,
  confirmed: CheckCircle,
  preparing: Package,
  shipped:   Truck,
  delivered: CheckCircle,
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function stepState(step, currentStatus) {
  if (currentStatus === 'cancelled' || currentStatus === 'pending_payment')
    return step === 'received' ? 'pending' : 'pending'
  const currentIdx = STATUS_STEPS.indexOf(currentStatus)
  const stepIdx    = STATUS_STEPS.indexOf(step)
  if (stepIdx < currentIdx)  return 'done'
  if (stepIdx === currentIdx) return 'active'
  return 'pending'
}

export default function OrderDetailPage() {
  const { number } = useParams()
  const navigate   = useNavigate()

  const [order, setOrder]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled]   = useState(false)

  useEffect(() => {
    api.get(`/orders/${number}`)
      .then(res => setOrder(res.data ?? res))
      .catch(err => { if (err.status === 404) setNotFound(true) })
      .finally(() => setLoading(false))
  }, [number])

  if (loading) return (
    <>
      <Navbar currentPage="commandes" />
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <span className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--tomato)' }} />
      </div>
    </>
  )

  if (notFound || !order) return (
    <>
      <Navbar currentPage="commandes" />
      <main className="od-main"><div className="page-container">
        <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Package size={56} strokeWidth={1.5} color="var(--border)" />
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', color: 'var(--fg)' }}>Commande introuvable</h1>
          <Link to="/mes-commandes" className="btn btn-primary">Retour aux commandes</Link>
        </div>
      </div></main>
    </>
  )

  const currentStatus = cancelled ? 'cancelled' : order.status
  const canCancel = currentStatus === 'pending_payment' || currentStatus === 'received'

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.put(`/orders/${number}/cancel`, {})
      setCancelled(true)
      setOrder(o => ({ ...o, status: 'cancelled' }))
    } catch {
      // If no cancel endpoint, optimistic local only
      setCancelled(true)
    } finally {
      setCancelling(false)
    }
  }

  const address = order.address ?? {}
  const items   = order.items ?? []
  const zone    = order.delivery_zone ?? {}

  return (
    <>
      <Navbar currentPage="commandes" />

      <main className="od-main">
        <div className="page-container">

          <Link to="/mes-commandes" className="od-back">
            <ChevronLeft size={16} /> Retour à mes commandes
          </Link>

          {/* ── Header ── */}
          <div className="od-header">
            <div className="od-header-left">
              <h1 className="od-number">{order.number}</h1>
              <div className="od-date">Passée le {formatDate(order.created_at)}</div>
            </div>
            <div className={`ord-status ${currentStatus}`} style={{ alignSelf: 'flex-start' }}>
              <span className="ord-status-dot" />
              {STATUS_LABEL[currentStatus] ?? currentStatus}
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
              ) : currentStatus === 'pending_payment' ? (
                <div className="od-step active" role="listitem" style={{ flex: 'none' }}>
                  <div className="od-step-dot"><Clock size={16} /></div>
                  <div className="od-step-label">Paiement en attente</div>
                </div>
              ) : STATUS_STEPS.map(step => {
                const state    = stepState(step, currentStatus)
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
                  {items.map((item, i) => (
                    <div key={i} className="od-item">
                      <div className="od-item-icon">
                        <Package size={36} color="var(--tomato)" />
                      </div>
                      <div className="od-item-info">
                        <div className="od-item-name">{item.product_name}</div>
                      </div>
                      <div className="od-item-right">
                        <div className="od-item-qty">×{item.quantity}</div>
                        <div className="od-item-price">{fmt(item.unit_price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
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
                    <Phone size={15} />
                    <span className="od-delivery-label">Téléphone</span>
                    <span className="od-delivery-val">{address.phone}</span>
                  </div>
                  <div className="od-delivery-row">
                    <MapPin size={15} />
                    <span className="od-delivery-label">Adresse</span>
                    <span className="od-delivery-val">
                      {address.neighborhood}{address.landmark ? ` — ${address.landmark}` : ''}, {address.city}
                    </span>
                  </div>
                  <div className="od-delivery-row">
                    <Truck size={15} />
                    <span className="od-delivery-label">Zone</span>
                    <span className="od-delivery-val">{zone.name}</span>
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
                    <span>Sous-total ({items.reduce((s, it) => s + it.quantity, 0)} articles)</span>
                    <span>{fmt(order.subtotal)}</span>
                  </div>
                  <div className="od-sum-line">
                    <span>Livraison</span>
                    <span>{fmt(order.delivery_fee)}</span>
                  </div>
                </div>
                <div className="od-divider" style={{ margin: '12px 0' }} />
                <div className="od-sum-total">
                  <span>Total payé</span>
                  <span className="od-sum-total-amt">{fmt(order.total)}</span>
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
