# Data Flow - Documentation

**Version:** 1.0
**Last Updated:** 2025-11-08
**Related Diagram:** `data-flow.mermaid.md`

---

## Overview

This document describes how data moves through the CBC Acoustics v2 application, from user interactions to visual updates. The architecture follows a **unidirectional data flow** pattern via React's Context API, ensuring predictable state changes and easy debugging.

---

## Core Data Flow Principles

### 1. Single Source of Truth
- **AcousticsContext** is the single source of truth for all application state
- No duplicate state across components
- Derived values (RT60, STI, cost) calculated in context, not stored separately

### 2. Unidirectional Flow
- User interactions → Actions → Context updates → Component re-renders → UI updates
- No bidirectional data binding
- All state changes flow downward from context

### 3. Pure Calculations
- Business logic (RT60, STI) isolated in pure functions
- No side effects in calculation modules
- Deterministic outputs for given inputs

### 4. Reactive Updates
- State changes automatically trigger re-renders
- React's reconciliation handles efficient DOM updates
- Memoization prevents unnecessary recalculations

---

## Data Flow Scenarios

### Scenario 1: Application Initialization

**Sequence:**
1. User navigates to application URL
2. Browser loads `index.html` → `main.tsx`
3. React initializes App component
4. AcousticsProvider mounts and initializes state:
   - Loads STUDIO_8 constants (room dimensions, baseline RT60)
   - Sets default panel configuration
   - Calculates initial predicted metrics
5. Router renders Dashboard component
6. Dashboard calls `useAcoustics()` to access state
7. Visualization components receive data as props
8. Initial UI rendered to user

**Data Sources:**
- `src/lib/utils/constants.ts` - STUDIO_8 room data
- AcousticsContext - Default panel configuration

**Initial State:**
```typescript
{
  selectedRoom: 'Studio 8',
  selectedPosition: 'Host C (Talent)',
  panelConfig: {
    '2_inch': 3,
    '3_inch': 6,
    '5_5_inch': 12,
    '11_inch': 4,
  },
  drapeRemoval: true,
  // Calculated values...
}
```

**Performance:** <100ms initial render time

---

### Scenario 2: Panel Configuration Change

**Trigger:** User adjusts slider to change 2" panel count from 3 to 8

**Sequence:**
1. User drags slider in Simulator page
2. Slider component fires `onValueChange(8)` event
3. Page calls `updatePanelCount('2_inch', 8)`
4. AcousticsContext updates `panelConfig.2_inch` to 8
5. Context triggers recalculation cascade:
   ```typescript
   // Step 5a: Calculate panel absorption
   const addedAbsorption = calculatePanelAbsorption(panelConfig, surfaceArea)
   // Returns: { 125: 0.45, 250: 0.82, 500: 1.15, ... }

   // Step 5b: Calculate drape absorption (if removing)
   const drapeAbsorption = calculateDrapeAbsorption(surfaceArea)
   // Returns: { 125: 0.12, 250: 0.18, 500: 0.24, ... }

   // Step 5c: Calculate predicted RT60
   const predictedRT60 = calculateRT60WithPanels(
     currentRT60,     // { 125: 0.92, 250: 0.88, ... }
     volume,          // 58.4 m³
     surfaceArea,     // 107.1 m²
     addedAbsorption,
     drapeAbsorption
   )
   // Returns: { 125: 0.62, 250: 0.54, 500: 0.41, ... }

   // Step 5d: Calculate STI improvement
   const avgCurrentRT60 = calculateAverageRT60(currentRT60)   // 0.92s
   const avgPredictedRT60 = calculateAverageRT60(predictedRT60) // 0.48s
   const rt60Improvement = avgCurrentRT60 - avgPredictedRT60   // 0.44s

   const predictedSTI = calculateSTIImprovement(
     currentSTI,      // 0.62
     targetSTI,       // 0.75
     rt60Improvement  // 0.44
   )
   // Returns: 0.73

   // Step 5e: Calculate cost
   const totalCost = calculatePanelCost(panelConfig)
   // Returns: 1,180 (USD)
   ```
6. Context state update triggers re-render of consuming components
7. RT60Comparison receives new `predictedRT60` prop
8. Chart re-renders with updated line
9. User sees updated predictions in <100ms

