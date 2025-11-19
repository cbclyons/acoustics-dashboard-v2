import { describe, it, expect } from 'vitest'
import {
  CONVERSIONS,
  SPEED_OF_SOUND_FT_S,
  SPEED_OF_SOUND_M_S,
} from '../../../src/lib/utils/conversions'

describe('CONVERSIONS', () => {
  describe('length conversions', () => {
    it('should have correct feet to meters conversion', () => {
      // 1 foot = 0.3048 meters
      expect(CONVERSIONS.feetToMeters).toBe(0.3048)
    })

    it('should have correct meters to feet conversion', () => {
      // 1 meter = 3.28084 feet
      expect(CONVERSIONS.metersToFeet).toBe(3.28084)
    })

    it('should have inverse relationship between length conversions', () => {
      // feetToMeters * metersToFeet should ≈ 1
      const product = CONVERSIONS.feetToMeters * CONVERSIONS.metersToFeet
      expect(product).toBeCloseTo(1, 5)
    })

    it('should convert feet to meters correctly', () => {
      const feet = 10
      const meters = feet * CONVERSIONS.feetToMeters
      expect(meters).toBeCloseTo(3.048, 3)
    })

    it('should convert meters to feet correctly', () => {
      const meters = 5
      const feet = meters * CONVERSIONS.metersToFeet
      expect(feet).toBeCloseTo(16.4042, 3)
    })
  })

  describe('area conversions', () => {
    it('should have correct square feet to square meters conversion', () => {
      // 1 sq ft = 0.092903 sq m
      expect(CONVERSIONS.squareFeetToMeters).toBe(0.092903)
    })

    it('should have correct square meters to square feet conversion', () => {
      // 1 sq m = 10.7639 sq ft
      expect(CONVERSIONS.squareMetersToFeet).toBe(10.7639)
    })

    it('should have inverse relationship between area conversions', () => {
      // squareFeetToMeters * squareMetersToFeet should ≈ 1
      const product = CONVERSIONS.squareFeetToMeters * CONVERSIONS.squareMetersToFeet
      expect(product).toBeCloseTo(1, 4)
    })

    it('should convert square feet to square meters correctly', () => {
      const sqFeet = 100
      const sqMeters = sqFeet * CONVERSIONS.squareFeetToMeters
      expect(sqMeters).toBeCloseTo(9.2903, 3)
    })

    it('should convert square meters to square feet correctly', () => {
      const sqMeters = 10
      const sqFeet = sqMeters * CONVERSIONS.squareMetersToFeet
      expect(sqFeet).toBeCloseTo(107.639, 2)
    })

    it('should be consistent with length conversion squared', () => {
      // Area conversion should equal length conversion squared
      const expectedSqFtToSqM = Math.pow(CONVERSIONS.feetToMeters, 2)
      expect(CONVERSIONS.squareFeetToMeters).toBeCloseTo(expectedSqFtToSqM, 5)
    })
  })

  describe('volume conversions', () => {
    it('should have correct cubic feet to cubic meters conversion', () => {
      // 1 cu ft = 0.0283168 cu m
      expect(CONVERSIONS.cubicFeetToMeters).toBe(0.0283168)
    })

    it('should have correct cubic meters to cubic feet conversion', () => {
      // 1 cu m = 35.3147 cu ft
      expect(CONVERSIONS.cubicMetersToFeet).toBe(35.3147)
    })

    it('should have inverse relationship between volume conversions', () => {
      // cubicFeetToMeters * cubicMetersToFeet should ≈ 1
      const product = CONVERSIONS.cubicFeetToMeters * CONVERSIONS.cubicMetersToFeet
      expect(product).toBeCloseTo(1, 4)
    })

    it('should convert cubic feet to cubic meters correctly', () => {
      const cuFeet = 1000
      const cuMeters = cuFeet * CONVERSIONS.cubicFeetToMeters
      expect(cuMeters).toBeCloseTo(28.3168, 3)
    })

    it('should convert cubic meters to cubic feet correctly', () => {
      const cuMeters = 30
      const cuFeet = cuMeters * CONVERSIONS.cubicMetersToFeet
      expect(cuFeet).toBeCloseTo(1059.441, 2)
    })

    it('should be consistent with length conversion cubed', () => {
      // Volume conversion should equal length conversion cubed
      const expectedCuFtToCuM = Math.pow(CONVERSIONS.feetToMeters, 3)
      expect(CONVERSIONS.cubicFeetToMeters).toBeCloseTo(expectedCuFtToCuM, 5)
    })
  })

  describe('Studio 8 room calculations', () => {
    it('should correctly convert Studio 8 dimensions to metric', () => {
      // Studio 8 dimensions in feet
      const widthFt = 12.3
      const depthFt = 10.6
      const heightFt = 8.2

      // Convert to meters
      const widthM = widthFt * CONVERSIONS.feetToMeters
      const depthM = depthFt * CONVERSIONS.feetToMeters
      const heightM = heightFt * CONVERSIONS.feetToMeters

      expect(widthM).toBeCloseTo(3.749, 2)
      expect(depthM).toBeCloseTo(3.231, 2)
      expect(heightM).toBeCloseTo(2.499, 2)
    })

    it('should correctly convert Studio 8 volume to metric', () => {
      // Studio 8 volume in cubic feet
      const volumeCuFt = 1068.46

      // Convert to cubic meters
      const volumeCuM = volumeCuFt * CONVERSIONS.cubicFeetToMeters

      expect(volumeCuM).toBeCloseTo(30.25, 1)
    })

    it('should correctly convert Studio 8 surface area to metric', () => {
      // Studio 8 surface area in square feet
      const areaSqFt = 588.5

      // Convert to square meters
      const areaSqM = areaSqFt * CONVERSIONS.squareFeetToMeters

      expect(areaSqM).toBeCloseTo(54.67, 1)
    })
  })
})

