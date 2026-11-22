import { useState, useEffect } from 'react'
import ExcelJS from 'exceljs'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, ShoppingBag, Users, Wallet, Package,
  FileDown, ArrowUpRight, ArrowDownRight, Minus,
  ReceiptText, Layers, X, Check, FileSpreadsheet, FileText,
} from 'lucide-react'
import { adminApi } from '../../lib/adminApi'
import AdminLayout from '../../components/admin/AdminLayout'

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)
const fmtShort = n => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)} k`
  return String(n ?? 0)
}
const fmtDT = iso => new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const fmtDate = iso => new Date(iso).toLocaleDateString('fr-SN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const STATUS_LABEL = {
  pending_payment: 'En attente', received: 'Reçue', confirmed: 'Confirmée',
  preparing: 'En prépa.', shipped: 'Expédiée', delivered: 'Livrée',
  cancelled: 'Annulée', refunded: 'Remboursée',
}
const STATUS_COLOR = {
  pending_payment: '#F59E0B', received: '#3B82F6', confirmed: '#6366F1',
  preparing: '#0EA5E9', shipped: '#8B5CF6', delivered: '#10B981',
  cancelled: '#EF4444', refunded: '#6B7280',
}

/* ══════════════════════════════════════════
   EXPORT EXCEL
══════════════════════════════════════════ */
async function buildExcel(data) {
  const { kpis, revenue_by_month, top_products, orders_by_status, recent_orders, clients_by_month } = data
  const dateStr = fmtDate(data.generated_at)
  const month   = new Date(data.generated_at).toISOString().slice(0, 7)

  const wb = new ExcelJS.Workbook()
  wb.creator = "Tomat'Chef Admin"

  const BORDER = {
    top:    { style: 'thin', color: { argb: 'FF000000' } },
    left:   { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right:  { style: 'thin', color: { argb: 'FF000000' } },
  }
  const HDR_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
  const LOGO_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }
  const ALT_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }

  function setupSheet(ws, widths) {
    ws.columns = widths.map(w => ({ width: w }))
    const nc = widths.length
    // Rows 1–2 : logo placeholder
    ws.mergeCells(1, 1, 2, nc)
    const logo = ws.getCell(1, 1)
    logo.value = "[ LOGO TOMAT'CHEF ]"
    logo.font  = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
    logo.fill  = LOGO_FILL
    logo.alignment = { horizontal: 'center', vertical: 'middle' }
    logo.border = BORDER
    ws.getRow(1).height = 22
    ws.getRow(2).height = 22
    // Row 3 : date
    ws.mergeCells(3, 1, 3, nc)
    const dCell = ws.getCell(3, 1)
    dCell.value = `Rapport d'activité — ${dateStr}`
    dCell.font  = { size: 9, italic: true, color: { argb: 'FF374151' } }
    dCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
    dCell.alignment = { horizontal: 'right', vertical: 'middle' }
    dCell.border = BORDER
    ws.getRow(3).height = 15
    ws.getRow(4).height = 6
    return 5 // first data row
  }

  function addHeader(ws, row, labels) {
    labels.forEach((label, i) => {
      const cell = ws.getRow(row).getCell(i + 1)
      cell.value = label
      cell.font  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
      cell.fill  = HDR_FILL
      cell.border = BORDER
      cell.alignment = { horizontal: i === 0 ? 'left' : 'right', vertical: 'middle' }
    })
    ws.getRow(row).height = 18
    return row + 1
  }

  function addData(ws, row, values, alt = false) {
    values.forEach((val, i) => {
      const cell = ws.getRow(row).getCell(i + 1)
      cell.value  = val
      cell.border = BORDER
      if (alt) cell.fill = ALT_FILL
      cell.alignment = { horizontal: i === 0 ? 'left' : 'right', vertical: 'middle' }
    })
    ws.getRow(row).height = 15
    return row + 1
  }

  // ── Feuille 1 : Résumé ──
  const ws1 = wb.addWorksheet('Résumé')
  let r = setupSheet(ws1, [38, 22, 22])
  r = addHeader(ws1, r, ['Indicateur', 'Mois en cours', 'Cumul total'])
  r = addData(ws1, r, ["CA TTC (FCFA)", kpis.revenue_month, kpis.revenue_total])
  r = addData(ws1, r, ["CA HT (FCFA)", kpis.ht_month, kpis.ht_total], true)
  const tvaRow = r
  r = addData(ws1, r, ["TVA collectée 18% (FCFA)", kpis.tva_month, kpis.tva_total])
  ;[1, 2, 3].forEach(c => { ws1.getRow(tvaRow).getCell(c).font = { bold: true, size: 10 } })
  r++
  r = addHeader(ws1, r, ['Indicateur', 'Valeur'])
  ;[
    ["Commandes totales", kpis.orders_total],
    ["Commandes ce mois", kpis.orders_month],
    ["Panier moyen (FCFA)", kpis.avg_order_value],
    ["Clients inscrits", kpis.clients_total],
    ["Nouveaux clients ce mois", kpis.clients_month],
    ["Produits actifs", kpis.products_active],
    ["Valeur du stock (FCFA)", kpis.stock_value],
    ["Évolution CA vs mois préc. (%)", kpis.revenue_growth ?? 'N/A'],
  ].forEach((row, i) => { r = addData(ws1, r, row, i % 2 === 1) })

  // ── Feuille 2 : Évolution mensuelle ──
  const ws2 = wb.addWorksheet('Évolution mensuelle')
  r = setupSheet(ws2, [14, 14, 22, 20, 20])
  r = addHeader(ws2, r, ['Période', 'Commandes', 'CA TTC (FCFA)', 'TVA 18% (FCFA)', 'CA HT (FCFA)'])
  ;(revenue_by_month ?? []).forEach((m, i) => {
    r = addData(ws2, r, [m.label, m.orders, m.revenue, Math.round(m.revenue * 0.18), Math.round(m.revenue / 1.18)], i % 2 === 1)
  })

  // ── Feuille 3 : Top Produits ──
  const ws3 = wb.addWorksheet('Top Produits')
  r = setupSheet(ws3, [6, 32, 18, 20, 20])
  r = addHeader(ws3, r, ['Rang', 'Produit', 'Quantité vendue', 'CA TTC (FCFA)', 'CA HT (FCFA)'])
  ;(top_products ?? []).forEach((p, i) => {
    r = addData(ws3, r, [i + 1, p.name, p.quantity, Math.round(p.revenue), Math.round(p.revenue / 1.18)], i % 2 === 1)
  })

  // ── Feuille 4 : Statuts Commandes ──
  const ws4 = wb.addWorksheet('Statuts Commandes')
  r = setupSheet(ws4, [22, 22, 24])
  r = addHeader(ws4, r, ['Statut (clé)', 'Libellé', 'Nombre'])
  Object.entries(orders_by_status ?? {}).forEach(([s, c], i) => {
    r = addData(ws4, r, [s, STATUS_LABEL[s] ?? s, c], i % 2 === 1)
  })

  // ── Feuille 5 : Commandes Récentes ──
  const ws5 = wb.addWorksheet('Commandes Récentes')
  r = setupSheet(ws5, [26, 26, 18, 22, 22])
  r = addHeader(ws5, r, ['Numéro', 'Client', 'Statut', 'Total TTC (FCFA)', 'Date'])
  ;(recent_orders ?? []).forEach((o, i) => {
    r = addData(ws5, r, [o.number, o.client, STATUS_LABEL[o.status] ?? o.status, o.total, o.created_at], i % 2 === 1)
  })

  // ── Feuille 6 : Clients par Mois ──
  const ws6 = wb.addWorksheet('Clients par Mois')
  r = setupSheet(ws6, [16, 20])
  r = addHeader(ws6, r, ['Période', 'Nouveaux clients'])
  ;(clients_by_month ?? []).forEach((m, i) => {
    r = addData(ws6, r, [m.label, m.count], i % 2 === 1)
  })

  // ── Téléchargement ──
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `tomatchef_rapport_${month}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ══════════════════════════════════════════
   TEMPLATES DE RAPPORT
══════════════════════════════════════════ */
const TEMPLATES = [
  {
    id: 'classique',
    name: 'Classique',
    desc: 'Blanc et noir, style document officiel',
    preview: (
      <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: 10, fontSize: 7, lineHeight: 1.4, fontFamily: 'serif', height: 110, overflow: 'hidden' }}>
        <div style={{ borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 9 }}>TOMAT'CHEF</strong>
          <span style={{ color: '#555' }}>Rapport d'activité</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 6 }}>
          {['CA TTC','CA HT','TVA'].map(l => (
            <div key={l} style={{ border: '1px solid #ccc', padding: '3px 4px' }}>
              <div style={{ color: '#777', fontSize: 6 }}>{l}</div>
              <div style={{ fontWeight: 700, fontSize: 8 }}>— FCFA</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #000', paddingTop: 3 }}>
          <div style={{ fontWeight: 700, fontSize: 7, marginBottom: 3 }}>ÉVOLUTION MENSUELLE</div>
          {['Jan','Fév','Mar'].map(m => <div key={m} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '1px 0' }}><span>{m}</span><span>— FCFA</span></div>)}
        </div>
      </div>
    ),
  },
  {
    id: 'moderne',
    name: 'Moderne',
    desc: 'En-tête coloré, sections visuelles',
    preview: (
      <div style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb', height: 110 }}>
        <div style={{ background: '#DC2626', color: '#fff', padding: '8px 10px' }}>
          <div style={{ fontWeight: 800, fontSize: 9 }}>TOMAT'CHEF</div>
          <div style={{ fontSize: 6, opacity: .8 }}>Rapport d'activité · 2026</div>
        </div>
        <div style={{ padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[['CA TTC','#DC2626'],['CA HT','#D97706'],['Commandes','#2563EB'],['Clients','#059669']].map(([l,c]) => (
            <div key={l} style={{ background: `${c}12`, borderLeft: `3px solid ${c}`, padding: '3px 5px' }}>
              <div style={{ color: c, fontSize: 6, fontWeight: 700 }}>{l}</div>
              <div style={{ fontSize: 8, fontWeight: 800 }}>— FCFA</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'comptable',
    name: 'Comptable',
    desc: 'Format comptabilité, colonnes débit/crédit',
    preview: (
      <div style={{ background: '#FAFAF9', border: '1px solid #d6d3d1', borderRadius: 6, padding: 8, fontFamily: 'monospace', fontSize: 7, height: 110, overflow: 'hidden' }}>
        <div style={{ borderBottom: '2px double #57534e', paddingBottom: 4, marginBottom: 5 }}>
          <strong>TOMAT'CHEF — GRAND LIVRE</strong>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #57534e' }}>
              <th style={{ textAlign: 'left', fontSize: 6 }}>COMPTE</th>
              <th style={{ textAlign: 'right', fontSize: 6 }}>DÉBIT</th>
              <th style={{ textAlign: 'right', fontSize: 6 }}>CRÉDIT</th>
            </tr>
          </thead>
          <tbody>
            {['CA TTC','CA HT','TVA 18%','Stock'].map(l => (
              <tr key={l} style={{ borderBottom: '1px dotted #d6d3d1' }}>
                <td style={{ padding: '1px 0' }}>{l}</td>
                <td style={{ textAlign: 'right' }}>—</td>
                <td style={{ textAlign: 'right' }}>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
]

/* ── Report builders ── */
const BASE_DATA = (data) => {
  const { kpis, top_products = [], orders_by_status = {}, revenue_by_month = [], recent_orders = [] } = data
  const dateStr = fmtDate(data.generated_at)
  const totalRevenue = kpis.revenue_total || 1
  const statusRows = Object.entries(orders_by_status).map(([s, c]) =>
    `<tr><td>${STATUS_LABEL[s] ?? s}</td><td class="r">${c}</td></tr>`).join('')
  const productRows = top_products.map((p, i) => {
    const pct = totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : '0.0'
    const ht  = Math.round(p.revenue / 1.18)
    return `<tr><td><span class="rank">${i + 1}</span> ${p.name}</td><td class="r">${p.quantity}</td><td class="r">${fmt(p.revenue)}</td><td class="r">${fmt(ht)}</td><td class="r">${pct}%</td></tr>`
  }).join('')
  const recentRows = recent_orders.map(o =>
    `<tr><td style="font-weight:600">#${o.number}</td><td>${o.client}</td><td>${STATUS_LABEL[o.status] ?? o.status}</td><td class="r b">${fmt(o.total)}</td><td style="color:#9CA3AF;font-size:9pt">${new Date(o.created_at).toLocaleDateString('fr-SN',{day:'numeric',month:'short',year:'numeric'})}</td></tr>`
  ).join('')
  const monthRows = revenue_by_month.map(m =>
    `<tr><td>${m.label}</td><td class="r">${m.orders}</td><td class="r">${fmt(m.revenue)}</td><td class="r">${fmt(Math.round(m.revenue * 0.18))}</td><td class="r">${fmt(Math.round(m.revenue / 1.18))}</td></tr>`).join('')
  return { kpis, dateStr, statusRows, productRows, recentRows, monthRows, productCount: top_products.length }
}