**Data Transformations:**
- Panel count → Absorption coefficients (by frequency)
- Absorption → RT60 (via Sabine/Eyring equations)
- RT60 improvement → STI prediction (empirical model)
- Panel quantities → Total cost (lookup table)

**Performance Optimization:**
- Calculations memoized via React useMemo
- Only affected components re-render
- Chart animations debounced

---

### Scenario 3: Position Selection for Frequency Analysis

**Trigger:** User selects "Host B (Guest)" from position dropdown

**Sequence:**
1. User clicks Select component
2. Select fires `onValueChange("Host B (Guest)")`
3. Page calls `setSelectedPosition("Host B (Guest)")`
4. AcousticsContext updates `selectedPosition` state
5. Frequency page re-renders
6. FrequencyExplorer component receives new `selectedPosition` prop
7. Component calls `loadFrequencyResponse("Host B (Guest)")`:
   ```typescript
   // Step 7a: Map position name to CSV file
   const csvFile = positionMapping["Host B (Guest)"]
   // Returns: "data/measurements/host_b_guest.csv"

   // Step 7b: Parse CSV data
   const rawData = parseCSV(csvFile)
   // Returns: Array of { timestamp, frequency, spl, phase }

   // Step 7c: Transform to chart format
   const frequencyData = {
     frequency: rawData.map(r => r.frequency),  // [20, 25, 31.5, 40, ...]
     magnitude: rawData.map(r => r.spl),        // [68.2, 71.5, 74.3, ...]
     phase: rawData.map(r => r.phase),          // [-45, -32, -18, ...]
   }
   ```
8. Recharts renders LineChart with new data
9. User sees frequency response for selected position

**Data Sources:**
- `data/measurements/*.csv` - Real Smaart measurement data
- `src/lib/utils/constants.ts` - Position mapping

**Data Format (CSV):**
```csv
Timestamp,Frequency (Hz),SPL (dB),Phase (degrees)
2025-07-15 14:32:01,20,68.2,-45
2025-07-15 14:32:01,25,71.5,-32
...
```

---

### Scenario 4: Navigation Between Pages

**Trigger:** User clicks "Visualizer" in navigation

**Sequence:**
1. User clicks Header navigation link
2. React Router intercepts link click
3. Router updates URL to `/visualizer`
4. Router unmounts Dashboard component
5. Router mounts Visualizer component
6. Visualizer calls `useAcoustics()` hook
7. **Context state persists across navigation** (no reset)
8. Visualizer receives same `panelConfig`, `viewMode`, etc.
9. RoomModel3D initializes Three.js scene
10. 3D room rendered with current panel configuration

**Key Behavior:**
- State persistence across routes
- No data loss on navigation
- Fast page transitions (<50ms)

---

### Scenario 5: View Mode Toggle (3D → 2D)

**Trigger:** User clicks "2D View" button

**Sequence:**
1. User clicks Button in Visualizer
2. Button fires `onClick` event
3. Page calls `toggleViewMode()`
4. AcousticsContext updates `viewMode` from '3D' to '2D'
5. RoomModel3D component re-renders
6. Component conditionally renders based on `viewMode`:
   ```typescript
   if (viewMode === '3D') {
     return <Canvas>...</Canvas>  // Three.js scene
   } else {
     return <div>...</div>        // 2D SVG/CSS layout
   }
   ```
7. User sees 2D floor plan instead of 3D room

**Performance:**
- 3D canvas destroyed to free GPU resources
- 2D view renders instantly (no WebGL initialization)

---

### Scenario 6: Data Export (PNG)

**Trigger:** User clicks "Export PNG" button

**Sequence:**
1. User clicks export button
2. Button fires `onClick` → `exportToPNG('chart-id', 'rt60-comparison.png')`
3. Export utility:
   ```typescript
   // Step 3a: Find chart element in DOM
   const element = document.getElementById('chart-id')

   // Step 3b: Capture as canvas (via html2canvas)
   const canvas = await html2canvas(element)

   // Step 3c: Convert to PNG blob
   const blob = await canvas.toBlob('image/png')

   // Step 3d: Trigger browser download
   const link = document.createElement('a')
   link.href = URL.createObjectURL(blob)
   link.download = 'rt60-comparison.png'
   link.click()
   ```
4. Browser downloads PNG to user's device

**Data Flow:**
- Chart component (React/Recharts) → DOM → Canvas → PNG → File download

---

