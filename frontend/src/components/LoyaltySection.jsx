import { useState, useEffect } from 'react'
import { Award, Check, Gift, Copy, ChevronRight, Sparkles, Star, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'
import '../styles/loyalty.css'

const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

const TIER_ACCENT = ['#d97706', '#059669', '#dc2626']

function ProgressBar({ pct }) {
  return (
    <div className="loy-progress-track">
      <div className="loy-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function LoyaltySection() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [budget, setBudget]       = useState(25000)
  const [redeeming, setRedeeming] = useState(null)
  const [unlockedCode, setUnlockedCode] = useState(null)
  const [copied, setCopied]       = useState(false)
  const [redeemErr, setRedeemErr] = useState(null)

  const load = () => {
    api.get('/loyalty')
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(load, [])

  const handleRedeem = async (reward) => {
    setRedeemErr(null)
    setRedeeming(reward.id)
    try {
      const res = await api.post('/loyalty/redeem', { reward_id: reward.id })
      setUnlockedCode({ code: res.code, title: reward.title })
      load() // refresh points
    } catch (err) {
      setRedeemErr(err.message ?? 'Erreur lors de l\'échange.')
    } finally {
      setRedeeming(null)
    }
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading || !data) return null

  const { points, tier, next_tier, progress_pct, tiers, rewards } = data
  const ptsForCalc    = Math.floor(budget / 1000) * tier.pts_per_1000
  const saving        = Math.round(budget * tier.discount_pct / 100)

  return (
    <section className="loy-section" id="fidelite">
      <div className="loy-wrap">

        {/* ── Header + carte membre ── */}
        <div className="loy-header">
          <div>
            <span className="loy-label">
              <Award size={12} /> Programme de Récompenses
            </span>
            <h2 className="loy-title">Le Club Tomat'Chef</h2>
            <p className="loy-sub">
              Chaque achat vous rapproche de cadeaux exclusifs, de réductions permanentes et d'invitations à des masterclasses culinaires.
            </p>
          </div>

          {/* Carte membre */}
          <div className="loy-member-card">
            <div className="loy-card-top">
              <span className="loy-card-label">Carte Membre Officielle</span>
              <span className="loy-card-tier-badge">{tier.name}</span>
            </div>
            <div className="loy-card-points">
              <span className="loy-card-pts-num">{points.toLocaleString('fr-FR')}</span>
              <span className="loy-card-pts-unit">points Tomat'</span>
            </div>
            <ProgressBar pct={progress_pct} />
            <div className="loy-card-progress-labels">
              <span>Palier actuel : {tier.name}</span>
              <span>
                {next_tier
                  ? `${(next_tier.min_points - points).toLocaleString('fr-FR')} pts pour ${next_tier.name}`
                  : 'Niveau maximum atteint !'
                }
              </span>
            </div>
            <div className="loy-card-discount">
              <Star size={13} />
              <span>Réduction permanente : <strong>-{tier.discount_pct}%</strong></span>
            </div>
          </div>
        </div>

        {/* ── 3 Paliers ── */}
        <div className="loy-tiers">
          {tiers.map((t, i) => {
            const isCurrent = tier.level === t.level
            return (
              <div key={t.name} className={`loy-tier-card${isCurrent ? ' current' : ''}`}>
                <div className="loy-tier-head">
                  <span className="loy-tier-level">Niveau {t.level}</span>
                  {isCurrent && <span className="loy-tier-current-badge">Votre palier</span>}
                </div>
                <h3 className="loy-tier-name" style={{ color: TIER_ACCENT[i] }}>{t.name}</h3>
                <p className="loy-tier-min">Dès {t.min_points.toLocaleString('fr-FR')} points cumulés</p>
                <div className="loy-tier-discount">
                  <span className="loy-tier-discount-label">Avantage permanent :</span>
                  <span className="loy-tier-discount-val" style={{ color: TIER_ACCENT[i] }}>-{t.discount_pct}%</span>
                </div>
                <ul className="loy-tier-benefits">
                  {t.benefits.map((b, j) => (
                    <li key={j}><Check size={13} /> <span>{b}</span></li>
                  ))}
                </ul>
                <div className="loy-tier-footer">
                  {t.level === 1
                    ? 'Accessible immédiatement'
                    : `Débloqué à ${t.min_points.toLocaleString('fr-FR')} points`
                  }
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Simulateur ── */}
        <div className="loy-simulator">
          <div className="loy-sim-left">
            <span className="loy-sim-label"><TrendingUp size={13} /> Simulateur de Gain</span>
            <h3 className="loy-sim-title">Calculez vos points selon vos courses</h3>
            <p className="loy-sim-sub">
              Ajustez le curseur pour simuler vos gains de points et votre économie sur votre prochaine commande.
            </p>
            <div className="loy-sim-slider-wrap">
              <div className="loy-sim-slider-header">
                <span>Panier estimé :</span>
                <strong>{fmt(budget)}</strong>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={2500}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="loy-slider"
              />
              <div className="loy-sim-slider-ticks">
                <span>{fmt(5000)}</span>
                <span>{fmt(50000)}</span>
                <span>{fmt(100000)}</span>
              </div>
            </div>
          </div>
          <div className="loy-sim-right">
            <div className="loy-sim-stat">
              <span className="loy-sim-stat-num" style={{ color: '#d97706' }}>+{ptsForCalc}</span>
              <span className="loy-sim-stat-label">Points gagnés</span>
              <span className="loy-sim-stat-hint">Crédités à la livraison</span>
            </div>
            <div className="loy-sim-stat">
              <span className="loy-sim-stat-num" style={{ color: '#059669' }}>{fmt(saving)}</span>
              <span className="loy-sim-stat-label">Économie immédiate</span>
              <span className="loy-sim-stat-hint">Grâce à votre statut {tier.name}</span>
            </div>
          </div>
        </div>

        {/* ── Catalogue récompenses ── */}
        <div className="loy-rewards-head">
          <div>
            <h3 className="loy-rewards-title">Catalogue des Récompenses</h3>
            <p className="loy-rewards-sub">Échangez vos points contre un code promo applicable directement au panier.</p>
          </div>
          <span className="loy-rewards-balance">
            Solde disponible : <strong>{points.toLocaleString('fr-FR')} pts</strong>
          </span>
        </div>

        {redeemErr && <div className="loy-err">{redeemErr}</div>}

        <div className="loy-rewards-grid">
          {rewards.map(r => {
            const canAfford = points >= r.points
            return (
              <div key={r.id} className={`loy-reward-card${canAfford ? ' affordable' : ''}`}>
                <div className="loy-reward-top">
                  <span className="loy-reward-pts">{r.points} pts</span>
                  <Gift size={16} className="loy-reward-icon" />
                </div>
                <h4 className="loy-reward-title">{r.title}</h4>
                <p className="loy-reward-desc">{r.description}</p>
                <button
                  className={`loy-reward-btn${canAfford ? ' active' : ''}`}
                  onClick={() => canAfford && handleRedeem(r)}
                  disabled={!canAfford || redeeming === r.id}
                >
                  {redeeming === r.id
                    ? 'Échange en cours…'
                    : canAfford
                      ? 'Débloquer la récompense'
                      : `Il manque ${(r.points - points).toLocaleString('fr-FR')} pts`
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Code débloqué */}
        {unlockedCode && (
          <div className="loy-unlocked">
            <div className="loy-unlocked-left">
              <span className="loy-unlocked-check"><Check size={16} /></span>
              <div>
                <strong>Récompense débloquée !</strong>
                <span>Code promo : <code className="loy-code">{unlockedCode.code}</code> — valable au paiement</span>
              </div>
            </div>
            <button className="loy-copy-btn" onClick={() => handleCopy(unlockedCode.code)}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier le code'}
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
