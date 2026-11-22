import { useState } from 'react'
import { TomatoIcon, JarIcon, BoxIcon } from './TomatoIcon'

const ICON_MAP = { tomato: TomatoIcon, jar: JarIcon, box: BoxIcon }

/**
 * Affiche l'image d'un produit si disponible, sinon l'icône SVG.
 *
 * Priorité :
 *   1. images[primaryIndex].url  (backend API, chargé via with('images'))
 *   2. /images/{slug}.jpg        (fichiers locaux dans frontend/public/images/)
 *   3. Icône SVG                 (fallback garanti)
 */
export default function ProductImage({ images, slug, iconType, size = 72, className = '', alt = '' }) {
  const [failed, setFailed] = useState(false)

  const Icon = ICON_MAP[iconType] ?? TomatoIcon

  // Priorité 1 : URL venant du backend
  const primary = images?.find(i => i.is_primary) ?? images?.[0]
  const apiUrl  = primary?.url ?? null

  // Priorité 2 : fichier local
  const localUrl = slug ? `/images/${slug}.jpg` : null

  const imgUrl = apiUrl ?? localUrl

  if (imgUrl && !failed) {
    return (
      <img
        src={imgUrl}
        alt={alt}
        className={`product-img ${className}`}
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return <Icon size={size} className={className} />
}
