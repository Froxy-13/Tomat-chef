import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MapPin, Phone, Home, Pencil, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import ProfileSidebar from '../components/ProfileSidebar'
import '../styles/globals.css'
import '../styles/profile.css'
import '../styles/addresses.css'

const EMPTY_FORM = { name: '', phone: '', address: '', city: '', quartier: '', isDefault: false }

const INITIAL_ADDRESSES = [
  { id: 1, name: 'Fatimata Diallo', phone: '77 353 00 00', address: '12 Avenue Cheikh Anta Diop', city: 'Dakar', quartier: 'Plateau', isDefault: true },
  { id: 2, name: 'Fatimata Diallo', phone: '77 353 00 00', address: '45 Rue 10, Cité Fadia',       city: 'Dakar', quartier: 'Médina',  isDefault: false },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [errors, setErrors]       = useState({})
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const setF = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  const openAdd = () => {
    setEditId(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true)
  }
  const openEdit = (addr) => {
    setEditId(addr.id); setForm({ ...addr }); setErrors({}); setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Requis'
    if (!form.phone.trim())   e.phone   = 'Requis'
    if (!form.address.trim()) e.address = 'Requis'
    if (!form.city.trim())    e.city    = 'Requis'
    return e
  }

  const handleSave = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setAddresses(prev => {
        let updated = editId
          ? prev.map(a => a.id === editId ? { ...form, id: editId } : a)
          : [...prev, { ...form, id: Date.now() }]
        if (form.isDefault) updated = updated.map(a => ({ ...a, isDefault: a.id === (editId ?? Date.now()) }))
        return updated
      })
      closeModal()
    }, 600)
  }

  const handleDelete = (id) => {
    setDeletingId(id)
    setTimeout(() => {
      setAddresses(prev => prev.filter(a => a.id !== id))
      setDeletingId(null)
    }, 400)
  }

  const setDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
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
                  <p className="adr-sub">{addresses.length} adresse{addresses.length !== 1 ? 's' : ''} enregistrée{addresses.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                  <Plus size={16} /> Ajouter une adresse
                </button>
              </div>

              <div className="adr-grid">
                <AnimatePresence>
                  {addresses.map(addr => (
                    <motion.div
                      key={addr.id}
                      className={`adr-card${addr.isDefault ? ' default' : ''}`}
                      layout
                      initial={{ opacity: 0, scale: .96 }}
                      animate={{ opacity: deletingId === addr.id ? 0 : 1, scale: deletingId === addr.id ? .95 : 1 }}
                      exit={{ opacity: 0, scale: .95, height: 0 }}
                      transition={{ duration: .3 }}
                    >
                      <div className="adr-card-top">
                        <div className="adr-card-name">{addr.name}</div>
                        {addr.isDefault && <span className="adr-default-badge">Défaut</span>}
                      </div>
                      <div className="adr-card-body">
                        <div className="adr-card-line"><Home size={13} /> {addr.address}{addr.quartier ? `, ${addr.quartier}` : ''}</div>
                        <div className="adr-card-line"><MapPin size={13} /> {addr.city}</div>
                        <div className="adr-card-line"><Phone size={13} /> {addr.phone}</div>
                      </div>
                      <div className="adr-card-actions">
                        {!addr.isDefault && (
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
                            disabled={addr.isDefault}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Bouton ajout */}
                <button className="adr-add-card" onClick={openAdd} aria-label="Ajouter une adresse">
                  <Plus size={28} />
                  Nouvelle adresse
                </button>
              </div>
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
                    <label className="adr-label" htmlFor="adr-name">Nom complet <span>*</span></label>
                    <input id="adr-name" className={`field-input${errors.name ? ' field-error' : ''}`}
                      placeholder="Fatimata Diallo" value={form.name} onChange={setF('name')} autoComplete="name" />
                    {errors.name && <div className="field-error-msg"><AlertCircle size={12} /> {errors.name}</div>}
                  </div>
                  <div className="adr-field">
                    <label className="adr-label" htmlFor="adr-phone">Téléphone <span>*</span></label>
                    <input id="adr-phone" type="tel" className={`field-input${errors.phone ? ' field-error' : ''}`}
                      placeholder="77 123 45 67" value={form.phone} onChange={setF('phone')} autoComplete="tel" />
                    {errors.phone && <div className="field-error-msg"><AlertCircle size={12} /> {errors.phone}</div>}
                  </div>
                </div>

                <div className="adr-field">
                  <label className="adr-label" htmlFor="adr-address">Adresse <span>*</span></label>
                  <input id="adr-address" className={`field-input${errors.address ? ' field-error' : ''}`}
                    placeholder="N° et nom de rue" value={form.address} onChange={setF('address')} autoComplete="street-address" />
                  {errors.address && <div className="field-error-msg"><AlertCircle size={12} /> {errors.address}</div>}
                </div>

                <div className="adr-row">
                  <div className="adr-field">
                    <label className="adr-label" htmlFor="adr-city">Ville <span>*</span></label>
                    <input id="adr-city" className={`field-input${errors.city ? ' field-error' : ''}`}
                      placeholder="Dakar" value={form.city} onChange={setF('city')} autoComplete="address-level2" />
                    {errors.city && <div className="field-error-msg"><AlertCircle size={12} /> {errors.city}</div>}
                  </div>
                  <div className="adr-field">
                    <label className="adr-label" htmlFor="adr-quartier">Quartier</label>
                    <input id="adr-quartier" className="field-input"
                      placeholder="Plateau, Médina…" value={form.quartier} onChange={setF('quartier')} />
                  </div>
                </div>

                <label className="adr-default-check">
                  <input type="checkbox" checked={form.isDefault} onChange={setF('isDefault')} />
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
