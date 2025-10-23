import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock toast
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// Mock Tabs to always render content and expose triggers as buttons with role=tab
vi.mock('@/components/ui/tabs', () => {
  return {
    Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children, ...props }: any) => (
      <button role="tab" {...props}>{children}</button>
    ),
    TabsContent: ({ children }: { children: React.ReactNode }) => <div role="tabpanel">{children}</div>,
  }
})

// Mock react-big-calendar with a simple trigger to open slot
vi.mock('react-big-calendar', () => {
  return {
    Calendar: (props: { onSelectSlot?: (slot: { start: Date; end: Date }) => void }) => (
      <button onClick={() => props.onSelectSlot?.({ start: new Date(), end: new Date(Date.now() + 60 * 60 * 1000) })}>
        Open Slot
      </button>
    ),
    dateFnsLocalizer: () => ({}),
  }
})

// API mocks
vi.mock('@/api/api', () => {
  const createApprovedBooking = vi.fn(async (payload: Record<string, unknown>) => ({ data: { id: 1, ...payload } }))
  // minimal types not needed here; just provide the APIs the components call
  return {
    adminApi: {
      getApprovedBookings: vi.fn(async () => ({ data: [] })),
      createApprovedBooking,
    },
    usersApi: {
      getAllRoleLecturer: vi.fn(async () => ({ data: [{ id: 10, username: 'Prof. Alice', email: 'alice@uni.edu' }] })),
    },
    batchApi: {
      getAll: vi.fn(async () => ({ data: [{ id: 20, name: 'Batch A' }] })),
    },
    buildingsApi: {
      getAll: vi.fn(async () => ({ data: [{ id: 1, name: 'Main Building', description: '', createdAt: new Date().toISOString() }] })),
    },
    floorsApi: {
      getByBuilding: vi.fn(async (_id: number) => ({ data: [{ id: 2, name: 'First Floor', description: '', buildingId: 1, buildingName: 'Main Building' }] })),
    },
    blocksApi: {
      getByFloor: vi.fn(async (_id: number) => ({ data: [{ id: 3, name: 'Block A', description: '', floorId: 2, floorName: 'First Floor', buildingName: 'Main Building' }] })),
    },
    resourcesApi: {
      getByBlock: vi.fn(async (_id: number) => ({ data: [{ id: 4, name: 'Room 101', type: 'Room', description: 'Test room', capacity: 30, blockId: 3, blockName: 'Block A', floorName: 'First Floor', buildingName: 'Main Building' }] })),
    },
  }
})

describe('Admin Academic Scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens scheduler, selects a slot, fills dialog, and creates booking', async () => {
    const { default: AcademicPage } = await import('@/app/admin/academic/page')
    render(<AcademicPage />)

    // Switch to Academic Scheduler tab
    const schedulerTab = screen.getByRole('tab', { name: /academic scheduler/i })
    fireEvent.click(schedulerTab)

    // Trigger slot selection via mocked calendar (wait until calendar is rendered)
    const openSlotBtn = await screen.findByRole('button', { name: /open slot/i })
    fireEvent.click(openSlotBtn)

    // Dialog should appear
    expect(await screen.findByText(/Create New Academic Booking/i)).toBeInTheDocument()

    // Select building → floor → block → resource
    const building = await screen.findByLabelText(/Select Building/i)
    fireEvent.change(building, { target: { value: '1' } })

    const floor = await screen.findByLabelText(/Select Floor/i)
    fireEvent.change(floor, { target: { value: '2' } })

    const block = await screen.findByLabelText(/Select Block/i)
    fireEvent.change(block, { target: { value: '3' } })

    // Resource card is role=button
    const resource = await screen.findByRole('button', { name: /Room 101/i })
    fireEvent.click(resource)

    // Select lecturer via Radix Select
    fireEvent.click(screen.getByText(/Select a lecturer/i))
    const lecturerItem = await screen.findByText(/Prof\. Alice/i)
    fireEvent.click(lecturerItem)

    // Fill reason and capacity (scope to the dialog content)
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(await screen.findByLabelText(/Reason/i, {}, { container: dialog as HTMLElement }), { target: { value: 'Test Lecture' } })
    fireEvent.change(await screen.findByLabelText(/Capacity/i, {}, { container: dialog as HTMLElement }), { target: { value: '25' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }))

    await waitFor(async () => {
      const { adminApi } = await import('@/api/api')
      expect(adminApi.createApprovedBooking).toHaveBeenCalled()
    })
  }, 20000)
})


