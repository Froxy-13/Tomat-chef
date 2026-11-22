import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, Home, ArrowRight, Package, AlertCircle, Plus, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { TomatoIcon, JarIcon, BoxIcon } from '../components/TomatoIcon'
import { getMeta, fmt } from '../data/products'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import '../styles/globals.css'
import '../styles/checkout.css'

const ICON_MAP = { tomato: TomatoIcon, jar: JarIcon, box: BoxIcon }

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()

  const [addresses, setAddresses]   = useState([])
  const [zones, setZones]           = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [addressId, setAddressId]   = useState(null)
  const [zoneId, setZoneId]         = useState(null)
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/addresses'),
      api.get('/delivery-zones'),
    ])
      .then(([aRes, zRes]) => {
        const addrs = Array.isArray(aRes) ? aRes : (aRes.data ?? [])
        const zonesData = Array.isArray(zRes) ? zRes : (zRes.data ?? [])
        setAddresses(addrs)
        setZones(zonesData)
        const def = addrs.find(a => a.is_default)
        if (def) setAddressId(def.id)
        if (zonesData.length > 0) setZoneId(zonesData[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [])

  const zone = zones.find(z => z.id === zoneId)
  const deliveryFee = zone?.fee ?? 0
  const total = subtotal + deliveryFee

  const validate = () => {
    const e = {}
    if (!addressId) e.address = 'Veuillez sélectionner une adresse de livraison'
    if (!zoneId)    e.zone    = 'Veuillez sélectionner une zone de livraison'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)

    try {
      // 1. Sync frontend cart to backend
      await api.delete('/cart')
      for (const { product, quantity } of items) {
        await api.post('/cart/items', { product_id: product.id, quantity })
      }

      // 2. Create order
      const res = await api.post('/orders', {
        address_id:        addressId,
        delivery_zone_id:  zoneId,
      })
      const order = res.data ?? res
      navigate(`/commande/${order.number}/paiement`, {
        state: { total, zone: zone?.name, orderNumber: order.number }
      })
    } catch (err) {
      setErrors({ submit: err.message ?? 'Erreur lors de la création de la commande' })
    } finally {
      setLoading(false)
    }
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
            <p className="co-sub">Choisissez votre adresse et zone de livraison.</p>
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

          {loadingData ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--tomato)', width: 32, height: 32 }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="co-layout">

                {/* ── Formulaire ── */}
                <div className="co-form-section">

                  {/* Adresse */}
                  <motion.div
                    className="co-card"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .4 }}
                  >
                    <div className="co-card-title"><Home size={18} /> Adresse de livraison</div>

                    {addresses.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
                        <p style={{ fontSize: '.85rem', color: 'var(--fg-muted)' }}>
                          Vous n'avez pas encore d'adresse enregistrée.
                        </p>
                        <Link to="/profil/adresses" className="btn btn-outline btn-sm">
                          <Plus size={14} /> Ajouter une adresse
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {addresses.map(addr => (
                          <label
                            key={addr.id}
                            className={`co-zone-opt${addressId === addr.id ? ' selected' : ''}`}
                            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={addr.id}
                              checked={addressId === addr.id}
                              onChange={() => setAddressId(addr.id)}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                              <strong className="co-zone-name">{addr.label}</strong>
                              {addr.is_default && (
                                <span style={{ fontSize: '.72rem', background: 'var(--tomato)', color: '#fff', borderRadius: 4, padding: '1px 6px' }}>Défaut</span>
                              )}
                            </div>
                            <div style={{ fontSize: '.82rem', color: 'var(--fg-muted)', display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 2 }}>
                              <span><MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />{addr.neighborhood}{addr.landmark ? ` — ${addr.landmark}` : ''}, {addr.city}</span>
                              <span><Phone size={11} style={{ display: 'inline', marginRight: 4 }} />{addr.phone}</span>
                            </div>
                          </label>
                        ))}
                        <Link to="/profil/adresses" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                          <Plus size={13} /> Gérer mes adresses
                        </Link>
                      </div>
                    )}
                    {errors.address && <div className="field-error-msg" style={{ marginTop: 8 }}><AlertCircle size={12} /> {errors.address}</div>}
                  </motion.div>

                  {/* Zone livraison */}
                  <motion.div
                    className="co-card"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .4, delay: .07 }}
                  >
                    <div className="co-card-title"><MapPin size={18} /> Zone de livraison</div>
                    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                      <legend className="co-label" style={{ marginBottom: 12 }}>
                        Choisissez votre zone <span style={{ color: 'var(--tomato)' }}>*</span>
                      </legend>
                      <div className="co-zone-grid">
                        {zones.map(z => (
                          <label key={z.id} className={`co-zone-opt${zoneId === z.id ? ' selected' : ''}`}>
                            <input
                              type="radio"
                              name="zone"
                              value={z.id}
                              checked={zoneId === z.id}
                              onChange={() => setZoneId(z.id)}
                            />
                            <span className="co-zone-name">{z.name}</span>
                            <span className="co-zone-fee">{fmt(z.fee)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {errors.zone && <div className="field-error-msg" style={{ marginTop: 8 }}><AlertCircle size={12} /> {errors.zone}</div>}
                  </motion.div>

                  {errors.submit && (
                    <div className="field-error-msg" style={{ background: 'rgba(220,38,38,.08)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(220,38,38,.2)' }}>
                      <AlertCircle size={14} /> {errors.submit}
                    </div>
                  )}

                </div>

                {/* ── Résumé ── */}
                <aside className="co-summary" aria-label="Résumé de la commande">
                  <div className="co-sum-title">Récapitulatif</div>

                  <div className="co-sum-items">
                    {items.map(({ product, quantity }) => {
                      const meta = getMeta(product.slug)
                      const Icon = ICON_MAP[meta.iconType] ?? TomatoIcon
                      return (
                        <div key={product.id} className="co-sum-item">
                          <div className="co-sum-icon"><Icon size={36} /></div>
                          <div className="co-sum-info">
                            <div className="co-sum-name">{product.name}</div>
                            <div className="co-sum-vol">{meta.volume}</div>
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
                      <span>Livraison{zone ? ` — ${zone.name}` : ''}</span>
                      <motion.span key={deliveryFee} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {zone ? fmt(deliveryFee) : '—'}
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
                    disabled={loading || addresses.length === 0}
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
          )}

        </div>
      </main>
    </>
  )
}
