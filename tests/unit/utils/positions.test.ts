import { describe, it, expect } from 'vitest'
import {
  MEASUREMENT_POSITIONS,
  getSTIColor,
  getSTIQualityLabel,
  MeasurementPosition,
} from '../../../src/lib/utils/positions'

describe('MEASUREMENT_POSITIONS', () => {
  describe('data structure', () => {
    it('should have all expected measurement positions', () => {
      const expectedPositions = [
        'Host A (Reference)',
        'Host C (Talent)',
        'Mid Room',
        'NE Corner',
        'SE Corner',
        'Ceiling',
      ]

      expectedPositions.forEach(position => {
        expect(MEASUREMENT_POSITIONS[position]).toBeDefined()
      })
    })

    it('should have valid coordinates for all positions', () => {
      Object.values(MEASUREMENT_POSITIONS).forEach(position => {
        expect(position.x).toBeGreaterThanOrEqual(0)
        expect(position.y).toBeGreaterThanOrEqual(0)
        expect(position.z).toBeGreaterThan(0)

        // Within Studio 8 dimensions (approximately)
        expect(position.x).toBeLessThanOrEqual(13)
        expect(position.y).toBeLessThanOrEqual(11)
        expect(position.z).toBeLessThanOrEqual(9)
      })
    })

    it('should have valid STI values (0-1 range)', () => {
      Object.values(MEASUREMENT_POSITIONS).forEach(position => {
        expect(position.sti).toBeGreaterThanOrEqual(0)
        expect(position.sti).toBeLessThanOrEqual(1)
      })
    })

    it('should have valid degradation values (0-1 range)', () => {
      Object.values(MEASUREMENT_POSITIONS).forEach(position => {
        expect(position.degradation).toBeGreaterThanOrEqual(0)
        expect(position.degradation).toBeLessThanOrEqual(1)
      })
    })

    it('should have labels for all positions', () => {
      Object.values(MEASUREMENT_POSITIONS).forEach(position => {
        expect(position.label).toBeTruthy()
        expect(typeof position.label).toBe('string')
      })
    })
  })

  describe('reference position', () => {
    it('should have Host A as reference with 0 degradation', () => {
      const hostA = MEASUREMENT_POSITIONS['Host A (Reference)']

      expect(hostA.degradation).toBe(0.0)
      expect(hostA.sti).toBe(0.95)
      expect(hostA.label).toBe('Host A')
    })

    it('should have highest STI at reference position', () => {
      const hostA = MEASUREMENT_POSITIONS['Host A (Reference)']
      const otherPositions = Object.entries(MEASUREMENT_POSITIONS)
        .filter(([key]) => key !== 'Host A (Reference)')
        .map(([, value]) => value)

      otherPositions.forEach(position => {
        expect(hostA.sti).toBeGreaterThanOrEqual(position.sti)
      })
    })
  })

  describe('position-specific values', () => {
    it('should have correct values for Host C (Talent)', () => {
      const hostC = MEASUREMENT_POSITIONS['Host C (Talent)']

      expect(hostC.x).toBe(11.0)
      expect(hostC.y).toBe(5.3)
      expect(hostC.z).toBe(4.0)
      expect(hostC.sti).toBe(0.67)
      expect(hostC.label).toBe('Host C')
    })

    it('should have correct values for Mid Room', () => {
      const midRoom = MEASUREMENT_POSITIONS['Mid Room']

      expect(midRoom.x).toBe(6.15)
      expect(midRoom.y).toBe(5.3)
      expect(midRoom.z).toBe(4.0)
      expect(midRoom.sti).toBe(0.71)
      expect(midRoom.label).toBe('Mid Room')
    })

    it('should have Ceiling at higher z coordinate', () => {
      const ceiling = MEASUREMENT_POSITIONS['Ceiling']

      // Ceiling should be at a higher z than ear level
      expect(ceiling.z).toBe(7.5)
      expect(ceiling.z).toBeGreaterThan(4.0)
    })

    it('should have corners at room edges', () => {
      const neCorner = MEASUREMENT_POSITIONS['NE Corner']
      const seCorner = MEASUREMENT_POSITIONS['SE Corner']

      // Both corners should be at the far x position
      expect(neCorner.x).toBe(11.0)
      expect(seCorner.x).toBe(11.0)

      // NE corner near front, SE corner near back
      expect(neCorner.y).toBeLessThan(seCorner.y)
    })
  })

  describe('degradation calculations', () => {
    it('should have degradation calculated as (reference_sti - position_sti) / reference_sti', () => {
      const referenceSTI = MEASUREMENT_POSITIONS['Host A (Reference)'].sti // 0.95

      Object.values(MEASUREMENT_POSITIONS).forEach(position => {
        if (position.degradation > 0) {
          const expectedDegradation = (referenceSTI - position.sti) / referenceSTI
          // Allow for small rounding differences
          expect(position.degradation).toBeCloseTo(expectedDegradation, 2)
        }
      })
    })

    it('should have increasing degradation with decreasing STI', () => {
      const positions = Object.values(MEASUREMENT_POSITIONS)

      positions.forEach(pos1 => {
        positions.forEach(pos2 => {
          if (pos1.sti > pos2.sti) {
            expect(pos1.degradation).toBeLessThan(pos2.degradation)
          }
        })
      })
    })
  })
})

