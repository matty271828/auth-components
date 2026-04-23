import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import { validatePassword } from '@/lib/utils'

describe('PasswordStrengthIndicator', () => {
  it('renders empty state when isEmpty is true', () => {
    const strength = validatePassword('')
    const { container } = render(
      <PasswordStrengthIndicator strength={strength} isEmpty={true} />
    )
    // Should be an empty placeholder (no label)
    expect(screen.queryByText(/very weak/i)).not.toBeInTheDocument()
    expect(container.querySelector('.bg-gray-200')).toBeInTheDocument()
  })

  it('renders with label when showRequirements is false', () => {
    const strength = validatePassword('Abc1!xyz9Def')
    render(
      <PasswordStrengthIndicator
        strength={strength}
        showRequirements={false}
        showLabel={true}
      />
    )
    expect(screen.getByText(strength.label)).toBeInTheDocument()
  })

  it('hides label when showLabel is false and showRequirements=false', () => {
    const strength = validatePassword('Abc1!xyz9Def')
    render(
      <PasswordStrengthIndicator
        strength={strength}
        showRequirements={false}
        showLabel={false}
      />
    )
    expect(screen.queryByText(strength.label)).not.toBeInTheDocument()
  })

  it('renders compact view with strength label and count', () => {
    const strength = validatePassword('Abc!xyz9')
    render(<PasswordStrengthIndicator strength={strength} compact={true} />)
    expect(screen.getByText(strength.label)).toBeInTheDocument()
    const metCount = strength.requirements.filter((r) => r.met).length
    const total = strength.requirements.length
    expect(screen.getByText(`(${metCount}/${total})`)).toBeInTheDocument()
  })

  it('renders full view when compact=false', () => {
    const strength = validatePassword('Abc!xyz9')
    render(<PasswordStrengthIndicator strength={strength} compact={false} />)
    expect(screen.getByText(strength.label)).toBeInTheDocument()
  })

  it('renders for very weak password without crashing', () => {
    const strength = validatePassword('a')
    render(<PasswordStrengthIndicator strength={strength} />)
    expect(screen.getByText('Very Weak')).toBeInTheDocument()
  })

  it('renders for very strong password', () => {
    const strength = validatePassword('Zq9!Kw3@Px7#Mv')
    render(<PasswordStrengthIndicator strength={strength} />)
    expect(screen.getByText('Very Strong')).toBeInTheDocument()
  })
})
