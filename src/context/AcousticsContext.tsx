import { createContext, useContext, useState, ReactNode } from 'react'
import type { PanelThickness } from '../lib/acoustics/absorption'
import { STUDIO_8 } from '../lib/utils/constants'
import {
  calculateRT60WithPanels,
  calculateAverageRT60,
  calculatePanelAbsorption,
  calculateDrapeAbsorption,
  calculatePanelCost,
  calculateTotalPanels,
  calculateSTIImprovement,
} from '../lib/acoustics'
import { CONVERSIONS } from '../lib/utils/conversions'

export interface PanelConfig {
  '2_inch': number
  '3_inch': number
  '5_5_inch': number
  '11_inch': number
}

interface AcousticsState {
  // Room selection
  selectedRoom: 'Studio 8' | 'The Hub'

  // Measurement position
  selectedPosition: string

  // Panel configuration
  panelConfig: PanelConfig
  drapeRemoval: boolean

  // Calculated metrics (derived from panel config)
  currentRT60: Record<number, number>
  predictedRT60: Record<number, number>
  currentSTI: number
  predictedSTI: number
  totalCost: number
  totalPanels: number

  // UI state
  viewMode: '2D' | '3D'
  showModalAnalysis: boolean
  comparisonMode: boolean
}

interface AcousticsActions {
  setSelectedRoom: (room: 'Studio 8' | 'The Hub') => void
  setSelectedPosition: (position: string) => void
  updatePanelCount: (thickness: PanelThickness, count: number) => void
  setDrapeRemoval: (remove: boolean) => void
  toggleViewMode: () => void
  toggleModalAnalysis: () => void
  toggleComparisonMode: () => void
  resetPanelConfig: () => void
}

type AcousticsContextType = AcousticsState & AcousticsActions

const AcousticsContext = createContext<AcousticsContextType | undefined>(undefined)

const defaultPanelConfig: PanelConfig = {
  '2_inch': 3,
  '3_inch': 6,
  '5_5_inch': 12,
  '11_inch': 4,
}

export function AcousticsProvider({ children }: { children: ReactNode }) {
  const [selectedRoom, setSelectedRoom] = useState<'Studio 8' | 'The Hub'>('Studio 8')
  const [selectedPosition, setSelectedPosition] = useState('Host C (Talent)')
  const [panelConfig, setPanelConfig] = useState<PanelConfig>(defaultPanelConfig)
  const [drapeRemoval, setDrapeRemoval] = useState(true)
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D')
  const [showModalAnalysis, setShowModalAnalysis] = useState(false)
  const [comparisonMode, setComparisonMode] = useState(false)

  // Calculate metrics from current configuration
  const roomData = STUDIO_8 // Could expand to support The Hub later
  const currentRT60 = roomData.rt60ByFreq
  const currentSTI = roomData.measured.averageSTI

  // Convert room dimensions to metric for calculations
  const volume = roomData.volume * CONVERSIONS.cubicFeetToMeters
  const surfaceArea = roomData.surfaceArea * CONVERSIONS.squareFeetToMeters

  // Calculate panel absorption
  const addedAbsorption = calculatePanelAbsorption(panelConfig, roomData.surfaceArea)

  // Calculate drape absorption if removing
  const drapeAbsorption = drapeRemoval
    ? calculateDrapeAbsorption(roomData.surfaceArea)
    : {}

  // Calculate predicted RT60
  const predictedRT60 = calculateRT60WithPanels(
    currentRT60,
    volume,
    surfaceArea,
    addedAbsorption,
    drapeAbsorption
  )

  // Calculate RT60 improvement for STI prediction
  const avgCurrentRT60 = calculateAverageRT60(currentRT60)
  const avgPredictedRT60 = calculateAverageRT60(predictedRT60)
  const rt60Improvement = avgCurrentRT60 - avgPredictedRT60

  // Calculate predicted STI
  const predictedSTI = calculateSTIImprovement(
    currentSTI,
    roomData.measured.targetSTI,
    rt60Improvement
  )

  // Calculate costs
  const totalCost = calculatePanelCost(panelConfig)
  const totalPanels = calculateTotalPanels(panelConfig)

  const updatePanelCount = (thickness: PanelThickness, count: number) => {
    setPanelConfig(prev => ({
      ...prev,
      [thickness]: Math.max(0, count),
    }))
  }

  const resetPanelConfig = () => {
    setPanelConfig(defaultPanelConfig)
  }

  const toggleViewMode = () => {
    setViewMode(prev => (prev === '2D' ? '3D' : '2D'))
  }

  const toggleModalAnalysis = () => {
    setShowModalAnalysis(prev => !prev)
  }

  const toggleComparisonMode = () => {
    setComparisonMode(prev => !prev)
  }

  const value: AcousticsContextType = {
    // State
    selectedRoom,
    selectedPosition,
    panelConfig,
    drapeRemoval,
    currentRT60,
    predictedRT60,
    currentSTI,
    predictedSTI,
    totalCost,
    totalPanels,
    viewMode,
    showModalAnalysis,
    comparisonMode,

    // Actions
    setSelectedRoom,
    setSelectedPosition,
    updatePanelCount,
    setDrapeRemoval,
    toggleViewMode,
    toggleModalAnalysis,
    toggleComparisonMode,
    resetPanelConfig,
  }

  return <AcousticsContext.Provider value={value}>{children}</AcousticsContext.Provider>
}

export function useAcoustics() {
  const context = useContext(AcousticsContext)
  if (!context) {
    throw new Error('useAcoustics must be used within AcousticsProvider')
  }
  return context
}
