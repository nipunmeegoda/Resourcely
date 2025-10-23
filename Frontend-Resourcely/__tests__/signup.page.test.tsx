import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUpPage from '@/app/signup/page'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { within } from '@testing-library/react'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'User registered successfully.' }),
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('submits valid form and shows success toast', async () => {
    const { toast } = await import('sonner')
    render(<SignUpPage />)

    const name = screen.getByLabelText(/Full Name/i)
    const email = screen.getByLabelText(/Email/i)
    const password = screen.getByLabelText(/^Password$/i)

    fireEvent.change(name, { target: { value: 'Test User' } })
    fireEvent.change(email, { target: { value: 'test@example.com' } })
    fireEvent.change(password, { target: { value: 'Aa1!aa' } })

    const form1 = screen.getByLabelText(/Full Name/i).closest('form') as HTMLFormElement
    const submit1 = within(form1).getByRole('button', { name: /^\s*sign up\s*$/i })
    fireEvent.click(submit1)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/register',
        expect.objectContaining({ method: 'POST' })
      )
      expect(toast.success).toHaveBeenCalled()
    })
  })

  it('shows validation errors for invalid inputs', async () => {
    render(<SignUpPage />)
  
    const form = screen.getByLabelText(/full name/i).closest('form') as HTMLFormElement
    fireEvent.submit(form)
  
    expect(await screen.findByText(/Name is required\./i)).toBeInTheDocument()
    expect(await screen.findByText(/Email is required\./i)).toBeInTheDocument()
    expect(await screen.findByText(/Password is required\./i)).toBeInTheDocument()
  })
})


