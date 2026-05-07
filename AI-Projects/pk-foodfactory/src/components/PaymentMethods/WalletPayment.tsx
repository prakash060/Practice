import { useState } from 'react'

interface WalletPaymentProps {
  amount: number
  onSuccess: () => void
  onBack: () => void
}

const WALLETS = [
  { name: 'Paytm Wallet', balance: 2500 },
  { name: 'Amazon Pay', balance: 5000 },
  { name: 'Google Pay', balance: 1000 },
  { name: 'PhonePe', balance: 3000 },
]

export function WalletPayment({ amount, onSuccess, onBack }: WalletPaymentProps) {
  const [selectedWallet, setSelectedWallet] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePay = () => {
    if (!selectedWallet) {
      setError('Please select a wallet')
      return
    }

    const wallet = WALLETS.find((w) => w.name === selectedWallet)
    if (wallet && wallet.balance < amount) {
      setError(`Insufficient balance. Available: ₹${wallet.balance}`)
      return
    }

    setIsProcessing(true)
    setError('')

    // Simulate wallet payment processing with possible failure
    setTimeout(() => {
      setIsProcessing(false)
      const success = Math.random() > 0.2 // 80% success rate
      if (success) {
        onSuccess()
      } else {
        setError('Payment failed. Please check your wallet or try again.')
      }
    }, 2000)
  }

  return (
    <div className="payment-method-screen">
      <div className="payment-method-header">
        <button type="button" className="back-button" onClick={onBack} disabled={isProcessing}>
          ← Back
        </button>
        <h2>👛 Digital Wallet Payment</h2>
      </div>

      <div className="payment-method-content">
        <div className="payment-info">
          <p>Amount to pay: <strong>₹{amount}</strong></p>
        </div>

        <div className="form-group">
          <label>Select Your Wallet</label>
          <div className="wallet-options">
            {WALLETS.map((wallet) => (
              <button
                key={wallet.name}
                type="button"
                className={`wallet-option ${selectedWallet === wallet.name ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedWallet(wallet.name)
                  setError('')
                }}
                disabled={isProcessing}
              >
                <div className="wallet-name">{wallet.name}</div>
                <div className="wallet-balance">Balance: ₹{wallet.balance}</div>
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
            disabled={isProcessing || !selectedWallet}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  )
}
