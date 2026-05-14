import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FoodProvider } from './state/FoodContext'
import { AuthProvider } from './state/AuthContext'
import { ToastProvider } from './state/ToastContext'
import { ProtectedRoute, GuestRoute, AuthCatchAll, AdminRoute } from './components/ProtectedRoute'
import { ToastHost } from './components/ToastHost'
import HomePage from './pages/HomePage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import PaymentMethodPage from './pages/PaymentMethodPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <FoodProvider>
            <ToastHost />
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignupPage />
                </GuestRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:method"
              element={
                <ProtectedRoute>
                  <PaymentMethodPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
              <Route path="*" element={<AuthCatchAll />} />
            </Routes>
          </FoodProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  )
}

export default App
