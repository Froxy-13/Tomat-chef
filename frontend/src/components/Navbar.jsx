import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronDown, User, Package, MapPin, LogOut, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

export default function Navbar({ currentPage = '' }) {
  const { count }                    = useCart()
  const { user, logout, isAdmin }    = useAuth()
  const navigate                     = useNavigate()
  const [menuOpen, setMenuOpen]      = useState(false)
  const [mobileOpen, setMobileOpen]  = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const firstName = user?.first_name ?? user?.name?.split(' ')[0] ?? ''

  return (
    <header className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link to={isAdmin ? '/admin/commandes' : '/'} className="nav-logo">
          <span className="nav-logo-dot" aria-hidden="true" />
          Tomat'chef
        </Link>

        {/* Liens desktop */}
        {!isAdmin && (
          <nav className="nav-links desktop-nav" aria-label="Navigation">
            <Link to="/home"           className={`nav-link${currentPage === 'boutique' ? ' active' : ''}`}>Boutique</Link>
            <Link to="/mes-commandes"  className={`nav-link${currentPage === 'commandes' ? ' active' : ''}`}>Mes commandes</Link>
          </nav>
        )}

        <div className="hp-nav-actions">
          {/* Panier (clients seulement) */}
          {!isAdmin && (
            <Link to="/panier" className="hp-cart-btn" aria-label={`Panier, ${count} article${count !== 1 ? 's' : ''}`}>
              <ShoppingBag size={20} color="#fff" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    className="hp-cart-count"
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    aria-hidden="true"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          {/* Menu utilisateur */}
          {user && (
            <div className="hp-user-wrap">
              <button
                className="hp-user-btn"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu utilisateur"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div className="hp-user-avatar">
                  {initials(user.first_name ? `${user.first_name} ${user.last_name ?? ''}` : (user.name ?? ''))}
                </div>
                <span className="hp-user-name">{firstName}</span>
                <ChevronDown size={14} color="rgba(255,255,255,.8)" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="hp-menu-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                    <motion.div
                      className="hp-user-menu"
                      initial={{ opacity: 0, y: -8, scale: .97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: .97 }}
                      transition={{ duration: .2 }}
                      role="menu"
                    >
                      <div className="hp-menu-header">
                        <div className="hp-menu-name">
                          {user.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : (user.name ?? '')}
                        </div>
                        <div className="hp-menu-email">{user.email}</div>
                      </div>
                      <div className="hp-menu-items">
                        {!isAdmin && (
                          <>
                            <Link to="/profil"          className="hp-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}><User size={15} /> Mon profil</Link>
                            <Link to="/mes-commandes"   className="hp-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}><Package size={15} /> Mes commandes</Link>
                            <Link to="/profil/adresses" className="hp-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}><MapPin size={15} /> Mes adresses</Link>
                          </>
                        )}
                        {isAdmin && (
                          <Link to="/admin/commandes" className="hp-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}><Package size={15} /> Dashboard admin</Link>
                        )}
                        <div className="hp-menu-divider" />
                        <button className="hp-menu-item hp-menu-item-danger" role="menuitem" onClick={handleLogout}>
                          <LogOut size={15} /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile burger */}
          <button
            className="nav-burger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu mobile"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: .25 }}
          >
            {!isAdmin && (
              <>
                <Link to="/home"           className="nav-drawer-link" onClick={() => setMobileOpen(false)}>Boutique</Link>
                <Link to="/mes-commandes"  className="nav-drawer-link" onClick={() => setMobileOpen(false)}>Mes commandes</Link>
                <Link to="/panier"         className="nav-drawer-link" onClick={() => setMobileOpen(false)}>Panier {count > 0 && `(${count})`}</Link>
              </>
            )}
            <button className="nav-drawer-link" style={{ color: 'var(--tomato)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={handleLogout}>
              Déconnexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
