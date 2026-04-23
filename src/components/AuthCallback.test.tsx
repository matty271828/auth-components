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

    render(<AuthCallback onSuccess={vi.fn()} onError={vi.fn()} />)

    await vi.waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('abc')
    })
    const user = JSON.parse(localStorage.getItem('auth_user')!)
    expect(user.email).toBe('a@b.com')
    expect(user.firstName).toBe('A')
    vi.useRealTimers()
  })

  it('shows error when no data found', async () => {
    setSearchParams('')
    document.body.textContent = ''
    render(<AuthCallback onSuccess={vi.fn()} onError={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/no valid authentication data/i)).toBeInTheDocument()
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
})
