import { useState } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Lock, ChevronDown, CheckCircle, Package, ShoppingBag, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { api } from '../lib/api'
import { fmt } from '../data/products'
import Navbar from '../components/Navbar'
import '../styles/globals.css'
import '../styles/payment.css'

/* ── Formatage numéro carte ── */
function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}
function maskCardDisplay(num) {
  const digits = num.replace(/\s/g, '')
  if (!digits) return '•••• •••• •••• ••••'
  const groups = []
  for (let i = 0; i < 4; i++) {
    const chunk = digits.slice(i * 4, i * 4 + 4)
    groups.push(chunk.padEnd(4, '•'))
  }
  return groups.join(' ')
}

/* ── Icône Visa SVG ── */
function VisaIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" aria-label="Visa">
      <rect width="38" height="24" rx="4" fill="#1A1F71"/>
      <path d="M15.1 7.5H12.3L10.6 14.4H13.4L15.1 7.5Z" fill="white"/>
      <path d="M23.2 7.7C22.6 7.5 21.7 7.3 20.6 7.3C18 7.3 16.1 8.6 16.1 10.5C16.1 11.9 17.3 12.7 18.3 13.2C19.3 13.7 19.6 14 19.6 14.4C19.6 15 18.9 15.3 18.2 15.3C17.2 15.3 16.7 15.1 15.9 14.8L15.6 14.6L15.3 16.5C15.9 16.8 17 17.1 18.1 17.1C20.9 17.1 22.7 15.8 22.7 13.8C22.7 12.7 22 11.9 20.5 11.2C19.6 10.8 19.1 10.5 19.1 10.1C19.1 9.7 19.5 9.4 20.4 9.4C21.2 9.4 21.8 9.6 22.3 9.8L22.6 9.9L23.2 7.7Z" fill="white"/>
      <path d="M27.5 7.5H25.3C24.6 7.5 24.1 7.7 23.8 8.4L19.9 16.5H22.7L23.3 14.9H26.7L27 16.5H29.5L27.5 7.5ZM24.1 13C24.3 12.5 25.1 10.4 25.1 10.4C25.1 10.4 25.3 9.9 25.4 9.6L25.6 10.3C25.6 10.3 26.3 13 26.4 13H24.1Z" fill="white"/>
      <path d="M9.1 7.5L6.5 13.4L6.2 12C5.7 10.5 4.3 8.8 2.7 8L5.1 16.5H8L12.1 7.5H9.1Z" fill="white"/>
    </svg>
  )
}

