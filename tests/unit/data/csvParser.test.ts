import { describe, it, expect } from 'vitest'
import { parseFrequencyResponseCsv, FrequencyResponseData } from '../../../src/lib/data/csvParser'

describe('parseFrequencyResponseCsv', () => {
  describe('basic parsing', () => {
    it('should parse a valid CSV with all fields', () => {
      const csv = `Frequency_Hz,Magnitude_dB,Phase_deg,STI,STI_Degradation_%,position,Color
100,85.5,45.0,0.95,0.0,Host A,#10b981
200,82.3,-30.5,0.88,7.4,Host B,#3b82f6`

      const result = parseFrequencyResponseCsv(csv)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        frequency: 100,
        magnitude: 85.5,
        phase: 45.0,
        sti: 0.95,
        stiDegradation: 0.0,
        position: 'Host A',
        color: '#10b981',
      })
      expect(result[1]).toEqual({
        frequency: 200,
        magnitude: 82.3,
        phase: -30.5,
        sti: 0.88,
        stiDegradation: 7.4,
        position: 'Host B',
        color: '#3b82f6',
      })
    })

    it('should return empty array for empty input', () => {
      const result = parseFrequencyResponseCsv('')
      expect(result).toEqual([])
    })

    it('should return empty array for header-only CSV', () => {
      const csv = 'Frequency_Hz,Magnitude_dB,Phase_deg'
      const result = parseFrequencyResponseCsv(csv)
      expect(result).toEqual([])
    })

    it('should handle single data row', () => {
      const csv = `Frequency_Hz,Magnitude_dB
1000,75.0`

      const result = parseFrequencyResponseCsv(csv)

      expect(result).toHaveLength(1)
      expect(result[0].frequency).toBe(1000)
      expect(result[0].magnitude).toBe(75.0)
    })
  })

  describe('whitespace handling', () => {
    it('should trim headers', () => {
      const csv = `  Frequency_Hz  ,  Magnitude_dB
100,85.0`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(100)
      expect(result[0].magnitude).toBe(85.0)
    })

    it('should trim values', () => {
      const csv = `Frequency_Hz,Magnitude_dB,position
  100  ,  85.0  ,  Host A  `

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(100)
      expect(result[0].magnitude).toBe(85.0)
      expect(result[0].position).toBe('Host A')
    })

    it('should handle trailing newlines', () => {
      const csv = `Frequency_Hz,Magnitude_dB
100,85.0
200,80.0

`

      const result = parseFrequencyResponseCsv(csv)

      expect(result).toHaveLength(2)
    })
  })

  describe('numeric parsing', () => {
    it('should parse negative numbers', () => {
      const csv = `Frequency_Hz,Magnitude_dB,Phase_deg
100,-10.5,-180.0`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].magnitude).toBe(-10.5)
      expect(result[0].phase).toBe(-180.0)
    })

    it('should parse decimal values', () => {
      const csv = `Frequency_Hz,Magnitude_dB,STI,STI_Degradation_%
125.5,85.123,0.9456,12.345`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(125.5)
      expect(result[0].magnitude).toBe(85.123)
      expect(result[0].sti).toBe(0.9456)
      expect(result[0].stiDegradation).toBe(12.345)
    })

    it('should handle integer values', () => {
      const csv = `Frequency_Hz,Magnitude_dB
1000,85`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(1000)
      expect(result[0].magnitude).toBe(85)
    })
  })

  describe('partial data handling', () => {
    it('should handle missing optional fields', () => {
      const csv = `Frequency_Hz,Magnitude_dB
100,85.0`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(100)
      expect(result[0].magnitude).toBe(85.0)
      expect(result[0].phase).toBeUndefined()
      expect(result[0].sti).toBeUndefined()
    })

    it('should ignore unknown headers', () => {
      const csv = `Frequency_Hz,Unknown_Field,Magnitude_dB
100,xyz,85.0`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(100)
      expect(result[0].magnitude).toBe(85.0)
      expect((result[0] as Record<string, unknown>).Unknown_Field).toBeUndefined()
    })

    it('should handle columns in different order', () => {
      const csv = `Magnitude_dB,Frequency_Hz,position
85.0,100,Host A`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(100)
      expect(result[0].magnitude).toBe(85.0)
      expect(result[0].position).toBe('Host A')
    })
  })

  describe('multiple rows', () => {
    it('should parse multiple data rows correctly', () => {
      const csv = `Frequency_Hz,Magnitude_dB,STI
100,85.0,0.95
200,82.0,0.92
400,79.0,0.88
800,76.0,0.85
1600,73.0,0.80`

      const result = parseFrequencyResponseCsv(csv)

      expect(result).toHaveLength(5)
      expect(result[0].frequency).toBe(100)
      expect(result[4].frequency).toBe(1600)
      expect(result[4].magnitude).toBe(73.0)
      expect(result[4].sti).toBe(0.80)
    })

    it('should maintain row order', () => {
      const csv = `Frequency_Hz,Magnitude_dB
500,80.0
125,90.0
1000,75.0`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(500)
      expect(result[1].frequency).toBe(125)
      expect(result[2].frequency).toBe(1000)
    })
  })

  describe('edge cases', () => {
    it('should handle NaN for invalid numeric values', () => {
      const csv = `Frequency_Hz,Magnitude_dB
invalid,85.0`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBeNaN()
      expect(result[0].magnitude).toBe(85.0)
    })

    it('should handle empty field values', () => {
      const csv = `Frequency_Hz,position
100,`

      const result = parseFrequencyResponseCsv(csv)

      expect(result[0].frequency).toBe(100)
      expect(result[0].position).toBe('')
    })
  })
})
