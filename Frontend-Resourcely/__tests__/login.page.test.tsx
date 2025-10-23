import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import LoginPage from '@/app/login/page'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as nextNav from 'next/navigation'
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('LoginPage', () => {
  const push = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock router push/replace
    vi.spyOn(nextNav, 'useRouter').mockReturnValue({ push, replace: vi.fn() } as any)

    // Mock fetch success
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          user: { role: 'user', email: 'test@example.com', username: 'Test' },
          message: 'Login successful.',
        }),
    } as any)

    // Clear auth between tests
    localStorage.clear()
    push.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs in successfully and navigates to /user/', async () => {
    render(<LoginPage />)

    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/^password$/i)

    fireEvent.change(email, { target: { value: 'test@example.com' } })
    fireEvent.change(password, { target: { value: 'abcdef' } })

    const form = email.closest('form') as HTMLFormElement
    const submit = within(form).getByRole('button', { name: /^\s*sign in\s*$/i })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({ method: 'POST' })
      )
      const auth = localStorage.getItem('auth') || ''
      expect(auth).toContain('"isAuthenticated":true')
      expect(push).toHaveBeenCalledWith('/user/')
    })

    const { toast } = await import('sonner')
    expect(toast.success).toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows validation errors for invalid inputs', async () => {
    render(<LoginPage />)

    const form = screen.getByLabelText(/email/i).closest('form') as HTMLFormElement
    fireEvent.submit(form)

    expect(await screen.findByText(/Please enter a valid email address\./i)).toBeInTheDocument()
    expect(
      await screen.findByText(/Password must be at least 6 characters long\./i)
    ).toBeInTheDocument()

    const { toast } = await import('sonner')
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })
})

