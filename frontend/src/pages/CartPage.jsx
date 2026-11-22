import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ChevronRight, MapPin, ArrowRight, Package, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getMeta } from '../data/products'
import { fmt } from '../data/products'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import ProductImage from '../components/ProductImage'
import '../styles/globals.css'
import '../styles/cart.css'

/* ── Cart item row ── */
function CartItem({ item, onUpdate, onRemove }) {
  const { product, quantity } = item
  const meta      = getMeta(product.slug) ?? {}
  const lineTotal = product.price * quantity

  return (
    <motion.div
      className={`cart-item ${meta.bg ?? product.bg ?? ''}`}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: .3, ease: [.22, 1, .36, 1] }}
    >
      {/* Image produit */}
      <div className="ci-icon">
        <ProductImage
          images={product.images}
          slug={product.slug}
          iconType={meta.iconType}
          size={52}
          alt={product.name}
        />
      </div>

      {/* Infos */}
      <div className="ci-info">
        <div className="ci-name">{product.name}</div>
        <div className="ci-vol">{product.volume} · {product.format}</div>
        <div className="ci-price-unit">{fmt(product.price)} / unité</div>
      </div>

      {/* Contrôle quantité */}
      <div className="ci-qty-ctrl" role="group" aria-label={`Quantité pour ${product.name}`}>
        <button
          className="ci-qty-btn"
          onClick={() => onUpdate(product.id, quantity - 1)}
          aria-label="Diminuer"
        >
          <Minus size={14} />
        </button>
        <span className="ci-qty-num" aria-live="polite">{quantity}</span>
        <button
          className="ci-qty-btn"
          onClick={() => onUpdate(product.id, quantity + 1)}
          aria-label="Augmenter"
          disabled={quantity >= product.stock}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Total ligne */}
      <div className="ci-total">{fmt(lineTotal)}</div>

      {/* Supprimer */}
      <button
        className="ci-remove"
        onClick={() => onRemove(product.id)}
        aria-label={`Supprimer ${product.name}`}
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  )
}

/* ── Page ── */
export default function CartPage() {
  const { items, count, subtotal, updateItem, removeItem, clearCart } = useCart()
  const [zones, setZones]   = useState([])
  const [zoneId, setZoneId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/delivery-zones').then(res => {
      const list = (Array.isArray(res) ? res : res.data ?? []).filter(z => z.is_active)
      setZones(list)
      if (list.length > 0) setZoneId(list[0].id)
    }).catch(() => {})
  }, [])

  const zone        = zones.find(z => z.id === zoneId)
  const deliveryFee = zone?.fee ?? 0
  const total       = subtotal + deliveryFee

  return (
    <>
      <Navbar currentPage="boutique" />

      <main className="cart-main">
        <div className="page-container">

          {/* ── Header ── */}
          <div className="cart-header">
            <div>
              <h1 className="cart-title">Mon panier</h1>
              <p className="cart-sub">{count > 0 ? `${count} article${count !== 1 ? 's' : ''}` : 'Votre panier est vide'}</p>
            </div>
            {items.length > 0 && (
              <button className="btn btn-ghost btn-sm cart-clear" onClick={clearCart}>
                <Trash2 size={14} /> Vider le panier
              </button>
            )}
          </div>

          {items.length === 0 ? (
            /* ── Empty state ── */
            <motion.div
              className="cart-empty"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .4 }}
            >
              <div className="cart-empty-icon" aria-hidden="true">
                <ShoppingCart size={56} strokeWidth={1.5} color="var(--border)" />
              </div>
              <h2 className="cart-empty-title">Votre panier est vide</h2>
              <p className="cart-empty-sub">Découvrez notre sélection de concentrés de tomate et ajoutez vos produits préférés.</p>
              <Link to="/home" className="btn btn-primary btn-lg">
                <Package size={18} /> Découvrir nos produits
              </Link>
            </motion.div>
          ) : (
            <div className="cart-layout">

              {/* ── Liste articles ── */}
              <section className="cart-items-section" aria-label="Articles du panier">
                <div className="cart-items-header">
                  <span>Produit</span>
                  <span className="cart-items-header-qty">Quantité</span>
                  <span className="cart-items-header-total">Total</span>
                </div>

                <AnimatePresence>
                  {items.map(item => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </AnimatePresence>

                <Link to="/home" className="cart-continue">
                  <ChevronRight size={15} /> Continuer mes achats
                </Link>
              </section>

              {/* ── Résumé commande ── */}
              <aside className="cart-summary" aria-label="Résumé de la commande">
                <div className="cs-title">Résumé</div>

                {/* Zone livraison */}
                <div className="cs-zone-block">
                  <div className="cs-zone-label">
                    <MapPin size={14} aria-hidden="true" />
                    Zone de livraison
                  </div>
                  <div className="cs-zone-select-wrap">
                    <select
                      className="field-input cs-zone-select"
                      value={zoneId ?? ''}
                      onChange={e => setZoneId(Number(e.target.value))}
                      aria-label="Choisir la zone de livraison"
                      disabled={zones.length === 0}
                    >
                      {zones.length === 0 && <option value="">Chargement…</option>}
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>
                          {z.name} — {z.fee === 0 ? 'Gratuit' : fmt(z.fee)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lignes */}
                <div className="cs-lines">
                  <div className="cs-line">
                    <span>Sous-total ({count} article{count !== 1 ? 's' : ''})</span>
                    <motion.span key={subtotal} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {fmt(subtotal)}
                    </motion.span>
                  </div>
                  <div className="cs-line">
                    <span>Livraison — {zone?.name}</span>
                    <motion.span key={deliveryFee} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {fmt(deliveryFee)}
                    </motion.span>
                  </div>
                </div>

                <div className="cs-divider" />

                <div className="cs-total">
                  <span>Total</span>
                  <motion.span
                    key={total}
                    className="cs-total-amount"
                    initial={{ scale: .92, opacity: .6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: .25 }}
                  >
                    {fmt(total)}
                  </motion.span>
                </div>

                <button
                  className="btn btn-primary btn-lg cs-checkout-btn"
                  onClick={() => navigate('/commande')}
                >
                  Passer la commande <ArrowRight size={18} />
                </button>

                <div className="cs-secure">
                  <svg width="12" height="14" fill="none" viewBox="0 0 12 14" aria-hidden="true">
                    <path d="M6 1L1 3v4c0 3 2.5 5.3 5 6 2.5-.7 5-3 5-6V3L6 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                  Paiement 100% sécurisé
                </div>
              </aside>

            </div>
          )}
        </div>
      </main>
    </>
  )
}
