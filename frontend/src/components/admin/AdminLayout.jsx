import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Package, Users, MapPin,
  LogOut, Menu, X, ChevronRight, ChevronLeft, BookOpen,
} from 'lucide-react'
import { TomatoIcon } from '../TomatoIcon'
import { useAdminAuth } from '../../context/AdminAuthContext'
import '../../styles/globals.css'
import '../../styles/admin.css'

const NAV_ITEMS = [
  { to: '/admin',            label: 'Dashboard',          icon: LayoutDashboard, end: true },
  { to: '/admin/commandes',  label: 'Commandes',           icon: ClipboardList },
  { to: '/admin/produits',   label: 'Produits',            icon: Package },
  { to: '/admin/clients',    label: 'Clients',             icon: Users },
  { to: '/admin/recettes',   label: 'Recettes',            icon: BookOpen },
  { to: '/admin/zones',      label: 'Zones de livraison',  icon: MapPin },
]

function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function AdminLayout({ children, breadcrumb = [] }) {
  // Accept a plain string shorthand: "Clients" → [{ label: 'Clients' }]
  const crumbs = typeof breadcrumb === 'string'
    ? breadcrumb.split('›').map(s => ({ label: s.trim() }))
    : breadcrumb
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('adm_sidebar_collapsed') === 'true')
  const toggleCollapse = () => setCollapsed(c => { const v = !c; localStorage.setItem('adm_sidebar_collapsed', String(v)); return v })

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const fullName = admin
    ? `${admin.first_name ?? ''} ${admin.last_name ?? ''}`.trim() || admin.email
    : ''

  return (
    <div className={`adm-wrap${collapsed ? ' sidebar-collapsed' : ''}`}>

      {/* ── Overlay mobile ── */}
      <div
        className={`adm-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar${open ? ' open' : ''}${collapsed ? ' collapsed' : ''}`}>

        <div className="adm-sidebar-inner">
          <div className="adm-brand">
            <TomatoIcon size={26} />
            <span className="adm-brand-name">Tomat'Chef</span>
            <span className="adm-brand-badge">Admin</span>
          </div>

          <nav className="adm-nav">
            <div className="adm-nav-section">
              <span className="adm-nav-label">Navigation</span>
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} />
                  <span className="adm-nav-text">{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="adm-sidebar-foot">
            <div className="adm-user-row">
              <div className="adm-user-avatar">{initials(fullName)}</div>
              <div className="adm-user-info">
                <div className="adm-user-name">{fullName}</div>
                <div className="adm-user-role">Administrateur</div>
              </div>
            </div>
            <button className="adm-logout-btn" onClick={handleLogout} title={collapsed ? 'Déconnexion' : undefined}>
              <LogOut size={15} /> <span className="adm-logout-text">Déconnexion</span>
            </button>
          </div>
        </div>

        <button
          className="adm-sidebar-toggle"
          onClick={toggleCollapse}
          title={collapsed ? 'Développer' : 'Réduire'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="adm-main">

        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button className="adm-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <nav className="adm-topbar-breadcrumb">
              <Link to="/admin">Admin</Link>
              {crumbs.map((crumb, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ChevronRight size={13} />
                  {i === crumbs.length - 1
                    ? <span className="adm-topbar-current">{crumb.label}</span>
                    : <Link to={crumb.path}>{crumb.label}</Link>
                  }
                </span>
              ))}
            </nav>
          </div>
        </header>

        <main className="adm-content">
          {children}
        </main>
      </div>

    </div>
  )
}
