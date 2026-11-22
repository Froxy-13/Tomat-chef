import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, ChefHat } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../lib/adminApi'

const DIFF_COLOR = { Facile: '#22c55e', Moyen: '#f59e0b', Expert: '#ef4444' }

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/recipes')
      .then(d => { setRecipes(d.data ?? []); setLoading(false) })
      .catch(() => { setError('Erreur de chargement'); setLoading(false) })
  }

  useEffect(load, [])

  const togglePublish = async (recipe) => {
    try {
      await adminApi.put(`/admin/recipes/${recipe.id}`, { ...recipe, is_published: !recipe.is_published })
      setRecipes(rs => rs.map(r => r.id === recipe.id ? { ...r, is_published: !r.is_published } : r))
    } catch {
      alert('Erreur lors de la mise à jour.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette recette ?')) return
    setDeleting(id)
    try {
      await adminApi.delete(`/admin/recipes/${id}`)
      setRecipes(rs => rs.filter(r => r.id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout breadcrumb="Recettes">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Recettes</h1>
          <p className="adm-page-sub">{recipes.length} recette{recipes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/recettes/nouveau" className="adm-btn adm-btn-primary">
          <Plus size={16} /> Nouvelle recette
        </Link>
      </div>

      {error && <div className="adm-alert adm-alert-error">{error}</div>}

      {loading ? (
        <div className="adm-loading">Chargement…</div>
      ) : recipes.length === 0 ? (
        <div className="adm-empty">
          <ChefHat size={48} />
          <p>Aucune recette. <Link to="/admin/recettes/nouveau">Créez la première.</Link></p>
        </div>
      ) : (
        <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Recette</th>
                <th>Catégorie</th>
                <th>Difficulté</th>
                <th>Temps</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="adm-rec-thumb">
                        {r.image
                          ? <img src={r.image} alt={r.title} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                          : <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}><ChefHat size={20} /></div>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{r.featured ? '★ En vedette' : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="adm-badge" style={{ background: '#f3f4f6', color: '#374151' }}>{r.category}</span></td>
                  <td><span className="adm-badge" style={{ background: DIFF_COLOR[r.difficulty] + '20', color: DIFF_COLOR[r.difficulty] }}>{r.difficulty}</span></td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{r.prep_time} + {r.cook_time}</td>
                  <td>
                    <span className={`adm-badge ${r.is_published ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                      {r.is_published ? 'Publié' : 'Masqué'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-action-btn" title={r.is_published ? 'Masquer' : 'Publier'} onClick={() => togglePublish(r)}>
                        {r.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <Link to={`/admin/recettes/${r.id}`} className="adm-action-btn" title="Modifier">
                        <Pencil size={15} />
                      </Link>
                      <button
                        className="adm-action-btn adm-action-btn-danger"
                        title="Supprimer"
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
