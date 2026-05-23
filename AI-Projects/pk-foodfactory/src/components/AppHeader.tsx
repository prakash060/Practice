import { Link, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { BRAND_EYEBROW, BRAND_TITLE } from '../constants/brand'
import { BrandMark } from './BrandMark'
import { CartTrigger } from './CartDrawer'
import { useAuth } from '../state/AuthContext'
import {
  AlertIcon,
  LogoutIcon,
  ReceiptIcon,
  ShieldIcon,
  UserIcon as SharedUserIcon,
} from './Icons'

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        fill="currentColor"
      />
    </svg>
  )
}

export function AppHeaderAuth({ title }: { title: string }) {
  return (
    <header className="brand-header brand-header--flow">
      <div className="brand-header__left">
        <div className="brand-mark" aria-hidden="true">
          <BrandMark />
        </div>
        <div>
          <p className="eyebrow">{BRAND_EYEBROW}</p>
          <h1 className="brand-title">{title}</h1>
        </div>
      </div>
    </header>
  )
}

export function AppHeaderApp() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const isAdmin = Boolean(user?.isAdmin)
  const showCart = pathname === '/'
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onDocPointerDown(e: PointerEvent) {
      const el = wrapRef.current
      if (el && !el.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onDocPointerDown)
    return () => document.removeEventListener('pointerdown', onDocPointerDown)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <header className="brand-header brand-header--flow">
      <div className="brand-header__left">
        <div className="brand-mark" aria-hidden="true">
          <BrandMark />
        </div>
        <div>
          <p className="eyebrow">{BRAND_EYEBROW}</p>
          <h1 className="brand-title">{BRAND_TITLE}</h1>
        </div>
      </div>
      <div className="brand-header__right brand-header__actions">
        {showCart ? <CartTrigger /> : null}
        <div className="header-user-menu" ref={wrapRef}>
          <button
            type="button"
            className="header-user-trigger"
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="header-user-trigger__icon">
              <UserIcon />
            </span>
            <span className="visually-hidden">Account menu</span>
          </button>
          {open ? (
            <div id={menuId} className="header-user-dropdown" role="menu">
              <Link
                to="/orders"
                className="header-user-dropdown__item"
                role="menuitem"
                onClick={close}
              >
                <span className="header-user-dropdown__item-icon">
                  <ReceiptIcon />
                </span>
                My orders
              </Link>
              <Link
                to="/profile"
                className="header-user-dropdown__item"
                role="menuitem"
                onClick={close}
              >
                <span className="header-user-dropdown__item-icon">
                  <SharedUserIcon />
                </span>
                Edit profile
              </Link>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className="header-user-dropdown__item"
                    role="menuitem"
                    onClick={close}
                  >
                    <span className="header-user-dropdown__item-icon">
                      <ShieldIcon />
                    </span>
                    Administration
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="header-user-dropdown__item"
                    role="menuitem"
                    onClick={close}
                  >
                    <span className="header-user-dropdown__item-icon">
                      <ReceiptIcon />
                    </span>
                    Orders & delivery
                  </Link>
                  <Link
                    to="/admin/reset"
                    className="header-user-dropdown__item header-user-dropdown__item--danger"
                    role="menuitem"
                    onClick={close}
                  >
                    <span className="header-user-dropdown__item-icon">
                      <AlertIcon />
                    </span>
                    Reset data
                  </Link>
                </>
              ) : null}
              <button
                type="button"
                className="header-user-dropdown__item header-user-dropdown__item--danger"
                role="menuitem"
                onClick={() => {
                  close()
                  logout()
                }}
              >
                <span className="header-user-dropdown__item-icon">
                  <LogoutIcon />
                </span>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
