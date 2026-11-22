import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MapPin, Phone, Home, Pencil, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import ProfileSidebar from '../components/ProfileSidebar'
import '../styles/globals.css'
import '../styles/profile.css'
import '../styles/addresses.css'

const EMPTY_FORM = { label: '', phone: '', neighborhood: '', landmark: '', city: '', is_default: false }

export default function AddressesPage() {
  const [addresses, setAddresses]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [errors, setErrors]         = useState({})
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    api.get('/addresses')
      .then(res => setAddresses(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setF = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  const openAdd = () => {
    setEditId(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true)
  }
  const openEdit = (addr) => {
    setEditId(addr.id)
    setForm({
      label:        addr.label ?? '',
      phone:        addr.phone ?? '',
      neighborhood: addr.neighborhood ?? '',
      landmark:     addr.landmark ?? '',
      city:         addr.city ?? '',
      is_default:   addr.is_default ?? false,
    })
    setErrors({})
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.label.trim())        e.label        = 'Requis'
    if (!form.phone.trim())        e.phone        = 'Requis'
    if (!form.city.trim())         e.city         = 'Requis'
    if (!form.neighborhood.trim()) e.neighborhood = 'Requis'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (editId) {
        const res = await api.put(`/addresses/${editId}`, form)
        const updated = res.data ?? res
        setAddresses(prev => {
          let list = prev.map(a => a.id === editId ? updated : a)
          if (form.is_default) list = list.map(a => ({ ...a, is_default: a.id === editId }))
          return list
        })
      } else {
        const res = await api.post('/addresses', form)
        const created = res.data ?? res
        setAddresses(prev => {
          let list = form.is_default ? prev.map(a => ({ ...a, is_default: false })) : [...prev]
          return [...list, created]
        })
      }
      closeModal()
    } catch (err) {
      if (err.data?.errors) setErrors(err.data.errors)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/addresses/${id}`)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {
      setDeletingId(null)
    }
  }

  const setDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}`, { label: addresses.find(a => a.id === id)?.label ?? '', is_default: true })
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
    } catch {}
  }

  return (
    <>
      <Navbar />

      <main className="adr-main">
        <div className="page-container">
          <div className="prf-layout">

            <ProfileSidebar active="/profil/adresses" />

            <div>
              <div className="adr-header">
                <div>
                  <h1 className="adr-title">Mes adresses</h1>
                  {!loading && (
                    <p className="adr-sub">{addresses.length} adresse{addresses.length !== 1 ? 's' : ''} enregistrée{addresses.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                  <Plus size={16} /> Ajouter une adresse
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <span className="spinner" style={{ borderTopColor: 'var(--tomato)', width: 32, height: 32 }} />
                </div>
              ) : (
                <div className="adr-grid">
                  <AnimatePresence>
                    {addresses.map(addr => (
                      <motion.div
                        key={addr.id}
                        className={`adr-card${addr.is_default ? ' default' : ''}`}
                        layout
                        initial={{ opacity: 0, scale: .96 }}
                        animate={{ opacity: deletingId === addr.id ? 0 : 1, scale: deletingId === addr.id ? .95 : 1 }}
                        exit={{ opacity: 0, scale: .95, height: 0 }}
                        transition={{ duration: .3 }}
                      >
                        <div className="adr-card-top">
                          <div className="adr-card-name">{addr.label}</div>
                          {addr.is_default && <span className="adr-default-badge">Défaut</span>}
                        </div>
                        <div className="adr-card-body">
                          <div className="adr-card-line">
                            <Home size={13} /> {addr.neighborhood}{addr.landmark ? ` — ${addr.landmark}` : ''}
                          </div>
                          <div className="adr-card-line"><MapPin size={13} /> {addr.city}</div>
                          <div className="adr-card-line"><Phone size={13} /> {addr.phone}</div>
                        </div>
                        <div className="adr-card-actions">
                          {!addr.is_default && (
                            <button className="adr-set-default" onClick={() => setDefault(addr.id)}>
                              <CheckCircle size={13} style={{ display: 'inline', marginRight: 4 }} />
                              Définir par défaut
                            </button>
                          )}
                          <div className="adr-actions-right">
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(addr)} aria-label="Modifier">
                              <Pencil size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--tomato)' }}
                              onClick={() => handleDelete(addr.id)}
                              aria-label="Supprimer"
                              disabled={addr.is_default}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button className="adr-add-card" onClick={openAdd} aria-label="Ajouter une adresse">
                    <Plus size={28} />
                    Nouvelle adresse
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ── Modal ajout / édition ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="adr-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          >
            <motion.div
              className="adr-modal"
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              transition={{ duration: .3, ease: [.22, 1, .36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={editId ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
            >
              <div className="adr-modal-header">
                <div className="adr-modal-title">{editId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</div>
                <button className="adr-modal-close" onClick={closeModal} aria-label="Fermer">
                  <X size={16} />
                </button>
              </div>

              <form className="adr-form" onSubmit={handleSave} noValidate>

                <div className="adr-row">
                  <div className="adr-field">
                    <label className="adr-label" htmlFor="adr-label">Libellé <span>*</span></label>
                    <input id="adr-label" className={`field-input${errors.label ? ' field-error' : ''}`}
                      placeholder="Maison, Bureau…" value={form.label} onChange={setF('label')} />
                    {errors.label && <div className="field-error-msg"><AlertCircle size={12} /> {errors.label}</div>}
                  </div>
                  <div className="adr-field">
                    <label className="adr-label" htmlFor="adr-phone">Téléphone <span>*</span></label>
                    <input id="adr-phone" type="tel" className={`field-input${errors.phone ? ' field-error' : ''}`}
                      placeholder="77 123 45 67" value={form.phone} onChange={setF('phone')} autoComplete="tel" />
                    {errors.phone && <div className="field-error-msg"><AlertCircle size={12} /> {errors.phone}</div>}
                  </div>
                </div>

                <div className="adr-row">
                  <div className="adr-field">
                    <label className="adr-label" htmlFor="adr-city">Ville <span>*</span></label>
                    <input id="adr-city" className={`field-input${errors.city ? ' field-error' : ''}`}
                      placeholder="Dakar" value={form.city} onChange={setF('city')} autoComplete="address-level2" />
                    {errors.city && <div className="field-error-msg"><AlertCircle size={12} /> {errors.city}</div>}
                  </div>
                  <div className="adr-field">
                    <label className="adr-label" htmlFor="adr-neighborhood">Quartier <span>*</span></label>
                    <input id="adr-neighborhood" className={`field-input${errors.neighborhood ? ' field-error' : ''}`}
                      placeholder="Plateau, Médina…" value={form.neighborhood} onChange={setF('neighborhood')} />
                    {errors.neighborhood && <div className="field-error-msg"><AlertCircle size={12} /> {errors.neighborhood}</div>}
                  </div>
                </div>

                <div className="adr-field">
                  <label className="adr-label" htmlFor="adr-landmark">Point de repère (optionnel)</label>
                  <input id="adr-landmark" className="field-input"
                    placeholder="Face à la mosquée, derrière le marché…" value={form.landmark} onChange={setF('landmark')} />
                </div>

                <label className="adr-default-check">
                  <input type="checkbox" checked={form.is_default} onChange={setF('is_default')} />
                  Définir comme adresse par défaut
                </label>

                <div className="adr-modal-actions">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                  <motion.button type="submit" className="btn btn-primary" disabled={saving} whileTap={{ scale: .98 }}>
                    {saving ? <><span className="spinner" /> Enregistrement…</> : editId ? 'Modifier' : 'Ajouter'}
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
