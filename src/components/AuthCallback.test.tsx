import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AuthCallback from './AuthCallback'

const originalLocation = window.location

function setSearchParams(search: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      ...originalLocation,
      search,
      href: 'http://localhost/',
      pathname: '/',
    },
  })
}

describe('AuthCallback', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.textContent = ''
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('processes URL parameter token and stores session', async () => {
    vi.useFakeTimers()
    setSearchParams(
      '?token=abc&userId=1&email=a%40b.com&firstName=A&lastName=B&createdAt=2020-01-01'
    )

    const onSuccess = vi.fn()
    render(<AuthCallback onSuccess={onSuccess} onError={vi.fn()} />)

    await vi.waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('abc')
    })
    const user = JSON.parse(localStorage.getItem('auth_user')!)
    expect(user.email).toBe('a@b.com')
    expect(user.firstName).toBe('A')
    expect(onSuccess).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('shows error and invokes onError when no data found', async () => {
    setSearchParams('')
    document.body.textContent = ''
    const onError = vi.fn()
    render(<AuthCallback onSuccess={vi.fn()} onError={onError} />)

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/no valid authentication data/i)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/no valid authentication data/i))
  })

  it('clears storage on error', async () => {
    setSearchParams('')
    localStorage.setItem('auth_token', 'junk')
    render(<AuthCallback onSuccess={vi.fn()} onError={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    })
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  // Regression: a previous fallback path read document.body.textContent,
  // parsed it as JSON, and trusted whatever it found as a valid OAuth
  // response — letting a network-level attacker (MITM, compromised CDN
  // edge, captive portal) inject a session by serving a JSON body.
  // See security audit CRIT-5 — the path is removed.
  it('does NOT consume a JSON OAuth response from document.body.textContent', async () => {
    setSearchParams('')
    document.body.textContent = JSON.stringify({
      success: true,
      message: 'ok',
      user: {
        id: 'attacker',
        email: 'attacker@evil.com',
        firstName: 'Mal',
        lastName: 'Lory',
        createdAt: '2020-01-01',
      },
      session: {
        id: 'session-evil',
        token: 'attacker-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })

    render(<AuthCallback onSuccess={vi.fn()} onError={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    })
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
    expect(localStorage.getItem('auth_session')).toBeNull()
  })
})