### Scenario 7: Reset Configuration

**Trigger:** User clicks "Reset to Defaults" button

**Sequence:**
1. User clicks reset button
2. Button fires `onClick` → `resetPanelConfig()`
3. AcousticsContext sets `panelConfig` to defaults:
   ```typescript
   const defaultPanelConfig = {
     '2_inch': 3,
     '3_inch': 6,
     '5_5_inch': 12,
     '11_inch': 4,
   }
   ```
4. Context triggers full recalculation (same as Scenario 2)
5. All components re-render with baseline predictions
6. User sees original state restored

---

## State Management Deep Dive

### Context Provider Structure

**AcousticsContext.tsx:**
```typescript
export function AcousticsProvider({ children }) {
  // State hooks
  const [selectedRoom, setSelectedRoom] = useState('Studio 8')
  const [selectedPosition, setSelectedPosition] = useState('Host C')
  const [panelConfig, setPanelConfig] = useState(defaultPanelConfig)
  const [drapeRemoval, setDrapeRemoval] = useState(true)
  const [viewMode, setViewMode] = useState('3D')
  const [showModalAnalysis, setShowModalAnalysis] = useState(false)
  const [comparisonMode, setComparisonMode] = useState(false)

  // Derived calculations (run on every state change)
  const currentRT60 = STUDIO_8.rt60ByFreq
  const currentSTI = STUDIO_8.measured.averageSTI

  const addedAbsorption = calculatePanelAbsorption(panelConfig, surfaceArea)
  const drapeAbsorption = drapeRemoval ? calculateDrapeAbsorption(surfaceArea) : {}

  const predictedRT60 = calculateRT60WithPanels(
    currentRT60,
    volume,
    surfaceArea,
    addedAbsorption,
    drapeAbsorption
  )

  const avgCurrentRT60 = calculateAverageRT60(currentRT60)
  const avgPredictedRT60 = calculateAverageRT60(predictedRT60)
  const rt60Improvement = avgCurrentRT60 - avgPredictedRT60

  const predictedSTI = calculateSTIImprovement(
    currentSTI,
    targetSTI,
    rt60Improvement
  )

  const totalCost = calculatePanelCost(panelConfig)
  const totalPanels = calculateTotalPanels(panelConfig)

  // Action creators
  const updatePanelCount = (thickness, count) => {
    setPanelConfig(prev => ({ ...prev, [thickness]: count }))
  }

  // Context value
  const value = {
    selectedRoom,
    selectedPosition,
    panelConfig,
    currentRT60,
    predictedRT60,
    currentSTI,
    predictedSTI,
    totalCost,
    totalPanels,
    viewMode,
    // ... actions
    setSelectedRoom,
    setSelectedPosition,
    updatePanelCount,
    toggleViewMode,
    // ...
  }

  return <AcousticsContext.Provider value={value}>{children}</AcousticsContext.Provider>
}
```

**Key Design Points:**
- **Derived State:** Calculations happen in render, not stored separately
- **Single Update:** One `setPanelConfig` triggers all recalculations
- **Memoization:** Could add `useMemo` for expensive calculations (future optimization)

---

## Data Transformations

### 1. Panel Configuration → Absorption Coefficients

**Input:**
```typescript
panelConfig = {
  '2_inch': 3,
  '3_inch': 6,
  '5_5_inch': 12,
  '11_inch': 4,
}
```

**Transformation:**
```typescript
// For each panel type, look up absorption coefficients
const absorptionCoefficients = {
  '2_inch': { 125: 0.15, 250: 0.45, 500: 0.85, 1000: 0.95, ... },
  '3_inch': { 125: 0.25, 250: 0.65, 500: 0.95, 1000: 0.98, ... },
  // ...
}

// Calculate total absorption area for each frequency
const addedAbsorption = {
  125: (3 * 0.15 * panelArea) + (6 * 0.25 * panelArea) + ...,
  250: (3 * 0.45 * panelArea) + (6 * 0.65 * panelArea) + ...,
  // ...
}
```

**Output:**
```typescript
{ 125: 12.5, 250: 28.3, 500: 45.2, 1000: 52.1, ... } // m² of absorption
```

---

### 2. Absorption → RT60

**Input:**
- `currentRT60`: { 125: 0.92, 250: 0.88, ... }
- `volume`: 58.4 m³
- `surfaceArea`: 107.1 m²
- `addedAbsorption`: { 125: 12.5, 250: 28.3, ... }

