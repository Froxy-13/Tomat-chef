import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, ArrowLeft } from 'lucide-react'
import { TomatoIcon } from '../components/TomatoIcon'
import '../styles/globals.css'
import '../styles/auth.css'

/* ── Variantes ── */
const panelVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0, transition: { duration: .32, ease: [.22, 1, .36, 1] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32, transition: { duration: .22, ease: 'easeIn' } }),
}

/* ── Input Field ── */
function AuthField({ label, id, type = 'text', placeholder, icon: Icon, value, onChange, error, hint, ...rest }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        {Icon && (
          <span className="auth-input-icon" aria-hidden="true">
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className={`field-input auth-input${Icon ? ' has-icon' : ''}${error ? ' error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          aria-invalid={!!error}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-toggle-vis"
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <span className="field-error" id={`${id}-err`} role="alert">
          <AlertCircle size={12} /> {error}
        </span>
      )}
      {hint && !error && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
    </div>
  )
}

/* ── Formulaire Connexion ── */
function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.email)    errs.email    = "L'adresse email est requise."
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Format d'email invalide."
    if (!form.password) errs.password = 'Le mot de passe est requis.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setErrors({})
    // TODO: appel API POST /api/v1/auth/login
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    onSuccess?.()
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <AuthField
        label="Adresse email" id="login-email" type="email"
        placeholder="fatimata@example.com" icon={Mail}
        value={form.email} onChange={set('email')} error={errors.email}
      />
      <AuthField
        label="Mot de passe" id="login-password" type="password"
        placeholder="••••••••" icon={Lock}
        value={form.password} onChange={set('password')} error={errors.password}
      />
      <div className="auth-forgot-wrap">
        <a href="#" className="auth-forgot">Mot de passe oublié ?</a>
      </div>
      <button type="submit" className={`btn btn-primary btn-lg auth-submit${loading ? ' loading' : ''}`} disabled={loading}>
        {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}

/* ── Formulaire Inscription ── */
function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = 'Le prénom est requis.'
    if (!form.last_name.trim())  errs.last_name  = 'Le nom est requis.'
    if (!form.email) errs.email = "L'email est requis."
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Format d'email invalide."
    if (!form.phone) errs.phone = 'Le numéro de téléphone est requis.'
    if (!form.password) errs.password = 'Le mot de passe est requis.'
    else if (form.password.length < 8) errs.password = 'Minimum 8 caractères.'
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Les mots de passe ne correspondent pas.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setErrors({})
    // TODO: appel API POST /api/v1/auth/register
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    onSuccess?.()
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-name-row">
        <AuthField label="Prénom" id="reg-fname" placeholder="Fatimata" icon={User}
          value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
        <AuthField label="Nom" id="reg-lname" placeholder="Diallo" icon={User}
          value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
      </div>
      <AuthField label="Adresse email" id="reg-email" type="email" placeholder="fatimata@example.com" icon={Mail}
        value={form.email} onChange={set('email')} error={errors.email} />
      <AuthField label="Téléphone" id="reg-phone" type="tel" placeholder="+221 77 000 00 00" icon={Phone}
        value={form.phone} onChange={set('phone')} error={errors.phone}
        hint="Format : +221 7X XXX XX XX" />
      <AuthField label="Mot de passe" id="reg-pwd" type="password" placeholder="Minimum 8 caractères" icon={Lock}
        value={form.password} onChange={set('password')} error={errors.password} />
      <AuthField label="Confirmer le mot de passe" id="reg-pwd2" type="password" placeholder="Répétez le mot de passe" icon={Lock}
        value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} />
      <button type="submit" className={`btn btn-primary btn-lg auth-submit${loading ? ' loading' : ''}`} disabled={loading}>
        {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
        {loading ? 'Création…' : 'Créer mon compte'}
      </button>
      <p className="auth-terms">
        En créant un compte vous acceptez nos <a href="#">conditions d'utilisation</a>.
      </p>
    </form>
  )
}

/* ── Page Auth ── */
export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login')
  const [dir, setDir] = useState(1)

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'register' || t === 'login') {
      setDir(t === 'register' ? 1 : -1)
      setTab(t)
    }
  }, [searchParams])

  const switchTab = (t) => {
    setDir(t === 'register' ? 1 : -1)
    setTab(t)
  }

  const handleSuccess = () => navigate('/home')

  return (
    <div className="auth-page">
      {/* ── Côté gauche — Branding ── */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-brand-bg">
          <div className="auth-brand-blob blob-a" />
          <div className="auth-brand-blob blob-b" />
        </div>
        <div className="auth-brand-content">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <div className="auth-brand-logo">
            <span className="nav-logo-dot" style={{ width: 14, height: 14, background: 'var(--gold)' }} aria-hidden="true" />
            Tomat'chef
          </div>
          <h2 className="auth-brand-title">La meilleure tomate<br />concentrée du Sénégal.</h2>
          <p className="auth-brand-sub">
            Rejoignez des centaines de clients satisfaits et commandez directement en ligne.
          </p>
          <div className="auth-brand-features">
            {['Livraison partout au Sénégal', 'Paiement sécurisé', 'Produit 100% naturel'].map(f => (
              <div key={f} className="auth-brand-feature">
                <span className="auth-brand-feature-dot" />
                {f}
              </div>
            ))}
          </div>
          <div className="auth-brand-visual" aria-hidden="true">
            <TomatoIcon size={120} className="auth-tomato-deco" />
          </div>
        </div>
      </div>

      {/* ── Côté droit — Formulaire ── */}
      <main className="auth-form-side">
        <div className="auth-form-container">
          {/* Tab switcher */}
          <div className="auth-tabs" role="tablist" aria-label="Mode d'authentification">
            <button
              role="tab"
              aria-selected={tab === 'login'}
              className={`auth-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Connexion
            </button>
            <button
              role="tab"
              aria-selected={tab === 'register'}
              className={`auth-tab${tab === 'register' ? ' active' : ''}`}
              onClick={() => switchTab('register')}
            >
              Créer un compte
            </button>
            <span
              className="auth-tab-indicator"
              style={{ left: tab === 'login' ? '4px' : 'calc(50% - 4px)', width: 'calc(50% - 4px)' }}
              aria-hidden="true"
            />
          </div>

          {/* Title */}
          <div className="auth-form-header">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={tab + '-header'}
                custom={dir}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h1 className="auth-form-title">
                  {tab === 'login' ? 'Bon retour !' : 'Bienvenue !'}
                </h1>
                <p className="auth-form-sub">
                  {tab === 'login'
                    ? 'Connectez-vous pour accéder à votre compte et passer commande.'
                    : 'Créez votre compte pour commander et suivre vos livraisons.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form panels */}
          <div className="auth-panel-wrap" aria-live="polite">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={tab}
                custom={dir}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {tab === 'login'
                  ? <LoginForm onSuccess={handleSuccess} />
                  : <RegisterForm onSuccess={handleSuccess} />
                }
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Switch link */}
          <p className="auth-switch">
            {tab === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <button className="auth-switch-btn" onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}>
              {tab === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
