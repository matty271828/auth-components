import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/auth', () => ({
  auth: {
    verifyEmail: vi.fn(),
  },
}))

import EmailVerificationForm from './EmailVerificationForm'
import { auth } from '@/lib/auth'

const mockAuth = auth as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('EmailVerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders verify button', () => {
    render(<EmailVerificationForm token="tok" />)
    expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument()
  })

  it('shows error when no token', async () => {
    render(<EmailVerificationForm />)
    await userEvent.click(screen.getByRole('button', { name: /verify email/i }))
    expect(await screen.findByText(/token is missing/i)).toBeInTheDocument()
  })

  it('calls auth.verifyEmail and shows success', async () => {
    const onSuccess = vi.fn()
    mockAuth.verifyEmail.mockResolvedValue({ success: true })
    render(<EmailVerificationForm token="tok" onSuccess={onSuccess} />)
    await userEvent.click(screen.getByRole('button', { name: /verify email/i }))
    expect(mockAuth.verifyEmail).toHaveBeenCalledWith('tok')
    expect(await screen.findByText(/email verified/i)).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows error on failure', async () => {
    const onError = vi.fn()
    mockAuth.verifyEmail.mockRejectedValue(new Error('Bad'))
    render(<EmailVerificationForm token="tok" onError={onError} />)
    await userEvent.click(screen.getByRole('button', { name: /verify email/i }))
    expect(await screen.findByText(/bad/i)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith('Bad')
  })

  it('clicking Back to Login in success calls onSwitchToLogin', async () => {
    const onSwitch = vi.fn()
    mockAuth.verifyEmail.mockResolvedValue({ success: true })
    render(<EmailVerificationForm token="tok" onSwitchToLogin={onSwitch} />)
    await userEvent.click(screen.getByRole('button', { name: /verify email/i }))
    await userEvent.click(await screen.findByRole('button', { name: /back to login/i }))
    expect(onSwitch).toHaveBeenCalled()
  })
})
