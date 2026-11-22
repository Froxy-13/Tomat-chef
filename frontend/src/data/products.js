/* Métadonnées d'affichage uniquement — les données réelles viennent de l'API */

export const PRODUCT_META = {
  'double-concentre-70g':    { iconType: 'tomato', bg: 'grad-a', badge: null,         volume: '70g',      format: 'Sachet',       conservation: '18 mois', origine: 'Sénégal' },
  'double-concentre-400g':   { iconType: 'jar',    bg: 'grad-b', badge: 'best-seller', volume: '400g',     format: 'Boîte métal',  conservation: '24 mois', origine: 'Sénégal' },
  'double-concentre-2kg':    { iconType: 'box',    bg: 'grad-c', badge: 'promo',       volume: '2,2kg',    format: 'Grand format', conservation: '24 mois', origine: 'Sénégal' },
  'triple-concentre-400g':   { iconType: 'tomato', bg: 'grad-a', badge: 'nouveau',     volume: '400g',     format: 'Premium',      conservation: '24 mois', origine: 'Sénégal' },
  'double-concentre-200g':   { iconType: 'jar',    bg: 'grad-b', badge: null,          volume: '200g',     format: 'Bocal verre',  conservation: '18 mois', origine: 'Sénégal' },
  'pack-famille-6x400g':     { iconType: 'box',    bg: 'grad-c', badge: 'économie',    volume: '6 × 400g', format: 'Économique',   conservation: '24 mois', origine: 'Sénégal' },
}

export const BADGE_MAP = {
  'best-seller': { label: 'Best-seller', cls: 'badge-red' },
  'promo':       { label: 'Promo −10%',  cls: 'badge-gold' },
  'nouveau':     { label: 'Nouveau',     cls: 'badge-green' },
  'économie':    { label: 'Économie',    cls: 'badge-gold' },
}

export const getMeta = (slug) => PRODUCT_META[slug] ?? { iconType: 'tomato', bg: 'grad-a', badge: null, volume: '', format: '', conservation: '', origine: 'Sénégal' }

export const fmt = (n) => Number(n).toLocaleString('fr-SN') + ' F CFA'
