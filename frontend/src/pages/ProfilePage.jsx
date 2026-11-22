import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Eye, EyeOff, CheckCircle, Lock, AlertCircle, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import ProfileSidebar from '../components/ProfileSidebar'
import '../styles/globals.css'
import '../styles/profile.css'
import '../styles/orders.css'

export default function ProfilePage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    firstName: user?.first_name ?? user?.name?.split(' ')[0] ?? '',
    lastName:  user?.last_name  ?? user?.name?.split(' ').slice(1).join(' ') ?? '',
    email:     user?.email  ?? '',
    phone:     user?.phone  ?? '',
  })
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [showPwd, setShowPwd]       = useState({ current: false, next: false, confirm: false })
  const [pwdOpen, setPwdOpen]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [savingPwd, setSavingPwd]   = useState(false)
  const [saved, setSaved]           = useState(false)
  const [savedPwd, setSavedPwd]     = useState(false)
  const [pwdErrors, setPwdErrors]   = useState({})

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setP = (k) => (e) => setPwdForm(p => ({ ...p, [k]: e.target.value }))
  const togglePwd = (k) => setShowPwd(s => ({ ...s, [k]: !s[k] }))

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', {
        first_name: form.firstName,
        last_name:  form.lastName,
        email:      form.email,
        phone:      form.phone,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Erreur profil:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePwd = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!pwdForm.current)                errs.current = 'Requis'
    if (pwdForm.next.length < 8)         errs.next    = '8 caractères minimum'
    if (pwdForm.next !== pwdForm.confirm) errs.confirm = 'Les mots de passe ne correspondent pas'
    if (Object.keys(errs).length) { setPwdErrors(errs); return }
    setSavingPwd(true)
    try {
      await api.put('/profile/password', {
        current_password:      pwdForm.current,
        password:              pwdForm.next,
        password_confirmation: pwdForm.confirm,
      })
      setSavedPwd(true)
      setPwdForm({ current: '', next: '', confirm: '' })
      setTimeout(() => { setSavedPwd(false); setPwdOpen(false) }, 2500)
    } catch (err) {
      if (err.data?.errors?.current_password) {
        setPwdErrors({ current: 'Mot de passe actuel incorrect' })
      }
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="prf-main">
        <div className="page-container">
          <div className="prf-layout">

            <ProfileSidebar active="/profil" />

            <div>
              {/* ── Infos personnelles ── */}
              <motion.div
                className="prf-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4 }}
              >
                <div className="prf-card-header">
                  <div className="prf-card-title"><User size={18} /> Informations personnelles</div>
                </div>

                <form onSubmit={handleSaveProfile} noValidate>
                  <div className="prf-row">
                    <div className="prf-field">
                      <label className="prf-label" htmlFor="prf-first">Prénom</label>
                      <input id="prf-first" className="field-input" value={form.firstName} onChange={setF('firstName')} autoComplete="given-name" />
                    </div>
                    <div className="prf-field">
                      <label className="prf-label" htmlFor="prf-last">Nom</label>
                      <input id="prf-last" className="field-input" value={form.lastName} onChange={setF('lastName')} autoComplete="family-name" />
                    </div>
                  </div>

                  <div className="prf-field" style={{ marginTop: 16 }}>
                    <label className="prf-label" htmlFor="prf-email">Adresse e-mail</label>
                    <input id="prf-email" type="email" className="field-input" value={form.email} onChange={setF('email')} autoComplete="email" />
                  </div>

                  <div className="prf-field" style={{ marginTop: 16 }}>
                    <label className="prf-label" htmlFor="prf-phone">Téléphone</label>
                    <input id="prf-phone" type="tel" className="field-input" value={form.phone} onChange={setF('phone')} autoComplete="tel" />
                  </div>

                  <div className="prf-save-bar">
                    <AnimatePresence>
                      {saved && (
                        <motion.div
                          className="prf-success-msg"
                          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        >
                          <CheckCircle size={16} /> Modifications enregistrées
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button type="submit" className="btn btn-primary" disabled={saving} whileTap={{ scale: .98 }}>
                      {saving ? <><span className="spinner" /> Enregistrement…</> : 'Enregistrer'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>

              {/* ── Mot de passe ── */}
              <motion.div
                className="prf-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4, delay: .07 }}
              >
                <div className="prf-card-header">
                  <div className="prf-card-title"><Lock size={18} /> Mot de passe</div>
                  {!pwdOpen && (
                    <button className="prf-pwd-toggle" onClick={() => setPwdOpen(true)} type="button">
                      Modifier
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {!pwdOpen ? (
                    <motion.p key="hint" style={{ fontSize: '.85rem', color: 'var(--fg-muted)' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Votre mot de passe est sécurisé. Cliquez sur "Modifier" pour le changer.
                    </motion.p>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSavePwd}
                      noValidate
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {[
                        { key: 'current', label: 'Mot de passe actuel',      id: 'pwd-cur' },
                        { key: 'next',    label: 'Nouveau mot de passe',      id: 'pwd-new' },
                        { key: 'confirm', label: 'Confirmer le nouveau mot de passe', id: 'pwd-cfm' },
                      ].map(({ key, label, id }) => (
                        <div key={key} className="prf-field" style={{ marginBottom: 14 }}>
                          <label className="prf-label" htmlFor={id}>{label}</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              id={id}
                              type={showPwd[key] ? 'text' : 'password'}
                              className={`field-input${pwdErrors[key] ? ' field-error' : ''}`}
                              style={{ paddingRight: 44 }}
                              value={pwdForm[key]}
                              onChange={setP(key)}
                              autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                            />
                            <button
                              type="button"
                              onClick={() => togglePwd(key)}
                              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'flex' }}
                              aria-label={showPwd[key] ? 'Masquer' : 'Afficher'}
                            >
                              {showPwd[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {pwdErrors[key] && <div className="field-error-msg"><AlertCircle size={12} /> {pwdErrors[key]}</div>}
                        </div>
                      ))}

                      <div className="prf-save-bar">
                        <AnimatePresence>
                          {savedPwd && (
                            <motion.div className="prf-success-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <CheckCircle size={16} /> Mot de passe modifié
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setPwdOpen(false); setPwdErrors({}) }}>
                          Annuler
                        </button>
                        <motion.button type="submit" className="btn btn-primary" disabled={savingPwd} whileTap={{ scale: .98 }}>
                          {savingPwd ? <><span className="spinner" /> Enregistrement…</> : 'Modifier le mot de passe'}
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── Zone danger ── */}
              <motion.div
                className="prf-card prf-danger"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4, delay: .14 }}
              >
                <div className="prf-card-header">
                  <div className="prf-card-title"><Trash2 size={18} /> Supprimer le compte</div>
                </div>
                <p className="prf-danger-text">
                  La suppression de votre compte est définitive et irréversible. Toutes vos données, commandes et adresses seront effacées.
                </p>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: 'var(--tomato)', color: 'var(--tomato)', alignSelf: 'flex-start' }}
                >
                  <Trash2 size={14} /> Supprimer mon compte
                </button>
              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