export default function PaymentPage() {
  const { number }   = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()
  const { clearCart } = useCart()

  const state = location.state ?? {}
  const total = state.total ?? 0

  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [declined, setDeclined] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)

  const setF = (key) => (e) => setCard(c => ({ ...c, [key]: e.target.value }))

  const handleNumberChange = (e) => {
    setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))
  }
  const handleExpiryChange = (e) => {
    setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))
  }

  const validate = () => {
    const e = {}
    const digits = card.number.replace(/\s/g, '')
    if (digits.length !== 16)         e.number = '16 chiffres requis'
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Format MM/AA'
    if (card.cvv.length < 3)          e.cvv    = '3 chiffres requis'
    if (!card.holder.trim())          e.holder = 'Requis'
    return e
  }

  const handlePay = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setDeclined(false)

    try {
      const digits = card.number.replace(/\s/g, '')
      const [month, year] = card.expiry.split('/')
      const res = await api.post(`/orders/${number}/pay`, {
        card_number: digits,
        card_name:   card.holder,
        expiry:      `${month}/${year}`,
        cvv:         card.cvv,
      })
      const transaction = res?.transaction
      if (transaction?.status === 'declined') {
        setDeclined(true)
      } else {
        clearCart()
        setSuccess(true)
      }
    } catch (err) {
      setErrors({ submit: err.message ?? 'Erreur lors du paiement. Réessayez.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className="pay-main">
          <div className="pay-container">
            <motion.div
              className="pay-success"
              initial={{ opacity: 0, scale: .92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: .5, ease: [.22, 1, .36, 1] }}
            >
              <motion.div
                className="pay-success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: .2, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle size={64} />
              </motion.div>
              <h1 className="pay-success-title">Paiement confirmé !</h1>
              <p className="pay-success-sub">
                Votre commande a été validée et sera préparée dans les plus brefs délais.
              </p>
              <div className="pay-success-ref">Commande {number}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                <Link to="/mes-commandes" className="btn btn-primary btn-lg">
                  <Package size={18} /> Voir mes commandes
                </Link>
                <Link to="/home" className="btn btn-outline btn-lg">
                  <ShoppingBag size={18} /> Continuer mes achats
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
      </>
    )
  }

  if (declined) {
    return (
      <>
        <Navbar />
        <main className="pay-main">
          <div className="pay-container">
            <motion.div
              className="pay-success"
              initial={{ opacity: 0, scale: .92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: .4 }}
            >
              <div className="pay-success-icon" style={{ background: 'rgba(220,38,38,.12)', color: 'var(--tomato)' }}>
                <AlertCircle size={64} />
              </div>
              <h1 className="pay-success-title" style={{ color: 'var(--tomato)' }}>Paiement refusé</h1>
              <p className="pay-success-sub">Votre carte a été refusée. Vérifiez vos informations ou utilisez une autre carte.</p>
              <button className="btn btn-primary btn-lg" onClick={() => setDeclined(false)}>
                Réessayer
              </button>
            </motion.div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar currentPage="boutique" />

      <main className="pay-main">
        <div className="pay-container">

          {/* Référence commande */}
          <div className="pay-order-ref">
            <Package size={14} aria-hidden="true" />
            Commande <span>{number}</span>
          </div>

          {/* Montant */}
          <motion.div
            className="pay-amount-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4 }}
          >
            <div className="pay-amount-label">Montant à payer</div>
            <div className="pay-amount-value">{fmt(total)}</div>
          </motion.div>

          <motion.form
            onSubmit={handlePay}
            noValidate
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4, delay: .1 }}
          >
            <div className="pay-card">
              <div className="pay-card-title">
                <CreditCard size={20} />
                Informations de paiement
              </div>

              {/* Preview carte */}
              <div className="pay-card-preview" aria-hidden="true">
                <div className="pay-preview-logo"><VisaIcon /></div>
                <div className="pay-preview-num">{maskCardDisplay(card.number)}</div>
                <div className="pay-preview-bot">
                  <div>
                    <div className="pay-preview-label">Titulaire</div>
                    <div className="pay-preview-value">{card.holder || 'VOTRE NOM'}</div>
                  </div>
                  <div>
                    <div className="pay-preview-label">Expire</div>
                    <div className="pay-preview-value">{card.expiry || 'MM/AA'}</div>
                  </div>
                </div>
              </div>

              {/* Numéro carte */}
              <div className="pay-field">
                <label className="pay-label" htmlFor="cardNumber">Numéro de carte</label>
                <div className="pay-input-wrap">
                  <input
                    id="cardNumber"
                    className={`field-input${errors.number ? ' field-error' : ''}`}
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={handleNumberChange}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={19}
                  />
                  <div className="pay-card-icons" aria-hidden="true">
                    <VisaIcon />
                  </div>
                </div>
                {errors.number && <div className="field-error-msg">{errors.number}</div>}
              </div>

              {/* Titulaire */}
              <div className="pay-field">
                <label className="pay-label" htmlFor="cardHolder">Nom du titulaire</label>
                <input
                  id="cardHolder"
                  className={`field-input${errors.holder ? ' field-error' : ''}`}
                  placeholder="MOUSSA DIALLO"
                  value={card.holder}
                  onChange={setF('holder')}
                  autoComplete="cc-name"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.holder && <div className="field-error-msg">{errors.holder}</div>}
              </div>

              {/* Expiry + CVV */}
              <div className="pay-row">
                <div className="pay-field">
                  <label className="pay-label" htmlFor="cardExpiry">Date d'expiration</label>
                  <input
                    id="cardExpiry"
                    className={`field-input${errors.expiry ? ' field-error' : ''}`}
                    placeholder="MM/AA"
                    value={card.expiry}
                    onChange={handleExpiryChange}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                  />
                  {errors.expiry && <div className="field-error-msg">{errors.expiry}</div>}
                </div>
                <div className="pay-field">
                  <label className="pay-label" htmlFor="cardCvv">CVV</label>
                  <input
                    id="cardCvv"
                    className={`field-input${errors.cvv ? ' field-error' : ''}`}
                    placeholder="•••"
                    value={card.cvv}
                    onChange={(e) => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    type="password"
                  />
                  {errors.cvv && <div className="field-error-msg">{errors.cvv}</div>}
                </div>
              </div>

              {/* Cartes test */}
              <div className="pay-hint">
                <button
                  type="button"
                  className="pay-hint-toggle"
                  onClick={() => setHintOpen(o => !o)}
                  aria-expanded={hintOpen}
                >
                  <span>Cartes de test disponibles</span>
                  <motion.span animate={{ rotate: hintOpen ? 180 : 0 }} transition={{ duration: .2 }}>
                    <ChevronDown size={14} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {hintOpen && (
                    <motion.div
                      className="pay-hint-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: .25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="pay-hint-row">
                        <span className="pay-hint-num">4242 4242 4242 4242</span>
                        <span className="pay-hint-res pay-hint-ok">Paiement OK</span>
                      </div>
                      <div className="pay-hint-row">
                        <span className="pay-hint-num">4000 0000 0000 0002</span>
                        <span className="pay-hint-res pay-hint-nok">Refusée</span>
                      </div>
                      <div style={{ fontSize: '.7rem', color: 'var(--fg-muted)', marginTop: 4 }}>
                        Expiry : n'importe quelle date future · CVV : 3 chiffres quelconques
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {errors.submit && (
                <div className="field-error-msg" style={{ background: 'rgba(220,38,38,.08)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(220,38,38,.2)', marginBottom: 8 }}>
                  <AlertCircle size={14} /> {errors.submit}
                </div>
              )}

              {/* Bouton payer */}
              <motion.button
                type="submit"
                className="btn btn-primary btn-lg pay-submit-btn"
                disabled={loading}
                whileTap={{ scale: .98 }}
              >
                <Lock size={18} />
                {loading ? 'Traitement du paiement…' : `Payer ${fmt(total)}`}
              </motion.button>

            </div>
          </motion.form>

        </div>
      </main>
    </>
  )
}