**Transformation (Sabine Equation):**
```typescript
RT60 = 0.161 × V / (A_current + A_added)

For 125 Hz:
A_current = V × 0.161 / RT60_current
          = 58.4 × 0.161 / 0.92
          = 10.2 m²

A_total = A_current + A_added
        = 10.2 + 12.5
        = 22.7 m²

RT60_predicted = 0.161 × V / A_total
               = 0.161 × 58.4 / 22.7
               = 0.41 seconds
```

**Output:**
```typescript
{ 125: 0.41, 250: 0.35, 500: 0.28, 1000: 0.25, ... }
```

---

### 3. RT60 Improvement → STI Prediction

**Input:**
- `currentSTI`: 0.62
- `targetSTI`: 0.75
- `rt60Improvement`: 0.44 seconds (0.92 → 0.48)

**Transformation (Empirical Model):**
```typescript
// STI improves logarithmically with RT60 reduction
const improvementRatio = rt60Improvement / currentRT60  // 0.44 / 0.92 = 0.48
const stiGain = (targetSTI - currentSTI) * improvementRatio  // 0.13 * 0.48 = 0.06

const predictedSTI = Math.min(1.0, currentSTI + stiGain)  // 0.62 + 0.06 = 0.68
```

**Output:**
```typescript
0.68  // Predicted STI (0.0-1.0 scale)
```

---

## Event Flows

### User Input Events
- **Slider Change:** `onValueChange` → `updatePanelCount` → Context update → Re-render
- **Dropdown Select:** `onValueChange` → `setSelectedPosition` → Context update → Re-render
- **Button Click:** `onClick` → Action (toggle, reset, export) → Context update (if applicable) → Re-render

### Navigation Events
- **Route Change:** Link click → Router update → Component unmount/mount → useAcoustics hook → State access

### Lifecycle Events
- **Component Mount:** useEffect → Data fetching (CSV) → State update → Re-render
- **Component Unmount:** Cleanup (Three.js dispose) → No state change

---

## Performance Considerations

### Calculation Performance
- **RT60 Calculation:** <1ms (6 frequency bands)
- **STI Calculation:** <1ms (simple arithmetic)
- **Total Recalculation:** <5ms for all metrics

### Rendering Performance
- **State Update → UI Update:** <100ms target
- **Chart Re-render:** <50ms (Recharts animation)
- **3D Scene Update:** <16ms (60fps target)

### Optimization Strategies
1. **Memoization:** useMemo for expensive calculations (future)
2. **Debouncing:** Slider inputs debounced to 100ms
3. **Lazy Loading:** Visualization components loaded on demand
4. **Code Splitting:** Routes split for faster initial load

---

## Common Data Flow Patterns

### Pattern 1: Global State Access
```typescript
// Any component can access global state
function MyComponent() {
  const { currentRT60, predictedRT60, updatePanelCount } = useAcoustics()

  return (
    <div>
      <p>Current RT60: {currentRT60[500]}s</p>
      <p>Predicted RT60: {predictedRT60[500]}s</p>
      <button onClick={() => updatePanelCount('2_inch', 10)}>
        Add Panels
      </button>
    </div>
  )
}
```

### Pattern 2: Derived Props
```typescript
// Parent passes derived data to child
function Simulator() {
  const { currentRT60, predictedRT60 } = useAcoustics()

  return <RT60Comparison current={currentRT60} predicted={predictedRT60} />
}
```

### Pattern 3: Local State + Global Actions
```typescript
// Component has local UI state but calls global actions
function PanelSlider() {
  const [localValue, setLocalValue] = useState(3)
  const { updatePanelCount } = useAcoustics()

  const handleChange = (value) => {
    setLocalValue(value)  // Immediate UI update
    debounce(() => updatePanelCount('2_inch', value), 100)()  // Delayed calculation
  }

  return <Slider value={localValue} onChange={handleChange} />
}
```

---

## Related Diagrams

- `architecture-overview.mermaid.md` - System layers and interactions
- `component-map.mermaid.md` - Component dependencies
- `entry-points.mermaid.md` - Application initialization

---

**Last Updated:** Sprint 4 (ACU005)
**State Updates:** All synchronous (no async state)
**Performance Target:** <100ms for all interactions
