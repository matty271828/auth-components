import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
  it('renders an input', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts type prop', () => {
    render(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')
  })

  it('accepts user typing', async () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    await userEvent.type(input, 'hello')
    expect(input.value).toBe('hello')
  })

  it('merges className', () => {
    render(<Input className="custom" data-testid="input" />)
    expect(screen.getByTestId('input').className).toContain('custom')
  })

  it('has data-slot="input"', () => {
    render(<Input data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'input')
  })

  it('forwards disabled prop', () => {
    render(<Input disabled data-testid="input" />)
    expect(screen.getByTestId('input')).toBeDisabled()
  })
})
