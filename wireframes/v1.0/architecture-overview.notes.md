# Architecture Overview - Documentation

**Version:** 1.0
**Last Updated:** 2025-11-08
**Related Diagram:** `architecture-overview.mermaid.md`

---

## Overview

CBC Acoustics v2 follows a **layered architecture** pattern optimized for a React-based single-page application (SPA). The design separates presentation, visualization, state management, business logic, and data layers to ensure maintainability, testability, and performance.

This architecture was selected in **Sprint 2** (ACU003) after evaluating multiple modern web frameworks. The decision prioritized:
- Developer autonomy (Claude Code self-direction)
- Modern best practices (React 18, TypeScript, Vite)
- Performance (<100ms interactions, 60fps 3D rendering)
- Accessibility (WCAG 2.1 AA compliance)

---

## Architectural Layers

### 1. Presentation Layer

**Components:**
- **React Router** - Client-side navigation without page reloads
- **Page Components** - Top-level route handlers (Dashboard, Visualizer, Frequency, Simulator, About)
- **UI Components** - Reusable primitives (Buttons, Cards, Sliders, Selects)

**Responsibilities:**
- Route management and navigation
- Page layout and structure
- User interaction handling
- Accessibility (ARIA labels, keyboard navigation)

**Design Patterns:**
- Component composition (small, focused components)
- Radix UI primitives for accessibility
- Tailwind CSS for consistent styling

**Key Files:**
- `src/App.tsx` - Root component with route definitions
- `src/pages/*.tsx` - Page components
- `src/components/layout/` - Layout components
- `src/components/ui/` - Reusable UI primitives

---

### 2. Visualization Layer

**Components:**
- **Three.js / React Three Fiber (R3F)** - 3D room visualization
- **Recharts** - 2D charts and graphs
- **Visualization Components** - Domain-specific acoustic visualizations

**Responsibilities:**
- 3D room rendering with WebGL
- Interactive chart generation (frequency response, RT60)
- Heatmap generation (STI degradation)
- Panel placement visualization
- Measurement position markers

**Performance Considerations:**
- 3D rendering optimized for 60fps on desktop
- Lazy loading for heavy visualization components
- Responsive design (fallback to 2D on mobile)
- Canvas size optimization

**Key Files:**
- `src/components/visualizations/RoomModel3D.tsx` - Three.js integration
- `src/components/visualizations/FrequencyExplorer.tsx` - Recharts integration
- `src/components/visualizations/RT60Comparison.tsx` - RT60 charts
- `src/components/visualizations/DegradationHeatmap.tsx` - STI heatmaps

---

### 3. State Management Layer

**Components:**
- **AcousticsContext** - Global application state
- **React Hooks** - Local component state (useState, useEffect, useMemo)

**State Structure:**
```typescript
interface AcousticsState {
  // Room selection
  selectedRoom: 'Studio 8' | 'The Hub'
  selectedPosition: string

  // Panel configuration
  panelConfig: PanelConfig
  drapeRemoval: boolean

  // Calculated metrics (derived)
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
```

**Design Decisions:**
- **Single Context** - All acoustic state in one place for simplicity
- **Derived State** - Metrics calculated in context, not stored separately
- **Immutability** - State updates via actions (setters)
- **No Redux** - Context API sufficient for this application size

**Key Files:**
- `src/context/AcousticsContext.tsx` - Global state provider and hooks

---

### 4. Business Logic Layer

**Components:**
- **Acoustics Module** - Pure calculation functions (RT60, STI, modes)
- **Data Processing** - Measurement data transformations
- **Utilities** - Helper functions (conversions, positions, export)

**Responsibilities:**
- Acoustic calculations (RT60, STI, modal analysis)
- Unit conversions (imperial ↔ metric)
- Position calculations (3D coordinates)
- Data export (PNG, CSV)

**Design Patterns:**
- **Pure Functions** - No side effects, easily testable
- **Single Responsibility** - Each module handles one domain
- **Type Safety** - Full TypeScript coverage
- **Preservation** - Original v1 formulas maintained exactly

**Key Calculations:**

**RT60 (Reverberation Time):**
- Sabine equation: `RT60 = 0.161 × V / A`
- Eyring equation (for high absorption): `RT60 = 0.161 × V / (-S × ln(1 - α))`
- Frequency-dependent absorption coefficients

**STI (Speech Transmission Index):**
- Empirical model based on RT60 improvement
- Range: 0.0 (unintelligible) to 1.0 (perfect)
- Target: >0.75 for broadcast environments

**Room Modes:**
- Axial: `f = (c/2) × (n/L)`
- Tangential: `f = (c/2) × √((n₁/L)² + (n₂/W)²)`
- Oblique: `f = (c/2) × √((n₁/L)² + (n₂/W)² + (n₃/H)²)`

**Key Files:**
- `src/lib/acoustics/rt60.ts` - RT60 calculations
- `src/lib/acoustics/sti.ts` - STI predictions
- `src/lib/acoustics/modes.ts` - Modal analysis
- `src/lib/acoustics/absorption.ts` - Material coefficients
- `src/lib/utils/conversions.ts` - Unit conversions
- `src/lib/utils/export.ts` - Export functionality

---

### 5. Data Layer

**Components:**
- **Constants** - Room dimensions, measurement positions, target specifications
- **Measurement Data** - Real acoustic measurements from July 15, 2025

**Data Sources:**
- CSV files in `data/measurements/`
- Static imports (no runtime data fetching)

