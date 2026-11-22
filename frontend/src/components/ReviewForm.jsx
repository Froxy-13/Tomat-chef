import { useState } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'

export default function ReviewForm({ orderNumber, onDone }) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)
  const [err, setErr]         = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { setErr('Veuillez choisir une note.'); return }
    setErr(null)
    setSaving(true)
    try {
      await api.post(`/orders/${orderNumber}/review`, { rating, comment: comment.trim() || null })
      setDone(true)
      onDone?.()
    } catch (error) {
      setErr(error.message ?? 'Erreur lors de l\'envoi.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="rvw-success">
        <CheckCircle size={18} />
        <span>Merci pour votre avis !</span>
      </div>
    )
  }

  return (
    <form className="rvw-form" onSubmit={handleSubmit}>
      <p className="rvw-title">Votre avis sur cette commande</p>

      {/* Étoiles */}
      <div className="rvw-stars" role="group" aria-label="Note de 1 à 5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`rvw-star${(hovered || rating) >= n ? ' active' : ''}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            <Star size={22} fill={(hovered || rating) >= n ? 'currentColor' : 'none'} />
          </button>
        ))}
        <span className="rvw-stars-hint">
          {(hovered || rating) === 1 && 'Décevant'}
          {(hovered || rating) === 2 && 'Passable'}
          {(hovered || rating) === 3 && 'Bien'}
          {(hovered || rating) === 4 && 'Très bien'}
          {(hovered || rating) === 5 && 'Excellent !'}
        </span>
      </div>

      {/* Commentaire optionnel */}
      <textarea
        className="rvw-textarea"
        placeholder="Commentaire (optionnel)…"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
      />

      {err && <p className="rvw-err">{err}</p>}

      <button type="submit" className="rvw-submit" disabled={saving}>
        {saving ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : <Send size={14} />}
        {saving ? 'Envoi…' : 'Envoyer mon avis'}
      </button>
    </form>
  )
}
