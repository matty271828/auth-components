import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
  it('renders children', () => {
    render(<Label>My Label</Label>)
    expect(screen.getByText('My Label')).toBeInTheDocument()
  })

  it('accepts htmlFor', () => {
    render(<Label htmlFor="x">My Label</Label>)
    expect(screen.getByText('My Label')).toHaveAttribute('for', 'x')
  })

  it('merges className', () => {
    render(<Label className="custom">Label</Label>)
    expect(screen.getByText('Label').className).toContain('custom')
  })

  it('has data-slot attribute', () => {
    render(<Label>Label</Label>)
    expect(screen.getByText('Label')).toHaveAttribute('data-slot', 'label')
  })
})