describe('getSTIColor', () => {
  describe('excellent quality (< 0.15 degradation)', () => {
    it('should return green for 0 degradation', () => {
      expect(getSTIColor(0)).toBe('#10b981')
    })

    it('should return green for 0.14 degradation', () => {
      expect(getSTIColor(0.14)).toBe('#10b981')
    })

    it('should return green for 0.10 degradation', () => {
      expect(getSTIColor(0.10)).toBe('#10b981')
    })
  })

  describe('good quality (0.15-0.25 degradation)', () => {
    it('should return blue for 0.15 degradation', () => {
      expect(getSTIColor(0.15)).toBe('#3b82f6')
    })

    it('should return blue for 0.24 degradation', () => {
      expect(getSTIColor(0.24)).toBe('#3b82f6')
    })

    it('should return blue for 0.20 degradation', () => {
      expect(getSTIColor(0.20)).toBe('#3b82f6')
    })
  })

  describe('fair quality (0.25-0.35 degradation)', () => {
    it('should return amber for 0.25 degradation', () => {
      expect(getSTIColor(0.25)).toBe('#f59e0b')
    })

    it('should return amber for 0.34 degradation', () => {
      expect(getSTIColor(0.34)).toBe('#f59e0b')
    })

    it('should return amber for 0.30 degradation', () => {
      expect(getSTIColor(0.30)).toBe('#f59e0b')
    })
  })

  describe('poor quality (>= 0.35 degradation)', () => {
    it('should return red for 0.35 degradation', () => {
      expect(getSTIColor(0.35)).toBe('#ef4444')
    })

    it('should return red for 0.50 degradation', () => {
      expect(getSTIColor(0.50)).toBe('#ef4444')
    })

    it('should return red for 1.0 degradation', () => {
      expect(getSTIColor(1.0)).toBe('#ef4444')
    })
  })

  describe('edge cases', () => {
    it('should handle boundary value 0.15 as blue (not green)', () => {
      expect(getSTIColor(0.15)).toBe('#3b82f6')
    })

    it('should handle boundary value 0.25 as amber (not blue)', () => {
      expect(getSTIColor(0.25)).toBe('#f59e0b')
    })

    it('should handle boundary value 0.35 as red (not amber)', () => {
      expect(getSTIColor(0.35)).toBe('#ef4444')
    })

    it('should handle very small degradation', () => {
      expect(getSTIColor(0.001)).toBe('#10b981')
    })

    it('should handle very large degradation', () => {
      expect(getSTIColor(10)).toBe('#ef4444')
    })
  })
})

describe('getSTIQualityLabel', () => {
  describe('excellent quality (< 0.15 degradation)', () => {
    it('should return "Excellent" for 0 degradation', () => {
      expect(getSTIQualityLabel(0)).toBe('Excellent')
    })

    it('should return "Excellent" for 0.14 degradation', () => {
      expect(getSTIQualityLabel(0.14)).toBe('Excellent')
    })
  })

  describe('good quality (0.15-0.25 degradation)', () => {
    it('should return "Good" for 0.15 degradation', () => {
      expect(getSTIQualityLabel(0.15)).toBe('Good')
    })

    it('should return "Good" for 0.24 degradation', () => {
      expect(getSTIQualityLabel(0.24)).toBe('Good')
    })
  })

  describe('fair quality (0.25-0.35 degradation)', () => {
    it('should return "Fair" for 0.25 degradation', () => {
      expect(getSTIQualityLabel(0.25)).toBe('Fair')
    })

    it('should return "Fair" for 0.34 degradation', () => {
      expect(getSTIQualityLabel(0.34)).toBe('Fair')
    })
  })

  describe('poor quality (>= 0.35 degradation)', () => {
    it('should return "Poor" for 0.35 degradation', () => {
      expect(getSTIQualityLabel(0.35)).toBe('Poor')
    })

    it('should return "Poor" for 0.50 degradation', () => {
      expect(getSTIQualityLabel(0.50)).toBe('Poor')
    })
  })

  describe('consistency with getSTIColor', () => {
    it('should have consistent thresholds with getSTIColor', () => {
      // Test values at boundaries
      const testValues = [0, 0.14, 0.15, 0.24, 0.25, 0.34, 0.35, 0.50, 1.0]

      testValues.forEach(value => {
        const color = getSTIColor(value)
        const label = getSTIQualityLabel(value)

        // Verify color-label consistency
        if (color === '#10b981') expect(label).toBe('Excellent')
        if (color === '#3b82f6') expect(label).toBe('Good')
        if (color === '#f59e0b') expect(label).toBe('Fair')
        if (color === '#ef4444') expect(label).toBe('Poor')
      })
    })
  })
})
