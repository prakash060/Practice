import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FoodProvider } from './state/FoodContext'
import HomePage from './pages/HomePage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import PaymentMethodPage from './pages/PaymentMethodPage'
import './App.css'

function App() {
  return (
    <FoodProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/:method" element={<PaymentMethodPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </FoodProvider>
  )
}

export default App
