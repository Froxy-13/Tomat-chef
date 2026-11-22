import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, User, Phone, Home, ChevronRight, ArrowRight, Package, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { TomatoIcon, JarIcon, BoxIcon } from '../components/TomatoIcon'
import { fmt } from '../data/products'
import Navbar from '../components/Navbar'
import '../styles/globals.css'
import '../styles/checkout.css'

const ICON_MAP = { tomato: TomatoIcon, jar: JarIcon, box: BoxIcon }

const ZONES = [
  { id: 1, name: 'Dakar Centre',   fee: 1000 },
  { id: 2, name: 'Dakar Banlieue', fee: 1500 },
  { id: 3, name: 'Régions',        fee: 3000 },
]

function generateOrderNumber() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TC-${y}${m}${d}-${rand}`
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, count, subtotal, clearCart } = useCart()

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    address: '', city: '', quartier: '',
  })
  const [zoneId, setZoneId]   = useState(1)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const zone        = ZONES.find(z => z.id === zoneId)
  const deliveryFee = zone?.fee ?? 0
  const total       = subtotal + deliveryFee

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Requis'
    if (!form.lastName.trim())  e.lastName  = 'Requis'
    if (!form.phone.trim())     e.phone     = 'Requis'
    else if (!/^(\+?221)?[7][0-9]{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Numéro sénégalais invalide (ex: 77 123 45 67)'
    if (!form.address.trim())   e.address   = 'Requis'
    if (!form.city.trim())      e.city      = 'Requis'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)

    setTimeout(() => {
      const orderNumber = generateOrderNumber()
      navigate(`/commande/${orderNumber}/paiement`, {
        state: { total, zone: zone.name, form, items: items.map(i => ({ ...i })) }
      })
    }, 600)
  }

  /* Panier vide */
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="co-main">
          <div className="page-container">
            <div className="co-empty-state">
              <Package size={56} strokeWidth={1.5} color="var(--border)" />
              <h2>Votre panier est vide</h2>
              <p>Ajoutez des produits avant de passer commande.</p>
              <Link to="/home" className="btn btn-primary btn-lg">
                <Package size={18} /> Découvrir nos produits
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar currentPage="boutique" />

      <main className="co-main">
        <div className="page-container">

          <div className="co-header">
            <h1 className="co-title">Finaliser la commande</h1>
            <p className="co-sub">Renseignez votre adresse de livraison.</p>
          </div>

          {/* Steps */}
          <div className="co-steps" aria-label="Étapes de commande">
            <div className="co-step done">
              <span className="co-step-num">1</span>
              <span>Panier</span>
            </div>
            <div className="co-step-sep" />
            <div className="co-step active">
              <span className="co-step-num">2</span>
              <span>Livraison</span>
            </div>
            <div className="co-step-sep" />
            <div className="co-step">
              <span className="co-step-num">3</span>
              <span>Paiement</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="co-layout">

              {/* ── Formulaire ── */}
              <div className="co-form-section">

                {/* Coordonnées */}
                <motion.div
                  className="co-card"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .4 }}
                >
                  <div className="co-card-title"><User size={18} /> Vos coordonnées</div>

                  <div className="co-row">
                    <div className="co-field">
                      <label className="co-label" htmlFor="firstName">Prénom <span>*</span></label>
                      <input
                        id="firstName" className={`field-input${errors.firstName ? ' field-error' : ''}`}
                        placeholder="Moussa" value={form.firstName} onChange={set('firstName')}
                        autoComplete="given-name"
                      />
                      {errors.firstName && <div className="field-error-msg"><AlertCircle size={12} /> {errors.firstName}</div>}
                    </div>
                    <div className="co-field">
                      <label className="co-label" htmlFor="lastName">Nom <span>*</span></label>
                      <input
                        id="lastName" className={`field-input${errors.lastName ? ' field-error' : ''}`}
                        placeholder="Diallo" value={form.lastName} onChange={set('lastName')}
                        autoComplete="family-name"
                      />
                      {errors.lastName && <div className="field-error-msg"><AlertCircle size={12} /> {errors.lastName}</div>}
                    </div>
                  </div>

                  <div className="co-field" style={{ marginTop: 16 }}>
                    <label className="co-label" htmlFor="phone">Téléphone <span>*</span></label>
                    <div className="field-input-wrap">
                      <Phone size={16} className="field-icon" aria-hidden="true" />
                      <input
                        id="phone" type="tel" className={`field-input field-input-icon${errors.phone ? ' field-error' : ''}`}
                        placeholder="77 123 45 67" value={form.phone} onChange={set('phone')}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && <div className="field-error-msg"><AlertCircle size={12} /> {errors.phone}</div>}
                  </div>
                </motion.div>

                {/* Adresse */}
                <motion.div
                  className="co-card"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .4, delay: .07 }}
                >
                  <div className="co-card-title"><Home size={18} /> Adresse de livraison</div>

                  <div className="co-field">
                    <label className="co-label" htmlFor="address">Adresse <span>*</span></label>
                    <input
                      id="address" className={`field-input${errors.address ? ' field-error' : ''}`}
                      placeholder="N° et nom de rue" value={form.address} onChange={set('address')}
                      autoComplete="street-address"
                    />
                    {errors.address && <div className="field-error-msg"><AlertCircle size={12} /> {errors.address}</div>}
                  </div>

                  <div className="co-row" style={{ marginTop: 16 }}>
                    <div className="co-field">
                      <label className="co-label" htmlFor="city">Ville <span>*</span></label>
                      <input
                        id="city" className={`field-input${errors.city ? ' field-error' : ''}`}
                        placeholder="Dakar" value={form.city} onChange={set('city')}
                        autoComplete="address-level2"
                      />
                      {errors.city && <div className="field-error-msg"><AlertCircle size={12} /> {errors.city}</div>}
                    </div>
                    <div className="co-field">
                      <label className="co-label" htmlFor="quartier">Quartier</label>
                      <input
                        id="quartier" className="field-input"
                        placeholder="Plateau, Médina…" value={form.quartier} onChange={set('quartier')}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Zone livraison */}
                <motion.div
                  className="co-card"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .4, delay: .14 }}
                >
                  <div className="co-card-title"><MapPin size={18} /> Zone de livraison</div>
                  <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                    <legend className="co-label" style={{ marginBottom: 12 }}>Choisissez votre zone <span style={{ color: 'var(--tomato)' }}>*</span></legend>
                    <div className="co-zone-grid">
                      {ZONES.map(z => (
                        <label key={z.id} className={`co-zone-opt${zoneId === z.id ? ' selected' : ''}`}>
                          <input type="radio" name="zone" value={z.id} checked={zoneId === z.id} onChange={() => setZoneId(z.id)} />
                          <span className="co-zone-name">{z.name}</span>
                          <span className="co-zone-fee">{fmt(z.fee)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </motion.div>

              </div>

              {/* ── Résumé ── */}
              <aside className="co-summary" aria-label="Résumé de la commande">
                <div className="co-sum-title">Récapitulatif</div>

                <div className="co-sum-items">
                  {items.map(({ product, quantity }) => {
                    const Icon = ICON_MAP[product.iconType] ?? TomatoIcon
                    return (
                      <div key={product.id} className="co-sum-item">
                        <div className="co-sum-icon"><Icon size={36} /></div>
                        <div className="co-sum-info">
                          <div className="co-sum-name">{product.name}</div>
                          <div className="co-sum-vol">{product.volume}</div>
                        </div>
                        <div className="co-sum-qty">×{quantity}</div>
                        <div className="co-sum-price">{fmt(product.price * quantity)}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="co-divider" />

                <div className="co-sum-lines">
                  <div className="co-sum-line">
                    <span>Sous-total</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="co-sum-line">
                    <span>Livraison — {zone?.name}</span>
                    <motion.span key={deliveryFee} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {fmt(deliveryFee)}
                    </motion.span>
                  </div>
                </div>

                <div className="co-divider" />

                <div className="co-sum-total">
                  <span>Total</span>
                  <motion.span
                    key={total}
                    className="co-sum-total-amt"
                    initial={{ scale: .92, opacity: .6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: .25 }}
                  >
                    {fmt(total)}
                  </motion.span>
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary btn-lg co-submit-btn"
                  disabled={loading}
                  whileTap={{ scale: .98 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="spinner" aria-hidden="true" /> Traitement…
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Continuer vers le paiement <ArrowRight size={18} />
                    </span>
                  )}
                </motion.button>

                <div className="co-secure">
                  <svg width="12" height="14" fill="none" viewBox="0 0 12 14" aria-hidden="true">
                    <path d="M6 1L1 3v4c0 3 2.5 5.3 5 6 2.5-.7 5-3 5-6V3L6 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                  Paiement 100% sécurisé
                </div>
              </aside>

            </div>
          </form>

        </div>
      </main>
    </>
  )
}
