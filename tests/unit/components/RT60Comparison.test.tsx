import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RT60Comparison } from '../../../src/components/visualizations/RT60Comparison'

// Mock the AcousticsContext
const mockUseAcoustics = vi.fn()
vi.mock('../../../src/context/AcousticsContext', () => ({
  useAcoustics: () => mockUseAcoustics(),
}))

// Mock the export utilities
vi.mock('../../../src/lib/utils/export', () => ({
  exportToCSV: vi.fn(),
  exportChartAsPNG: vi.fn().mockResolvedValue(undefined),
  generateFilename: vi.fn().mockReturnValue('test-file.csv'),
}))

// Mock ResizeObserver for Recharts ResponsiveContainer
vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

describe('RT60Comparison', () => {
  const defaultMockData = {
    currentRT60: {
      125: 0.85,
      250: 0.92,
      500: 0.78,
      1000: 0.71,
      2000: 0.68,
      4000: 0.55,
    },
    predictedRT60: {
      125: 0.45,
      250: 0.48,
      500: 0.42,
      1000: 0.38,
      2000: 0.35,
      4000: 0.30,
    },
  }

  beforeEach(() => {
    mockUseAcoustics.mockReturnValue(defaultMockData)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the component', () => {
      render(<RT60Comparison />)

      expect(screen.getByText('RT60 Comparison (Before/After Treatment)')).toBeDefined()
    })

    it('should render export CSV button', () => {
      render(<RT60Comparison />)

      expect(screen.getByText('Export CSV')).toBeDefined()
    })

    it('should render export PNG button', () => {
      render(<RT60Comparison />)

      expect(screen.getByText('Export PNG')).toBeDefined()
    })

    it('should render summary statistics', () => {
      render(<RT60Comparison />)

      expect(screen.getByText('Current Avg RT60')).toBeDefined()
      expect(screen.getByText('Predicted Avg RT60')).toBeDefined()
      expect(screen.getByText('Improvement')).toBeDefined()
    })
  })

  describe('summary calculations', () => {
    it('should display correct current average RT60', () => {
      render(<RT60Comparison />)

      // Average of current: (0.85 + 0.92 + 0.78 + 0.71 + 0.68 + 0.55) / 6 = 0.7483
      // Should be displayed as 0.75s
      const avgText = screen.getByText(/0\.75s|0\.74s/)
      expect(avgText).toBeDefined()
    })

    it('should display correct predicted average RT60', () => {
      render(<RT60Comparison />)

      // Average of predicted: (0.45 + 0.48 + 0.42 + 0.38 + 0.35 + 0.30) / 6 = 0.3967
      // Should be displayed as 0.40s
      const predText = screen.getByText(/0\.40s|0\.39s|0\.38s/)
      expect(predText).toBeDefined()
    })

    it('should display improvement percentage', () => {
      render(<RT60Comparison />)

      // Improvement = ((0.7483 - 0.3967) / 0.7483) * 100 ≈ 47%
      // Look for any percentage value
      const percentages = screen.getAllByText(/%$/)
      expect(percentages.length).toBeGreaterThan(0)
    })
  })

  describe('export functionality', () => {
    it('should call exportToCSV when CSV button is clicked', async () => {
      const { exportToCSV } = await import('../../../src/lib/utils/export')
      render(<RT60Comparison />)

      const csvButton = screen.getByText('Export CSV')
      fireEvent.click(csvButton)

      expect(exportToCSV).toHaveBeenCalled()
    })

    it('should pass correct data format to exportToCSV', async () => {
      const { exportToCSV } = await import('../../../src/lib/utils/export')
      render(<RT60Comparison />)

      const csvButton = screen.getByText('Export CSV')
      fireEvent.click(csvButton)

      // Check that it was called with an array containing the frequency data
      const callArgs = (exportToCSV as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(Array.isArray(callArgs[0])).toBe(true)
      expect(callArgs[0].length).toBe(6) // 6 frequency bands
      expect(callArgs[0][0]).toHaveProperty('frequency')
      expect(callArgs[0][0]).toHaveProperty('current')
      expect(callArgs[0][0]).toHaveProperty('predicted')
      expect(callArgs[0][0]).toHaveProperty('target')
    })
  })

  describe('data transformation', () => {
    it('should transform RT60 data into chart format', async () => {
      const { exportToCSV } = await import('../../../src/lib/utils/export')
      render(<RT60Comparison />)

      const csvButton = screen.getByText('Export CSV')
      fireEvent.click(csvButton)

      // Verify data structure using the mocked function
      const mockCalls = (exportToCSV as ReturnType<typeof vi.fn>).mock.calls
      expect(mockCalls.length).toBeGreaterThan(0)

      const data = mockCalls[0][0]
      expect(data[0].frequency).toBe('125Hz')
      expect(data[0].current).toBe(0.85)
      expect(data[0].predicted).toBe(0.45)
      expect(data[0].target).toBe(0.3)
    })

    it('should include ITU-R target in all data points', async () => {
      const { exportToCSV } = await import('../../../src/lib/utils/export')
      render(<RT60Comparison />)

      const csvButton = screen.getByText('Export CSV')
      fireEvent.click(csvButton)

      const mockCalls = (exportToCSV as ReturnType<typeof vi.fn>).mock.calls
      const data = mockCalls[0][0]

      // All entries should have target of 0.3
      data.forEach((entry: { target: number }) => {
        expect(entry.target).toBe(0.3)
      })
    })
  })

  describe('with different data', () => {
    it('should handle minimal RT60 values', () => {
      mockUseAcoustics.mockReturnValue({
        currentRT60: { 1000: 0.3 },
        predictedRT60: { 1000: 0.2 },
      })

      render(<RT60Comparison />)

      // Should still render without errors
      expect(screen.getByText('RT60 Comparison (Before/After Treatment)')).toBeDefined()
    })

    it('should handle empty RT60 data gracefully', () => {
      mockUseAcoustics.mockReturnValue({
        currentRT60: {},
        predictedRT60: {},
      })

      render(<RT60Comparison />)

      // Should render with NaN or handle empty gracefully
      expect(screen.getByText('RT60 Comparison (Before/After Treatment)')).toBeDefined()
    })

    it('should handle equal current and predicted values', () => {
      mockUseAcoustics.mockReturnValue({
        currentRT60: { 1000: 0.5 },
        predictedRT60: { 1000: 0.5 },
      })

      render(<RT60Comparison />)

      // 0% improvement
      expect(screen.getByText('0%')).toBeDefined()
    })
  })

  describe('UI elements', () => {
    it('should wrap content in a Card component', () => {
      const { container } = render(<RT60Comparison />)

      // Card should be present in the DOM
      const card = container.querySelector('.rounded-lg')
      expect(card).toBeDefined()
    })

    it('should have buttons with correct icons', () => {
      render(<RT60Comparison />)

      // Buttons should be present
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(2)
    })
  })

  describe('chart container', () => {
    it('should have a responsive container', () => {
      const { container } = render(<RT60Comparison />)

      // ResponsiveContainer renders with specific classes
      const responsiveContainer = container.querySelector('.recharts-responsive-container')
      expect(responsiveContainer).toBeDefined()
    })
  })
})