function buildClassique(data) {
  const { kpis, dateStr, statusRows, productRows, recentRows, monthRows, productCount } = BASE_DATA(data)
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Rapport Classique — Tomat'Chef</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Times New Roman',Times,serif;color:#111;background:#fff;font-size:11pt;padding:40px 56px}
.head{display:flex;justify-content:space-between;border-bottom:3px double #000;padding-bottom:16px;margin-bottom:24px}
.brand{font-size:20pt;font-weight:700;letter-spacing:2px}
.brand small{display:block;font-size:9pt;font-weight:400;letter-spacing:.5px;margin-top:2px}
.meta{text-align:right;font-size:9pt}
h2{font-size:12pt;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #000;padding-bottom:4px;margin:24px 0 12px}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}
.kpi{border:1px solid #999;padding:10px 12px}
.kpi-label{font-size:8pt;text-transform:uppercase;letter-spacing:.5px;color:#555;margin-bottom:4px}
.kpi-value{font-size:16pt;font-weight:700}
.kpi-sub{font-size:8pt;color:#777;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:10pt;margin-bottom:8px}
th{border-top:2px solid #000;border-bottom:1px solid #000;padding:5px 8px;text-align:left;font-size:8pt;text-transform:uppercase;letter-spacing:.5px}
td{padding:6px 8px;border-bottom:1px solid #ddd}
.r{text-align:right}.b{font-weight:700}
.rank{display:inline-block;width:18px;height:18px;border-radius:50%;background:#111;color:#fff;font-size:8pt;font-weight:700;text-align:center;line-height:18px;margin-right:4px}
.note{border:1px solid #ccc;padding:10px 14px;font-size:9pt;color:#555;margin-top:16px;font-style:italic}
.footer{margin-top:48px;border-top:1px solid #000;padding-top:12px;font-size:8pt;color:#777;display:flex;justify-content:space-between}
@media print{body{padding:20px 32px}}
</style></head><body>
<div class="head"><div><div class="brand">TOMAT'CHEF<small>Rapport officiel d'activité</small></div></div><div class="meta">Généré le :<br><strong>${dateStr}</strong></div></div>
<h2>Résumé financier</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-label">CA TTC total</div><div class="kpi-value">${fmtShort(kpis.revenue_total)} FCFA</div><div class="kpi-sub">Depuis le lancement</div></div>
  <div class="kpi"><div class="kpi-label">CA du mois (TTC)</div><div class="kpi-value">${fmtShort(kpis.revenue_month)} FCFA</div><div class="kpi-sub">${kpis.revenue_growth !== null ? (kpis.revenue_growth >= 0 ? '▲' : '▼') + Math.abs(kpis.revenue_growth) + '% vs mois préc.' : 'Données insuffisantes'}</div></div>
  <div class="kpi"><div class="kpi-label">CA HT du mois</div><div class="kpi-value">${fmtShort(kpis.ht_month)} FCFA</div><div class="kpi-sub">TVA : ${fmt(kpis.tva_month)}</div></div>
  <div class="kpi"><div class="kpi-label">Commandes totales</div><div class="kpi-value">${kpis.orders_total}</div><div class="kpi-sub">Ce mois : ${kpis.orders_month}</div></div>
  <div class="kpi"><div class="kpi-label">Panier moyen</div><div class="kpi-value">${fmtShort(kpis.avg_order_value)} FCFA</div></div>
  <div class="kpi"><div class="kpi-label">Clients inscrits</div><div class="kpi-value">${kpis.clients_total}</div><div class="kpi-sub">Ce mois : ${kpis.clients_month}</div></div>
</div>
<h2>Fiscalité & TVA (taux 18%)</h2>
<table><thead><tr><th>Indicateur</th><th class="r">Mois en cours</th><th class="r">Cumul total</th></tr></thead><tbody>
<tr><td>CA TTC</td><td class="r">${fmt(kpis.revenue_month)}</td><td class="r">${fmt(kpis.revenue_total)}</td></tr>
<tr><td>CA HT</td><td class="r">${fmt(kpis.ht_month)}</td><td class="r">${fmt(kpis.ht_total)}</td></tr>
<tr><td><strong>TVA collectée</strong></td><td class="r b">${fmt(kpis.tva_month)}</td><td class="r b">${fmt(kpis.tva_total)}</td></tr>
</tbody></table>
<h2>Produits vendus — Classement (${productCount} produit${productCount > 1 ? 's' : ''})</h2>
<table><thead><tr><th>Produit</th><th class="r">Qté vendue</th><th class="r">CA TTC</th><th class="r">CA HT</th><th class="r">% du CA</th></tr></thead><tbody>${productRows || '<tr><td colspan="5" style="color:#999;text-align:center">Aucune vente enregistrée</td></tr>'}</tbody></table>
<h2>Dernières commandes</h2>
<table><thead><tr><th>Numéro</th><th>Client</th><th>Statut</th><th class="r">Total TTC</th><th>Date</th></tr></thead><tbody>${recentRows || '<tr><td colspan="5" style="color:#999;text-align:center">Aucune commande</td></tr>'}</tbody></table>
<h2>Évolution mensuelle (12 mois)</h2>
<table><thead><tr><th>Mois</th><th class="r">Commandes</th><th class="r">CA TTC</th><th class="r">TVA</th><th class="r">CA HT</th></tr></thead><tbody>${monthRows || '<tr><td colspan="5" style="color:#999;text-align:center;padding:12px">Aucune donnée</td></tr>'}</tbody></table>
<h2>Répartition des commandes</h2>
<table><thead><tr><th>Statut</th><th class="r">Nombre</th></tr></thead><tbody>${statusRows}</tbody></table>
<div class="note">Les montants TVA sont calculés au taux légal sénégalais de 18%. Ces données sont indicatives — consultez votre expert-comptable pour la déclaration fiscale officielle.</div>
<div class="footer"><span>TOMAT'CHEF — Document confidentiel à usage interne</span><span>Généré le ${dateStr}</span></div>
</body></html>`
}

function buildModerne(data) {
  const { kpis, dateStr, statusRows, productRows, recentRows, monthRows, productCount } = BASE_DATA(data)
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Rapport Moderne — Tomat'Chef</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;color:#111827;background:#F9FAFB;font-size:10.5pt}
.page{max-width:800px;margin:0 auto;padding:0 0 48px}
.hero{background:linear-gradient(135deg,#991B1B,#DC2626);color:#fff;padding:32px 48px;display:flex;justify-content:space-between;align-items:flex-start}
.hero-brand{font-size:22pt;font-weight:900;letter-spacing:-1px}
.hero-brand small{display:block;font-size:9pt;font-weight:400;opacity:.8;margin-top:2px}
.hero-meta{text-align:right;font-size:9pt;opacity:.85}
.body{padding:32px 48px}
h2{font-size:11pt;font-weight:800;color:#DC2626;margin:28px 0 14px;display:flex;align-items:center;gap:8px}
h2::before{content:'';display:inline-block;width:4px;height:14px;background:#DC2626;border-radius:2px}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:4px}
.kpi{background:#fff;border-radius:10px;padding:14px 16px;border-left:4px solid var(--c,#DC2626)}
.kpi-label{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6B7280;margin-bottom:4px}
.kpi-value{font-size:15pt;font-weight:800;color:#111827;line-height:1}
.kpi-sub{font-size:7.5pt;color:#9CA3AF;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:10pt;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)}
th{background:#F3F4F6;padding:8px 14px;text-align:left;font-size:7.5pt;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #E5E7EB}
td{padding:9px 14px;border-bottom:1px solid #F9FAFB}
tr:last-child td{border-bottom:none}
.r{text-align:right}.b{font-weight:700;color:#DC2626}
.rank{display:inline-block;width:18px;height:18px;border-radius:50%;background:#DC2626;color:#fff;font-size:7.5pt;font-weight:700;text-align:center;line-height:18px;margin-right:4px}
.note{background:#FEF9C3;border:1px solid #FDE047;border-radius:8px;padding:12px 16px;font-size:9pt;color:#713F12;margin-top:16px}
.footer{margin-top:40px;padding:16px 48px;background:#111827;color:#9CA3AF;font-size:8pt;display:flex;justify-content:space-between}
@media print{.page{max-width:100%}.body{padding:20px 32px}.hero{padding:20px 32px}}
</style></head><body>
<div class="page">
<div class="hero"><div><div class="hero-brand">Tomat'Chef<small>Rapport d'activité</small></div></div><div class="hero-meta">Généré le<br><strong>${dateStr}</strong></div></div>
<div class="body">
<h2>Indicateurs clés</h2>
<div class="kpi-grid">
  <div class="kpi" style="--c:#DC2626"><div class="kpi-label">CA TTC total</div><div class="kpi-value">${fmtShort(kpis.revenue_total)} FCFA</div><div class="kpi-sub">Ce mois : ${fmtShort(kpis.revenue_month)} FCFA</div></div>
  <div class="kpi" style="--c:#D97706"><div class="kpi-label">CA HT du mois</div><div class="kpi-value">${fmtShort(kpis.ht_month)} FCFA</div><div class="kpi-sub">TVA collectée : ${fmt(kpis.tva_month)}</div></div>
  <div class="kpi" style="--c:#2563EB"><div class="kpi-label">Commandes</div><div class="kpi-value">${kpis.orders_total}</div><div class="kpi-sub">Ce mois : ${kpis.orders_month} · Panier moy. ${fmtShort(kpis.avg_order_value)} FCFA</div></div>
  <div class="kpi" style="--c:#059669"><div class="kpi-label">Clients inscrits</div><div class="kpi-value">${kpis.clients_total}</div><div class="kpi-sub">Ce mois : +${kpis.clients_month}</div></div>
  <div class="kpi" style="--c:#7C3AED"><div class="kpi-label">Valeur du stock</div><div class="kpi-value">${fmtShort(kpis.stock_value)} FCFA</div><div class="kpi-sub">${kpis.products_active} produits actifs</div></div>
  <div class="kpi" style="--c:#0891B2"><div class="kpi-label">TVA totale</div><div class="kpi-value">${fmtShort(kpis.tva_total)} FCFA</div><div class="kpi-sub">Taux 18% — Cumul depuis lancement</div></div>
</div>
<h2>Fiscalité & TVA</h2>
<table><thead><tr><th>Indicateur</th><th class="r">Mois en cours</th><th class="r">Cumul total</th></tr></thead><tbody>
<tr><td>CA TTC</td><td class="r">${fmt(kpis.revenue_month)}</td><td class="r">${fmt(kpis.revenue_total)}</td></tr>
<tr><td>CA HT</td><td class="r">${fmt(kpis.ht_month)}</td><td class="r">${fmt(kpis.ht_total)}</td></tr>
<tr><td><strong>TVA collectée (18%)</strong></td><td class="r b">${fmt(kpis.tva_month)}</td><td class="r b">${fmt(kpis.tva_total)}</td></tr>
</tbody></table>
<h2>Évolution sur 12 mois</h2>
<table><thead><tr><th>Mois</th><th class="r">Commandes</th><th class="r">CA TTC</th><th class="r">TVA</th><th class="r">CA HT</th></tr></thead><tbody>${monthRows || '<tr><td colspan="5" style="color:#9CA3AF;text-align:center;padding:12px">Aucune donnée</td></tr>'}</tbody></table>
<h2>Produits vendus — Classement (${productCount} produit${productCount > 1 ? 's' : ''})</h2>
<table><thead><tr><th>Produit</th><th class="r">Qté vendue</th><th class="r">CA TTC</th><th class="r">CA HT</th><th class="r">% du CA</th></tr></thead><tbody>${productRows || '<tr><td colspan="5" style="color:#9CA3AF;text-align:center">Aucune vente enregistrée</td></tr>'}</tbody></table>
<h2>Dernières commandes</h2>
<table><thead><tr><th>Numéro</th><th>Client</th><th>Statut</th><th class="r">Total TTC</th><th>Date</th></tr></thead><tbody>${recentRows || '<tr><td colspan="5" style="color:#9CA3AF;text-align:center">Aucune commande</td></tr>'}</tbody></table>
<h2>Statuts des commandes</h2>
<table><thead><tr><th>Statut</th><th class="r">Nombre</th></tr></thead><tbody>${statusRows}</tbody></table>
<div class="note">⚠ TVA calculée au taux légal sénégalais de 18%. Données indicatives — consultez votre expert-comptable.</div>
</div>
<div class="footer"><span>Tomat'Chef · Document confidentiel</span><span>Généré le ${dateStr}</span></div>
</div></body></html>`
}


function buildComptable(data) {
  const { kpis, dateStr, monthRows, productRows, recentRows, statusRows, productCount } = BASE_DATA(data)
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Grand Livre — Tomat'Chef</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Courier New',Courier,monospace;color:#1C1917;background:#FFFBF5;font-size:10pt;padding:40px 56px}
.head{border-bottom:3px solid #1C1917;padding-bottom:12px;margin-bottom:20px}
.head-top{display:flex;justify-content:space-between}
.company{font-size:14pt;font-weight:700;letter-spacing:2px}
.ref{font-size:8pt;color:#57534E}
hr{border:none;border-top:1px solid #57534E;margin:16px 0}
hr.double{border-top:3px double #1C1917}
h2{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:20px 0 8px;color:#57534E}
table{width:100%;border-collapse:collapse;font-size:9.5pt}
th{text-align:left;padding:5px 8px;border-bottom:2px solid #1C1917;font-size:8pt;text-transform:uppercase;letter-spacing:1px}
td{padding:5px 8px;border-bottom:1px dotted #D6D3D1;font-family:'Courier New',Courier,monospace}
tr:last-child td{border-bottom:1px solid #1C1917}
.r{text-align:right}.b{font-weight:700}.c{text-align:center;color:#57534E}
.rank{display:inline-block;width:16px;height:16px;border-radius:50%;background:#57534E;color:#fff;font-size:7pt;font-weight:700;text-align:center;line-height:16px;margin-right:3px}
.total-row td{border-top:2px solid #1C1917;font-weight:700;background:#FEF3C7}
.note{border:1px solid #D6D3D1;padding:10px;font-size:8.5pt;color:#57534E;margin-top:12px;background:#FAFAF9}
.footer{margin-top:32px;border-top:3px double #1C1917;padding-top:10px;font-size:8pt;color:#57534E;display:flex;justify-content:space-between}
@media print{body{padding:20px 32px}}
</style></head><body>
<div class="head">
  <div class="head-top">
    <div><div class="company">TOMAT'CHEF</div><div class="ref">GRAND LIVRE COMPTABLE · RAPPORT D'ACTIVITÉ</div></div>
    <div style="text-align:right"><div class="ref">Date d'édition :</div><strong>${dateStr}</strong></div>
  </div>
</div>
<h2>Compte de résultat simplifié</h2>
<table>
<thead><tr><th>LIBELLÉ</th><th class="r">DÉBIT (FCFA)</th><th class="r">CRÉDIT (FCFA)</th><th class="r">SOLDE</th></tr></thead>
<tbody>
<tr><td>7000 · Ventes de marchandises (TTC)</td><td class="r">—</td><td class="r">${fmt(kpis.revenue_total)}</td><td class="r b">${fmt(kpis.revenue_total)}</td></tr>
<tr><td>7000 · Ventes du mois (TTC)</td><td class="r">—</td><td class="r">${fmt(kpis.revenue_month)}</td><td class="r">${fmt(kpis.revenue_month)}</td></tr>
<tr><td>7000-HT · Chiffre d'affaires HT total</td><td class="r">—</td><td class="r">${fmt(kpis.ht_total)}</td><td class="r">${fmt(kpis.ht_total)}</td></tr>
<tr><td>4457 · TVA collectée (18%) — total</td><td class="r">${fmt(kpis.tva_total)}</td><td class="r">—</td><td class="r">${fmt(kpis.tva_total)}</td></tr>
<tr><td>4457 · TVA collectée (18%) — mois</td><td class="r">${fmt(kpis.tva_month)}</td><td class="r">—</td><td class="r">${fmt(kpis.tva_month)}</td></tr>
<tr class="total-row"><td>RÉSULTAT BRUT (CA HT mois)</td><td class="r">—</td><td class="r">${fmt(kpis.ht_month)}</td><td class="r b">${fmt(kpis.ht_month)}</td></tr>
</tbody></table>
<hr class="double">
<h2>Évolution du chiffre d'affaires (12 mois)</h2>
<table><thead><tr><th>PÉRIODE</th><th class="r">COMMANDES</th><th class="r">CA TTC</th><th class="r">TVA 18%</th><th class="r">CA HT</th></tr></thead>
<tbody>${monthRows || '<tr><td colspan="5" class="c" style="padding:10px">AUCUNE DONNÉE</td></tr>'}</tbody></table>
<hr>
<h2>Répartition des commandes par statut</h2>
<table><thead><tr><th>STATUT</th><th class="r">NOMBRE</th></tr></thead><tbody>${statusRows}</tbody></table>
<hr>
<h2>Produits vendus — Classement (${productCount} produit${productCount > 1 ? 's' : ''})</h2>
<table><thead><tr><th>DÉSIGNATION</th><th class="r">QUANTITÉ</th><th class="r">CA TTC</th><th class="r">MONTANT HT</th><th class="r">% CA</th></tr></thead>
<tbody>${productRows || '<tr><td colspan="5" class="c" style="padding:10px">AUCUNE DONNÉE</td></tr>'}</tbody></table>
<hr>
<h2>Dernières commandes</h2>
<table><thead><tr><th>NUMÉRO</th><th>CLIENT</th><th>STATUT</th><th class="r">TOTAL TTC</th><th>DATE</th></tr></thead><tbody>${recentRows || '<tr><td colspan="5" class="c" style="padding:10px">AUCUNE COMMANDE</td></tr>'}</tbody></table>
<hr>
<h2>Autres indicateurs</h2>
<table><thead><tr><th>INDICATEUR</th><th class="r">VALEUR</th></tr></thead><tbody>
<tr><td>Nombre total de clients</td><td class="r">${kpis.clients_total}</td></tr>
<tr><td>Nouveaux clients ce mois</td><td class="r">${kpis.clients_month}</td></tr>
<tr><td>Valeur du stock (prix de vente)</td><td class="r">${fmt(kpis.stock_value)}</td></tr>
<tr><td>Panier moyen (toutes commandes)</td><td class="r">${fmt(kpis.avg_order_value)}</td></tr>
<tr><td>Produits actifs au catalogue</td><td class="r">${kpis.products_active}</td></tr>
</tbody></table>
<div class="note">AVERTISSEMENT : Les montants TVA sont calculés au taux légal sénégalais de 18%. Ce document est à usage indicatif. Pour la déclaration fiscale officielle, veuillez vous rapprocher d'un expert-comptable agréé.</div>
<div class="footer"><span>TOMAT'CHEF · Grand Livre · Confidentiel</span><span>Édité le ${dateStr}</span></div>
</body></html>`
}

const BUILDERS = { classique: buildClassique, moderne: buildModerne, comptable: buildComptable }

/* ══════════════════════════════════════════
   COMPOSANTS UI
══════════════════════════════════════════ */
function Growth({ value }) {
  if (value === null || value === undefined) return <span style={{ fontSize: '.72rem', color: 'var(--adm-text-mid)' }}>— vs mois préc.</span>
  const up = value >= 0
  const Icon = value === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '.72rem', fontWeight: 700, color: up ? '#059669' : '#DC2626' }}>
      <Icon size={13} />{Math.abs(value)}% vs mois préc.
    </span>
  )
}

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, sub, growth }) {
  return (
    <div className="adm-card" style={{ padding: 0 }}>
      <div className="adm-card-body" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--adm-text-mid)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.35rem', color: 'var(--adm-text)', lineHeight: 1.1, marginBottom: 5 }}>{value}</div>
          {sub && <div style={{ fontSize: '.73rem', color: 'var(--adm-text-mid)', marginBottom: 3 }}>{sub}</div>}
          {growth !== undefined && <Growth value={growth} />}
        </div>
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.1)', fontSize: '.8rem' }}>
      <div style={{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: '#6B7280' }}>{p.name} :</span>
          <strong style={{ color: '#111827' }}>{p.name === 'Revenus' ? fmt(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

/* ── Export modal (PDF + Excel) ── */
function ExportModal({ onClose, onPdf, onExcel }) {
  const [format, setFormat]   = useState('pdf')   // 'pdf' | 'excel'
  const [selected, setSelected] = useState('moderne')

  const handleConfirm = () => {
    if (format === 'excel') { onExcel(); return }
    onPdf(selected)
  }

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 760, background: 'var(--adm-card)', borderRadius: 'var(--r-xl)', boxShadow: '0 24px 64px rgba(0,0,0,.18)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Head */}
        <div className="adm-modal-head">
          <div>
            <h2 className="adm-card-title"><FileDown size={17} /> Exporter le rapport</h2>
            <p style={{ fontSize: '.78rem', color: 'var(--adm-text-mid)', marginTop: 3 }}>Choisissez le format puis le modèle.</p>
          </div>
          <button className="adm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Format tabs */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 10, borderBottom: '1px solid var(--adm-border)' }}>
          {[
            { id: 'pdf',   icon: FileText,        label: 'PDF — Document imprimable' },
            { id: 'excel', icon: FileSpreadsheet,  label: 'Excel — Tableur (.xlsx)' },
          ].map(f => (
            <button key={f.id} onClick={() => setFormat(f.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', marginBottom: -1,
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '.88rem', fontWeight: 700,
                color: format === f.id ? 'var(--tomato)' : 'var(--adm-text-mid)',
                borderBottom: format === f.id ? '2px solid var(--tomato)' : '2px solid transparent' }}>
              <f.icon size={16} /> {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {format === 'pdf' ? (
          <div className="adm-template-grid">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)}
                style={{ background: 'none', border: `2px solid ${selected === t.id ? 'var(--tomato)' : 'var(--adm-border)'}`,
                  borderRadius: 'var(--r-xl)', cursor: 'pointer', padding: 0, overflow: 'hidden', textAlign: 'left',
                  transition: 'border-color 150ms, box-shadow 150ms',
                  boxShadow: selected === t.id ? '0 0 0 3px rgba(220,38,38,.15)' : 'none' }}>
                <div style={{ padding: '10px 10px 6px' }}>{t.preview}</div>
                <div style={{ padding: '10px 12px 12px', borderTop: `1px solid ${selected === t.id ? 'rgba(220,38,38,.2)' : 'var(--adm-border)'}`,
                  background: selected === t.id ? 'rgba(220,38,38,.03)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--adm-text)' }}>{t.name}</span>
                    {selected === t.id && <Check size={14} color="var(--tomato)" />}
                  </div>
                  <span style={{ fontSize: '.72rem', color: 'var(--adm-text-mid)', lineHeight: 1.3 }}>{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(5,150,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileSpreadsheet size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--adm-text)', marginBottom: 6 }}>Classeur Excel multi-feuilles</div>
                <p style={{ fontSize: '.85rem', color: 'var(--adm-text-mid)', lineHeight: 1.6, marginBottom: 14 }}>
                  Génère un fichier <strong>.xlsx</strong> avec 6 feuilles de calcul structurées, prêt pour analyse dans Excel ou Google Sheets.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['Résumé financier (KPIs, TVA)', 'Évolution mensuelle 12 mois', 'Top 5 produits + CA HT', 'Commandes par statut', 'Dernières commandes', 'Nouveaux clients par mois'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.8rem', color: 'var(--adm-text-mid)' }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: '#059669', flexShrink: 0 }} />
                      <span>Feuille {i + 1} — {s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--adm-border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }} onClick={handleConfirm}>
            {format === 'excel'
              ? <><FileSpreadsheet size={15} /> Télécharger Excel</>
              : <><FileDown size={15} /> Exporter PDF</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState('month')
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/dashboard')
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleExportPdf = (templateId) => {
    if (!data) return
    setShowModal(false)
    const html = BUILDERS[templateId](data)
    const win  = window.open('', '_blank', 'width=940,height=760')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 700)
  }

  const handleExportExcel = async () => {
    if (!data) return
    setShowModal(false)
    await buildExcel(data)
  }

  if (loading) return (
    <AdminLayout breadcrumb="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <span className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--tomato)' }} />
      </div>
    </AdminLayout>
  )

  if (!data) return (
    <AdminLayout breadcrumb="Dashboard">
      <p style={{ color: 'var(--adm-text-mid)' }}>Impossible de charger les données.</p>
    </AdminLayout>
  )

  const { kpis, revenue_by_day, revenue_by_month, clients_by_month, orders_by_status, top_products, recent_orders } = data

  const chartData = (view === 'day' ? revenue_by_day : revenue_by_month).map(d => ({
    name: view === 'day'
      ? new Date(d.date).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' })
      : d.label,
    'Revenus': d.revenue,
    'Commandes': d.orders,
  }))

  const clientsChart = clients_by_month.map(m => ({ name: m.label, 'Clients': m.count }))

  const pieData = Object.entries(orders_by_status ?? {}).map(([status, count]) => ({
    name: STATUS_LABEL[status] ?? status, value: count, color: STATUS_COLOR[status] ?? '#6B7280',
  }))

  const totalOrders = pieData.reduce((s, d) => s + d.value, 0)

  return (
    <AdminLayout breadcrumb="Dashboard">

      {showModal && <ExportModal onClose={() => setShowModal(false)} onPdf={handleExportPdf} onExcel={handleExportExcel} />}

      {/* ── Header ── */}
      <div className="adm-page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="adm-page-title">Tableau de bord</h1>
          <p style={{ fontSize: '.8rem', color: 'var(--adm-text-mid)', marginTop: 3 }}>
            Mise à jour : {new Date(data.generated_at).toLocaleString('fr-SN', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.85rem' }} onClick={() => setShowModal(true)}>
            <FileDown size={14} /> Exporter PDF
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="adm-kpi-grid">
        <KpiCard icon={Wallet}      iconBg="rgba(220,38,38,.1)"  iconColor="var(--tomato)" label="CA TTC du mois"    value={fmt(kpis.revenue_month)}    sub={`Total : ${fmt(kpis.revenue_total)}`}  growth={kpis.revenue_growth} />
        <KpiCard icon={ReceiptText} iconBg="rgba(217,119,6,.1)"  iconColor="#D97706"       label="CA HT du mois"     value={fmt(kpis.ht_month)}         sub={`TVA : ${fmt(kpis.tva_month)}`} />
        <KpiCard icon={ShoppingBag} iconBg="rgba(37,99,235,.1)"  iconColor="#2563EB"       label="Commandes du mois" value={kpis.orders_month}           sub={`Total : ${kpis.orders_total}`} growth={kpis.orders_growth} />
        <KpiCard icon={Users}       iconBg="rgba(5,150,105,.1)"  iconColor="#059669"       label="Clients du mois"   value={kpis.clients_month}          sub={`Total : ${kpis.clients_total} inscrits`} />
        <KpiCard icon={TrendingUp}  iconBg="rgba(124,58,237,.1)" iconColor="#7C3AED"       label="Panier moyen"      value={fmt(kpis.avg_order_value)} />
        <KpiCard icon={Package}     iconBg="rgba(8,145,178,.1)"  iconColor="#0891B2"       label="Valeur du stock"   value={fmt(kpis.stock_value)}       sub={`${kpis.products_active} produits actifs`} />
      </div>

      {/* ── TVA Summary strip ── */}
      <div className="adm-card" style={{ marginBottom: 20 }}>
        <div className="adm-card-body adm-tva-grid">
          {[
            { label: 'CA TTC total', value: fmt(kpis.revenue_total), color: 'var(--tomato)' },
            { label: 'CA HT total',  value: fmt(kpis.ht_total),      color: '#D97706' },
            { label: 'TVA totale',   value: fmt(kpis.tva_total),     color: '#7C3AED' },
            { label: 'TVA du mois',  value: fmt(kpis.tva_month),     color: '#059669' },
          ].map((item, i) => (
            <div key={item.label} style={{ textAlign: 'center', padding: '4px 12px', borderRight: i < 3 ? '1px solid var(--adm-border)' : 'none' }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--adm-text-mid)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.05rem', color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Area Chart ── */}
      <div className="adm-card" style={{ marginBottom: 20 }}>
        <div className="adm-card-head">
          <h2 className="adm-card-title"><TrendingUp size={16} /> Revenus & commandes</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['day','30 jours'],['month','12 mois']].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer',
                  background: view === v ? 'var(--tomato)' : 'none',
                  borderColor: view === v ? 'var(--tomato)' : 'var(--adm-border)',
                  color: view === v ? '#fff' : 'var(--adm-text-mid)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="adm-card-body">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="rev" orientation="left"  tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => fmtShort(v)} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area yAxisId="rev" type="monotone" dataKey="Revenus"   stroke="#DC2626" strokeWidth={2} fill="url(#gRev)" dot={false} activeDot={{ r: 4 }} />
              <Area yAxisId="ord" type="monotone" dataKey="Commandes" stroke="#2563EB" strokeWidth={2} fill="url(#gOrd)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row: Donut + Clients Bar ── */}
      <div className="adm-chart-row">

        <div className="adm-card">
          <div className="adm-card-head"><h2 className="adm-card-title"><Layers size={16} /> Statuts commandes</h2></div>
          <div className="adm-card-body">
            {pieData.length === 0
              ? <p style={{ color: 'var(--adm-text-mid)', fontSize: '.85rem', textAlign: 'center', padding: '32px 0' }}>Aucune commande.</p>
              : <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: '0 0 150px' }}>
                    <ResponsiveContainer width={150} height={150}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [v + ' cmd', '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {pieData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.76rem' }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <span style={{ color: 'var(--adm-text-mid)', flex: 1 }}>{d.name}</span>
                        <strong style={{ color: 'var(--adm-text)' }}>{d.value}</strong>
                        <span style={{ color: 'var(--adm-text-mid)', fontSize: '.68rem' }}>({totalOrders > 0 ? Math.round(d.value / totalOrders * 100) : 0}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
            }
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2 className="adm-card-title"><Users size={16} /> Nouveaux clients</h2></div>
          <div className="adm-card-body">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={clientsChart} margin={{ top: 0, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Clients" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row: Top produits table + bar ── */}
      <div className="adm-chart-row">

        <div className="adm-card">
          <div className="adm-card-head"><h2 className="adm-card-title"><Package size={16} /> Top 5 produits</h2></div>
          {top_products.length === 0
            ? <div className="adm-card-body"><p style={{ color: 'var(--adm-text-mid)', fontSize: '.85rem' }}>Aucune vente.</p></div>
            : <div className="adm-table-wrap" style={{ marginTop: 0 }}>
                <table className="adm-table">
                  <thead><tr><th>Produit</th><th style={{ textAlign: 'right' }}>Qté</th><th style={{ textAlign: 'right' }}>CA</th></tr></thead>
                  <tbody>
                    {top_products.map((p, i) => (
                      <tr key={i}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: `hsl(${i * 60},70%,88%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                          <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{p.name}</span>
                        </div></td>
                        <td style={{ textAlign: 'right', color: 'var(--adm-text-mid)', fontSize: '.85rem' }}>{p.quantity}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--tomato)', fontSize: '.85rem' }}>{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2 className="adm-card-title">CA par produit</h2></div>
          <div className="adm-card-body">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart layout="vertical"
                data={top_products.map(p => ({ name: p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name, 'CA': p.revenue }))}
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => fmtShort(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} width={96} />
                <Tooltip formatter={v => [fmt(v), 'CA']} />
                <Bar dataKey="CA" fill="#DC2626" radius={[0, 4, 4, 0]} maxBarSize={18}
                  label={{ position: 'right', formatter: v => fmtShort(v), fontSize: 10, fill: '#9CA3AF' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Dernières commandes ── */}
      <div className="adm-card">
        <div className="adm-card-head"><h2 className="adm-card-title"><ShoppingBag size={16} /> Dernières commandes</h2></div>
        <div className="adm-table-wrap" style={{ marginTop: 0 }}>
          <table className="adm-table">
            <thead><tr><th>N°</th><th>Client</th><th>Date</th><th style={{ textAlign: 'right' }}>Total</th><th>Statut</th></tr></thead>
            <tbody>
              {recent_orders.length === 0
                ? <tr><td colSpan={5} className="adm-table-empty">Aucune commande.</td></tr>
                : recent_orders.map(o => (
                    <tr key={o.number}>
                      <td><span style={{ fontFamily: 'var(--font-head)', color: 'var(--tomato)', fontWeight: 700 }}>#{o.number}</span></td>
                      <td style={{ fontWeight: 600 }}>{o.client}</td>
                      <td style={{ color: 'var(--adm-text-mid)', fontSize: '.82rem' }}>{fmtDT(o.created_at)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-head)', fontWeight: 700 }}>{fmt(o.total)}</td>
                      <td><span className={`adm-status ${o.status}`}>{STATUS_LABEL[o.status] ?? o.status}</span></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  )
}