describe('SPEED_OF_SOUND_FT_S', () => {
  it('should have correct value for speed of sound in feet per second', () => {
    // Speed of sound at room temperature is approximately 1130 ft/s
    expect(SPEED_OF_SOUND_FT_S).toBe(1130)
  })

  it('should be in reasonable range', () => {
    // Speed of sound varies with temperature, but should be 1080-1180 ft/s at normal temperatures
    expect(SPEED_OF_SOUND_FT_S).toBeGreaterThanOrEqual(1080)
    expect(SPEED_OF_SOUND_FT_S).toBeLessThanOrEqual(1180)
  })
})

describe('SPEED_OF_SOUND_M_S', () => {
  it('should have correct value for speed of sound in meters per second', () => {
    // Speed of sound at room temperature is approximately 343 m/s
    expect(SPEED_OF_SOUND_M_S).toBe(343)
  })

  it('should be in reasonable range', () => {
    // Speed of sound varies with temperature, but should be 330-360 m/s at normal temperatures
    expect(SPEED_OF_SOUND_M_S).toBeGreaterThanOrEqual(330)
    expect(SPEED_OF_SOUND_M_S).toBeLessThanOrEqual(360)
  })

  it('should be consistent with ft/s value when converted', () => {
    // Convert ft/s to m/s and compare
    const convertedSpeed = SPEED_OF_SOUND_FT_S * CONVERSIONS.feetToMeters
    // Allow some tolerance since these are standard values, not exact conversions
    // Both values are rounded to common reference values
    expect(Math.abs(SPEED_OF_SOUND_M_S - convertedSpeed)).toBeLessThan(2)
  })
})

describe('conversion consistency', () => {
  it('should maintain dimensional consistency (area = length^2)', () => {
    const areaFromLength = Math.pow(CONVERSIONS.feetToMeters, 2)
    expect(CONVERSIONS.squareFeetToMeters).toBeCloseTo(areaFromLength, 6)
  })

  it('should maintain dimensional consistency (volume = length^3)', () => {
    const volumeFromLength = Math.pow(CONVERSIONS.feetToMeters, 3)
    expect(CONVERSIONS.cubicFeetToMeters).toBeCloseTo(volumeFromLength, 6)
  })

  it('should have self-consistent round-trip conversions for length', () => {
    const original = 100
    const converted = original * CONVERSIONS.feetToMeters * CONVERSIONS.metersToFeet
    expect(converted).toBeCloseTo(original, 4)
  })

  it('should have self-consistent round-trip conversions for area', () => {
    const original = 100
    const converted = original * CONVERSIONS.squareFeetToMeters * CONVERSIONS.squareMetersToFeet
    expect(converted).toBeCloseTo(original, 3)
  })

  it('should have self-consistent round-trip conversions for volume', () => {
    const original = 100
    const converted = original * CONVERSIONS.cubicFeetToMeters * CONVERSIONS.cubicMetersToFeet
    expect(converted).toBeCloseTo(original, 3)
  })
})
