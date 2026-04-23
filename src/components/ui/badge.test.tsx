import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from './badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Hi</Badge>)
    expect(screen.getByText('Hi')).toBeInTheDocument()
  })

  it('applies default variant class', () => {
    render(<Badge data-testid="b">Hi</Badge>)
    expect(screen.getByTestId('b').className).toContain('bg-primary')
  })

  it('applies secondary variant', () => {
    render(<Badge data-testid="b" variant="secondary">Hi</Badge>)
    expect(screen.getByTestId('b').className).toContain('bg-secondary')
  })

  it('applies destructive variant', () => {
    render(<Badge data-testid="b" variant="destructive">Hi</Badge>)
    expect(screen.getByTestId('b').className).toContain('bg-destructive')
  })

  it('applies outline variant', () => {
    render(<Badge data-testid="b" variant="outline">Hi</Badge>)
    expect(screen.getByTestId('b').className).toContain('text-foreground')
  })

  it('merges className', () => {
    render(<Badge data-testid="b" className="custom">Hi</Badge>)
    expect(screen.getByTestId('b').className).toContain('custom')
  })

  describe('badgeVariants', () => {
    it('generates classes for each variant', () => {
      expect(badgeVariants({ variant: 'default' })).toContain('bg-primary')
      expect(badgeVariants({ variant: 'secondary' })).toContain('bg-secondary')
      expect(badgeVariants({ variant: 'destructive' })).toContain('bg-destructive')
      expect(badgeVariants({ variant: 'outline' })).toContain('text-foreground')
    })
  })
})
