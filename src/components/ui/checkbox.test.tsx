import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders with role checkbox', () => {
    render(<Checkbox aria-label="check" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Checkbox aria-label="check" onCheckedChange={onChange} />)
    const cb = screen.getByRole('checkbox')
    await userEvent.click(cb)
    expect(onChange).toHaveBeenCalledWith(true)
    await userEvent.click(cb)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('respects disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox aria-label="x" disabled onCheckedChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('has data-slot="checkbox"', () => {
    render(<Checkbox aria-label="x" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-slot', 'checkbox')
  })

  it('respects controlled checked prop', () => {
    render(<Checkbox aria-label="x" checked onCheckedChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked')
  })
})
