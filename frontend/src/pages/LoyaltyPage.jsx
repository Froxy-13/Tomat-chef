import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Star, Check, Gift, Copy, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import ProfileSidebar from '../components/ProfileSidebar'
import '../styles/globals.css'
import '../styles/profile.css'
import '../styles/loyalty.css'

const TIER_ACCENT = ['#d97706', '#059669', '#dc2626']
const fmt = n => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0)

function ProgressBar({ pct }) {
  return (
    <div className="loy-progress-track">
      <div className="loy-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function LoyaltyPage() {
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [budget, setBudget]           = useState(25000)
  const [redeeming, setRedeeming]     = useState(null)
  const [unlockedCode, setUnlockedCode] = useState(null)
  const [copied, setCopied]           = useState(false)
  const [redeemErr, setRedeemErr]     = useState(null)

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
      load()
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

  return (
    <>
      <Navbar />
      <main className="prf-main">
        <div className="page-container">
          <div className="prf-layout">
            <ProfileSidebar active="/profil/fidelite" />

            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <span className="spinner" style={{ borderTopColor: 'var(--tomato)', width: 32, height: 32 }} />
                </div>
              ) : !data ? (
                <motion.div
                  className="prf-card"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                >
                  <p style={{ color: 'var(--fg-muted)', fontSize: '.9rem' }}>
                    Impossible de charger les données de fidélité. Veuillez réessayer.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* ── Carte membre ── */}
                  <motion.div
                    className="prf-card"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .4 }}
                  >
                    <div className="prf-card-header">
                      <div className="prf-card-title"><Award size={18} /> Programme de fidélité</div>
                    </div>

                    <div className="loy-pg-hero">
                      {/* Carte membre plein format */}
                      <div className="loy-member-card loy-pg-card">
                        <div className="loy-card-top">
                          <span className="loy-card-label">Carte Membre Officielle</span>
                          <span className="loy-card-tier-badge">{data.tier.name}</span>
                        </div>
                        <div className="loy-card-points">
                          <span className="loy-card-pts-num">{data.points.toLocaleString('fr-FR')}</span>
                          <span className="loy-card-pts-unit">points Tomat'</span>
                        </div>
                        <ProgressBar pct={data.progress_pct} />
                        <div className="loy-card-progress-labels">
                          <span>Palier actuel : {data.tier.name}</span>
                          <span>
                            {data.next_tier
                              ? `${(data.next_tier.min_points - data.points).toLocaleString('fr-FR')} pts pour ${data.next_tier.name}`
                              : 'Niveau maximum atteint !'
                            }
                          </span>
                        </div>
                        <div className="loy-card-discount">
                          <Star size={13} />
                          <span>Réduction permanente : <strong>-{data.tier.discount_pct}%</strong></span>
                        </div>
                      </div>

                      {/* Infos tier actuel */}
                      <div className="loy-pg-tier-info">
                        <p className="loy-pg-tier-label" style={{ color: TIER_ACCENT[data.tier.level - 1] }}>
                          Niveau {data.tier.level} · {data.tier.name}
                        </p>
                        <p className="loy-pg-tier-discount" style={{ color: TIER_ACCENT[data.tier.level - 1] }}>
                          -{data.tier.discount_pct}%
                        </p>
                        <p className="loy-pg-tier-discount-label">réduction permanente</p>
                        <ul className="loy-tier-benefits" style={{ marginTop: 14 }}>
                          {data.tier.benefits.map((b, i) => (
                            <li key={i}><Check size={13} /><span>{b}</span></li>
                          ))}
                        </ul>
                        {data.next_tier && (
                          <p className="loy-pg-next-tier">
                            Prochain palier : <strong>{data.next_tier.name}</strong> à {data.next_tier.min_points.toLocaleString('fr-FR')} pts
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* ── 3 Paliers ── */}
                  <motion.div
                    className="prf-card"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .4, delay: .07 }}
                  >
                    <div className="prf-card-header">
                      <div className="prf-card-title"><TrendingUp size={18} /> Les paliers</div>
                    </div>
                    <div className="loy-tiers" style={{ marginBottom: 0 }}>
                      {data.tiers.map((t, i) => {
                        const isCurrent = data.tier.level === t.level
                        return (
                          <div key={t.name} className={`loy-tier-card${isCurrent ? ' current' : ''}`}>
                            <div className="loy-tier-head">
                              <span className="loy-tier-level">Niveau {t.level}</span>
                              {isCurrent && <span className="loy-tier-current-badge">Votre palier</span>}
                            </div>
                            <h3 className="loy-tier-name" style={{ color: TIER_ACCENT[i] }}>{t.name}</h3>
                            <p className="loy-tier-min">Dès {t.min_points.toLocaleString('fr-FR')} points</p>
                            <div className="loy-tier-discount">
                              <span className="loy-tier-discount-label">Avantage permanent :</span>
                              <span className="loy-tier-discount-val" style={{ color: TIER_ACCENT[i] }}>-{t.discount_pct}%</span>
                            </div>
                            <ul className="loy-tier-benefits">
                              {t.benefits.map((b, j) => (
                                <li key={j}><Check size={13} /><span>{b}</span></li>
                              ))}
                            </ul>
                            <div className="loy-tier-footer">
                              {t.level === 1 ? 'Accessible immédiatement' : `Débloqué à ${t.min_points.toLocaleString('fr-FR')} pts`}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* ── Simulateur ── */}
                  <motion.div
                    className="prf-card"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .4, delay: .1 }}
                  >
                    <div className="prf-card-header">
                      <div className="prf-card-title"><TrendingUp size={18} /> Simulateur de gain</div>
                    </div>
                    <div className="loy-simulator" style={{ margin: 0, border: 'none', background: 'transparent', padding: '8px 0 0' }}>
                      <div className="loy-sim-left">
                        <p className="loy-sim-sub" style={{ marginBottom: 14 }}>
                          Ajustez le curseur pour simuler vos gains de points et votre économie.
                        </p>
                        <div className="loy-sim-slider-wrap">
                          <div className="loy-sim-slider-header">
                            <span>Panier estimé :</span>
                            <strong>{fmt(budget)}</strong>
                          </div>
                          <input
                            type="range" min={5000} max={100000} step={2500}
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
                          <span className="loy-sim-stat-num" style={{ color: '#d97706' }}>
                            +{Math.floor(budget / 1000) * data.tier.pts_per_1000}
                          </span>
                          <span className="loy-sim-stat-label">Points gagnés</span>
                          <span className="loy-sim-stat-hint">À la livraison</span>
                        </div>
                        <div className="loy-sim-stat">
                          <span className="loy-sim-stat-num" style={{ color: '#059669' }}>
                            {fmt(Math.round(budget * data.tier.discount_pct / 100))}
                          </span>
                          <span className="loy-sim-stat-label">Économie immédiate</span>
                          <span className="loy-sim-stat-hint">Statut {data.tier.name}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Récompenses ── */}
                  <motion.div
                    className="prf-card"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .4, delay: .13 }}
                  >
                    <div className="prf-card-header">
                      <div className="prf-card-title"><Gift size={18} /> Mes récompenses</div>
                      <span className="prf-loyalty-balance">
                        <strong style={{ color: '#d97706' }}>{data.points.toLocaleString('fr-FR')} pts</strong> disponibles
                      </span>
                    </div>

                    {redeemErr && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 600, padding: '10px 14px', borderRadius: 10, marginBottom: 14 }}>
                        {redeemErr}
                      </div>
                    )}

                    <div className="loy-rewards-grid" style={{ marginTop: 4 }}>
                      {data.rewards.map(r => {
                        const canAfford = data.points >= r.points
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
                                  : `Il manque ${(r.points - data.points).toLocaleString('fr-FR')} pts`
                              }
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {unlockedCode && (
                      <div className="loy-unlocked" style={{ marginTop: 20 }}>
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
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
