import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider }      from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'

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
import LoyaltyPage           from './pages/LoyaltyPage'
import AdminLoginPage        from './pages/admin/AdminLoginPage'
import AdminOrdersPage       from './pages/admin/AdminOrdersPage'
import AdminOrderDetailPage  from './pages/admin/AdminOrderDetailPage'
import AdminProductsPage     from './pages/admin/AdminProductsPage'
import AdminProductFormPage  from './pages/admin/AdminProductFormPage'
import AdminClientsPage      from './pages/admin/AdminClientsPage'
import AdminClientDetailPage from './pages/admin/AdminClientDetailPage'
import AdminZonesPage        from './pages/admin/AdminZonesPage'
import AdminDashboardPage    from './pages/admin/AdminDashboardPage'
import AdminRecipesPage      from './pages/admin/AdminRecipesPage'
import AdminRecipeFormPage   from './pages/admin/AdminRecipeFormPage'
import RecipesPage           from './pages/RecipesPage'
import RecipeDetailPage      from './pages/RecipeDetailPage'
import PrivacyPage           from './pages/PrivacyPage'

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

/* ── Garde route admin ── */
function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}

/* ── Garde login admin (redirige si déjà connecté) ── */
function AdminPublicRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/admin/commandes" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* ── Publiques ── */}
              <Route path="/"    element={<LandingPage />} />
              <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
              <Route path="/recettes"         element={<RecipesPage />} />
              <Route path="/recettes/:slug"   element={<RecipeDetailPage />} />
              <Route path="/confidentialite"  element={<PrivacyPage />} />

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
              <Route path="/profil/fidelite"               element={<ClientRoute><LoyaltyPage /></ClientRoute>} />

              {/* ── Admin ── */}
              <Route path="/admin/login"              element={<AdminPublicRoute><AdminLoginPage /></AdminPublicRoute>} />
              <Route path="/admin"                    element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/commandes"            element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
              <Route path="/admin/commandes/:number"  element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
              <Route path="/admin/produits"           element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              <Route path="/admin/produits/nouveau"   element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
              <Route path="/admin/produits/:id"       element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
              <Route path="/admin/clients"            element={<AdminRoute><AdminClientsPage /></AdminRoute>} />
              <Route path="/admin/clients/:id"        element={<AdminRoute><AdminClientDetailPage /></AdminRoute>} />
              <Route path="/admin/zones"              element={<AdminRoute><AdminZonesPage /></AdminRoute>} />
              <Route path="/admin/recettes"           element={<AdminRoute><AdminRecipesPage /></AdminRoute>} />
              <Route path="/admin/recettes/nouveau"   element={<AdminRoute><AdminRecipeFormPage /></AdminRoute>} />
              <Route path="/admin/recettes/:id"       element={<AdminRoute><AdminRecipeFormPage /></AdminRoute>} />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
