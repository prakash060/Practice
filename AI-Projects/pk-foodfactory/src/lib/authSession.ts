const TOKEN_KEY = 'pk_foodfactory_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

type UnauthorizedFn = () => void

let onUnauthorized: UnauthorizedFn = () => {}

export function setUnauthorizedHandler(fn: UnauthorizedFn): void {
  onUnauthorized = fn
}

export function triggerUnauthorized(): void {
  onUnauthorized()
}
