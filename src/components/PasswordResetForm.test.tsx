import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/auth', () => ({
  auth: {
    requestPasswordReset: vi.fn(),
  },
}))

import PasswordResetForm from './PasswordResetForm'
import { auth } from '@/lib/auth'

const mockAuth = auth as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('PasswordResetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email field and button', () => {
    render(<PasswordResetForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('shows error when email is blank', async () => {
    render(<PasswordResetForm />)
    const form = screen.getByRole('button', { name: /send reset link/i }).closest('form')!
    form.noValidate = true
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(await screen.findByText(/please enter your email/i)).toBeInTheDocument()
  })

  it('calls auth.requestPasswordReset and shows success', async () => {
    const onSuccess = vi.fn()
    mockAuth.requestPasswordReset.mockResolvedValue({ success: true })
    render(<PasswordResetForm onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(mockAuth.requestPasswordReset).toHaveBeenCalledWith('a@b.com')
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows error on failure', async () => {
    const onError = vi.fn()
    mockAuth.requestPasswordReset.mockRejectedValue(new Error('Nope'))
    render(<PasswordResetForm onError={onError} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(await screen.findByText(/nope/i)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith('Nope')
  })

  it('calls onSwitchToLogin when clicked', async () => {
    const onSwitch = vi.fn()
    render(<PasswordResetForm onSwitchToLogin={onSwitch} />)
    await userEvent.click(screen.getByRole('button', { name: /back to login/i }))
    expect(onSwitch).toHaveBeenCalled()
  })

  it('calls onSwitchToLogin from success state too', async () => {
    const onSwitch = vi.fn()
    mockAuth.requestPasswordReset.mockResolvedValue({ success: true })
    render(<PasswordResetForm onSwitchToLogin={onSwitch} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await userEvent.click(await screen.findByRole('button', { name: /back to login/i }))
    expect(onSwitch).toHaveBeenCalled()
  })
})
