import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, MapPin, Phone, Truck, CreditCard, AlertCircle } from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

const STATUS_LABEL = {
  pending_payment: 'En attente de paiement',
  received:        'Reçue',
  confirmed:       'Confirmée',
  preparing:       'En préparation',
  shipped:         'Expédiée',
  delivered:       'Livrée',
  cancelled:       'Annulée',
  refunded:        'Remboursée',
}

const TRANSITIONS = {
  received:  ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped:   ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: ['refunded'],
}

const TRANSITION_BTN = {
  confirmed: { label: 'Confirmer la commande', cls: 'confirm' },
  preparing: { label: 'Mettre en préparation', cls: 'prepare' },
  shipped:   { label: 'Marquer expédiée',       cls: 'ship' },
  delivered: { label: 'Marquer livrée',          cls: 'deliver' },
  cancelled: { label: 'Annuler',                 cls: 'cancel' },
  refunded:  { label: 'Rembourser',              cls: 'refund' },
}

const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function clientName(user) {
  if (!user) return '—'
  return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email || '—'
}

export default function AdminOrderDetailPage() {
  const { number } = useParams()

  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [note, setNote]         = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')
  const [updateErr, setUpdateErr] = useState('')

  useEffect(() => {
    adminApi.get(`/admin/orders/${number}`)
      .then(res => setOrder(res.data ?? res))
      .catch(err => { if (err.status === 404) setNotFound(true) })
      .finally(() => setLoading(false))
  }, [number])

  const handleStatus = async (newStatus) => {
    setUpdating(true)
    setUpdateMsg('')
    setUpdateErr('')
    try {
      await adminApi.put(`/admin/orders/${number}/status`, { status: newStatus, note: note || undefined })
      setOrder(o => ({
        ...o,
        status: newStatus,
        status_history: [
          { status: newStatus, note: note || null, author: null, created_at: new Date().toISOString() },
          ...(o.status_history ?? []),
        ],
      }))
      setNote('')
      setUpdateMsg(`Statut mis à jour : ${STATUS_LABEL[newStatus]}`)
    } catch (err) {
      setUpdateErr(err.message ?? 'Erreur lors de la mise à jour.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <AdminLayout breadcrumb={[{ label: 'Commandes', path: '/admin/commandes' }, { label: '…' }]}>
      <div className="adm-empty"><span className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--tomato)' }} /></div>
    </AdminLayout>
  )

  if (notFound || !order) return (
    <AdminLayout breadcrumb={[{ label: 'Commandes', path: '/admin/commandes' }, { label: 'Introuvable' }]}>
      <div className="adm-empty">
        <Package size={48} strokeWidth={1.5} style={{ opacity: .3 }} />
        <div className="adm-empty-title">Commande introuvable</div>
        <Link to="/admin/commandes" className="btn btn-primary" style={{ marginTop: 8 }}>
          Retour aux commandes
        </Link>
      </div>
    </AdminLayout>
  )

  const address  = order.address ?? {}
  const items    = order.items   ?? []
  const zone     = order.delivery_zone ?? {}
  const user     = order.user ?? null
  const history  = order.status_history ?? []
  const allowed  = TRANSITIONS[order.status] ?? []
  const isPendingPayment = order.status === 'pending_payment'

  return (
    <AdminLayout breadcrumb={[
      { label: 'Commandes', path: '/admin/commandes' },
      { label: order.number },
    ]}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--adm-text)' }}>
            {order.number}
          </h1>
          <p style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)', marginTop: 3 }}>
            Passée le {fmtDate(order.created_at)}
          </p>
        </div>
        <span className={`adm-status ${order.status}`} style={{ fontSize: '.82rem', padding: '5px 14px' }}>
          <span className="adm-status-dot" />
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="adm-detail-grid">

        {/* ── Colonne principale ── */}
        <div>

          {/* Articles */}
          <div className="adm-card">
            <div className="adm-card-head">
              <div className="adm-card-title"><Package size={17} /> Articles commandés</div>
              <span style={{ fontSize: '.82rem', color: 'var(--adm-text-mid)' }}>
                {items.reduce((s, i) => s + i.quantity, 0)} article{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            {items.map((item, i) => (
              <div key={i} className="adm-item">
                <div className="adm-item-icon">
                  <Package size={18} color="var(--tomato)" />
                </div>
                <div>
                  <div className="adm-item-name">{item.product_name}</div>
                  <div className="adm-item-qty">{fmt(item.unit_price)} × {item.quantity}</div>
                </div>
                <div className="adm-item-price">{fmt(item.unit_price * item.quantity)}</div>
              </div>
            ))}
            <div className="adm-totals">
              <div className="adm-total-line">
                <span>Sous-total</span><span>{fmt(order.subtotal)}</span>
              </div>
              <div className="adm-total-line">
                <span>Livraison — {zone.name ?? '—'}</span><span>{fmt(order.delivery_fee)}</span>
              </div>
              <div className="adm-total-final">
                <span>Total</span>
                <span className="adm-total-final-amt">{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Client + adresse */}
          <div className="adm-card">
            <div className="adm-card-head">
              <div className="adm-card-title"><MapPin size={17} /> Livraison & client</div>
            </div>
            <div className="adm-card-body">
              <div className="adm-info-rows">
                {user && <>
                  <div className="adm-info-row">
                    <span className="adm-info-label">Client</span>
                    <span className="adm-info-val" style={{ fontWeight: 600 }}>{clientName(user)}</span>
                  </div>
                  <div className="adm-info-row">
                    <span className="adm-info-label">Email</span>
                    <span className="adm-info-val">{user.email}</span>
                  </div>
                </>}
                <div className="adm-info-row">
                  <span className="adm-info-label"><Phone size={13} style={{ display: 'inline' }} /> Téléphone</span>
                  <span className="adm-info-val">{address.phone ?? '—'}</span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label"><MapPin size={13} style={{ display: 'inline' }} /> Quartier</span>
                  <span className="adm-info-val">
                    {address.neighborhood}
                    {address.landmark ? ` — ${address.landmark}` : ''}, {address.city}
                  </span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label"><Truck size={13} style={{ display: 'inline' }} /> Zone</span>
                  <span className="adm-info-val">{zone.name ?? '—'} ({fmt(zone.fee)})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction */}
          {order.transaction && (
            <div className="adm-card">
              <div className="adm-card-head">
                <div className="adm-card-title"><CreditCard size={17} /> Paiement</div>
                <span className={`adm-status ${order.transaction.status === 'accepted' ? 'confirmed' : 'cancelled'}`}>
                  <span className="adm-status-dot" />
                  {order.transaction.status === 'accepted' ? 'Accepté' : 'Refusé'}
                </span>
              </div>
              <div className="adm-card-body">
                <div className="adm-info-rows">
                  <div className="adm-info-row">
                    <span className="adm-info-label">Montant</span>
                    <span className="adm-info-val" style={{ fontWeight: 700 }}>{fmt(order.transaction.amount)}</span>
                  </div>
                  {order.transaction.card_last4 && (
                    <div className="adm-info-row">
                      <span className="adm-info-label">Carte</span>
                      <span className="adm-info-val">•••• •••• •••• {order.transaction.card_last4}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne latérale ── */}
        <div>

          {/* Changer le statut */}
          <div className="adm-card">
            <div className="adm-card-head">
              <div className="adm-card-title">Changer le statut</div>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {isPendingPayment ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '.84rem', color: 'var(--adm-text-mid)' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1, color: '#D97706' }} />
                  Le statut change automatiquement après le paiement du client.
                </div>
              ) : allowed.length === 0 ? (
                <p style={{ fontSize: '.84rem', color: 'var(--adm-text-mid)' }}>
                  Aucune transition possible depuis ce statut.
                </p>
              ) : (
                <>
                  <div>
                    <label className="adm-label">Note (optionnelle)</label>
                    <textarea
                      className="adm-textarea"
                      placeholder="Ex : vérifié par Marie, retard transporteur…"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>
                  <div className="adm-transition-btns">
                    {allowed.map(s => {
                      const btn = TRANSITION_BTN[s]
                      if (!btn) return null
                      return (
                        <button
                          key={s}
                          className={`adm-transition-btn ${btn.cls}`}
                          onClick={() => handleStatus(s)}
                          disabled={updating}
                        >
                          {btn.label}
                        </button>
                      )
                    })}
                  </div>
                  {updateMsg && (
                    <div style={{ fontSize: '.82rem', color: '#059669', fontWeight: 600 }}>✓ {updateMsg}</div>
                  )}
                  {updateErr && (
                    <div style={{ fontSize: '.82rem', color: 'var(--tomato)' }}>{updateErr}</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="adm-card">
            <div className="adm-card-head">
              <div className="adm-card-title">Historique</div>
            </div>
            <div className="adm-card-body">
              {history.length === 0 ? (
                <p style={{ fontSize: '.84rem', color: 'var(--adm-text-mid)' }}>Aucun historique.</p>
              ) : (
                <div className="adm-history">
                  {history.map((h, i) => (
                    <div key={i} className="adm-history-item">
                      <div className={`adm-history-dot${i === 0 ? ' latest' : ''}`} />
                      <div>
                        <div className="adm-history-status">{STATUS_LABEL[h.status] ?? h.status}</div>
                        <div className="adm-history-meta">
                          {new Date(h.created_at).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {h.author ? ` · ${h.author}` : ''}
                        </div>
                        {h.note && <div className="adm-history-note">"{h.note}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
