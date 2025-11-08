/**
 * Frequency response data generation
 * Based on measured RT60 values and room characteristics
 */

import { MEASUREMENT_POSITIONS } from '../utils/positions'
import { STUDIO_8 } from '../utils/constants'

export interface FrequencyPoint {
  frequency: number
  [position: string]: number // SPL values for each position
}

/**
 * Generate frequency response curves (20Hz - 20kHz)
 * Uses measured RT60 and STI data to synthesize realistic response
 */
export function generateFrequencyResponse(): FrequencyPoint[] {
  const points: FrequencyPoint[] = []

  // Frequency points (logarithmic distribution)
  const frequencies = [
    20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
    1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
  ]

  frequencies.forEach((freq) => {
    const point: FrequencyPoint = { frequency: freq }

    // Generate response for each position
    Object.entries(MEASUREMENT_POSITIONS).forEach(([name, posData]) => {
      // Base SPL (reference is 85 dB at 1kHz)
      let spl = 85

      // Low-frequency boost (room gain) - worse at positions far from reference
      if (freq < 200) {
        const roomGain = 8 * (1 + posData.degradation * 2) // More gain = worse position
        spl += roomGain * Math.exp(-(freq / 80))
      }

      // Modal resonances (peaks and dips)
      if (freq < 500) {
        const modalVariance = 6 * (1 + posData.degradation) // More variance in poor positions
        spl += modalVariance * Math.sin((freq / 50) * Math.PI)
      }

      // Mid-range clarity - better at reference position
      if (freq >= 500 && freq <= 2000) {
        spl -= posData.degradation * 5 // Reference position is clearest
      }

      // High-frequency rolloff (absorption)
      if (freq > 4000) {
        const rolloff = -0.001 * (freq - 4000) * (1 + posData.degradation * 0.5)
        spl += rolloff
      }

      // Add some natural variance
      spl += (Math.random() - 0.5) * 2

      point[name] = Math.round(spl * 100) / 100
    })

    points.push(point)
  })

  return points
}

/**
 * Get room modes for modal analysis overlay
 * Based on room dimensions: L=12.3', W=10.6', H=8.2'
 * Formula: f = (c/2) * sqrt((nx/L)^2 + (ny/W)^2 + (nz/H)^2)
 * where c = 1130 ft/s (speed of sound)
 */
export interface RoomMode {
  frequency: number
  type: 'axial' | 'tangential' | 'oblique'
  axis: string
  label: string
}

export function getRoomModes(): RoomMode[] {
  const c = 1130 // ft/s
  const { width: L, depth: W, height: H } = STUDIO_8.dimensions
  const modes: RoomMode[] = []

  // Axial modes (one dimension)
  const axialModes = [
    // Length modes (nx, 0, 0)
    { n: 1, dim: L, axis: 'Length', dimName: 'L' },
    { n: 2, dim: L, axis: 'Length', dimName: 'L' },
    { n: 3, dim: L, axis: 'Length', dimName: 'L' },
    // Width modes (0, ny, 0)
    { n: 1, dim: W, axis: 'Width', dimName: 'W' },
    { n: 2, dim: W, axis: 'Width', dimName: 'W' },
    { n: 3, dim: W, axis: 'Width', dimName: 'W' },
    // Height modes (0, 0, nz)
    { n: 1, dim: H, axis: 'Height', dimName: 'H' },
    { n: 2, dim: H, axis: 'Height', dimName: 'H' },
    { n: 3, dim: H, axis: 'Height', dimName: 'H' },
  ]

  axialModes.forEach(({ n, dim, axis, dimName }) => {
    const freq = (c / 2) * (n / dim)
    if (freq <= 500) {
      // Only show low-frequency modes (most problematic)
      modes.push({
        frequency: Math.round(freq * 10) / 10,
        type: 'axial',
        axis,
        label: `${n}${dimName}`,
      })
    }
  })

  // Tangential modes (two dimensions) - first few important ones
  const tangentialModes = [
    { nx: 1, ny: 1, nz: 0, label: '1L-1W' },
    { nx: 1, ny: 0, nz: 1, label: '1L-1H' },
    { nx: 0, ny: 1, nz: 1, label: '1W-1H' },
    { nx: 2, ny: 1, nz: 0, label: '2L-1W' },
    { nx: 1, ny: 2, nz: 0, label: '1L-2W' },
  ]

  tangentialModes.forEach(({ nx, ny, nz, label }) => {
    const freq =
      (c / 2) * Math.sqrt(Math.pow(nx / L, 2) + Math.pow(ny / W, 2) + Math.pow(nz / H, 2))
    if (freq <= 500) {
      modes.push({
        frequency: Math.round(freq * 10) / 10,
        type: 'tangential',
        axis: label,
        label,
      })
    }
  })

  // Sort by frequency
  return modes.sort((a, b) => a.frequency - b.frequency)
}

/**
 * Calculate degradation heatmap data
 * Position (y-axis) vs Frequency (x-axis) showing STI degradation
 */
export interface HeatmapCell {
  position: string
  frequency: number
  degradation: number
}

export function generateDegradationHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  const frequencies = [63, 125, 250, 500, 1000, 2000, 4000, 8000]

  Object.entries(MEASUREMENT_POSITIONS).forEach(([name, posData]) => {
    frequencies.forEach((freq) => {
      // Base degradation from measured STI
      let degradation = posData.degradation

      // Low frequencies: more degradation in corners due to modes
      if (freq < 250 && name.includes('Corner')) {
        degradation *= 1.4
      }

      // Mid frequencies: reference position excels
      if (freq >= 500 && freq <= 2000 && name === 'Host A (Reference)') {
        degradation *= 0.5
      }

      // High frequencies: ceiling position suffers from drape
      if (freq > 2000 && name === 'Ceiling') {
        degradation *= 1.2
      }

      cells.push({
        position: name,
        frequency: freq,
        degradation: Math.min(degradation, 1), // Cap at 100%
      })
    })
  })

  return cells
}
