import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider }      from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import LandingPage           from './pages/LandingPage'
import AuthPage              from './pages/AuthPage'
import HomePage              from './pages/HomePage'
import ProductDetailPage     from './pages/ProductDetailPage'
import CartPage              from './pages/CartPage'
import CheckoutPage          from './pages/CheckoutPage'
import PaymentPage           from './pages/PaymentPage'
import OrdersPage            from './pages/OrdersPage'
import OrderDetailPage       from './pages/OrderDetailPage'
import ProfilePage           from './pages/ProfilePage'
import AddressesPage         from './pages/AddressesPage'

/* ── Garde route client ── */
function ClientRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (isAdmin)          return <Navigate to="/admin/commandes" replace />
  return children
}

/* ── Garde route publique (redirige si déjà connecté) ── */
function PublicRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin/commandes' : '/home'} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ── Publiques ── */}
            <Route path="/"    element={<LandingPage />} />
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

            {/* ── Client protégé ── */}
            <Route path="/home"                          element={<ClientRoute><HomePage /></ClientRoute>} />
            <Route path="/produits/:slug"                element={<ClientRoute><ProductDetailPage /></ClientRoute>} />
            <Route path="/panier"                        element={<ClientRoute><CartPage /></ClientRoute>} />
            <Route path="/commande"                      element={<ClientRoute><CheckoutPage /></ClientRoute>} />
            <Route path="/commande/:number/paiement"     element={<ClientRoute><PaymentPage /></ClientRoute>} />
            <Route path="/mes-commandes"                 element={<ClientRoute><OrdersPage /></ClientRoute>} />
            <Route path="/mes-commandes/:number"         element={<ClientRoute><OrderDetailPage /></ClientRoute>} />
            <Route path="/profil"                        element={<ClientRoute><ProfilePage /></ClientRoute>} />
            <Route path="/profil/adresses"               element={<ClientRoute><AddressesPage /></ClientRoute>} />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
