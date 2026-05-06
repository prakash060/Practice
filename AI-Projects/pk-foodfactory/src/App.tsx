import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FoodProvider } from './state/FoodContext'
import HomePage from './pages/HomePage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import './App.css'

function App() {
  return (
    <FoodProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </Router>
    </FoodProvider>
  )
}

export default App
