import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

const STATUS_LABEL = {
  all:             'Toutes',
  pending_payment: 'En attente',
  received:        'Reçue',
  confirmed:       'Confirmée',
  preparing:       'En préparation',
  shipped:         'Expédiée',
  delivered:       'Livrée',
  cancelled:       'Annulée',
  refunded:        'Remboursée',
}

const STATUS_TABS = ['all', 'pending_payment', 'received', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']

const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function clientName(user) {
  if (!user) return '—'
  const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
  return name || user.email || '—'
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('all')
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, per_page: 15 })
    if (status !== 'all') params.set('status', status)
    adminApi.get(`/admin/orders?${params}`)
      .then(res => {
        setOrders(res.data ?? [])
        setMeta(res.meta ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, page])

  useEffect(() => { load() }, [load])

  const handleTabChange = (s) => { setStatus(s); setPage(1) }

  const filtered = search
    ? orders.filter(o =>
        o.number?.toLowerCase().includes(search.toLowerCase()) ||
        clientName(o.user)?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <AdminLayout breadcrumb={[{ label: 'Commandes', path: '/admin/commandes' }]}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--adm-text)' }}>
            Commandes
          </h1>
          {meta && (
            <p style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)', marginTop: 2 }}>
              {meta.total} commande{meta.total !== 1 ? 's' : ''} au total
            </p>
          )}
        </div>
        <div style={{ position: 'relative', maxWidth: 280, flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-mid)' }} />
          <input
            type="search"
            placeholder="Numéro ou client…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 12,
              height: 38, border: '1.5px solid var(--adm-border)',
              borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)',
              fontSize: '.88rem', color: 'var(--adm-text)', background: 'var(--adm-card)',
            }}
          />
        </div>
      </div>

      {/* ── Card ── */}
      <div className="adm-card">

        {/* Tabs */}
        <div className="adm-card-head">
          <div className="adm-tabs">
            {STATUS_TABS.map(s => (
              <button key={s} className={`adm-tab${status === s ? ' active' : ''}`} onClick={() => handleTabChange(s)}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="adm-empty">
            <span className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--tomato)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-title">Aucune commande</div>
            <div className="adm-empty-sub">Aucun résultat pour ce filtre.</div>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.number}>
                    <td><span className="adm-table-num">{order.number}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{clientName(order.user)}</div>
                      {order.user?.email && (
                        <div style={{ fontSize: '.75rem', color: 'var(--adm-text-mid)' }}>{order.user.email}</div>
                      )}
                    </td>
                    <td style={{ color: 'var(--adm-text-mid)', whiteSpace: 'nowrap' }}>{fmtDate(order.created_at)}</td>
                    <td style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{fmt(order.total)}</td>
                    <td>
                      <span className={`adm-status ${order.status}`}>
                        <span className="adm-status-dot" />
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/commandes/${order.number}`} className="adm-table-link" title="Voir la commande">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="adm-pagination">
            <span>
              {meta.from}–{meta.to} sur {meta.total}
            </span>
            <div className="adm-page-btns">
              <button className="adm-page-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => p === '…'
                  ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--adm-text-mid)' }}>…</span>
                  : <button key={p} className={`adm-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )
              }
              <button className="adm-page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= meta.last_page}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
