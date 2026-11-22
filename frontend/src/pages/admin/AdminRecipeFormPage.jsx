import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ChefHat } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../lib/adminApi'

const EMPTY = {
  title: '', subtitle: '', category: 'Africaine', prep_time: '', cook_time: '',
  difficulty: 'Facile', servings: 4, tomato_quantity: '', image: '',
  featured: false, is_published: true,
  ingredients: [{ name: '', amount: '', isTomatoPaste: false }],
  steps: [''],
  chef_notes: '', nutrition_highlight: '',
}

export default function AdminRecipeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState({})

  useEffect(() => {
    if (!isEdit) return
    adminApi.get(`/admin/recipes/${id}`)
      .then(d => { setForm({ ...EMPTY, ...d.data }); setLoading(false) })
      .catch(() => { alert('Recette introuvable'); navigate('/admin/recettes') })
  }, [id])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  // Ingredients
  const setIng = (i, field, value) => setForm(f => ({
    ...f,
    ingredients: f.ingredients.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing)
  }))
  const addIng = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', amount: '', isTomatoPaste: false }] }))
  const removeIng = (i) => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))

  // Steps
  const setStep = (i, value) => setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? value : s) }))
  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ''] }))
  const removeStep = (i) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())              e.title = 'Titre requis'
    if (!form.subtitle.trim())           e.subtitle = 'Sous-titre requis'
    if (!form.prep_time.trim())          e.prep_time = 'Temps de préparation requis'
    if (!form.cook_time.trim())          e.cook_time = 'Temps de cuisson requis'
    if (!form.tomato_quantity.trim())    e.tomato_quantity = 'Quantité de tomate requise'
    if (!form.chef_notes.trim())         e.chef_notes = 'Conseil du chef requis'
    if (!form.nutrition_highlight.trim()) e.nutrition_highlight = 'Atout nutritionnel requis'
    if (form.ingredients.some(i => !i.name.trim() || !i.amount.trim())) e.ingredients = 'Tous les ingrédients doivent avoir un nom et une quantité'
    if (form.steps.some(s => !s.trim())) e.steps = 'Toutes les étapes doivent être remplies'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await adminApi.put(`/admin/recipes/${id}`, form)
      } else {
        await adminApi.post('/admin/recipes', form)
      }
      navigate('/admin/recettes')
    } catch (err) {
      if (err.data?.errors) {
        const e = {}
        Object.entries(err.data.errors).forEach(([k, v]) => { e[k] = v[0] })
        setErrors(e)
      } else {
        alert(err.message ?? 'Erreur lors de la sauvegarde')
      }
    } finally {
      setSaving(false)
    }
  }

  const breadcrumb = [
    { label: 'Recettes', path: '/admin/recettes' },
    { label: isEdit ? 'Modifier' : 'Nouvelle recette' },
  ]

  if (loading) return <AdminLayout breadcrumb={breadcrumb}><div className="adm-loading">Chargement…</div></AdminLayout>

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div className="adm-page-header">
        <h1 className="adm-page-title">{isEdit ? 'Modifier la recette' : 'Nouvelle recette'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="adm-form-grid">

        {/* Colonne gauche */}
        <div className="adm-form-col">

          <div className="adm-card adm-card-padded">
            <h3 className="adm-card-section-title">Informations générales</h3>

            <div className="adm-field">
              <label>Titre *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className={errors.title ? 'error' : ''} />
              {errors.title && <span className="adm-field-error">{errors.title}</span>}
            </div>

            <div className="adm-field">
              <label>Sous-titre *</label>
              <textarea rows={2} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className={errors.subtitle ? 'error' : ''} />
              {errors.subtitle && <span className="adm-field-error">{errors.subtitle}</span>}
            </div>

            <div className="adm-field-row">
              <div className="adm-field">
                <label>Catégorie</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {['Africaine', 'Méditerranéenne', 'Familiale', 'Rapide'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="adm-field">
                <label>Difficulté</label>
                <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                  {['Facile', 'Moyen', 'Expert'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="adm-field-row">
              <div className="adm-field">
                <label>Temps de préparation *</label>
                <input placeholder="ex: 25 min" value={form.prep_time} onChange={e => set('prep_time', e.target.value)} className={errors.prep_time ? 'error' : ''} />
                {errors.prep_time && <span className="adm-field-error">{errors.prep_time}</span>}
              </div>
              <div className="adm-field">
                <label>Temps de cuisson *</label>
                <input placeholder="ex: 1h 15 min" value={form.cook_time} onChange={e => set('cook_time', e.target.value)} className={errors.cook_time ? 'error' : ''} />
                {errors.cook_time && <span className="adm-field-error">{errors.cook_time}</span>}
              </div>
            </div>

            <div className="adm-field-row">
              <div className="adm-field">
                <label>Personnes</label>
                <input type="number" min={1} max={50} value={form.servings} onChange={e => set('servings', Number(e.target.value))} />
              </div>
              <div className="adm-field">
                <label>Quantité de Tomat'Chef *</label>
                <input placeholder="ex: 4 c. à soupe (120g)" value={form.tomato_quantity} onChange={e => set('tomato_quantity', e.target.value)} className={errors.tomato_quantity ? 'error' : ''} />
                {errors.tomato_quantity && <span className="adm-field-error">{errors.tomato_quantity}</span>}
              </div>
            </div>

            <div className="adm-field">
              <label>Image (URL)</label>
              <input placeholder="https://…" value={form.image} onChange={e => set('image', e.target.value)} />
              {form.image && <img src={form.image} alt="aperçu" style={{ marginTop: 8, height: 120, borderRadius: 8, objectFit: 'cover', width: '100%' }} onError={e => e.target.style.display = 'none'} />}
            </div>

            <div className="adm-field-row" style={{ gap: 24 }}>
              <label className="adm-checkbox-label">
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                En vedette
              </label>
              <label className="adm-checkbox-label">
                <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
                Publié
              </label>
            </div>
          </div>

          <div className="adm-card adm-card-padded">
            <h3 className="adm-card-section-title">Notes & Nutrition</h3>
            <div className="adm-field">
              <label>Conseil du Chef *</label>
              <textarea rows={3} value={form.chef_notes} onChange={e => set('chef_notes', e.target.value)} className={errors.chef_notes ? 'error' : ''} />
              {errors.chef_notes && <span className="adm-field-error">{errors.chef_notes}</span>}
            </div>
            <div className="adm-field">
              <label>Atout nutritionnel *</label>
              <textarea rows={3} value={form.nutrition_highlight} onChange={e => set('nutrition_highlight', e.target.value)} className={errors.nutrition_highlight ? 'error' : ''} />
              {errors.nutrition_highlight && <span className="adm-field-error">{errors.nutrition_highlight}</span>}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="adm-form-col">

          <div className="adm-card adm-card-padded">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="adm-card-section-title" style={{ margin: 0 }}>Ingrédients</h3>
              <button type="button" className="adm-btn adm-btn-sm" onClick={addIng}><Plus size={13} /> Ajouter</button>
            </div>
            {errors.ingredients && <span className="adm-field-error" style={{ display: 'block', marginBottom: 10 }}>{errors.ingredients}</span>}
            {form.ingredients.map((ing, i) => (
              <div key={i} className="adm-ing-row">
                <input placeholder="Quantité" value={ing.amount} onChange={e => setIng(i, 'amount', e.target.value)} style={{ width: '30%' }} />
                <input placeholder="Nom de l'ingrédient" value={ing.name} onChange={e => setIng(i, 'name', e.target.value)} style={{ flex: 1 }} />
                <label className="adm-checkbox-label" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={!!ing.isTomatoPaste} onChange={e => setIng(i, 'isTomatoPaste', e.target.checked)} />
                  TC
                </label>
                <button type="button" className="adm-action-btn adm-action-btn-danger" onClick={() => removeIng(i)} disabled={form.ingredients.length <= 1}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="adm-card adm-card-padded">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="adm-card-section-title" style={{ margin: 0 }}>Étapes de préparation</h3>
              <button type="button" className="adm-btn adm-btn-sm" onClick={addStep}><Plus size={13} /> Ajouter</button>
            </div>
            {errors.steps && <span className="adm-field-error" style={{ display: 'block', marginBottom: 10 }}>{errors.steps}</span>}
            {form.steps.map((step, i) => (
              <div key={i} className="adm-step-row">
                <span className="adm-step-num">{i + 1}</span>
                <textarea
                  rows={2}
                  placeholder={`Étape ${i + 1}…`}
                  value={step}
                  onChange={e => setStep(i, e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="adm-action-btn adm-action-btn-danger" onClick={() => removeStep(i)} disabled={form.steps.length <= 1}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

        </div>

        <div className="adm-form-footer">
          <button type="button" className="adm-btn" onClick={() => navigate('/admin/recettes')}>Annuler</button>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
            {saving ? 'Sauvegarde…' : isEdit ? 'Enregistrer les modifications' : 'Créer la recette'}
          </button>
        </div>

      </form>
    </AdminLayout>
  )
}
