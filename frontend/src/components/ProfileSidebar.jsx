import { Link, useNavigate } from 'react-router-dom'
import { User, MapPin, Package, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/profil',          label: 'Mon profil',    icon: User },
  { to: '/profil/adresses', label: 'Mes adresses',  icon: MapPin },
  { to: '/mes-commandes',   label: 'Mes commandes', icon: Package },
]

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

export default function ProfileSidebar({ active }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const displayName = user?.name
    ?? (user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : 'Utilisateur')

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <div className="prf-sidebar">
      <div className="prf-sidebar-head">
        <div className="prf-avatar">{initials(displayName)}</div>
        <div className="prf-sidebar-name">{displayName}</div>
        <div className="prf-sidebar-email">{user?.email ?? ''}</div>
      </div>
      <nav className="prf-nav" aria-label="Navigation profil">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} className={`prf-nav-item${active === item.to ? ' active' : ''}`}>
              <Icon size={16} /> {item.label}
            </Link>
          )
        })}
        <div className="prf-nav-divider" />
        <button className="prf-nav-item" style={{ color: 'var(--tomato)', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }} onClick={handleLogout}>
          <LogOut size={16} /> Déconnexion
        </button>
      </nav>
    </div>
  )
}
