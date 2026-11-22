import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, ArrowLeft, Upload, X, Star, ImageOff, AlertCircle } from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', weight: '', is_active: true }

function FieldError({ msg }) {
  if (!msg) return null
  return <span style={{ fontSize: '.75rem', color: 'var(--tomato)', marginTop: 4, display: 'block' }}>{msg}</span>
}

export default function AdminProductFormPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const isEdit     = !!id
  const fileRef    = useRef(null)

  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [product, setProduct] = useState(null)

  const [images, setImages]         = useState([])
  const [uploading, setUploading]   = useState(false)
  const [uploadErr, setUploadErr]   = useState('')
  const [deletingImg, setDeletingImg] = useState(null)

  /* Charger le produit en mode édition */
  useEffect(() => {
    if (!isEdit) return
    adminApi.get(`/admin/products/${id}`)
      .then(res => {
        const p = res.data ?? res
        setProduct(p)
        setForm({
          name:        p.name        ?? '',
          description: p.description ?? '',
          price:       p.price       ?? '',
          stock:       p.stock       ?? '',
          weight:      p.weight      ?? '',
          is_active:   p.is_active   ?? true,
        })
        setImages(p.images ?? [])
      })
      .catch(() => navigate('/admin/produits', { replace: true }))
      .finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaveMsg('')
    setSaving(true)
    try {
      const payload = {
        name:        form.name,
        description: form.description || null,
        price:       parseInt(form.price, 10),
        stock:       parseInt(form.stock, 10),
        weight:      form.weight || null,
        is_active:   form.is_active,
      }
      if (isEdit) {
        const res = await adminApi.put(`/admin/products/${id}`, payload)
        const p = res.data ?? res
        setProduct(p)
        setImages(p.images ?? images)
        setSaveMsg('Produit mis à jour.')
      } else {
        const res = await adminApi.post('/admin/products', payload)
        const p = res.data ?? res
        navigate(`/admin/produits/${p.id}`, { replace: true })
      }
    } catch (err) {
      if (err.data?.errors) setErrors(err.data.errors)
      else setErrors({ _global: err.message })
    } finally {
      setSaving(false)
    }
  }

  /* Upload image */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (images.length >= 5) { setUploadErr('Maximum 5 images par produit.'); return }
    setUploading(true)
    setUploadErr('')
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await adminApi.upload(`/admin/products/${id}/images`, fd)
      setImages(imgs => [...imgs, { id: res.id, url: res.url, is_primary: res.is_primary }])
    } catch (err) {
      setUploadErr(err.message ?? 'Erreur lors de l\'upload.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  /* Supprimer image */
  const handleDeleteImage = async (imgId) => {
    setDeletingImg(imgId)
    try {
      await adminApi.delete(`/admin/products/${id}/images/${imgId}`)
      setImages(imgs => {
        const remaining = imgs.filter(i => i.id !== imgId)
        if (remaining.length > 0 && !remaining.find(i => i.is_primary)) {
          remaining[0] = { ...remaining[0], is_primary: true }
        }
        return remaining
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingImg(null)
    }
  }

  const breadcrumb = [
    { label: 'Produits', path: '/admin/produits' },
    { label: isEdit ? (product?.name ?? '…') : 'Nouveau produit' },
  ]

  if (loading) return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="adm-empty"><span className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--tomato)' }} /></div>
    </AdminLayout>
  )

  return (
    <AdminLayout breadcrumb={breadcrumb}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--adm-text)' }}>
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          {isEdit && product && (
            <p style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)', marginTop: 2 }}>
              Slug : <code style={{ background: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}>{product.slug}</code>
            </p>
          )}
        </div>
        <Link to="/admin/produits" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.84rem', fontWeight: 600, color: 'var(--adm-text-mid)', textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr 300px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit}>
          <div className="adm-card">
            <div className="adm-card-head">
              <div className="adm-card-title">Informations du produit</div>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {errors._global && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 'var(--r-md)', fontSize: '.84rem', color: 'var(--tomato)' }}>
                  <AlertCircle size={16} /> {errors._global}
                </div>
              )}

              {/* Nom */}
              <div className="adm-field">
                <label>Nom du produit *</label>
                <input
                  type="text" required placeholder="Ex : Double concentré 400g"
                  value={form.name} onChange={e => set('name', e.target.value)}
                />
                <FieldError msg={errors.name?.[0]} />
              </div>

              {/* Description */}
              <div className="adm-field">
                <label>Description</label>
                <textarea
                  className="adm-textarea" placeholder="Description du produit…"
                  style={{ minHeight: 100 }}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
                <FieldError msg={errors.description?.[0]} />
              </div>

              {/* Prix + Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="adm-field">
                  <label>Prix (FCFA) *</label>
                  <input
                    type="number" required min={1} placeholder="1500"
                    value={form.price} onChange={e => set('price', e.target.value)}
                  />
                  <FieldError msg={errors.price?.[0]} />
                </div>
                <div className="adm-field">
                  <label>Stock *</label>
                  <input
                    type="number" required min={0} placeholder="50"
                    value={form.stock} onChange={e => set('stock', e.target.value)}
                  />
                  <FieldError msg={errors.stock?.[0]} />
                </div>
              </div>

              {/* Poids */}
              <div className="adm-field">
                <label>Poids</label>
                <input
                  type="text" placeholder="Ex : 400g, 2kg, 70g"
                  value={form.weight} onChange={e => set('weight', e.target.value)}
                />
                <FieldError msg={errors.weight?.[0]} />
              </div>

              {/* Actif */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => set('is_active', !form.is_active)}
                  style={{
                    width: 44, height: 24, borderRadius: 999,
                    background: form.is_active ? 'var(--tomato)' : '#D1D5DB',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    transition: 'background 200ms', flexShrink: 0,
                  }}
                  aria-pressed={form.is_active}
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    left: form.is_active ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#fff', transition: 'left 200ms',
                    boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }} />
                </button>
                <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--adm-text)' }}>
                  {form.is_active ? 'Visible dans la boutique' : 'Masqué (inactif)'}
                </span>
              </div>

            </div>
          </div>

          {/* Bouton */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: 8 }} disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} /> Enregistrement…</>
                : <><Save size={16} /> {isEdit ? 'Enregistrer' : 'Créer le produit'}</>
              }
            </button>
            {saveMsg && <span style={{ fontSize: '.84rem', color: '#059669', fontWeight: 600 }}>✓ {saveMsg}</span>}
          </div>
        </form>

        {/* ── Images (mode édition seulement) ── */}
        {isEdit && (
          <div>
            <div className="adm-card">
              <div className="adm-card-head">
                <div className="adm-card-title">Images</div>
                <span style={{ fontSize: '.75rem', color: 'var(--adm-text-mid)' }}>{images.length}/3</span>
              </div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Grille images */}
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {images.map(img => (
                      <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '2px solid', borderColor: img.is_primary ? 'var(--tomato)' : 'var(--adm-border)' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {img.is_primary && (
                          <span style={{ position: 'absolute', top: 5, left: 5, background: 'var(--tomato)', color: '#fff', borderRadius: 'var(--r-full)', padding: '2px 6px', fontSize: '.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={9} fill="#fff" /> Principale
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          disabled={deletingImg === img.id}
                          style={{ position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                          title="Supprimer"
                        >
                          {deletingImg === img.id
                            ? <span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} />
                            : <X size={12} />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--adm-text-mid)' }}>
                    <ImageOff size={32} strokeWidth={1.5} style={{ margin: '0 auto 8px', opacity: .4 }} />
                    <div style={{ fontSize: '.84rem' }}>Aucune image</div>
                  </div>
                )}

                {/* Upload */}
                {images.length < 5 && (
                  <>
                    <input
                      ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }} onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', border: '2px dashed var(--adm-border)', borderRadius: 'var(--r-md)', background: 'var(--adm-bg)', cursor: 'pointer', fontSize: '.84rem', fontWeight: 600, color: 'var(--adm-text-mid)', transition: 'border-color 150ms, color 150ms' }}
                    >
                      {uploading
                        ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--tomato)' }} /> Upload…</>
                        : <><Upload size={15} /> Ajouter une image</>
                      }
                    </button>
                    {uploadErr && <span style={{ fontSize: '.75rem', color: 'var(--tomato)' }}>{uploadErr}</span>}
                    <p style={{ fontSize: '.72rem', color: 'var(--adm-text-mid)', textAlign: 'center', lineHeight: 1.5 }}>
                      JPEG, PNG ou WebP · max 4 Mo<br />La 1ʳᵉ image ajoutée devient la principale
                    </p>
                  </>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
