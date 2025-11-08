# Component Map - Documentation

**Version:** 1.0
**Last Updated:** 2025-11-08
**Related Diagram:** `component-map.mermaid.md`

---

## Overview

This document provides a detailed breakdown of all components in the CBC Acoustics v2 application, including their responsibilities, public APIs, dependencies, and shared utilities. The component map follows a hierarchical structure from the root App component down to individual UI primitives.

---

## Module Boundaries

### Root Module (App.tsx)
**Responsibility:** Application initialization and routing setup

**Public API:**
```typescript
function App(): ReactElement
```

**Dependencies:**
- React Router (BrowserRouter, Routes, Route)
- AcousticsContext (provider wrapper)
- All page components
- Header component

**Key Behaviors:**
- Sets up client-side routing
- Wraps entire app in AcousticsProvider
- Defines route structure (/, /visualizer, /frequency, /simulator, /about)

---

## Context Module (AcousticsContext.tsx)

### AcousticsContext
**Responsibility:** Global state management for acoustic calculations and UI state

**Public API:**
```typescript
interface AcousticsState {
  // Room selection
  selectedRoom: 'Studio 8' | 'The Hub'
  selectedPosition: string

  // Panel configuration
  panelConfig: PanelConfig
  drapeRemoval: boolean

  // Calculated metrics
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

export function AcousticsProvider({ children }): ReactElement
export function useAcoustics(): AcousticsContextType
```

**Dependencies:**
- AcousticsLib (for calculations)
- Constants (for room data)

**Key Behaviors:**
- Automatically recalculates metrics when panelConfig changes
- Derives all metrics (no duplicate state)
- Throws error if useAcoustics() called outside provider

---

## Page Components

### Dashboard.tsx
**Responsibility:** Main landing page with overview metrics

**Public API:**
```typescript
export function Dashboard(): ReactElement
```

**Dependencies:**
- AcousticsContext (via useAcoustics)
- RoomGeometry
- RT60Comparison
- MeasurementPositions
- Button, Card (UI components)

**Key Features:**
- Displays current room metrics
- Shows RT60 comparison chart
- Measurement position selector
- Quick navigation to other pages

---

### Visualizer.tsx
**Responsibility:** 3D room visualization with acoustic panels

**Public API:**
```typescript
export function Visualizer(): ReactElement
```

**Dependencies:**
- AcousticsContext
- RoomModel3D
- AcousticPanels
- MeasurementPositions
- Button (for view mode toggle)

**Key Features:**
- 3D room rendering via Three.js
- Panel placement visualization
- 2D/3D view mode toggle
- Interactive camera controls

---

### Frequency.tsx
**Responsibility:** Frequency response analysis and exploration

**Public API:**
```typescript
export function Frequency(): ReactElement
```

**Dependencies:**
- AcousticsContext
- FrequencyExplorer
- Select (for position selection)

**Key Features:**
- Frequency response charts (20Hz-20kHz)
- Position comparison
- Modal analysis overlay
- Export to PNG/CSV

---

### Simulator.tsx
**Responsibility:** Treatment configuration and prediction

**Public API:**
```typescript
export function Simulator(): ReactElement
```

**Dependencies:**
- AcousticsContext
- RT60Comparison
- DegradationHeatmap
- Slider (for panel counts)
- Select (for panel types)
- Button, Card

**Key Features:**
- Panel count sliders (2", 3", 5.5", 11")
- Drape removal toggle
- Live RT60 prediction
- Cost calculator
- Before/after comparison

---

### About.tsx
**Responsibility:** Project context and methodology

**Public API:**
```typescript
export function About(): ReactElement
```

**Dependencies:** None (static content)

**Key Features:**
- Project background
- Acoustic standards explanation
- Data collection methodology
- Links to documentation

---

## Visualization Components

### RoomModel3D.tsx
**Responsibility:** 3D WebGL rendering of room and panels

**Public API:**
```typescript
interface RoomModel3DProps {
  panelConfig: PanelConfig
  viewMode: '2D' | '3D'
}

export function RoomModel3D(props: RoomModel3DProps): ReactElement
```

**Dependencies:**
- Three.js
- @react-three/fiber (Canvas)
- @react-three/drei (OrbitControls, PerspectiveCamera)
- AcousticPanels (nested component)

**Key Behaviors:**
- Creates WebGL canvas
- Sets up camera and lighting
- Renders room geometry (walls, ceiling, floor)
- Includes AcousticPanels component
- Handles camera controls

**Performance Notes:**
- Targets 60fps on desktop, 30fps on mobile
- Canvas size optimized based on viewport
- Geometry simplified for performance

---

### RT60Comparison.tsx
**Responsibility:** Reverberation time comparison chart

**Public API:**
```typescript
interface RT60ComparisonProps {
  currentRT60: Record<number, number>
  predictedRT60: Record<number, number>
}

export function RT60Comparison(props: RT60ComparisonProps): ReactElement
```

**Dependencies:**
- Recharts (LineChart, XAxis, YAxis, Legend, Tooltip)
- DataProcessing (for formatting)

