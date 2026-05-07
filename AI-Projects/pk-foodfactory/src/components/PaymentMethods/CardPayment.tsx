import { useState } from 'react'

interface CardPaymentProps {
  amount: number
  onSuccess: () => void
  onBack: () => void
}

export function CardPayment({ amount, onSuccess, onBack }: CardPaymentProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
  }

  const formatExpiryDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d{2})/, '$1/$2')
      .substring(0, 5)
  }

  const handlePay = () => {
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      setError('Please enter a valid 16-digit card number')
      return
    }

    if (!cardHolder.trim()) {
      setError('Please enter cardholder name')
      return
    }

    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      setError('Please enter valid expiry date (MM/YY)')
      return
    }

    if (!cvv.match(/^\d{3}$/)) {
      setError('Please enter valid 3-digit CVV')
      return
    }

    setIsProcessing(true)
    setError('')

    // Simulate card payment processing
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
        <h2>💳 Card Payment</h2>
      </div>

      <div className="payment-method-content">
        <div className="payment-info">
          <p>Amount to pay: <strong>₹{amount}</strong></p>
        </div>

        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => {
              setCardNumber(formatCardNumber(e.target.value))
              setError('')
            }}
            maxLength={19}
            disabled={isProcessing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cardHolder">Cardholder Name</label>
          <input
            id="cardHolder"
            type="text"
            placeholder="John Doe"
            value={cardHolder}
            onChange={(e) => {
              setCardHolder(e.target.value)
              setError('')
            }}
            disabled={isProcessing}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(formatExpiryDate(e.target.value))
                setError('')
              }}
              maxLength={5}
              disabled={isProcessing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              type="text"
              placeholder="123"
              value={cvv}
              onChange={(e) => {
                setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))
                setError('')
              }}
              maxLength={3}
              disabled={isProcessing}
            />
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
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  )
}
