import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/auth', () => {
  return {
    auth: {
      login: vi.fn(),
      requestPasswordReset: vi.fn(),
      initiateOAuth: vi.fn(),
      isMockMode: vi.fn().mockReturnValue(true),
      updateSessionConfig: vi.fn(),
    },
  }
})

import LoginForm from './LoginForm'
import { auth } from '@/lib/auth'

const mockAuth = auth as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.isMockMode.mockReturnValue(true)
    localStorage.clear()
  })

  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
  })

  it('shows error when fields empty on submit', async () => {
    render(<LoginForm />)
    const form = screen.getByRole('button', { name: /^sign in$/i }).closest('form')!
    // Override native validation to force error display
    form.noValidate = true
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText(/fill in all fields/i)).toBeInTheDocument()
  })

  it('calls auth.login and onSuccess on submit', async () => {
    const onSuccess = vi.fn()
    mockAuth.login.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      createdAt: 'x',
    })

    render(<LoginForm onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(mockAuth.login).toHaveBeenCalledWith(
      { email: 'a@b.com', password: 'password' },
      true
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('updates session config differently based on staySignedIn', async () => {
    mockAuth.login.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      createdAt: 'x',
    })

    render(<LoginForm />)
    // Default is staySignedIn=true, so click to toggle to false
    await userEvent.click(screen.getByLabelText(/stay signed in/i))
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(mockAuth.updateSessionConfig).toHaveBeenCalledWith(
      expect.objectContaining({ refreshThreshold: 2 })
    )
    expect(mockAuth.login).toHaveBeenCalledWith(
      { email: 'a@b.com', password: 'password' },
      false
    )
  })

  it('shows error and calls onError on login failure', async () => {
    const onError = vi.fn()
    mockAuth.login.mockRejectedValue(new Error('Invalid creds'))

    render(<LoginForm onError={onError} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText(/invalid creds/i)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith('Invalid creds')
  })

  it('toggles password visibility', async () => {
    render(<LoginForm />)
    const input = screen.getByLabelText(/^password$/i) as HTMLInputElement
    expect(input.type).toBe('password')
    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(input.type).toBe('text')
    await userEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(input.type).toBe('password')
  })

  it('switches to password reset view', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: /forgot password/i }))
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('submits password reset request', async () => {
    mockAuth.requestPasswordReset.mockResolvedValue({ success: true })
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: /forgot password/i }))
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(mockAuth.requestPasswordReset).toHaveBeenCalledWith('a@b.com')
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
  })

  it('shows error if password reset email missing', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: /forgot password/i }))
    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form')!
    form.noValidate = true
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(await screen.findByText(/please enter your email/i)).toBeInTheDocument()
  })

  it('shows error if password reset fails', async () => {
    mockAuth.requestPasswordReset.mockRejectedValue(new Error('Not found'))
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: /forgot password/i }))
    await userEvent.type(screen.getByLabelText(/email/i), 'nobody@x.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(await screen.findByText(/not found/i)).toBeInTheDocument()
  })

  it('goes back to login from reset view', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: /forgot password/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to login/i }))
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
  })

  it('calls onSwitchToRegister when clicked', async () => {
    const onSwitch = vi.fn()
    render(<LoginForm onSwitchToRegister={onSwitch} />)
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(onSwitch).toHaveBeenCalled()
  })
})