**Key Features:**
- Dual line chart (current vs predicted)
- Frequency bands (125Hz-8kHz)
- Target line at 0.3s
- Responsive design
- Export to PNG

---

### FrequencyExplorer.tsx
**Responsibility:** Interactive frequency response graphs

**Public API:**
```typescript
interface FrequencyExplorerProps {
  selectedPosition: string
}

export function FrequencyExplorer(props: FrequencyExplorerProps): ReactElement
```

**Dependencies:**
- Recharts (LineChart, AreaChart)
- DataProcessing (loads CSV data)
- Constants (position data)

**Key Features:**
- Full frequency range (20Hz-20kHz)
- Logarithmic frequency axis
- SPL magnitude display
- Phase overlay (optional)
- Position comparison mode

---

### DegradationHeatmap.tsx
**Responsibility:** STI degradation visualization by position

**Public API:**
```typescript
interface DegradationHeatmapProps {
  currentSTI: number
  predictedSTI: number
}

export function DegradationHeatmap(props: DegradationHeatmapProps): ReactElement
```

**Dependencies:**
- Constants (MEASUREMENT_POSITIONS)
- AcousticsLib (STI calculations)

**Key Features:**
- Color-coded position markers
- Before/after STI values
- Legend with STI ranges
- 2D room layout visualization

---

### RoomGeometry.tsx
**Responsibility:** Room dimension display

**Public API:**
```typescript
interface RoomGeometryProps {
  roomData: RoomData
}

export function RoomGeometry(props: RoomGeometryProps): ReactElement
```

**Dependencies:**
- Constants (room data)
- Utils (unit conversions)

**Key Features:**
- Length × Width × Height display
- Volume and surface area
- Imperial + Metric units

---

### AcousticPanels.tsx
**Responsibility:** Panel placement visualization

**Public API:**
```typescript
interface AcousticPanelsProps {
  panelConfig: PanelConfig
}

export function AcousticPanels(props: AcousticPanelsProps): ReactElement
```

**Dependencies:**
- Three.js (for 3D rendering within RoomModel3D)

**Key Features:**
- Color-coded panels by thickness
- Realistic panel dimensions
- Placement algorithm (walls/ceiling)
- Hover tooltips

---

### MeasurementPositions.tsx
**Responsibility:** Position selector and markers

**Public API:**
```typescript
interface MeasurementPositionsProps {
  selectedPosition: string
  onPositionChange: (position: string) => void
}

export function MeasurementPositions(props: MeasurementPositionsProps): ReactElement
```

**Dependencies:**
- Constants (MEASUREMENT_POSITIONS)
- Utils (position coordinates)

**Key Features:**
- Interactive position selector
- Visual markers on room layout
- Position labels (Host A, Host B, etc.)

---

## UI Components

### Button.tsx
**Responsibility:** Reusable button primitive

**Public API:**
```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  children: ReactNode
  disabled?: boolean
}

export function Button(props: ButtonProps): ReactElement
```

**Dependencies:**
- Radix UI (accessibility)
- Tailwind CSS (styling)

**Variants:**
- default (primary blue)
- outline (border only)
- ghost (transparent)
- destructive (red)

---

### Card.tsx
**Responsibility:** Container component

**Public API:**
```typescript
interface CardProps {
  children: ReactNode
  className?: string
}

export function Card(props: CardProps): ReactElement
export function CardHeader(props): ReactElement
export function CardContent(props): ReactElement
export function CardFooter(props): ReactElement
```

**Dependencies:** Tailwind CSS

---

### Select.tsx
**Responsibility:** Dropdown selection

**Public API:**
```typescript
interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function Select(props: SelectProps): ReactElement
```

**Dependencies:**
- Radix UI Select (accessibility)
- Tailwind CSS

---

### Slider.tsx
**Responsibility:** Numeric input slider

**Public API:**
```typescript
interface SliderProps {
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step?: number
}

export function Slider(props: SliderProps): ReactElement
```

**Dependencies:**
- Radix UI Slider (accessibility)
- Tailwind CSS

---

### Label.tsx
**Responsibility:** Form label with accessibility

**Public API:**
```typescript
interface LabelProps {
  htmlFor?: string
  children: ReactNode
}

export function Label(props: LabelProps): ReactElement
```

**Dependencies:** Radix UI Label

---

## Business Logic Modules

### AcousticsLib (lib/acoustics/)

**Public API:**
```typescript
// RT60 calculations
export function calculateRT60WithPanels(
  currentRT60: Record<number, number>,
  volume: number,
  surfaceArea: number,
  addedAbsorption: Record<number, number>,
  drapeAbsorption?: Record<number, number>
): Record<number, number>

export function calculateAverageRT60(
  rt60ByFreq: Record<number, number>
): number

// STI calculations
export function calculateSTIImprovement(
  currentSTI: number,
  targetSTI: number,
  rt60Improvement: number
): number

// Panel calculations
export function calculatePanelAbsorption(
  panelConfig: PanelConfig,
  surfaceArea: number
): Record<number, number>

export function calculateDrapeAbsorption(
  surfaceArea: number
): Record<number, number>

export function calculatePanelCost(
  panelConfig: PanelConfig
): number

export function calculateTotalPanels(
  panelConfig: PanelConfig
): number

// Modal analysis
export function identifyRoomModes(
  length: number,
  width: number,
  height: number
): RoomMode[]
```

