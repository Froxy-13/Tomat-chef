/**
 * TomatoIcon — SVG tomato stylisé
 * Props: size (px), color (remplissage principal), className
 */
export function TomatoIcon({ size = 48, color = '#DC2626', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Feuille */}
      <path
        d="M24 10 C24 10 20 4 14 6 C16 10 20 11 24 10Z"
        fill="#16A34A"
      />
      <path
        d="M24 10 C24 10 28 4 34 6 C32 10 28 11 24 10Z"
        fill="#15803D"
      />
      <path
        d="M24 10 C24 10 24 4 24 2"
        stroke="#166534"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Corps tomate */}
      <circle cx="24" cy="28" r="17" fill={color} />
      {/* Reflet */}
      <ellipse cx="19" cy="21" rx="4" ry="2.5" fill="rgba(255,255,255,.22)" transform="rotate(-20 19 21)" />
      {/* Lignes de section */}
      <path
        d="M24 11 C24 11 24 44 24 44"
        stroke="rgba(0,0,0,.08)"
        strokeWidth="1"
      />
      <path
        d="M7 28 C7 28 41 28 41 28"
        stroke="rgba(0,0,0,.08)"
        strokeWidth="1"
      />
    </svg>
  )
}

/** Variante bocal/conserve */
export function JarIcon({ size = 48, color = '#D97706', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Couvercle */}
      <rect x="13" y="8" width="22" height="6" rx="3" fill="#92400E" />
      <rect x="15" y="11" width="18" height="3" rx="1.5" fill="#B45309" />
      {/* Corps bocal */}
      <path
        d="M12 18 C10 18 8 20 8 24 L8 36 C8 40 10 42 12 42 L36 42 C38 42 40 40 40 36 L40 24 C40 20 38 18 36 18 Z"
        fill={color}
      />
      {/* Contenu (tomate) */}
      <ellipse cx="24" cy="30" rx="11" ry="8" fill="#DC2626" opacity=".9" />
      <ellipse cx="24" cy="30" rx="7" ry="5" fill="#B91C1C" opacity=".6" />
      {/* Reflet verre */}
      <path
        d="M12 20 C12 20 14 18 16 20 L16 40"
        stroke="rgba(255,255,255,.3)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bordure bocal */}
      <path
        d="M12 18 C10 18 8 20 8 24 L8 36 C8 40 10 42 12 42 L36 42 C38 42 40 40 40 36 L40 24 C40 20 38 18 36 18 Z"
        stroke="rgba(0,0,0,.1)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}

/** Variante grand format / pack */
export function BoxIcon({ size = 48, color = '#059669', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Face avant */}
      <rect x="6" y="20" width="36" height="22" rx="2" fill={color} />
      {/* Face dessus */}
      <path d="M6 20 L14 12 L42 12 L42 20 Z" fill="#047857" />
      {/* Rabat haut */}
      <path d="M14 12 L24 16 L24 20 L6 20 Z"  fill="#065F46" />
      <path d="M42 12 L24 16 L24 20 L42 20 Z" fill="#047857" />
      {/* Ruban */}
      <rect x="20" y="20" width="8" height="22" fill="rgba(255,255,255,.2)" rx="1" />
      <path d="M24 12 L24 20" stroke="rgba(255,255,255,.25)" strokeWidth="2" />
      {/* Tomate dessinée */}
      <circle cx="24" cy="31" r="5" fill="#DC2626" opacity=".85" />
      <path d="M24 26 C24 26 22 24 20 25 C21 26 23 26.5 24 26Z" fill="#16A34A" />
    </svg>
  )
}
