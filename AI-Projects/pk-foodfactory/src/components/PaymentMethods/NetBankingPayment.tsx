import { useState } from 'react'

interface NetBankingPaymentProps {
  amount: number
  onSuccess: () => void
  onBack: () => void
}

const BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'SBI (State Bank of India)',
  'Axis Bank',
  'Kotak Bank',
  'IndusInd Bank',
]

export function NetBankingPayment({ amount, onSuccess, onBack }: NetBankingPaymentProps) {
  const [selectedBank, setSelectedBank] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePay = () => {
    if (!selectedBank) {
      setError('Please select a bank')
      return
    }

    setIsProcessing(true)
    setError('')

    // Simulate net banking payment processing
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
        <h2>🏦 Net Banking Payment</h2>
      </div>

      <div className="payment-method-content">
        <div className="payment-info">
          <p>Amount to pay: <strong>₹{amount}</strong></p>
        </div>

        <div className="form-group">
          <label>Select Your Bank</label>
          <div className="bank-options">
            {BANKS.map((bank) => (
              <button
                key={bank}
                type="button"
                className={`bank-option ${selectedBank === bank ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedBank(bank)
                  setError('')
                }}
                disabled={isProcessing}
              >
                {bank}
              </button>
            ))}
          </div>
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
            disabled={isProcessing || !selectedBank}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  )
}
