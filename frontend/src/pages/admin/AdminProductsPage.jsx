import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Package, ImageOff } from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.get(`/admin/products?page=${page}&per_page=15`)
      .then(res => { setProducts(res.data ?? []); setMeta(res.meta ?? null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { load() }, [load])

  const handleDelete = async (product) => {
    if (!confirm(`Supprimer "${product.name}" ?`)) return
    setDeleting(product.id)
    try {
      await adminApi.delete(`/admin/products/${product.id}`)
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, deleted_at: new Date().toISOString() } : p))
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout breadcrumb={[{ label: 'Produits', path: '/admin/produits' }]}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--adm-text)' }}>Produits</h1>
          {meta && <p style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)', marginTop: 2 }}>{meta.total} produit{meta.total !== 1 ? 's' : ''}</p>}
        </div>
        <Link to="/admin/produits/nouveau" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Plus size={16} /> Nouveau produit
        </Link>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-empty"><span className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--tomato)' }} /></div>
        ) : products.length === 0 ? (
          <div className="adm-empty">
            <Package size={40} strokeWidth={1.5} style={{ opacity: .3 }} />
            <div className="adm-empty-title">Aucun produit</div>
            <Link to="/admin/produits/nouveau" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
              <Plus size={14} /> Créer le premier produit
            </Link>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const thumb = p.images?.find(i => i.is_primary) ?? p.images?.[0]
                  const isDeleted = !!p.deleted_at
                  return (
                    <tr key={p.id} style={{ opacity: isDeleted ? .5 : 1 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 'var(--r-md)',
                            background: '#F3F4F6', flexShrink: 0,
                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {thumb
                              ? <img src={thumb.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <ImageOff size={18} style={{ opacity: .3 }} />
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--adm-text)' }}>{p.name}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--adm-text-mid)', marginTop: 1 }}>{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-head)', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(p.price)}</td>
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: '.88rem',
                          color: p.stock === 0 ? '#DC2626' : p.stock < 10 ? '#D97706' : 'var(--adm-text)',
                        }}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        {isDeleted ? (
                          <span className="adm-status cancelled"><span className="adm-status-dot" />Supprimé</span>
                        ) : p.is_active ? (
                          <span className="adm-status confirmed"><span className="adm-status-dot" />Actif</span>
                        ) : (
                          <span className="adm-status pending_payment"><span className="adm-status-dot" />Inactif</span>
                        )}
                      </td>
                      <td>
                        {!isDeleted && (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Link
                              to={`/admin/produits/${p.id}`}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--adm-border)', fontSize: '.8rem', fontWeight: 600, color: 'var(--adm-text-mid)', textDecoration: 'none', transition: 'all 150ms' }}
                            >
                              <Pencil size={14} /> Modifier
                            </Link>
                            <button
                              onClick={() => handleDelete(p)}
                              disabled={deleting === p.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 'var(--r-md)', border: '1px solid rgba(220,38,38,.25)', fontSize: '.8rem', fontWeight: 600, color: '#DC2626', background: 'rgba(220,38,38,.06)', cursor: 'pointer', transition: 'all 150ms' }}
                            >
                              {deleting === p.id
                                ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#DC2626', borderColor: 'rgba(220,38,38,.2)' }} />
                                : <Trash2 size={14} />
                              }
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="adm-pagination">
            <span>{meta.from}–{meta.to} sur {meta.total}</span>
            <div className="adm-page-btns">
              <button className="adm-page-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}><ChevronLeft size={15} /></button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push('…'); acc.push(p); return acc }, [])
                .map((p, i) => p === '…'
                  ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--adm-text-mid)' }}>…</span>
                  : <button key={p} className={`adm-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )}
              <button className="adm-page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= meta.last_page}><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
