import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminNav } from '../components/AdminNav'
import { AppHeaderApp } from '../components/AppHeader'
import { ChevronLeftIcon, ZapIcon } from '../components/Icons'
import { adminSeedAPI, type SeedRandomResponse } from '../services/api'
import { useFoodContext } from '../state/FoodContext'
import { useToast } from '../state/ToastContext'

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

export default function AdminSeedPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { reloadMenu } = useFoodContext()

  const [isBusy, setIsBusy] = useState(false)
  const [result, setResult] = useState<SeedRandomResponse | null>(null)

  const handleGenerate = async () => {
    if (isBusy) return
    const proceed = window.confirm(
      'This will DELETE all existing categories and food items, then create 5 ' +
        'fresh categories with 10–15 items each (priced ₹1–₹2).\n\n' +
        'Existing orders are not affected, but the menu will be replaced.\n\n' +
        'Continue?'
    )
    if (!proceed) return
    setIsBusy(true)
    try {
      const res = await adminSeedAPI.random()
      setResult(res)
      showToast(
        `Replaced menu with ${res.categoriesCreated} categories (${res.itemsCreated} items, ₹1–₹2 each)`,
        'success'
      )
      try {
        await reloadMenu()
      } catch {
        // non-fatal: the next visit to /admin will refresh
      }
      // Drop the user on the Categories & Items page so they immediately see
      // the freshly-seeded data exactly where the screenshot pointed.
      setTimeout(() => navigate('/admin'), 700)
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not generate demo data'), 'error')
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
          <h2 className="category-hero__title">⚡ Generate demo data</h2>
          <p className="category-hero__subtitle">
            One-click seed of <strong>5 random food categories</strong> with
            10–15 relevant items each. Every item is priced between
            <strong> ₹1 and ₹2</strong>. Useful for demos and screenshots.
            <br />
            <strong>Heads up:</strong> running this will first <em>delete every
            existing category and food item</em> so the menu always starts
            clean. Orders are not affected.
          </p>
        </div>
      </section>

      <section className="panel">
        <AdminNav />
      </section>

      <section className="panel">
        <article className="reset-card reset-all">
          <header className="reset-card__head">
            <h3>Random seed</h3>
            <span className="reset-card__count">
              5 <span className="reset-card__count-label">categories</span>
            </span>
          </header>
          <p className="reset-all__lede">
            Click the button below to wipe the current menu and repopulate it
            with a fresh random set. The new entries appear under{' '}
            <strong>Categories &amp; items</strong> just like ones you create
            manually, with each item priced between <strong>₹1 and ₹2</strong>.
          </p>
          <div className="reset-all__form">
            <button
              type="button"
              className="proceed-payment-button reset-all__btn btn-icon"
              disabled={isBusy}
              onClick={handleGenerate}
            >
              <ZapIcon />
              <span>{isBusy ? 'Generating…' : 'Generate random data'}</span>
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
                {result.itemsCreated}{' '}
                <span className="reset-card__count-label">items</span>
              </span>
            </header>
            <p className="reset-card__body">
              Created {result.categoriesCreated} categor
              {result.categoriesCreated === 1 ? 'y' : 'ies'} with a total of{' '}
              {result.itemsCreated} item{result.itemsCreated === 1 ? '' : 's'}.
            </p>
            <ul className="admin-cards">
              {result.categories.map((c) => (
                <li key={c.name} className="admin-card-tile">
                  <div className="admin-card-tile__body">
                    <h4 className="admin-card-tile__title">{c.name}</h4>
                    <p className="admin-card-tile__meta">
                      {c.itemCount} item{c.itemCount === 1 ? '' : 's'}
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
          onClick={() => navigate('/admin')}
        >
          <ChevronLeftIcon />
          <span>Return to Admin</span>
        </button>
      </section>
    </main>
  )
}
