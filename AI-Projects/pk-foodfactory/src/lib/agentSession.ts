const TOKEN_KEY = 'pk_foodfactory_agent_token'

export function getStoredAgentToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredAgentToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

type UnauthorizedFn = () => void

let onAgentUnauthorized: UnauthorizedFn = () => {}

export function setAgentUnauthorizedHandler(fn: UnauthorizedFn): void {
  onAgentUnauthorized = fn
}

export function triggerAgentUnauthorized(): void {
  onAgentUnauthorized()
}
