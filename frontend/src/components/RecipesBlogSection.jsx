import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen, Clock, Users, ChefHat, Flame, ArrowRight,
  Check, ShoppingBag, Search, X, Sparkles, Leaf,
} from 'lucide-react'
import { TomatoIcon } from './TomatoIcon'
import { useCart } from '../context/CartContext'
import '../styles/recipes-section.css'

import { API_URL as BASE_API } from '../lib/config'

const CATEGORIES = [
  { id: 'all',             label: 'Toutes les Recettes' },
  { id: 'Africaine',       label: "Trésors d'Afrique" },
  { id: 'Méditerranéenne', label: 'Méditerranée & Sauces' },
  { id: 'Familiale',       label: 'Familiale' },
  { id: 'Rapide',          label: 'Rapide' },
]

const DIFF_COLOR = { Facile: '#22c55e', Moyen: '#f59e0b', Expert: '#ef4444' }

export default function RecipesBlogSection({ signatureProduct }) {
  const [recipes, setRecipes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch]     = useState('')
  const [active, setActive]     = useState(null)
  const [checked, setChecked]   = useState({})
  const [toast, setToast]       = useState(false)

  const { addItem } = useCart()

  useEffect(() => {
    fetch(`${BASE_API}/recipes`)
      .then(r => r.json())
      .then(d => { setRecipes(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = recipes.filter(r => {
    const matchCat    = category === 'all' || r.category === category
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const openRecipe = useCallback((recipe) => {
    setActive(null)
    setChecked({})
    fetch(`${BASE_API}/recipes/${recipe.slug}`)
      .then(r => r.json())
      .then(d => setActive(d.data))
      .catch(() => setActive(recipe))
  }, [])

  const toggleIng = (name) => setChecked(c => ({ ...c, [name]: !c[name] }))

  const handleAddToCart = () => {
    if (!signatureProduct) return
    addItem(signatureProduct, 1)
    setToast(true)
    setTimeout(() => setToast(false), 3200)
  }

  if (loading || recipes.length === 0) return null

  return (
    <section className="rbs-section" id="recettes">
      <div className="rbs-wrap">

        {/* ── Header ── */}
        <div className="rbs-header">
          <div>
            <span className="rbs-label">
              <BookOpen size={12} /> Blog Culinaire
            </span>
            <h2 className="rbs-title">Recettes Gourmandes & Inspirations</h2>
            <p className="rbs-sub">
              Du Mafé traditionnel mijoté aux sauces napolitaines — cochez vos ingrédients et cuisinez en direct.
            </p>
          </div>
          <div className="rbs-search-wrap">
            <Search size={14} className="rbs-search-icon" />
            <input
              type="text"
              placeholder="Rechercher une recette…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rbs-search-input"
            />
            {search && (
              <button className="rbs-search-clear" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Filtres ── */}
        <div className="rbs-cats">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`rbs-cat-btn${category === c.id ? ' active' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Grille ── */}
        {filtered.length === 0 ? (
          <p className="rbs-empty">Aucune recette pour cette sélection.</p>
        ) : (
          <div className="rbs-grid">
            {filtered.map(recipe => (
              <article key={recipe.id} className="rbs-card" onClick={() => openRecipe(recipe)}>
                <div className="rbs-card-img">
                  {recipe.image
                    ? <img src={recipe.image} alt={recipe.title} loading="lazy" />
                    : <div className="rbs-card-no-img"><ChefHat size={48} /></div>
                  }
                  <div className="rbs-card-overlay" />
                  <span className="rbs-card-cat">{recipe.category}</span>
                  <div className="rbs-card-bottom">
                    <div className="rbs-card-meta-row">
                      <span><Clock size={12} /> {recipe.cook_time}</span>
                      <span><Users size={12} /> {recipe.servings} pers.</span>
                      <span className="rbs-tomato-qty">
                        <TomatoIcon size={13} color="#fca5a5" /> {recipe.tomato_quantity}
                      </span>
                    </div>
                    <h3 className="rbs-card-title">{recipe.title}</h3>
                  </div>
                </div>
                <div className="rbs-card-body">
                  <p className="rbs-card-sub">{recipe.subtitle}</p>
                  <div className="rbs-card-foot">
                    <span
                      className="rbs-diff-badge"
                      style={{ background: DIFF_COLOR[recipe.difficulty] + '20', color: DIFF_COLOR[recipe.difficulty] }}
                    >
                      <Flame size={11} /> {recipe.difficulty}
                    </span>
                    <span className="rbs-card-cta">
                      Voir la fiche <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal recette ── */}
      {active && (
        <div className="rbs-modal-backdrop" onClick={() => setActive(null)}>
          <div className="rbs-modal" onClick={e => e.stopPropagation()}>

            <button className="rbs-modal-close" onClick={() => setActive(null)} aria-label="Fermer">
              <X size={16} />
            </button>

            {/* Toast ajout panier */}
            {toast && (
              <div className="rbs-toast">
                <Check size={14} /> Bouteille Signature 750g ajoutée au panier
              </div>
            )}

            {/* En-tête */}
            <div className="rbs-modal-head">
              <div className="rbs-modal-badges">
                <span className="rbs-modal-cat">{active.category}</span>
                <span
                  className="rbs-modal-diff"
                  style={{ color: DIFF_COLOR[active.difficulty] }}
                >
                  <Flame size={11} /> {active.difficulty}
                </span>
              </div>
              <h2 className="rbs-modal-title">{active.title}</h2>
              <p className="rbs-modal-subtitle">{active.subtitle}</p>
              <div className="rbs-modal-meta">
                <span><Clock size={13} /> Prépa&nbsp;: <strong>{active.prep_time}</strong></span>
                <span><Clock size={13} /> Cuisson&nbsp;: <strong>{active.cook_time}</strong></span>
                <span><Users size={13} /> <strong>{active.servings}</strong> convives</span>
                <span className="rbs-tomato-meta">
                  <TomatoIcon size={14} color="#dc2626" /> {active.tomato_quantity}
                </span>
              </div>
            </div>

            <div className="rbs-modal-body">
              {/* Colonne gauche : ingrédients */}
              <div className="rbs-modal-col">
                <h3 className="rbs-modal-section-title">
                  <Leaf size={14} /> Ingrédients
                  <span className="rbs-modal-section-hint">— Cochez ce que vous avez déjà</span>
                </h3>
                <ul className="rbs-ings">
                  {(active.ingredients ?? []).map((ing, i) => {
                    const isChecked = !!checked[ing.name]
                    return (
                      <li
                        key={i}
                        className={`rbs-ing${ing.isTomatoPaste ? ' tc' : ''}${isChecked ? ' checked' : ''}`}
                        onClick={() => !ing.isTomatoPaste && toggleIng(ing.name)}
                      >
                        <div className="rbs-ing-left">
                          {ing.isTomatoPaste
                            ? <TomatoIcon size={14} color="#dc2626" />
                            : (
                              <span className={`rbs-ing-check${isChecked ? ' on' : ''}`}>
                                {isChecked && <Check size={10} />}
                              </span>
                            )
                          }
                          <span className="rbs-ing-name">{ing.name}</span>
                        </div>
                        <span className="rbs-ing-qty">{ing.amount}</span>
                      </li>
                    )
                  })}
                </ul>

                {/* CTA panier */}
                {signatureProduct && (
                  <div className="rbs-cart-cta">
                    <div className="rbs-cart-cta-info">
                      <TomatoIcon size={16} color="#dc2626" />
                      <div>
                        <strong>Pas encore de Tomat'Chef ?</strong>
                        <span>Ajoutez la Bouteille Signature 750g</span>
                      </div>
                    </div>
                    <button className="rbs-cart-cta-btn" onClick={handleAddToCart}>
                      <ShoppingBag size={14} /> Ajouter au panier
                    </button>
                  </div>
                )}
              </div>

              {/* Colonne droite : étapes */}
              <div className="rbs-modal-col">
                <h3 className="rbs-modal-section-title">
                  <ChefHat size={14} /> Préparation étape par étape
                </h3>
                <ol className="rbs-steps">
                  {(active.steps ?? []).map((step, i) => (
                    <li key={i} className="rbs-step">
                      <span className="rbs-step-num">{i + 1}</span>
                      <p className="rbs-step-text">{step}</p>
                    </li>
                  ))}
                </ol>

                {/* Conseil du chef */}
                <div className="rbs-chef-note">
                  <div className="rbs-chef-note-title">
                    <Sparkles size={13} /> Conseil du Chef
                  </div>
                  <p>{active.chef_notes}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  )
}
