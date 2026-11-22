import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, ChefHat, Flame, ArrowRight, Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import '../styles/recipes.css'

const BASE = 'http://127.0.0.1:8000/api/v1'

const CATEGORIES = ['Toutes', 'Africaine', 'Méditerranéenne', 'Familiale', 'Rapide']

const DIFFICULTY_COLOR = {
  Facile: '#22c55e',
  Moyen:  '#f59e0b',
  Expert: '#ef4444',
}

function DifficultyBadge({ level }) {
  return (
    <span className="rec-badge" style={{ background: DIFFICULTY_COLOR[level] + '22', color: DIFFICULTY_COLOR[level], border: `1px solid ${DIFFICULTY_COLOR[level]}44` }}>
      <Flame size={11} /> {level}
    </span>
  )
}

function RecipeCard({ recipe }) {
  return (
    <Link to={`/recettes/${recipe.slug}`} className="rec-card">
      <div className="rec-card-img">
        {recipe.image
          ? <img src={recipe.image} alt={recipe.title} loading="lazy" />
          : <div className="rec-card-img-placeholder"><ChefHat size={40} /></div>
        }
        {recipe.featured && <span className="rec-featured-tag">★ En vedette</span>}
        <span className="rec-category-tag">{recipe.category}</span>
      </div>
      <div className="rec-card-body">
        <h3 className="rec-card-title">{recipe.title}</h3>
        <p className="rec-card-subtitle">{recipe.subtitle}</p>
        <div className="rec-card-meta">
          <span><Clock size={13} /> {recipe.prep_time}</span>
          <span><Users size={13} /> {recipe.servings} pers.</span>
          <DifficultyBadge level={recipe.difficulty} />
        </div>
        <div className="rec-card-cta">
          Voir la recette <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  )
}

export default function RecipesPage() {
  const [recipes, setRecipes]       = useState([])
  const [category, setCategory]     = useState('Toutes')
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'Toutes') params.set('category', category)
    fetch(`${BASE}/recipes?${params}`)
      .then(r => r.json())
      .then(d => { setRecipes(d.data ?? []); setLoading(false) })
      .catch(() => { setError('Impossible de charger les recettes.'); setLoading(false) })
  }, [category])

  const filtered = recipes.filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="rec-page">
      <Navbar />

      <div className="rec-hero">
        <div className="rec-hero-inner">
          <p className="rec-hero-label">Blog Culinaire</p>
          <h1>Recettes Tomat'Chef</h1>
          <p className="rec-hero-sub">Des plats authentiques sublimés par le concentré de tomate naturel</p>
          <div className="rec-hero-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher une recette…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rec-main">
        <div className="rec-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`rec-filter-btn${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rec-loading">Chargement des recettes…</div>
        ) : error ? (
          <div className="rec-error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="rec-empty">Aucune recette trouvée pour votre recherche.</div>
        ) : (
          <div className="rec-grid">
            {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}
