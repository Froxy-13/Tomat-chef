import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserCheck, UserX, ShoppingBag, Wallet, Trash2 } from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function initials(c) {
  const f = c.first_name?.[0] ?? ''
  const l = c.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || c.email[0].toUpperCase()
}

const STATUS_LABEL = {
  pending_payment: 'En attente',
  received:        'Reçue',
  confirmed:       'Confirmée',
  preparing:       'En préparation',
  shipped:         'Expédiée',
  delivered:       'Livrée',
  cancelled:       'Annulée',
  refunded:        'Remboursée',
}

export default function AdminClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    adminApi.get(`/admin/clients/${id}`)
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleToggle = async () => {
    if (!data) return
    setToggling(true)
    try {
      const res = await adminApi.put(`/admin/clients/${id}/toggle`)
      setData(prev => ({ ...prev, user: { ...prev.user, is_active: res.is_active } }))
    } catch {}
    setToggling(false)
  }

  if (loading) return (
    <AdminLayout breadcrumb="Clients › …">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <span className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--tomato)' }} />
      </div>
    </AdminLayout>
  )

  if (!data) return (
    <AdminLayout breadcrumb="Clients › Introuvable">
      <p style={{ color: 'var(--adm-text-mid)' }}>Client introuvable.</p>
    </AdminLayout>
  )

  const { user, orders_count, total_spent, orders } = data

  return (
    <AdminLayout breadcrumb={`Clients › ${[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/admin/clients" className="adm-back-link">
          <ArrowLeft size={16} /> Retour à la liste
        </Link>
      </div>

      <div className="adm-detail-grid" style={{ gridTemplateColumns: '1fr 300px' }}>

        {/* ── Left — Orders ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="adm-card">
            <div className="adm-card-head">
              <h2 className="adm-card-title">Commandes récentes</h2>
            </div>
            {orders.length === 0 ? (
              <div className="adm-card-body">
                <p style={{ color: 'var(--adm-text-mid)', fontSize: '.85rem', margin: 0 }}>Aucune commande.</p>
              </div>
            ) : (
              <div className="adm-table-wrap" style={{ marginTop: 0 }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.number}>
                        <td><span style={{ fontFamily: 'var(--font-head)', color: 'var(--tomato)', fontWeight: 700 }}>#{o.number}</span></td>
                        <td>{fmtDateTime(o.created_at)}</td>
                        <td style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{fmt(o.total)}</td>
                        <td><span className={`adm-status ${o.status}`}>{STATUS_LABEL[o.status] ?? o.status}</span></td>
                        <td>
                          <Link to={`/admin/commandes/${o.number}`} className="adm-action-btn" title="Voir">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Right — Profile + Stats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar card */}
          <div className="adm-card">
            <div className="adm-card-body" style={{ textAlign: 'center' }}>
              <div className="adm-avatar adm-avatar-lg" style={{ margin: '0 auto 16px' }}>
                {initials(user)}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--adm-text)', marginBottom: 4 }}>
                {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)', marginBottom: 4 }}>{user.email}</div>
              {user.phone && <div style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)', marginBottom: 12 }}>{user.phone}</div>}
              <div style={{ fontSize: '.75rem', color: 'var(--adm-text-mid)', marginBottom: 16 }}>
                Inscrit le {fmtDate(user.created_at)}
              </div>
              <span className={`adm-status ${user.is_active ? 'delivered' : 'cancelled'}`}>
                {user.is_active ? 'Actif' : 'Désactivé'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="adm-card">
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(220,38,38,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShoppingBag size={19} color="var(--tomato)" />
                </div>
                <div>
                  <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--adm-text-mid)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Commandes</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--adm-text)', lineHeight: 1 }}>{orders_count}</div>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--adm-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(217,119,6,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wallet size={19} color="#D97706" />
                </div>
                <div>
                  <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--adm-text-mid)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Total dépensé</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--adm-text)', lineHeight: 1 }}>{fmt(total_spent)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle */}
          <button
            className={`btn ${user.is_active ? 'btn-outline-danger' : 'btn-primary'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px' }}
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling
              ? <span className="spinner" style={{ width: 16, height: 16 }} />
              : user.is_active
                ? <><UserX size={16} /> Désactiver le compte</>
                : <><UserCheck size={16} /> Activer le compte</>
            }
          </button>

          {/* Delete */}
          <button
            className="btn-outline-danger"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            disabled={deleting}
            onClick={async () => {
              const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
              if (!window.confirm(`Supprimer définitivement le compte de "${name}" ? Cette action est irréversible.`)) return
              setDeleting(true)
              try {
                await adminApi.delete(`/admin/clients/${id}`)
                navigate('/admin/clients', { replace: true })
              } catch { setDeleting(false) }
            }}
          >
            {deleting
              ? <span className="spinner" style={{ width: 15, height: 15 }} />
              : <Trash2 size={15} />
            }
            {deleting ? 'Suppression…' : 'Supprimer le compte'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
