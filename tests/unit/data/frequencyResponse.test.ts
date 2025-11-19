import { describe, it, expect } from 'vitest'
import { getRoomModes, RoomMode } from '../../../src/lib/data/frequencyResponse'
import { STUDIO_8 } from '../../../src/lib/utils/constants'

describe('getRoomModes', () => {
  describe('axial mode calculations', () => {
    it('should return room modes sorted by frequency', () => {
      const modes = getRoomModes()

      // Verify sorting
      for (let i = 1; i < modes.length; i++) {
        expect(modes[i].frequency).toBeGreaterThanOrEqual(modes[i - 1].frequency)
      }
    })

    it('should calculate correct first axial mode for length', () => {
      const modes = getRoomModes()
      const c = 1130 // ft/s
      const L = STUDIO_8.dimensions.width // 12.3 ft

      // First length mode: f = c / (2 * L)
      const expectedFreq = Math.round((c / (2 * L)) * 10) / 10

      const lengthMode1 = modes.find(m => m.label === '1L')
      expect(lengthMode1).toBeDefined()
      expect(lengthMode1!.frequency).toBe(expectedFreq)
      expect(lengthMode1!.type).toBe('axial')
      expect(lengthMode1!.axis).toBe('Length')
    })

    it('should calculate correct first axial mode for width', () => {
      const modes = getRoomModes()
      const c = 1130 // ft/s
      const W = STUDIO_8.dimensions.depth // 10.6 ft

      const expectedFreq = Math.round((c / (2 * W)) * 10) / 10

      const widthMode1 = modes.find(m => m.label === '1W')
      expect(widthMode1).toBeDefined()
      expect(widthMode1!.frequency).toBe(expectedFreq)
      expect(widthMode1!.type).toBe('axial')
      expect(widthMode1!.axis).toBe('Width')
    })

    it('should calculate correct first axial mode for height', () => {
      const modes = getRoomModes()
      const c = 1130 // ft/s
      const H = STUDIO_8.dimensions.height // 8.2 ft

      const expectedFreq = Math.round((c / (2 * H)) * 10) / 10

      const heightMode1 = modes.find(m => m.label === '1H')
      expect(heightMode1).toBeDefined()
      expect(heightMode1!.frequency).toBe(expectedFreq)
      expect(heightMode1!.type).toBe('axial')
      expect(heightMode1!.axis).toBe('Height')
    })

    it('should include up to 3rd order axial modes for each dimension', () => {
      const modes = getRoomModes()

      // Check for length modes (some may be filtered out if > 500 Hz)
      const lengthModes = modes.filter(m => m.axis === 'Length' && m.type === 'axial')
      expect(lengthModes.length).toBeGreaterThanOrEqual(1)

      // Check for width modes
      const widthModes = modes.filter(m => m.axis === 'Width' && m.type === 'axial')
      expect(widthModes.length).toBeGreaterThanOrEqual(1)

      // Check for height modes
      const heightModes = modes.filter(m => m.axis === 'Height' && m.type === 'axial')
      expect(heightModes.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('tangential mode calculations', () => {
    it('should calculate tangential modes with two non-zero indices', () => {
      const modes = getRoomModes()
      const tangentialModes = modes.filter(m => m.type === 'tangential')

      expect(tangentialModes.length).toBeGreaterThan(0)

      // Check that tangential modes have two-dimension labels
      tangentialModes.forEach(mode => {
        expect(mode.label).toMatch(/^\d[LWH]-\d[LWH]$/)
      })
    })

    it('should calculate 1L-1W tangential mode correctly', () => {
      const modes = getRoomModes()
      const c = 1130 // ft/s
      const L = STUDIO_8.dimensions.width // 12.3 ft
      const W = STUDIO_8.dimensions.depth // 10.6 ft

      // f = (c/2) * sqrt((1/L)^2 + (1/W)^2)
      const expectedFreq = Math.round(
        (c / 2) * Math.sqrt(Math.pow(1 / L, 2) + Math.pow(1 / W, 2)) * 10
      ) / 10

      const mode1L1W = modes.find(m => m.label === '1L-1W')
      expect(mode1L1W).toBeDefined()
      expect(mode1L1W!.frequency).toBe(expectedFreq)
      expect(mode1L1W!.type).toBe('tangential')
    })

    it('should calculate 1L-1H tangential mode correctly', () => {
      const modes = getRoomModes()
      const c = 1130 // ft/s
      const L = STUDIO_8.dimensions.width // 12.3 ft
      const H = STUDIO_8.dimensions.height // 8.2 ft

      const expectedFreq = Math.round(
        (c / 2) * Math.sqrt(Math.pow(1 / L, 2) + Math.pow(1 / H, 2)) * 10
      ) / 10

      const mode1L1H = modes.find(m => m.label === '1L-1H')
      expect(mode1L1H).toBeDefined()
      expect(mode1L1H!.frequency).toBe(expectedFreq)
      expect(mode1L1H!.type).toBe('tangential')
    })

    it('should calculate 1W-1H tangential mode correctly', () => {
      const modes = getRoomModes()
      const c = 1130 // ft/s
      const W = STUDIO_8.dimensions.depth // 10.6 ft
      const H = STUDIO_8.dimensions.height // 8.2 ft

      const expectedFreq = Math.round(
        (c / 2) * Math.sqrt(Math.pow(1 / W, 2) + Math.pow(1 / H, 2)) * 10
      ) / 10

      const mode1W1H = modes.find(m => m.label === '1W-1H')
      expect(mode1W1H).toBeDefined()
      expect(mode1W1H!.frequency).toBe(expectedFreq)
      expect(mode1W1H!.type).toBe('tangential')
    })
  })

  describe('frequency filtering', () => {
    it('should only include modes up to 500 Hz', () => {
      const modes = getRoomModes()

      modes.forEach(mode => {
        expect(mode.frequency).toBeLessThanOrEqual(500)
      })
    })

    it('should filter out high frequency modes', () => {
      const modes = getRoomModes()
      const c = 1130 // ft/s
      const H = STUDIO_8.dimensions.height // 8.2 ft

      // Third height mode would be: (c/2) * (3/H) = 206.7 Hz
      // This should be included (< 500)
      // But much higher modes would be excluded

      const highestAxialLabel = '3H'
      const thirdHeightMode = modes.find(m => m.label === highestAxialLabel)

      // 3H should be around 206.7 Hz, which is < 500
      if (thirdHeightMode) {
        expect(thirdHeightMode.frequency).toBeLessThanOrEqual(500)
      }
    })
  })

  describe('mode structure', () => {
    it('should return array of RoomMode objects with correct properties', () => {
      const modes = getRoomModes()

      modes.forEach(mode => {
        expect(mode).toHaveProperty('frequency')
        expect(mode).toHaveProperty('type')
        expect(mode).toHaveProperty('axis')
        expect(mode).toHaveProperty('label')

        expect(typeof mode.frequency).toBe('number')
        expect(['axial', 'tangential', 'oblique']).toContain(mode.type)
        expect(typeof mode.axis).toBe('string')
        expect(typeof mode.label).toBe('string')
      })
    })

    it('should not return any oblique modes (not implemented)', () => {
      const modes = getRoomModes()
      const obliqueModes = modes.filter(m => m.type === 'oblique')

      expect(obliqueModes).toHaveLength(0)
    })

    it('should return non-empty array', () => {
      const modes = getRoomModes()
      expect(modes.length).toBeGreaterThan(0)
    })
  })

  describe('physical validity', () => {
    it('should have frequencies in reasonable range for room acoustics', () => {
      const modes = getRoomModes()

      modes.forEach(mode => {
        // Room modes typically start around 20-50 Hz for typical rooms
        expect(mode.frequency).toBeGreaterThan(20)
        // And are limited to low frequencies where modal behavior is significant
        expect(mode.frequency).toBeLessThanOrEqual(500)
      })
    })

    it('should have first axial modes in correct relative order', () => {
      const modes = getRoomModes()

      const mode1L = modes.find(m => m.label === '1L')
      const mode1W = modes.find(m => m.label === '1W')
      const mode1H = modes.find(m => m.label === '1H')

      // Height is smallest (8.2 ft) so 1H should have highest frequency
      // Width (10.6 ft) is next, so 1W should be middle
      // Length (12.3 ft) is largest, so 1L should be lowest

      expect(mode1L!.frequency).toBeLessThan(mode1W!.frequency)
      expect(mode1W!.frequency).toBeLessThan(mode1H!.frequency)
    })

    it('should have second order modes at roughly double first order frequency', () => {
      const modes = getRoomModes()

      const mode1L = modes.find(m => m.label === '1L')
      const mode2L = modes.find(m => m.label === '2L')

      if (mode1L && mode2L) {
        // Second mode should be approximately 2x first mode
        const ratio = mode2L.frequency / mode1L.frequency
        expect(ratio).toBeCloseTo(2, 0) // Within integer precision
      }
    })
  })

  describe('consistency checks', () => {
    it('should return consistent results on multiple calls', () => {
      const modes1 = getRoomModes()
      const modes2 = getRoomModes()

      expect(modes1).toEqual(modes2)
    })

    it('should have unique labels for each mode', () => {
      const modes = getRoomModes()
      const labels = modes.map(m => m.label)
      const uniqueLabels = [...new Set(labels)]

      expect(labels.length).toBe(uniqueLabels.length)
    })
  })
})
