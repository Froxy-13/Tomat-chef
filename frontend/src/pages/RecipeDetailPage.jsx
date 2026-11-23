import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Users, ChefHat, Flame, CheckCircle2, ArrowLeft, Leaf } from 'lucide-react'
import Navbar from '../components/Navbar'
import '../styles/recipes.css'

import { API_URL as BASE } from '../lib/config'

const DIFFICULTY_COLOR = {
  Facile: '#22c55e',
  Moyen:  '#f59e0b',
  Expert: '#ef4444',
}

export default function RecipeDetailPage() {
  const { slug } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${BASE}/recipes/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setRecipe(d.data); setLoading(false) })
      .catch(() => { setError('Recette introuvable.'); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="rec-page"><Navbar /><div className="rec-loading" style={{ marginTop: 100 }}>Chargement…</div></div>
  )
  if (error || !recipe) return (
    <div className="rec-page">
      <Navbar />
      <div className="rec-error" style={{ marginTop: 100 }}>
        {error ?? 'Recette introuvable.'}{' '}
        <Link to="/recettes" style={{ color: '#dc2626' }}>Retour aux recettes</Link>
      </div>
    </div>
  )

  const col = DIFFICULTY_COLOR[recipe.difficulty]

  return (
    <div className="rec-page">
      <Navbar />

      <div className="rcd-hero" style={{ backgroundImage: recipe.image ? `url(${recipe.image})` : 'none' }}>
        {!recipe.image && <div className="rcd-hero-placeholder"><ChefHat size={80} /></div>}
        <div className="rcd-hero-overlay">
          <div className="rcd-hero-inner">
            <Link to="/recettes" className="rcd-back"><ArrowLeft size={16} /> Toutes les recettes</Link>
            <span className="rcd-category">{recipe.category}</span>
            <h1 className="rcd-title">{recipe.title}</h1>
            <p className="rcd-subtitle">{recipe.subtitle}</p>
            <div className="rcd-meta">
              <span><Clock size={15} /> Prép : {recipe.prep_time}</span>
              <span><Clock size={15} /> Cuisson : {recipe.cook_time}</span>
              <span><Users size={15} /> {recipe.servings} personnes</span>
              <span style={{ color: col, border: `1px solid ${col}44`, background: col + '22' }}>
                <Flame size={14} /> {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rcd-body">
        <div className="rcd-left">

          <section className="rcd-section">
            <h2>Ingrédients</h2>
            <p className="rcd-tomato-qty">🍅 {recipe.tomato_quantity}</p>
            <ul className="rcd-ingredients">
              {(recipe.ingredients ?? []).map((ing, i) => (
                <li key={i} className={ing.isTomatoPaste ? 'tc-highlight' : ''}>
                  <span className="ing-amount">{ing.amount}</span>
                  <span className="ing-name">
                    {ing.isTomatoPaste && <Leaf size={13} style={{ color: '#dc2626', marginRight: 4 }} />}
                    {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rcd-section rcd-nutrition">
            <h3>🌿 Atout nutritionnel</h3>
            <p>{recipe.nutrition_highlight}</p>
          </section>

        </div>

        <div className="rcd-right">

          <section className="rcd-section">
            <h2>Préparation</h2>
            <ol className="rcd-steps">
              {(recipe.steps ?? []).map((step, i) => (
                <li key={i}>
                  <span className="step-num">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rcd-section rcd-chef-notes">
            <h3><CheckCircle2 size={18} /> Conseil du Chef</h3>
            <p>{recipe.chef_notes}</p>
          </section>

        </div>
      </div>

      <div className="rcd-footer-cta">
        <Link to="/home" className="btn-primary">Commander Tomat'Chef</Link>
        <Link to="/recettes" className="btn-outline">Voir d'autres recettes</Link>
      </div>
    </div>
  )
}
