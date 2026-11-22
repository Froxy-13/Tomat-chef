import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TomatoIcon } from '../../components/TomatoIcon'
import { useAdminAuth } from '../../context/AdminAuthContext'
import '../../styles/globals.css'
import '../../styles/admin.css'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAdminAuth()

  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/admin/commandes', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">

        <div className="adm-login-top">
          <div className="adm-login-logo">
            <TomatoIcon size={28} color="#fff" />
          </div>
          <div className="adm-login-title">Tomat'Chef Admin</div>
          <div className="adm-login-sub">Espace réservé à l'administration</div>
        </div>

        <form className="adm-login-body" onSubmit={handleSubmit}>
          {error && <div className="adm-login-error">{error}</div>}

          <div className="adm-field">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email" type="email" required autoComplete="email"
              placeholder="admin@exemple.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="adm-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password" type="password" required autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ justifyContent: 'center', marginTop: 4 }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)', width: 18, height: 18 }} /> Connexion…</>
              : 'Se connecter'
            }
          </button>
        </form>

      </div>
    </div>
  )
}
