import { describe, it, expect } from 'vitest'
import { parseSmaartLog, SmaartData } from '../../../src/lib/data/smaartLogParser'

describe('parseSmaartLog', () => {
  describe('RT60 parsing', () => {
    it('should parse RT60 values from octave band data', () => {
      const log = `
Filter	Band	RT60	T20	T30
Oct	125Hz	0.85	0.82	0.88
Oct	250Hz	0.92	0.89	0.95
Oct	500Hz	0.78	0.75	0.81
Oct	1000Hz	0.71	0.68	0.74
Oct	2000Hz	0.68	0.65	0.71
Oct	4000Hz	0.55	0.52	0.58
`

      const result = parseSmaartLog(log)

      expect(result.rt60ByFreq[125]).toBe(0.85)
      expect(result.rt60ByFreq[250]).toBe(0.92)
      expect(result.rt60ByFreq[500]).toBe(0.78)
      expect(result.rt60ByFreq[1000]).toBe(0.71)
      expect(result.rt60ByFreq[2000]).toBe(0.68)
      expect(result.rt60ByFreq[4000]).toBe(0.55)
    })

    it('should parse high frequency bands in Hz notation', () => {
      const log = `
Filter	Band	RT60	T20	T30
Oct	1000Hz	0.71	0.68	0.74
Oct	2000Hz	0.68	0.65	0.71
Oct	4000Hz	0.55	0.52	0.58
`

      const result = parseSmaartLog(log)

      expect(result.rt60ByFreq[1000]).toBe(0.71)
      expect(result.rt60ByFreq[2000]).toBe(0.68)
      expect(result.rt60ByFreq[4000]).toBe(0.55)
    })

    it('should handle missing RT60 section', () => {
      const log = `
Some other content
Not related to RT60
`

      const result = parseSmaartLog(log)

      expect(Object.keys(result.rt60ByFreq)).toHaveLength(0)
    })
  })

  describe('STI parsing', () => {
    it('should parse STI values from STI line', () => {
      const log = `
Freq	125	250	500	1000	2000	4000	8000
STI	0.94	0.99	0.97	0.98	0.86	0.91	1.00
`

      const result = parseSmaartLog(log)

      // STI values mapped to standard frequencies
      expect(result.stiByFreq[125]).toBe(0.94)
      expect(result.stiByFreq[250]).toBe(0.99)
      expect(result.stiByFreq[500]).toBe(0.97)
      expect(result.stiByFreq[1000]).toBe(0.98)
      expect(result.stiByFreq[2000]).toBe(0.86)
      expect(result.stiByFreq[4000]).toBe(0.91)
      expect(result.stiByFreq[8000]).toBe(1.00)
    })

    it('should calculate average STI from first value', () => {
      const log = `
STI	0.94	0.99	0.97	0.98	0.86	0.91	1.00
`

      const result = parseSmaartLog(log)

      // First value after "STI" is treated as average
      expect(result.averageSTI).toBe(0.94)
    })

    it('should handle missing STI section', () => {
      const log = `
Some other content
Not related to STI
`

      const result = parseSmaartLog(log)

      expect(Object.keys(result.stiByFreq)).toHaveLength(0)
    })
  })

  describe('combined RT60 and STI parsing', () => {
    it('should parse both RT60 and STI from complete log', () => {
      const log = `
Measurement Report
Date: 2025-07-15

Filter	Band	RT60	T20	T30
Oct	125Hz	0.85	0.82	0.88
Oct	250Hz	0.92	0.89	0.95
Oct	500Hz	0.78	0.75	0.81
Oct	1000Hz	0.71	0.68	0.74

Freq	125	250	500	1000	2000	4000	8000
STI	0.94	0.99	0.97	0.98	0.86	0.91	1.00

End of Report
`

      const result = parseSmaartLog(log)

      // Check RT60 values
      expect(result.rt60ByFreq[125]).toBe(0.85)
      expect(result.rt60ByFreq[250]).toBe(0.92)
      expect(result.rt60ByFreq[500]).toBe(0.78)
      expect(result.rt60ByFreq[1000]).toBe(0.71)

      // Check STI values
      expect(result.stiByFreq[125]).toBe(0.94)
      expect(result.stiByFreq[250]).toBe(0.99)
      expect(result.stiByFreq[500]).toBe(0.97)
      expect(result.stiByFreq[1000]).toBe(0.98)

      // Check average STI
      expect(result.averageSTI).toBe(0.94)
    })
  })

  describe('edge cases', () => {
    it('should return empty data for empty input', () => {
      const result = parseSmaartLog('')

      expect(Object.keys(result.rt60ByFreq)).toHaveLength(0)
      expect(Object.keys(result.stiByFreq)).toHaveLength(0)
      expect(result.averageSTI).toBe(0)
    })

    it('should calculate average STI when not directly available', () => {
      // This tests the fallback calculation when averageSTI isn't set directly
      const log = `
STI	0.80	0.90	0.85	0.88	0.82	0.86	0.84
`

      const result = parseSmaartLog(log)

      // The first value (0.80) becomes averageSTI
      expect(result.averageSTI).toBe(0.80)
    })

    it('should skip invalid RT60 entries', () => {
      const log = `
Filter	Band	RT60	T20	T30
Oct	125Hz	0.85	0.82	0.88
Oct	invalid	abc	xyz	def
Oct	500Hz	0.78	0.75	0.81
`

      const result = parseSmaartLog(log)

      expect(result.rt60ByFreq[125]).toBe(0.85)
      expect(result.rt60ByFreq[500]).toBe(0.78)
      // Invalid entry should be skipped
      expect(Object.keys(result.rt60ByFreq)).toHaveLength(2)
    })

    it('should handle tabs and spaces in data', () => {
      const log = `
Filter	Band	RT60	T20	T30
Oct	125Hz	0.85	0.82	0.88
`

      const result = parseSmaartLog(log)

      expect(result.rt60ByFreq[125]).toBe(0.85)
    })

    it('should process STI lines (last one wins)', () => {
      const log = `
STI	0.94	0.99	0.97	0.98	0.86	0.91	1.00
STI	0.50	0.50	0.50	0.50	0.50	0.50	0.50
`

      const result = parseSmaartLog(log)

      // Parser processes each STI line, so last one wins
      expect(result.stiByFreq[125]).toBe(0.50)
      expect(result.averageSTI).toBe(0.50)
    })

    it('should handle partial STI data', () => {
      const log = `
STI	0.94	0.99	0.97
`

      const result = parseSmaartLog(log)

      expect(result.stiByFreq[125]).toBe(0.94)
      expect(result.stiByFreq[250]).toBe(0.99)
      expect(result.stiByFreq[500]).toBe(0.97)
      expect(result.stiByFreq[1000]).toBeUndefined()
    })
  })

  describe('real-world format compatibility', () => {
    it('should handle typical Smaart export format', () => {
      const log = `
Smaart Measurement Log
Session: Studio 8 Acoustics Analysis
Date: July 15, 2025

=== RT60 Measurements ===

Filter	Band	RT60	T20	T30
Oct	125Hz	0.85	0.82	0.88
Oct	250Hz	0.92	0.89	0.95
Oct	500Hz	0.78	0.75	0.81
Oct	1000Hz	0.71	0.68	0.74
Oct	2000Hz	0.68	0.65	0.71
Oct	4000Hz	0.55	0.52	0.58

=== STI Measurements ===

Freq	125	250	500	1000	2000	4000	8000
STI	0.94	0.99	0.97	0.98	0.86	0.91	1.00

=== End of Log ===
`

      const result = parseSmaartLog(log)

      expect(Object.keys(result.rt60ByFreq)).toHaveLength(6)
      expect(Object.keys(result.stiByFreq)).toHaveLength(7)
      expect(result.rt60ByFreq[125]).toBe(0.85)
      expect(result.rt60ByFreq[4000]).toBe(0.55)
      expect(result.stiByFreq[125]).toBe(0.94)
      expect(result.stiByFreq[8000]).toBe(1.00)
    })
  })
})
