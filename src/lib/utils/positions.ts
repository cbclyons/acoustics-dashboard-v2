/**
 * Measurement position coordinates in Studio 8
 * Coordinates are in feet (x, y, z) matching room dimensions
 * x: width (0-12.3), y: depth (0-10.6), z: height (ear level ~4.0)
 */

export interface MeasurementPosition {
  x: number // feet along width
  y: number // feet along depth
  z: number // feet height (ear level)
  sti: number // Speech Transmission Index
  degradation: number // STI degradation from reference
  label: string
}

// STI degradation calculated from reference (Host A = 0.95)
export const MEASUREMENT_POSITIONS: Record<string, MeasurementPosition> = {
  'Host A (Reference)': {
    x: 1.0,
    y: 0.33,
    z: 4.0,
    sti: 0.95,
    degradation: 0.0,
    label: 'Host A',
  },
  'Host C (Talent)': {
    x: 11.0,
    y: 5.3,
    z: 4.0,
    sti: 0.67,
    degradation: 0.295, // (0.95 - 0.67) / 0.95
    label: 'Host C',
  },
  'Mid Room': {
    x: 6.15,
    y: 5.3,
    z: 4.0,
    sti: 0.71,
    degradation: 0.253, // (0.95 - 0.71) / 0.95
    label: 'Mid Room',
  },
  'NE Corner': {
    x: 11.0,
    y: 0.5,
    z: 4.0,
    sti: 0.58,
    degradation: 0.389, // (0.95 - 0.58) / 0.95
    label: 'NE Corner',
  },
  'SE Corner': {
    x: 11.0,
    y: 10.0,
    z: 4.0,
    sti: 0.62,
    degradation: 0.347, // (0.95 - 0.62) / 0.95
    label: 'SE Corner',
  },
  Ceiling: {
    x: 6.15,
    y: 5.3,
    z: 7.5,
    sti: 0.64,
    degradation: 0.326, // (0.95 - 0.64) / 0.95
    label: 'Ceiling',
  },
}

/**
 * Get color based on STI degradation
 * Green (excellent) -> Blue (good) -> Yellow (fair) -> Red (poor)
 */
export function getSTIColor(degradation: number): string {
  if (degradation < 0.15) return '#10b981' // green-500 - excellent
  if (degradation < 0.25) return '#3b82f6' // blue-500 - good
  if (degradation < 0.35) return '#f59e0b' // amber-500 - fair
  return '#ef4444' // red-500 - poor
}

/**
 * Get STI quality label
 */
export function getSTIQualityLabel(degradation: number): string {
  if (degradation < 0.15) return 'Excellent'
  if (degradation < 0.25) return 'Good'
  if (degradation < 0.35) return 'Fair'
  return 'Poor'
}