**Data Format:**
```csv
Timestamp,Frequency (Hz),SPL (dB),Phase (degrees)
```

**Immutability Guarantee:**
- Measurement data MUST NOT be modified
- Original data preserved from v1 implementation
- Any synthetic data clearly marked

**Key Files:**
- `src/lib/utils/constants.ts` - Room and target data
- `src/lib/data/frequencyResponse.ts` - Measurement processing
- `data/measurements/*.csv` - Raw measurement files

---

## Core Technologies & Dependencies

### Frontend Framework
- **React 18.3.1** - UI framework with concurrent features
- **React Router 7.9.5** - Client-side routing
- **TypeScript 5.7.2** - Type safety

### Visualization Libraries
- **Three.js 0.181.0** - WebGL 3D rendering
- **@react-three/fiber 8.18.0** - React integration for Three.js
- **@react-three/drei 9.122.0** - Helper components for R3F
- **Recharts 3.3.0** - Declarative chart library

### Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Lucide React 0.553.0** - Icon library
- **clsx + tailwind-merge** - Conditional class management

### Build Tools
- **Vite 6.0.1** - Dev server and bundler (HMR, optimized builds)
- **ESLint 9.15.0** - Linting with TypeScript support
- **Prettier 3.3.3** - Code formatting
- **Vitest 2.1.8** - Unit testing framework
- **@testing-library/react 16.3.0** - Component testing utilities

---

## Design Patterns

### Component Composition
Small, focused components composed to build complex UIs:
```typescript
<Dashboard>
  <RoomGeometry />
  <RT60Comparison />
  <MeasurementPositions />
</Dashboard>
```

### Provider Pattern
Global state via React Context:
```typescript
<AcousticsProvider>
  <App />
</AcousticsProvider>
```

### Custom Hooks
Encapsulated logic in reusable hooks:
```typescript
const { currentRT60, predictedRT60, updatePanelCount } = useAcoustics()
```

### Pure Functions
Calculations separated from UI:
```typescript
const predictedRT60 = calculateRT60WithPanels(
  currentRT60,
  volume,
  surfaceArea,
  addedAbsorption
)
```

---

## Architectural Decisions & Rationale

### Why React over Streamlit (v1)?
- **Performance:** Client-side rendering eliminates server roundtrips
- **Interactivity:** Direct DOM manipulation for <100ms responses
- **Deployment:** Static hosting (Cloudflare Pages) vs Python server
- **Maintainability:** Component-based architecture scales better

### Why Vite over Create React App?
- **Speed:** Instant HMR with native ESM
- **Modern:** ES2020+ support out of the box
- **Simplicity:** Minimal configuration
- **Bundle Size:** Tree-shaking and code splitting

### Why Context over Redux?
- **Simplicity:** Single global state sufficient for app size
- **Performance:** Calculations are fast (<10ms)
- **Maintenance:** Less boilerplate, easier to understand

### Why Three.js over Unity/Unreal?
- **Web Native:** No plugin/download required
- **Performance:** Hardware-accelerated WebGL
- **Flexibility:** Full control over rendering pipeline
- **Integration:** Seamless React integration via R3F

---

## External Services & APIs

**None Required.**

This application is fully self-contained:
- No backend API (static site)
- No authentication (public dashboard)
- No database (data in CSV files)
- No external data fetching (all data bundled)

**Benefits:**
- Zero runtime dependencies
- Works offline (once loaded)
- No API rate limits
- No server costs

---

## Performance Characteristics

### Build Output
- **Bundle Size:** ~1.48 MB uncompressed
- **Gzipped:** ~424 KB
- **Initial Load:** <3 seconds on 4G

### Runtime Performance
- **3D Rendering:** 60fps on desktop (30fps mobile)
- **Chart Interactions:** <100ms response time
- **State Updates:** <10ms for calculations
- **Memory Usage:** ~50-100 MB typical

### Optimization Techniques
- Code splitting by route (lazy loading)
- Memoization of expensive calculations
- Debounced user inputs (slider changes)
- Canvas size optimization for mobile

---

## Security Considerations

### Static Site Security
- **No Server-Side Code:** Eliminates server vulnerabilities
- **No User Data:** Nothing to leak or compromise
- **HTTPS Only:** Enforced by Cloudflare Pages/Vercel
- **CSP Headers:** Content Security Policy configured

### Dependency Management
- Regular updates via `npm audit`
- Locked versions in `package-lock.json`
- No known vulnerabilities in current dependencies

---

## Areas of Technical Debt

### Current Limitations
1. **State Management Scalability** - AcousticsContext growing large; consider splitting
2. **Test Coverage** - UI components lack visual regression tests
3. **Data Loading** - CSV data statically imported; no dynamic loading
4. **Error Handling** - Limited error boundaries for visualization failures

### Future Improvements
- **React Query** for data fetching if expanding to multiple rooms
- **Context Splitting** into domain-specific providers (UI state, acoustic state, etc.)
- **Playwright** for E2E testing
- **Error Boundaries** around visualization components
- **Web Workers** for heavy calculations (future optimization)

---

## Related Diagrams

- `component-map.mermaid.md` - Detailed component relationships and dependencies
- `data-flow.mermaid.md` - How data moves through layers
- `entry-points.mermaid.md` - Application initialization and routing

---

**Architecture Decisions Documented In:**
- ACU003 Sprint 2 Architecture.md
- ACU006 Sprint 3 Completion Report.md

**Last Architecture Review:** Sprint 2 (ACU003)
**Current Phase:** Production-ready (Sprint 4 complete)
