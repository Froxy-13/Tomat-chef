import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, MapPin } from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

const EMPTY = { name: '', fee: '', is_active: true }

export default function AdminZonesPage() {
  const [zones, setZones]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)   // null | 'create' | zone-object
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/delivery-zones')
      .then(res => setZones(Array.isArray(res) ? res : res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal('create') }
  const openEdit   = (z) => { setForm({ name: z.name, fee: z.fee, is_active: z.is_active }); setErrors({}); setModal(z) }
  const closeModal = () => { setModal(null) }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors(e => ({ ...e, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())             errs.name = 'Le nom est obligatoire.'
    if (form.fee === '' || isNaN(+form.fee) || +form.fee < 0) errs.fee = 'Frais invalides (entier ≥ 0).'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    const payload = { name: form.name.trim(), fee: parseInt(form.fee, 10), is_active: form.is_active }
    try {
      if (modal === 'create') {
        const created = await adminApi.post('/admin/delivery-zones', payload)
        setZones(z => [...z, created])
      } else {
        const updated = await adminApi.put(`/admin/delivery-zones/${modal.id}`, payload)
        setZones(z => z.map(z => z.id === modal.id ? updated : z))
      }
      closeModal()
    } catch (err) {
      if (err.data?.errors) {
        const mapped = {}
        Object.entries(err.data.errors).forEach(([k, v]) => { mapped[k] = v[0] })
        setErrors(mapped)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (zone) => {
    if (!window.confirm(`Supprimer la zone "${zone.name}" ?`)) return
    setDeleting(zone.id)
    try {
      await adminApi.delete(`/admin/delivery-zones/${zone.id}`)
      setZones(z => z.filter(z => z.id !== zone.id))
    } catch {}
    setDeleting(null)
  }

  const handleToggle = async (zone) => {
    try {
      const updated = await adminApi.put(`/admin/delivery-zones/${zone.id}`, {
        name: zone.name, fee: zone.fee, is_active: !zone.is_active,
      })
      setZones(z => z.map(z => z.id === zone.id ? updated : z))
    } catch {}
  }

  return (
    <AdminLayout breadcrumb="Zones de livraison">

      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Zones de livraison</h1>
          <p style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)', marginTop: 2 }}>
            Gérez les zones et leurs frais de livraison.
          </p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }} onClick={openCreate}>
          <Plus size={16} /> Nouvelle zone
        </button>
      </div>

      {/* Table */}
      <div className="adm-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <span className="spinner" style={{ width: 28, height: 28, borderTopColor: 'var(--tomato)' }} />
          </div>
        ) : zones.length === 0 ? (
          <div className="adm-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <MapPin size={36} color="var(--adm-border)" strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--adm-text-mid)', fontSize: '.9rem', margin: 0 }}>Aucune zone configurée.</p>
          </div>
        ) : (
          <div className="adm-table-wrap" style={{ marginTop: 0 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Frais</th>
                  <th>Statut</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(220,38,38,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MapPin size={15} color="var(--tomato)" />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--adm-text)' }}>{z.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '.95rem' }}>
                        {z.fee === 0 ? <span style={{ color: '#059669' }}>Gratuit</span> : fmt(z.fee)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(z)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title={z.is_active ? 'Désactiver' : 'Activer'}
                      >
                        <span className={`adm-status ${z.is_active ? 'delivered' : 'cancelled'}`}>
                          {z.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-action-btn" title="Modifier" onClick={() => openEdit(z)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          className="adm-action-btn danger"
                          title="Supprimer"
                          onClick={() => handleDelete(z)}
                          disabled={deleting === z.id}
                        >
                          {deleting === z.id
                            ? <span className="spinner" style={{ width: 13, height: 13 }} />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="adm-modal-overlay" onClick={closeModal}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2 className="adm-card-title">{modal === 'create' ? 'Nouvelle zone' : 'Modifier la zone'}</h2>
              <button className="adm-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="adm-modal-body">

              {/* Nom */}
              <div className="adm-field">
                <label htmlFor="zname">Nom de la zone *</label>
                <input
                  id="zname" name="name" value={form.name}
                  onChange={handleChange} placeholder="ex: Dakar Plateau"
                  style={errors.name ? { borderColor: '#DC2626' } : {}}
                />
                {errors.name && <span className="adm-field-error">{errors.name}</span>}
              </div>

              {/* Frais */}
              <div className="adm-field">
                <label htmlFor="zfee">Frais de livraison (FCFA) *</label>
                <input
                  id="zfee" name="fee" type="number" min="0" step="100"
                  value={form.fee} onChange={handleChange} placeholder="ex: 1500"
                  style={errors.fee ? { borderColor: '#DC2626' } : {}}
                />
                {errors.fee && <span className="adm-field-error">{errors.fee}</span>}
                <span style={{ fontSize: '.72rem', color: 'var(--adm-text-mid)' }}>Mettre 0 pour la livraison gratuite.</span>
              </div>

              {/* Statut */}
              <label className="adm-toggle-row">
                <span>Zone active</span>
                <div
                  className={`adm-toggle ${form.is_active ? 'on' : ''}`}
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  role="switch" aria-checked={form.is_active}
                  tabIndex={0} onKeyDown={e => e.key === ' ' && setForm(f => ({ ...f, is_active: !f.is_active }))}
                >
                  <div className="adm-toggle-thumb" />
                </div>
              </label>

              <div className="adm-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 15, height: 15 }} /> : <Check size={15} />}
                  {modal === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
