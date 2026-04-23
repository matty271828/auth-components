import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, buttonVariants } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies variant class', () => {
    render(<Button variant="destructive">X</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-destructive')
  })

  it('applies size class', () => {
    render(<Button size="lg">X</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-10')
  })

  it('respects disabled prop', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        X
      </Button>
    )
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders as Slot when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/x">Link</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/x')
  })

  it('merges custom className', () => {
    render(<Button className="custom">X</Button>)
    expect(screen.getByRole('button').className).toContain('custom')
  })

  it('has data-slot="button" attribute', () => {
    render(<Button>X</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
  })

  describe('buttonVariants', () => {
    it('returns classes for each variant', () => {
      expect(buttonVariants({ variant: 'default' })).toContain('bg-primary')
      expect(buttonVariants({ variant: 'secondary' })).toContain('bg-secondary')
      expect(buttonVariants({ variant: 'ghost' })).toContain('hover:bg-accent')
      expect(buttonVariants({ variant: 'link' })).toContain('text-primary')
      expect(buttonVariants({ variant: 'outline' })).toContain('border')
    })

    it('returns classes for each size', () => {
      expect(buttonVariants({ size: 'default' })).toContain('h-9')
      expect(buttonVariants({ size: 'sm' })).toContain('h-8')
      expect(buttonVariants({ size: 'lg' })).toContain('h-10')
      expect(buttonVariants({ size: 'icon' })).toContain('size-9')
    })
  })
})
