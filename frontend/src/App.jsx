import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider }      from './context/CartContext'
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

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/"                                element={<LandingPage />} />
          <Route path="/auth"                            element={<AuthPage />} />
          <Route path="/home"                            element={<HomePage />} />
          <Route path="/produits/:slug"                  element={<ProductDetailPage />} />
          <Route path="/panier"                          element={<CartPage />} />
          <Route path="/commande"                        element={<CheckoutPage />} />
          <Route path="/commande/:number/paiement"       element={<PaymentPage />} />
          <Route path="/mes-commandes"                   element={<OrdersPage />} />
          <Route path="/mes-commandes/:number"           element={<OrderDetailPage />} />
          <Route path="/profil"                          element={<ProfilePage />} />
          <Route path="/profil/adresses"                 element={<AddressesPage />} />
          <Route path="*"                                element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
