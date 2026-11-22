import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, ArrowLeft } from 'lucide-react'
import { TomatoIcon } from '../components/TomatoIcon'
import { useAuth } from '../context/AuthContext'
import '../styles/globals.css'
import '../styles/auth.css'

const panelVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0, transition: { duration: .32, ease: [.22, 1, .36, 1] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32, transition: { duration: .22, ease: 'easeIn' } }),
}

function AuthField({ label, id, type = 'text', placeholder, icon: Icon, value, onChange, error, hint, ...rest }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        {Icon && <span className="auth-input-icon" aria-hidden="true"><Icon size={16} strokeWidth={2} /></span>}
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
          <button type="button" className="auth-toggle-vis" onClick={() => setShow(s => !s)}
            aria-label={show ? 'Masquer' : 'Afficher'}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="field-error" id={`${id}-err`} role="alert"><AlertCircle size={12} /> {error}</span>}
      {hint && !error && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
    </div>
  )
}

/* ── Connexion ── */
function LoginForm() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = "L'adresse email est requise."
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format d'email invalide."
    if (!form.password) e.password = 'Le mot de passe est requis.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setErrors({}); setApiError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin/commandes' : '/home')
    } catch (err) {
      setApiError(err.data?.message ?? 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="auth-api-error" role="alert">
          <AlertCircle size={15} /> {apiError}
        </div>
      )}
      <AuthField label="Adresse email" id="login-email" type="email"
        placeholder="votre@email.com" icon={Mail}
        value={form.email} onChange={set('email')} error={errors.email} />
      <AuthField label="Mot de passe" id="login-password" type="password"
        placeholder="••••••••" icon={Lock}
        value={form.password} onChange={set('password')} error={errors.password} />
      <div className="auth-forgot-wrap">
        <a href="#" className="auth-forgot">Mot de passe oublié ?</a>
      </div>
      <button type="submit" className={`btn btn-primary btn-lg auth-submit${loading ? ' loading' : ''}`} disabled={loading}>
        {loading && <span className="auth-spinner" aria-hidden="true" />}
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}

/* ── Inscription ── */
function RegisterForm() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]     = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Le prénom est requis.'
    if (!form.last_name.trim())  e.last_name  = 'Le nom est requis.'
    if (!form.email) e.email = "L'email est requis."
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format d'email invalide."
    if (!form.phone) e.phone = 'Le numéro de téléphone est requis.'
    if (!form.password) e.password = 'Le mot de passe est requis.'
    else if (form.password.length < 8) e.password = 'Minimum 8 caractères.'
    if (form.password !== form.password_confirmation)
      e.password_confirmation = 'Les mots de passe ne correspondent pas.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setErrors({}); setApiError('')
    try {
      const user = await register(form)
      navigate(user.role === 'admin' ? '/admin/commandes' : '/home')
    } catch (err) {
      const data = err.data?.errors ?? {}
      if (Object.keys(data).length) {
        const mapped = {}
        Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setErrors(mapped)
      } else {
        setApiError(err.data?.message ?? 'Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="auth-api-error" role="alert">
          <AlertCircle size={15} /> {apiError}
        </div>
      )}
      <div className="auth-name-row">
        <AuthField label="Prénom" id="reg-fname" placeholder="Moussa" icon={User}
          value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
        <AuthField label="Nom" id="reg-lname" placeholder="Diallo" icon={User}
          value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
      </div>
      <AuthField label="Adresse email" id="reg-email" type="email" placeholder="votre@email.com" icon={Mail}
        value={form.email} onChange={set('email')} error={errors.email} />
      <AuthField label="Téléphone" id="reg-phone" type="tel" placeholder="+221 77 000 00 00" icon={Phone}
        value={form.phone} onChange={set('phone')} error={errors.phone} hint="Format : +221 7X XXX XX XX" />
      <AuthField label="Mot de passe" id="reg-pwd" type="password" placeholder="Minimum 8 caractères" icon={Lock}
        value={form.password} onChange={set('password')} error={errors.password} />
      <AuthField label="Confirmer le mot de passe" id="reg-pwd2" type="password" placeholder="Répétez le mot de passe" icon={Lock}
        value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} />
      <button type="submit" className={`btn btn-primary btn-lg auth-submit${loading ? ' loading' : ''}`} disabled={loading}>
        {loading && <span className="auth-spinner" aria-hidden="true" />}
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
  const { isAuthenticated, isAdmin } = useAuth()
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const [tab, setTab]   = useState(searchParams.get('tab') === 'register' ? 'register' : 'login')
  const [dir, setDir]   = useState(1)

  /* Redirige si déjà connecté */
  useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? '/admin/commandes' : '/home')
  }, [isAuthenticated])

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'register' || t === 'login') { setDir(t === 'register' ? 1 : -1); setTab(t) }
  }, [searchParams])

  const switchTab = (t) => { setDir(t === 'register' ? 1 : -1); setTab(t) }

  return (
    <div className="auth-page">
      {/* Branding */}
      <div className="auth-brand">
        <div className="auth-brand-bg">
          <div className="auth-brand-blob blob-a" />
          <div className="auth-brand-blob blob-b" />
        </div>
        <div className="auth-brand-content">
          <Link to="/" className="auth-back-link"><ArrowLeft size={16} /> Retour à l'accueil</Link>
          <div className="auth-brand-logo">
            <span className="nav-logo-dot" style={{ width: 14, height: 14, background: 'var(--gold)' }} aria-hidden="true" />
            Tomat'chef
          </div>
          <h2 className="auth-brand-title">La meilleure tomate<br />concentrée du Sénégal.</h2>
          <p className="auth-brand-sub">Rejoignez des centaines de clients satisfaits et commandez directement en ligne.</p>
          <div className="auth-brand-features">
            {['Livraison partout au Sénégal', 'Paiement sécurisé', 'Produit 100% naturel'].map(f => (
              <div key={f} className="auth-brand-feature"><span className="auth-brand-feature-dot" />{f}</div>
            ))}
          </div>
          <div className="auth-brand-visual" aria-hidden="true">
            <TomatoIcon size={120} className="auth-tomato-deco" />
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <main className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-tabs" role="tablist" aria-label="Mode d'authentification">
            <button role="tab" aria-selected={tab === 'login'}    className={`auth-tab${tab === 'login'    ? ' active' : ''}`} onClick={() => switchTab('login')}>Connexion</button>
            <button role="tab" aria-selected={tab === 'register'} className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>Créer un compte</button>
            <span className="auth-tab-indicator"
              style={{ left: tab === 'login' ? '4px' : 'calc(50% - 4px)', width: 'calc(50% - 4px)' }}
              aria-hidden="true" />
          </div>

          <div className="auth-form-header">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={tab + '-header'} custom={dir} variants={panelVariants} initial="enter" animate="center" exit="exit">
                <h1 className="auth-form-title">{tab === 'login' ? 'Bon retour !' : 'Créer un compte'}</h1>
                <p className="auth-form-sub">{tab === 'login' ? 'Connectez-vous pour accéder à votre espace.' : 'Rejoignez Tomat\'chef en quelques secondes.'}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={tab} custom={dir} variants={panelVariants} initial="enter" animate="center" exit="exit">
              {tab === 'login' ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
