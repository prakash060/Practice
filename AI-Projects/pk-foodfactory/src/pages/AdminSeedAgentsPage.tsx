import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminNav } from '../components/AdminNav'
import { AppHeaderApp } from '../components/AppHeader'
import { ChevronLeftIcon, TruckIcon, ZapIcon } from '../components/Icons'
import { adminSeedAPI, type SeedAgentsResponse } from '../services/api'
import { useToast } from '../state/ToastContext'

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

export default function AdminSeedAgentsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [isBusy, setIsBusy] = useState(false)
  const [result, setResult] = useState<SeedAgentsResponse | null>(null)

  const handleGenerate = async () => {
    if (isBusy) return
    const proceed = window.confirm(
      'This will DELETE all existing delivery agents and unassign them from ' +
        'open orders, then create 5 fresh demo riders.\n\n' +
        'Each demo agent can sign in with passcode 1234 at the delivery login.\n\n' +
        'Continue?'
    )
    if (!proceed) return
    setIsBusy(true)
    try {
      const res = await adminSeedAPI.agents()
      setResult(res)
      showToast(
        `Created ${res.agentsCreated} demo agents (passcode ${res.demoPasscode})`,
        'success'
      )
      setTimeout(() => navigate('/admin/delivery'), 700)
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not generate demo agents'), 'error')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <main className="app-shell">
      <AppHeaderApp />

      <section className="category-hero category-hero--compact category-hero--danger">
        <div className="category-hero__content">
          <p className="category-hero__kicker">Administration</p>
          <h2 className="category-hero__title">🛵 Generate demo agents</h2>
          <p className="category-hero__subtitle">
            One-click seed of <strong>5 random delivery riders</strong> with
            realistic names, phones, and vehicle details. Useful for demos and
            testing rider login.
            <br />
            <strong>Heads up:</strong> running this will first{' '}
            <em>delete every existing delivery agent</em> and clear their
            assignments on open orders. Customer orders are kept.
          </p>
        </div>
      </section>

      <section className="panel">
        <AdminNav />
      </section>

      <section className="panel">
        <article className="reset-card reset-all">
          <header className="reset-card__head">
            <h3>Random agent seed</h3>
            <span className="reset-card__count">
              5 <span className="reset-card__count-label">agents</span>
            </span>
          </header>
          <p className="reset-all__lede">
            Click the button below to wipe the current rider list and repopulate
            it with a fresh random set. The new agents appear under{' '}
            <strong>Delivery onboarding</strong> just like ones you create
            manually. All demo agents share login passcode{' '}
            <strong>1234</strong> (phone + passcode at{' '}
            <code>/delivery/login</code>).
          </p>
          <div className="reset-all__form">
            <button
              type="button"
              className="proceed-payment-button reset-all__btn btn-icon"
              disabled={isBusy}
              onClick={handleGenerate}
            >
              <TruckIcon />
              <span>{isBusy ? 'Generating…' : 'Generate demo agents'}</span>
            </button>
          </div>
        </article>
      </section>

      {result ? (
        <section className="panel">
          <article className="reset-card">
            <header className="reset-card__head">
              <h3>Last run</h3>
              <span className="reset-card__count">
                {result.agentsCreated}{' '}
                <span className="reset-card__count-label">agents</span>
              </span>
            </header>
            <p className="reset-card__body">
              Created {result.agentsCreated} delivery agent
              {result.agentsCreated === 1 ? '' : 's'}. Sign in with any listed
              phone and passcode <code>{result.demoPasscode}</code>.
            </p>
            <ul className="admin-cards">
              {result.agents.map((a) => (
                <li key={a.id} className="admin-card-tile">
                  <div className="admin-card-tile__body">
                    <h4 className="admin-card-tile__title">{a.name}</h4>
                    <p className="admin-card-tile__meta">
                      {a.phone}
                      <span className="admin-card-tile__dot">·</span>
                      {a.vehicleType}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}

      <section className="panel admin-footer-actions">
        <button
          type="button"
          className="back-button btn-icon"
          onClick={() => navigate('/admin/seed')}
        >
          <ZapIcon />
          <span>Generate demo data</span>
        </button>
        <button
          type="button"
          className="back-button btn-icon"
          onClick={() => navigate('/admin/delivery')}
        >
          <ChevronLeftIcon />
          <span>Delivery onboarding</span>
        </button>
      </section>
    </main>
  )
}
