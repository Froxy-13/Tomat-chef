import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, Eye, UserCheck, UserX } from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(c) {
  const f = c.first_name?.[0] ?? ''
  const l = c.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || c.email[0].toUpperCase()
}

export default function AdminClientsPage() {
  const [clients, setClients]   = useState([])
  const [meta, setMeta]         = useState(null)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [query, setQuery]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = useCallback((p, q) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 15 })
    if (q) params.set('search', q)
    adminApi.get(`/admin/clients?${params}`)
      .then(res => { setClients(res.data); setMeta(res.meta) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(page, query) }, [page, query, load])

  const handleSearch = e => {
    e.preventDefault()
    setPage(1); setQuery(search)
  }

  const handleToggle = async (client) => {
    setToggling(client.id)
    try {
      const res = await adminApi.put(`/admin/clients/${client.id}/toggle`)
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, is_active: res.is_active } : c))
    } catch {}
    setToggling(null)
  }

  const totalPages = meta?.last_page ?? 1

  return (
    <AdminLayout breadcrumb="Clients">
      <div className="adm-page-header">
        <h1 className="adm-page-title">Clients</h1>
        <span className="adm-page-count">{meta?.total ?? '—'} clients</span>
      </div>

      {/* Search */}
      <form className="adm-search-row" onSubmit={handleSearch}>
        <div className="adm-search-wrap">
          <Search size={15} className="adm-search-icon" />
          <input
            className="adm-search-input"
            placeholder="Rechercher par nom ou e-mail…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary adm-search-btn" type="submit">Rechercher</button>
      </form>

      {/* Table */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>E-mail</th>
              <th>Téléphone</th>
              <th>Inscrit le</th>
              <th>Statut</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="adm-table-empty">
                <span className="spinner" style={{ width: 24, height: 24, borderTopColor: 'var(--tomato)' }} />
              </td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={6} className="adm-table-empty">Aucun client trouvé.</td></tr>
            ) : clients.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="adm-avatar" aria-hidden="true">{initials(c)}</div>
                    <span className="adm-client-name">
                      {[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}
                    </span>
                  </div>
                </td>
                <td>{c.email}</td>
                <td>{c.phone || '—'}</td>
                <td>{fmtDate(c.created_at)}</td>
                <td>
                  <span className={`adm-status ${c.is_active ? 'delivered' : 'cancelled'}`}>
                    {c.is_active ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Link to={`/admin/clients/${c.id}`} className="adm-action-btn" title="Voir le profil">
                      <Eye size={15} />
                    </Link>
                    <button
                      className={`adm-action-btn ${c.is_active ? 'danger' : 'success'}`}
                      title={c.is_active ? 'Désactiver' : 'Activer'}
                      onClick={() => handleToggle(c)}
                      disabled={toggling === c.id}
                    >
                      {toggling === c.id
                        ? <span className="spinner" style={{ width: 14, height: 14 }} />
                        : c.is_active ? <UserX size={15} /> : <UserCheck size={15} />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="adm-pagination">
          <button className="adm-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
              acc.push(p); return acc
            }, [])
            .map((p, i) => typeof p === 'string'
              ? <span key={`e${i}`} className="adm-page-ellipsis">{p}</span>
              : <button key={p} className={`adm-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            )}
          <button className="adm-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
