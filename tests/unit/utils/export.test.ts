import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, generateFilename } from '../../../src/lib/utils/export'

// Mock DOM APIs
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()

describe('exportToCSV', () => {
  beforeEach(() => {
    // Setup DOM mocks
    vi.stubGlobal('document', {
      createElement: mockCreateElement.mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      }),
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    })

    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL.mockReturnValue('blob:test'),
      revokeObjectURL: mockRevokeObjectURL,
    })

    vi.stubGlobal('Blob', class {
      constructor(public content: string[], public options: { type: string }) {}
    })

    // Clear mock call counts
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('basic functionality', () => {
    it('should create CSV with headers and data', () => {
      const data = [
        { name: 'Test1', value: 100 },
        { name: 'Test2', value: 200 },
      ]

      exportToCSV(data, 'test.csv')

      // Verify Blob was created
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('should handle empty data array', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      exportToCSV([], 'test.csv')

      expect(consoleSpy).toHaveBeenCalledWith('No data to export')
      expect(mockCreateObjectURL).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should set correct download filename', () => {
      const link = {
        href: '',
        download: '',
        click: mockClick,
      }
      mockCreateElement.mockReturnValue(link)

      const data = [{ test: 1 }]
      exportToCSV(data, 'my-export.csv')

      expect(link.download).toBe('my-export.csv')
    })
  })

  describe('CSV content formatting', () => {
    it('should generate correct headers from first object', () => {
      let capturedContent = ''
      vi.stubGlobal('Blob', class {
        constructor(content: string[]) {
          capturedContent = content[0]
        }
      })

      const data = [
        { frequency: 100, magnitude: 85, position: 'Host A' },
      ]

      exportToCSV(data, 'test.csv')

      expect(capturedContent).toContain('frequency,magnitude,position')
    })

    it('should include all data rows', () => {
      let capturedContent = ''
      vi.stubGlobal('Blob', class {
        constructor(content: string[]) {
          capturedContent = content[0]
        }
      })

      const data = [
        { value: 1 },
        { value: 2 },
        { value: 3 },
      ]

      exportToCSV(data, 'test.csv')

      const lines = capturedContent.split('\n')
      expect(lines).toHaveLength(4) // header + 3 data rows
    })

    it('should wrap strings containing commas in quotes', () => {
      let capturedContent = ''
      vi.stubGlobal('Blob', class {
        constructor(content: string[]) {
          capturedContent = content[0]
        }
      })

      const data = [
        { name: 'Host A, Reference', value: 100 },
      ]

      exportToCSV(data, 'test.csv')

      expect(capturedContent).toContain('"Host A, Reference"')
    })

    it('should handle numeric values', () => {
      let capturedContent = ''
      vi.stubGlobal('Blob', class {
        constructor(content: string[]) {
          capturedContent = content[0]
        }
      })

      const data = [
        { integer: 100, decimal: 3.14, negative: -50 },
      ]

      exportToCSV(data, 'test.csv')

      expect(capturedContent).toContain('100')
      expect(capturedContent).toContain('3.14')
      expect(capturedContent).toContain('-50')
    })

    it('should handle null and undefined values', () => {
      let capturedContent = ''
      vi.stubGlobal('Blob', class {
        constructor(content: string[]) {
          capturedContent = content[0]
        }
      })

      const data = [
        { a: null, b: undefined, c: '' },
      ]

      exportToCSV(data as Record<string, unknown>[], 'test.csv')

      // Should not throw and should produce CSV
      expect(capturedContent).toBeDefined()
    })
  })

  describe('blob creation', () => {
    it('should create blob with correct MIME type', () => {
      let capturedOptions: { type: string } | null = null
      vi.stubGlobal('Blob', class {
        constructor(_content: string[], options: { type: string }) {
          capturedOptions = options
        }
      })

      const data = [{ test: 1 }]
      exportToCSV(data, 'test.csv')

      expect(capturedOptions?.type).toBe('text/csv;charset=utf-8;')
    })
  })
})

describe('generateFilename', () => {
  beforeEach(() => {
    // Mock Date to return consistent value
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-07-15T10:30:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('filename format', () => {
    it('should generate filename with prefix and date', () => {
      const filename = generateFilename('export', 'csv')
      expect(filename).toBe('export_2025-07-15.csv')
    })

    it('should use correct extension', () => {
      const csvFilename = generateFilename('data', 'csv')
      const pngFilename = generateFilename('chart', 'png')
      const jsonFilename = generateFilename('config', 'json')

      expect(csvFilename.endsWith('.csv')).toBe(true)
      expect(pngFilename.endsWith('.png')).toBe(true)
      expect(jsonFilename.endsWith('.json')).toBe(true)
    })

    it('should include underscore separator between prefix and date', () => {
      const filename = generateFilename('test', 'txt')
      expect(filename).toContain('_')
      expect(filename.split('_')).toHaveLength(2)
    })
  })

  describe('date formatting', () => {
    it('should format date as YYYY-MM-DD', () => {
      const filename = generateFilename('export', 'csv')
      const dateMatch = filename.match(/\d{4}-\d{2}-\d{2}/)

      expect(dateMatch).not.toBeNull()
      expect(dateMatch![0]).toBe('2025-07-15')
    })

    it('should pad single digit months with zero', () => {
      vi.setSystemTime(new Date('2025-01-05T10:30:00.000Z'))

      const filename = generateFilename('export', 'csv')
      expect(filename).toContain('2025-01-05')
    })

    it('should pad single digit days with zero', () => {
      vi.setSystemTime(new Date('2025-12-03T10:30:00.000Z'))

      const filename = generateFilename('export', 'csv')
      expect(filename).toContain('2025-12-03')
    })
  })

  describe('edge cases', () => {
    it('should handle empty prefix', () => {
      const filename = generateFilename('', 'csv')
      expect(filename).toBe('_2025-07-15.csv')
    })

    it('should handle empty extension', () => {
      const filename = generateFilename('export', '')
      expect(filename).toBe('export_2025-07-15.')
    })

    it('should handle special characters in prefix', () => {
      const filename = generateFilename('rt60-comparison', 'csv')
      expect(filename).toBe('rt60-comparison_2025-07-15.csv')
    })

    it('should handle spaces in prefix', () => {
      const filename = generateFilename('my export', 'csv')
      expect(filename).toBe('my export_2025-07-15.csv')
    })
  })

  describe('typical use cases', () => {
    it('should generate appropriate filename for RT60 data export', () => {
      const filename = generateFilename('rt60_data', 'csv')
      expect(filename).toBe('rt60_data_2025-07-15.csv')
    })

    it('should generate appropriate filename for chart PNG export', () => {
      const filename = generateFilename('frequency_response_chart', 'png')
      expect(filename).toBe('frequency_response_chart_2025-07-15.png')
    })

    it('should generate appropriate filename for 3D view export', () => {
      const filename = generateFilename('room_3d_view', 'png')
      expect(filename).toBe('room_3d_view_2025-07-15.png')
    })
  })
})
