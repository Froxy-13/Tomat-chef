import { useState } from 'react'
import { TomatoIcon, JarIcon, BoxIcon } from './TomatoIcon'

const ICON_MAP = { tomato: TomatoIcon, jar: JarIcon, box: BoxIcon }

export default function ProductImage({ images, iconType, size = 72, className = '', alt = '' }) {
  const [failed, setFailed] = useState(false)

  const Icon = ICON_MAP[iconType] ?? TomatoIcon

  const primary = images?.find(i => i.is_primary) ?? images?.[0]
  const imgUrl  = primary?.url ?? null

  if (imgUrl && !failed) {
    return (
      <img
        src={imgUrl}
        alt={alt}
        className={`product-img ${className}`}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return <Icon size={size} className={className} />
}
