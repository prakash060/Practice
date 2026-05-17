import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FoodProvider } from './state/FoodContext'
import { AuthProvider } from './state/AuthContext'
import { DeliveryAuthProvider } from './state/DeliveryAuthContext'
import { ToastProvider } from './state/ToastContext'
import {
  ProtectedRoute,
  GuestRoute,
  AuthCatchAll,
  AdminRoute,
  DeliveryProtectedRoute,
  DeliveryGuestRoute,
} from './components/ProtectedRoute'
import { ToastHost } from './components/ToastHost'
import HomePage from './pages/HomePage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminPage from './pages/AdminPage'
import DeliveryOnboardingPage from './pages/DeliveryOnboardingPage'
import DeliveryLoginPage from './pages/DeliveryLoginPage'
import DeliveryDashboardPage from './pages/DeliveryDashboardPage'
import AdminResetPage from './pages/AdminResetPage'
import './App.css'

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <DeliveryAuthProvider>
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
            <Route
              path="/admin/delivery"
              element={
                <AdminRoute>
                  <DeliveryOnboardingPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reset"
              element={
                <AdminRoute>
                  <AdminResetPage />
                </AdminRoute>
              }
            />
            <Route
              path="/delivery/login"
              element={
                <DeliveryGuestRoute>
                  <DeliveryLoginPage />
                </DeliveryGuestRoute>
              }
            />
            <Route
              path="/delivery"
              element={
                <DeliveryProtectedRoute>
                  <DeliveryDashboardPage />
                </DeliveryProtectedRoute>
              }
            />
              <Route path="*" element={<AuthCatchAll />} />
            </Routes>
          </FoodProvider>
          </DeliveryAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  )
}

export default App
