import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { AcousticsProvider, useAcoustics, PanelConfig } from '../../../src/context/AcousticsContext'
import { ReactNode } from 'react'

// Mock fetch for data loading tests
const mockFetch = vi.fn()

// Sample mock data
const mockCsvData = `Frequency_Hz,Magnitude_dB,Phase_deg,STI,STI_Degradation_%,position,Color
100,85.0,45.0,0.95,0.0,Host A,#10b981
200,82.0,-30.0,0.88,7.4,Host B,#3b82f6`

const mockSmaartLog = `
Filter	Band	RT60	T20	T30
Oct	125Hz	0.85	0.82	0.88
Oct	250Hz	0.92	0.89	0.95
Oct	500Hz	0.78	0.75	0.81
Oct	1000Hz	0.71	0.68	0.74

STI	0.94	0.99	0.97	0.98	0.86	0.91	1.00
`

describe('AcousticsContext', () => {
  beforeEach(() => {
    // Setup fetch mock
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('.csv')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvData),
        })
      }
      if (url.includes('smaartLogs') || url.includes('.txt')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockSmaartLog),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  // Wrapper for testing hooks
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AcousticsProvider>{children}</AcousticsProvider>
  )

  describe('useAcoustics hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAcoustics())
      }).toThrow('useAcoustics must be used within AcousticsProvider')

      consoleSpy.mockRestore()
    })

    it('should provide context when used within provider', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current).toBeDefined()
      })

      expect(result.current.selectedRoom).toBeDefined()
      expect(result.current.panelConfig).toBeDefined()
    })
  })

  describe('initial state', () => {
    it('should have correct default room selection', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.selectedRoom).toBe('Studio 8')
    })

    it('should have correct default position selection', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.selectedPosition).toBe('Host C (Talent)')
    })

    it('should have correct default panel configuration', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.panelConfig).toEqual({
        '2_inch': 3,
        '3_inch': 6,
        '5_5_inch': 12,
        '11_inch': 4,
      })
    })

    it('should have drape removal enabled by default', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.drapeRemoval).toBe(true)
    })

    it('should have correct default view mode', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.viewMode).toBe('3D')
    })

    it('should have modal analysis disabled by default', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.showModalAnalysis).toBe(false)
    })

    it('should have comparison mode disabled by default', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.comparisonMode).toBe(false)
    })
  })

  describe('room selection', () => {
    it('should update selected room', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        result.current.setSelectedRoom('The Hub')
      })

      await waitFor(() => {
        expect(result.current.selectedRoom).toBe('The Hub')
      })
    })
  })

  describe('position selection', () => {
    it('should update selected position', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        result.current.setSelectedPosition('Mid Room')
      })

      await waitFor(() => {
        expect(result.current.selectedPosition).toBe('Mid Room')
      })
    })
  })

  describe('panel configuration', () => {
    it('should update panel count for specific thickness', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updatePanelCount('2_inch', 10)
      })

      expect(result.current.panelConfig['2_inch']).toBe(10)
    })

    it('should not allow negative panel counts', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updatePanelCount('3_inch', -5)
      })

      expect(result.current.panelConfig['3_inch']).toBe(0)
    })

    it('should reset panel config to defaults', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Modify panel config
      act(() => {
        result.current.updatePanelCount('2_inch', 100)
        result.current.updatePanelCount('3_inch', 100)
      })

      // Reset
      act(() => {
        result.current.resetPanelConfig()
      })

      expect(result.current.panelConfig).toEqual({
        '2_inch': 3,
        '3_inch': 6,
        '5_5_inch': 12,
        '11_inch': 4,
      })
    })

    it('should update multiple panel thicknesses independently', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updatePanelCount('2_inch', 5)
      })

      act(() => {
        result.current.updatePanelCount('11_inch', 8)
      })

      expect(result.current.panelConfig['2_inch']).toBe(5)
      expect(result.current.panelConfig['11_inch']).toBe(8)
      // Others should remain unchanged
      expect(result.current.panelConfig['3_inch']).toBe(6)
      expect(result.current.panelConfig['5_5_inch']).toBe(12)
    })
  })

  describe('drape removal', () => {
    it('should toggle drape removal state', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.drapeRemoval).toBe(true)

      act(() => {
        result.current.setDrapeRemoval(false)
      })

      expect(result.current.drapeRemoval).toBe(false)
    })
  })

  describe('view mode', () => {
    it('should toggle between 2D and 3D', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.viewMode).toBe('3D')

      act(() => {
        result.current.toggleViewMode()
      })

      expect(result.current.viewMode).toBe('2D')

      act(() => {
        result.current.toggleViewMode()
      })

      expect(result.current.viewMode).toBe('3D')
    })
  })

  describe('modal analysis', () => {
    it('should toggle modal analysis state', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.showModalAnalysis).toBe(false)

      act(() => {
        result.current.toggleModalAnalysis()
      })

      expect(result.current.showModalAnalysis).toBe(true)

      act(() => {
        result.current.toggleModalAnalysis()
      })

      expect(result.current.showModalAnalysis).toBe(false)
    })
  })

  describe('comparison mode', () => {
    it('should toggle comparison mode state', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.comparisonMode).toBe(false)

      act(() => {
        result.current.toggleComparisonMode()
      })

      expect(result.current.comparisonMode).toBe(true)
    })
  })

  describe('calculated metrics', () => {
    it('should calculate total panels from config', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Default config: 3 + 6 + 12 + 4 = 25
      expect(result.current.totalPanels).toBe(25)
    })

    it('should calculate total cost from config', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Cost should be positive
      expect(result.current.totalCost).toBeGreaterThan(0)
    })

    it('should have predicted RT60 values', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.predictedRT60).toBeDefined()
      expect(typeof result.current.predictedRT60).toBe('object')
    })

    it('should have current and predicted STI values', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.currentSTI).toBeGreaterThan(0)
      expect(result.current.currentSTI).toBeLessThanOrEqual(1)
      expect(result.current.predictedSTI).toBeGreaterThan(0)
      expect(result.current.predictedSTI).toBeLessThanOrEqual(1)
    })

    it('should update calculated metrics when panel config changes', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCost = result.current.totalCost
      const initialPanels = result.current.totalPanels

      act(() => {
        result.current.updatePanelCount('11_inch', 20)
      })

      expect(result.current.totalPanels).toBeGreaterThan(initialPanels)
      expect(result.current.totalCost).toBeGreaterThan(initialCost)
    })
  })

  describe('data loading', () => {
    it('should set loading state during data fetch', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      // Initially should be loading
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should fetch CSV data on mount', async () => {
      renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Should have called fetch for CSV file
      const csvCall = mockFetch.mock.calls.find(call =>
        call[0].includes('.csv')
      )
      expect(csvCall).toBeDefined()
    })

    it('should fetch Smaart log data on mount', async () => {
      renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Should have called fetch for Smaart log file
      const smaartCall = mockFetch.mock.calls.find(call =>
        call[0].includes('smaartLogs') || call[0].includes('.txt')
      )
      expect(smaartCall).toBeDefined()
    })

    it('should set error state on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should set error state on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should store parsed frequency data', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.rawFrequencyData).toBeDefined()
      expect(Array.isArray(result.current.rawFrequencyData)).toBe(true)
    })

    it('should store parsed Smaart data', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.smaartData).toBeDefined()
    })

    it('should refetch data when room changes', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = mockFetch.mock.calls.length

      await act(async () => {
        result.current.setSelectedRoom('The Hub')
      })

      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount)
      })
    })

    it('should refetch data when position changes', async () => {
      const { result } = renderHook(() => useAcoustics(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = mockFetch.mock.calls.length

      await act(async () => {
        result.current.setSelectedPosition('Mid Room')
      })

      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount)
      })
    })
  })

  describe('provider component', () => {
    it('should render children', async () => {
      render(
        <AcousticsProvider>
          <div data-testid="child">Test Child</div>
        </AcousticsProvider>
      )

      expect(screen.getByTestId('child')).toBeDefined()
    })
  })
})
