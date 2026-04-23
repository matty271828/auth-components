import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/api', () => ({
  default: {
    getSubscriptionStatus: vi.fn(),
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
  },
}))

import AccountSettings from './AccountSettings'
import api from '@/lib/api'

const mockApi = api as unknown as Record<string, ReturnType<typeof vi.fn>>

const baseUser = {
  email: 'a@b.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  memberSince: '2020-01-15',
}

function mockLocation(search = '') {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      ...window.location,
      search,
      pathname: '/account',
      href: 'http://localhost/account',
    },
  })
}

describe('AccountSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation('')
  })

  it('renders loading state while fetching subscription', () => {
    mockApi.getSubscriptionStatus.mockReturnValue(new Promise(() => {}))
    render(<AccountSettings user={baseUser} />)
    expect(screen.getByText(/loading subscription/i)).toBeInTheDocument()
  })

  it('renders user details once loaded', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'free',
      status: 'free',
    })
    render(<AccountSettings user={baseUser} />)
    expect(await screen.findByText(baseUser.email)).toBeInTheDocument()
    expect(screen.getByText(/member since/i)).toBeInTheDocument()
  })

  it('renders upgrade cards for free plan users', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'free',
      status: 'free',
    })
    render(<AccountSettings user={baseUser} monthlyPriceId="price_m" lifetimePriceId="price_l" />)
    expect(await screen.findByRole('button', { name: /start monthly plan/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get lifetime access/i })).toBeInTheDocument()
  })

  it('renders subscription management for standard users', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'standard',
      status: 'standard',
      nextBillingDate: '2099-01-01',
    })
    render(<AccountSettings user={baseUser} />)
    expect(await screen.findByText(/subscription management/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /manage subscription/i })).toBeInTheDocument()
  })

  it('renders lifetime membership section for lifetime users', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'lifetime',
      status: 'lifetime',
    })
    render(<AccountSettings user={baseUser} />)
    expect(await screen.findByText(/your lifetime membership is active/i)).toBeInTheDocument()
  })

  it('falls back to free plan when subscription fetch fails', async () => {
    mockApi.getSubscriptionStatus.mockRejectedValue(new Error('fetch failed'))
    render(<AccountSettings user={baseUser} monthlyPriceId="price_m" />)
    // falls back to free plan view
    expect(
      await screen.findByRole('button', { name: /start monthly plan/i })
    ).toBeInTheDocument()
  })

  it('shows upgrade buttons disabled when no priceId provided', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'free',
      status: 'free',
    })
    render(<AccountSettings user={baseUser} />)
    const btns = await screen.findAllByRole('button', { name: /stripe not configured/i })
    expect(btns.length).toBeGreaterThanOrEqual(1)
    for (const btn of btns) {
      expect(btn).toBeDisabled()
    }
  })

  it('creates checkout session on monthly plan upgrade click', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'free',
      status: 'free',
    })
    mockApi.createCheckoutSession.mockResolvedValue({ url: 'https://checkout' })

    const hrefSetter = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        search: '',
        pathname: '/account',
        get href() {
          return 'http://localhost/account'
        },
        set href(val: string) {
          hrefSetter(val)
        },
      },
    })

    render(<AccountSettings user={baseUser} monthlyPriceId="price_m" />)
    const btn = await screen.findByRole('button', { name: /start monthly plan/i })
    await userEvent.click(btn)
    await waitFor(() => {
      expect(mockApi.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ priceId: 'price_m' })
      )
    })
  })

  it('creates lifetime checkout session on lifetime plan upgrade click', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'free',
      status: 'free',
    })
    mockApi.createCheckoutSession.mockResolvedValue({ url: 'https://checkout' })

    render(<AccountSettings user={baseUser} lifetimePriceId="price_lifetime" />)
    const btn = await screen.findByRole('button', { name: /get lifetime access/i })
    await userEvent.click(btn)
    await waitFor(() => {
      expect(mockApi.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ priceId: 'price_lifetime' })
      )
    })
  })

  it('opens portal session on manage subscription click', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'standard',
      status: 'standard',
    })
    mockApi.createPortalSession.mockResolvedValue({ url: 'https://portal' })

    render(<AccountSettings user={baseUser} />)
    const btn = await screen.findByRole('button', { name: /manage subscription/i })
    await userEvent.click(btn)
    await waitFor(() => {
      expect(mockApi.createPortalSession).toHaveBeenCalled()
    })
  })

  it('does not render manage subscription for lifetime members', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'lifetime',
      status: 'lifetime',
    })
    render(<AccountSettings user={baseUser} />)
    await screen.findByText(/your lifetime membership is active/i)
    expect(screen.queryByRole('button', { name: /manage subscription/i })).not.toBeInTheDocument()
  })

  it('renders with custom className', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'free',
      status: 'free',
    })
    const { container } = render(
      <AccountSettings user={baseUser} className="custom-class" monthlyPriceId="p" />
    )
    await screen.findByRole('button', { name: /start monthly plan/i })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders custom plan features', async () => {
    mockApi.getSubscriptionStatus.mockResolvedValue({
      currentPlan: 'free',
      status: 'free',
    })
    render(
      <AccountSettings
        user={baseUser}
        monthlyPriceId="p"
        standardPlanFeatures={[{ name: 'Custom Feature A' }, { name: 'Custom Feature B' }]}
      />
    )
    expect(await screen.findByText('Custom Feature A')).toBeInTheDocument()
    expect(screen.getByText('Custom Feature B')).toBeInTheDocument()
  })
})
