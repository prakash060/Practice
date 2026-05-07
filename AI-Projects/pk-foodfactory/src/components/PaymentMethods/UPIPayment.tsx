import { useState } from 'react'

interface UPIPaymentProps {
  amount: number
  onSuccess: () => void
  onBack: () => void
}

export function UPIPayment({ amount, onSuccess, onBack }: UPIPaymentProps) {
  const [upiId, setUpiId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePay = () => {
    if (!upiId.trim()) {
      setError('Please enter a valid UPI ID')
      return
    }

    if (!upiId.includes('@')) {
      setError('UPI ID must contain @ (e.g., 9876543210@paytm)')
      return
    }

    setIsProcessing(true)
    setError('')

    // Simulate UPI payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
    }, 2000)
  }

  return (
    <div className="payment-method-screen">
      <div className="payment-method-header">
        <button type="button" className="back-button" onClick={onBack} disabled={isProcessing}>
          ← Back
        </button>
        <h2>📱 UPI Payment</h2>
      </div>

      <div className="payment-method-content">
        <div className="payment-info">
          <p>Amount to pay: <strong>₹{amount}</strong></p>
        </div>

        <div className="form-group">
          <label htmlFor="upiId">UPI ID</label>
          <input
            id="upiId"
            type="text"
            placeholder="9876543210@paytm"
            value={upiId}
            onChange={(e) => {
              setUpiId(e.target.value)
              setError('')
            }}
            disabled={isProcessing}
          />
          <p className="form-hint">Examples: phone@googlepay, phone@paytm, phone@phonepe</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="payment-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onBack}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pay-button"
            onClick={handlePay}
            disabled={isProcessing || !upiId.trim()}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  )
}
