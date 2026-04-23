import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/auth', () => ({
  auth: {
    changePassword: vi.fn(),
  },
}))

import ChangePasswordForm from './ChangePasswordForm'
import { auth } from '@/lib/auth'

const mockAuth = auth as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders two password fields', () => {
    render(<ChangePasswordForm token="tok" />)
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
  })

  it('disables submit when form is invalid', () => {
    render(<ChangePasswordForm token="tok" />)
    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled()
  })

  it('enables submit when passwords match', async () => {
    render(<ChangePasswordForm token="tok" />)
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpass1!')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpass1!')
    expect(screen.getByRole('button', { name: /change password/i })).not.toBeDisabled()
  })

  it('disables submit button when passwords do not match', async () => {
    render(<ChangePasswordForm token="tok" />)
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'a')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'b')
    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled()
  })

  it('submits to auth.changePassword', async () => {
    const onSuccess = vi.fn()
    mockAuth.changePassword.mockResolvedValue({ success: true })
    render(<ChangePasswordForm token="tok" onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'abc123!@')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'abc123!@')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))
    expect(mockAuth.changePassword).toHaveBeenCalledWith('tok', 'abc123!@')
    expect(await screen.findByText(/password changed/i)).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows error when no token provided', async () => {
    render(<ChangePasswordForm />)
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'abc123!@')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'abc123!@')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))
    expect(await screen.findByText(/token is required/i)).toBeInTheDocument()
  })

  it('shows error when server fails', async () => {
    const onError = vi.fn()
    mockAuth.changePassword.mockRejectedValue(new Error('Expired'))
    render(<ChangePasswordForm token="tok" onError={onError} />)
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'abc123!@')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'abc123!@')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))
    expect(await screen.findByText(/expired/i)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith('Expired')
  })

  it('toggles new password visibility', async () => {
    render(<ChangePasswordForm token="tok" />)
    const newPass = screen.getByLabelText(/^new password$/i) as HTMLInputElement
    expect(newPass.type).toBe('password')
    // Two show password buttons (new + confirm); pick first
    const showButtons = screen.getAllByRole('button', { name: /show password/i })
    await userEvent.click(showButtons[0])
    expect(newPass.type).toBe('text')
  })

  it('calls onSwitchToLogin', async () => {
    const onSwitch = vi.fn()
    render(<ChangePasswordForm token="tok" onSwitchToLogin={onSwitch} />)
    await userEvent.click(screen.getByRole('button', { name: /back to login/i }))
    expect(onSwitch).toHaveBeenCalled()
  })
})
