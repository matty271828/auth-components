import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './card'

describe('Card', () => {
  it('renders Card with data-slot', () => {
    render(<Card data-testid="card">hi</Card>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-slot', 'card')
  })

  it('renders CardHeader', () => {
    render(<CardHeader data-testid="hdr">hdr</CardHeader>)
    expect(screen.getByTestId('hdr')).toHaveAttribute('data-slot', 'card-header')
  })

  it('renders CardTitle', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)
    const title = screen.getByTestId('title')
    expect(title).toHaveAttribute('data-slot', 'card-title')
    expect(title).toHaveTextContent('Title')
  })

  it('renders CardDescription', () => {
    render(<CardDescription data-testid="desc">Desc</CardDescription>)
    expect(screen.getByTestId('desc')).toHaveAttribute('data-slot', 'card-description')
  })

  it('renders CardContent', () => {
    render(<CardContent data-testid="content">content</CardContent>)
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content')
  })

  it('renders CardFooter', () => {
    render(<CardFooter data-testid="footer">footer</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer')
  })

  it('renders CardAction', () => {
    render(<CardAction data-testid="action">action</CardAction>)
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'card-action')
  })

  it('merges className on Card', () => {
    render(<Card data-testid="card" className="xx">x</Card>)
    expect(screen.getByTestId('card').className).toContain('xx')
  })
})