**Dependencies:**
- Constants (material coefficients)
- Utils (conversions)

**Key Behaviors:**
- All functions are pure (no side effects)
- Frequency-dependent calculations (125Hz-8kHz)
- Sabine/Eyring equations for RT60
- Empirical STI model

---

### DataProcessing (lib/data/)

**Public API:**
```typescript
export function loadFrequencyResponse(
  position: string
): FrequencyData

export interface FrequencyData {
  frequency: number[]
  magnitude: number[]
  phase: number[]
}
```

**Dependencies:**
- CSV measurement data (static imports)
- Constants (position mapping)

---

### Utils (lib/utils/)

**Public API:**
```typescript
// Unit conversions
export const CONVERSIONS = {
  feetToMeters: 0.3048,
  squareFeetToMeters: 0.092903,
  cubicFeetToMeters: 0.0283168,
}

// Position utilities
export function getPositionCoordinates(
  positionName: string
): { x: number; y: number; z: number }

// Export utilities
export function exportToPNG(
  elementId: string,
  filename: string
): void

export function exportToCSV(
  data: any[],
  filename: string
): void

// Classname utility
export function cn(...inputs: ClassValue[]): string
```

**Dependencies:**
- clsx + tailwind-merge (for cn)
- html2canvas (for PNG export)

---

### Constants (lib/utils/constants.ts)

**Public API:**
```typescript
export const STUDIO_8: RoomData = {
  name: 'Studio 8',
  dimensions: { length: 16.8, width: 13.2, height: 9.3 }, // feet
  volume: 2063.9, // cubic feet
  surfaceArea: 1152.9, // square feet
  rt60ByFreq: { 125: 0.92, 250: 0.88, ... },
  measured: {
    averageRT60: 0.92,
    averageSTI: 0.62,
    targetRT60: 0.3,
    targetSTI: 0.75,
  },
}

export const MEASUREMENT_POSITIONS: Position[] = [
  { name: 'Host A (Reference)', x: 0, y: 0, z: 0 },
  { name: 'Host B (Guest)', x: 5, y: 3, z: 0 },
  // ...
]

export const TARGET_RT60 = 0.3 // seconds
export const TARGET_STI = 0.75
```

---

## Component Dependencies

### Dependency Graph (Simplified)

```
App
├── AcousticsContext (provides)
│   └── AcousticsLib
│       ├── Constants
│       └── Utils
├── Header
├── Dashboard
│   ├── useAcoustics (context)
│   ├── RoomGeometry
│   ├── RT60Comparison
│   │   └── DataProcessing
│   └── Button, Card
├── Visualizer
│   ├── useAcoustics
│   ├── RoomModel3D
│   │   └── AcousticPanels
│   └── Button
├── Frequency
│   ├── useAcoustics
│   ├── FrequencyExplorer
│   │   └── DataProcessing
│   └── Select
└── Simulator
    ├── useAcoustics
    ├── RT60Comparison
    ├── DegradationHeatmap
    └── Slider, Select, Button, Card
```

---

## Shared Utilities

### Used by Multiple Components

**useAcoustics Hook:**
- All page components
- Most visualization components

**Button Component:**
- Dashboard, Visualizer, Simulator

**Card Component:**
- Dashboard, Simulator

**DataProcessing:**
- RT60Comparison
- FrequencyExplorer

**Constants:**
- AcousticsContext
- All visualization components
- Business logic modules

---

## Common Workflows

### Adding a New Page
1. Create component in `src/pages/{Name}.tsx`
2. Add route to `App.tsx`
3. Add navigation link to `Header.tsx`
4. Use `useAcoustics()` if state needed
5. Compose existing visualization components

### Creating a New Visualization
1. Create component in `src/components/visualizations/{Name}.tsx`
2. Define props interface
3. Use `useAcoustics()` or accept props from parent
4. Use Recharts or Three.js as appropriate
5. Add to relevant page component

### Adding a New Calculation
1. Add function to `src/lib/acoustics/{module}.ts`
2. Export from `src/lib/acoustics/index.ts`
3. Add to AcousticsContext if global state needed
4. Write unit test in `tests/unit/acoustics/`
5. Document in ACU technical notes

---

## Related Diagrams

- `architecture-overview.mermaid.md` - High-level system layers
- `data-flow.mermaid.md` - How data flows through components
- `repo-structure.mermaid.md` - File system organization

---

**Last Updated:** Sprint 4 (ACU005)
**Component Count:** 24 components (5 pages, 7 visualizations, 5 UI, 7 lib modules)
**Total Lines of Code:** ~3,500 TypeScript
