# Entry Points - Documentation

**Version:** 1.0
**Last Updated:** 2025-11-08
**Related Diagram:** `entry-points.mermaid.md`

---

## Overview

This document catalogs all entry points into the CBC Acoustics v2 codebase, including browser application initialization, development workflows, build processes, testing, and data access patterns.

---

## Browser Application Entry Points

### 1. User Navigation (Production)

**Entry Sequence:**
```
User navigates to https://app.domain.com
  ↓
Browser fetches index.html
  ↓
index.html loads main.tsx via <script type="module">
  ↓
main.tsx initializes React application
  ↓
App.tsx renders with routing and context
  ↓
AcousticsProvider initializes global state
  ↓
Router renders Dashboard (default route)
  ↓
User sees application
```

**Key Files:**

**index.html** (`/index.html`)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CBC Studio 8 Acoustics Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**main.tsx** (`/src/main.tsx`)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Purpose:**
- Mounts React application to DOM
- Enables StrictMode for development warnings
- Loads global styles (Tailwind CSS)

---

### 2. Application Initialization (App.tsx)

**File:** `/src/App.tsx`

**Initialization Steps:**
1. BrowserRouter initialization (client-side routing)
2. AcousticsProvider mounts (global state)
3. Route definitions loaded
4. Layout component rendered (Header + main content area)
5. Default route (Dashboard) rendered

**Code:**
```typescript
function App() {
  return (
    <BrowserRouter>
      <AcousticsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/visualizer" element={<Visualizer />} />
            <Route path="/frequency" element={<Frequency />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </AcousticsProvider>
    </BrowserRouter>
  )
}
```

---

### 3. State Initialization (AcousticsContext)

**File:** `/src/context/AcousticsContext.tsx`

**Default State:**
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
  viewMode: '3D',
  showModalAnalysis: false,
  comparisonMode: false,
}
```

**Calculated on Initialization:**
- Current RT60 (from STUDIO_8 constants)
- Predicted RT60 (based on default panel config)
- Current STI (0.62)
- Predicted STI (based on RT60 improvement)
- Total cost ($1,180 with default config)
- Total panels (25 with default config)

**Timing:** <100ms from page load to fully initialized state

---

## Routing Entry Points

### Route: / (Root/Dashboard)
**Component:** `src/pages/Dashboard.tsx`
**Purpose:** Overview metrics and quick navigation
**URL:** `https://app.domain.com/`

**Features:**
- Room geometry display
- RT60 comparison chart
- Current vs predicted metrics
- Position selector
- Navigation cards to other pages

---

### Route: /visualizer
**Component:** `src/pages/Visualizer.tsx`
**Purpose:** 3D room visualization with panels
**URL:** `https://app.domain.com/visualizer`

**Features:**
- 3D WebGL room rendering
- Panel placement visualization
- 2D/3D view toggle
- Measurement position markers
- Interactive camera controls

**Dependencies:**
- Three.js (3D rendering)
- @react-three/fiber (React integration)

---

### Route: /frequency
**Component:** `src/pages/Frequency.tsx`
**Purpose:** Frequency response analysis
**URL:** `https://app.domain.com/frequency`

**Features:**
- Frequency response charts (20Hz-20kHz)
- Position comparison
- Modal analysis overlay
- Export to PNG/CSV

**Data Sources:**
- `data/measurements/*.csv` (real Smaart data)
- Loaded via `lib/data/frequencyResponse.ts`

---

### Route: /simulator
**Component:** `src/pages/Simulator.tsx`
**Purpose:** Treatment configuration and prediction
**URL:** `https://app.domain.com/simulator`

**Features:**
- Panel count sliders (2", 3", 5.5", 11")
- Drape removal toggle
- Live RT60 prediction
- STI improvement calculation
- Cost calculator
- Before/after comparison

---

### Route: /about
**Component:** `src/pages/About.tsx`
**Purpose:** Project context and methodology
**URL:** `https://app.domain.com/about`

**Features:**
- Project background
- Acoustic standards (ITU-R BS.1116, EBU R128)
- Measurement methodology
- Data collection details
- Links to documentation

---

## Development Entry Points

### npm run dev
**Command:** `vite`
**Purpose:** Start development server with hot module replacement (HMR)

**Behavior:**
```bash
$ npm run dev

  VITE v6.0.1  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

**Features:**
- Instant HMR (hot module replacement)
- Fast refresh for React components
- Source maps for debugging
- TypeScript compilation on-the-fly

**Use Case:** Active development and testing

---

### npm test
**Command:** `vitest`
**Purpose:** Run tests in watch mode

**Behavior:**
```bash
$ npm test

 ✓ src/lib/acoustics/rt60.test.ts (12)
 ✓ src/lib/acoustics/sti.test.ts (8)
 ✓ src/lib/acoustics/modes.test.ts (6)

Test Files  3 passed (3)
     Tests  26 passed (26)
```

**Use Case:** Test-driven development, continuous testing

---

### npm run test:coverage
**Command:** `vitest run --coverage`
**Purpose:** Generate code coverage report

**Output:**
- Terminal summary
- HTML report in `coverage/` directory

---

### npm run test:ui
**Command:** `vitest --ui`
**Purpose:** Interactive test UI in browser

**Features:**
- Visual test runner
- File-by-file test results
- Re-run failed tests
- Test filtering

---

### npm run lint
**Command:** `eslint . --ext .ts,.tsx`
**Purpose:** Check code quality and style

**Use Case:** Pre-commit checks, CI/CD validation

---

### npm run lint:fix
**Command:** `eslint . --ext .ts,.tsx --fix`
**Purpose:** Auto-fix linting issues

---

### npm run typecheck
**Command:** `tsc --noEmit`
**Purpose:** Validate TypeScript types without emitting files

**Use Case:** CI/CD type validation

---

### npm run format
**Command:** `prettier --write "src/**/*.{ts,tsx,json,css}"`
**Purpose:** Format code according to Prettier rules

---

## Build Entry Points

### npm run build
**Command:** `tsc && vite build`
**Purpose:** Create optimized production build

**Steps:**
1. **TypeScript Compilation** (`tsc`)
   - Compiles all `.ts` and `.tsx` files
   - Generates type declarations (if configured)
   - Validates types across entire codebase
   - Output: Type-checked JavaScript

2. **Vite Build** (`vite build`)
   - Bundles all modules
   - Tree-shaking (removes unused code)
   - Minification (Terser for JS, cssnano for CSS)
   - Code splitting by route
   - Asset optimization (images, fonts)
   - Generates source maps
   - Output: `dist/` directory

**Build Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      (~1.48 MB → 424 KB gzipped)
│   ├── vendor-[hash].js     (Third-party libs)
│   ├── index-[hash].css
│   └── [images/fonts]
└── data/
    └── measurements/
        └── *.csv
```

**Performance Metrics:**
- Build time: ~30 seconds
- Bundle size: ~1.48 MB uncompressed, ~424 KB gzipped
- Chunks: Main app + vendor libs (code splitting)

---

### npm run preview
**Command:** `vite preview`
**Purpose:** Preview production build locally

**Use Case:** Validate build before deployment

---

## Testing Entry Points

### Unit Tests
**Location:** `tests/unit/`
**Framework:** Vitest + Testing Library

**Test Structure:**
```
tests/unit/
└── acoustics/
    ├── rt60.test.ts       (RT60 calculation tests)
    ├── sti.test.ts        (STI prediction tests)
    ├── modes.test.ts      (Modal analysis tests)
    └── absorption.test.ts (Absorption coefficient tests)
```

**Example Test:**
```typescript
// tests/unit/acoustics/rt60.test.ts
import { describe, it, expect } from 'vitest'
import { calculateRT60WithPanels } from '@/lib/acoustics/rt60'

describe('calculateRT60WithPanels', () => {
  it('should reduce RT60 with added panels', () => {
    const currentRT60 = { 125: 0.92, 250: 0.88, 500: 0.82 }
    const volume = 58.4  // m³
    const surfaceArea = 107.1  // m²
    const addedAbsorption = { 125: 12.5, 250: 28.3, 500: 45.2 }

    const result = calculateRT60WithPanels(currentRT60, volume, surfaceArea, addedAbsorption)

    expect(result[125]).toBeLessThan(currentRT60[125])
    expect(result[250]).toBeLessThan(currentRT60[250])
    expect(result[500]).toBeLessThan(currentRT60[500])
  })
})
```

**Run Tests:**
```bash
npm test                    # Watch mode
npm run test:coverage       # Coverage report
npm run test:ui             # Interactive UI
```

---

## Data Entry Points

### 1. CSV Measurement Data
**Location:** `data/measurements/*.csv`
**Format:**
```csv
Timestamp,Frequency (Hz),SPL (dB),Phase (degrees)
2025-07-15 14:32:01,20,68.2,-45
2025-07-15 14:32:01,25,71.5,-32
...
```

**Positions:**
- `host_a_reference.csv` - 4" from source (baseline)
- `host_b_guest.csv` - Guest position
- `host_c_talent.csv` - Talent position
- `center_mix.csv` - Mix position
- `far_left.csv`, `far_right.csv`, `rear_door.csv`

**Access Method:**
```typescript
import { loadFrequencyResponse } from '@/lib/data/frequencyResponse'

const data = loadFrequencyResponse('Host A (Reference)')
// Returns: { frequency: number[], magnitude: number[], phase: number[] }
```

---

### 2. Room Constants
**Location:** `src/lib/utils/constants.ts`

**Data Structure:**
```typescript
export const STUDIO_8 = {
  name: 'Studio 8',
  dimensions: {
    length: 16.8,  // feet
    width: 13.2,
    height: 9.3,
  },
  volume: 2063.9,      // cubic feet
  surfaceArea: 1152.9, // square feet
  rt60ByFreq: {
    125: 0.92,
    250: 0.88,
    500: 0.82,
    1000: 0.75,
    2000: 0.68,
    4000: 0.62,
    8000: 0.58,
  },
  measured: {
    averageRT60: 0.92,
    averageSTI: 0.62,
    targetRT60: 0.3,
    targetSTI: 0.75,
  },
}

export const MEASUREMENT_POSITIONS = [
  { name: 'Host A (Reference)', x: 0, y: 0, z: 0 },
  { name: 'Host B (Guest)', x: 5, y: 3, z: 0 },
  // ...
]
```

**Access Method:**
```typescript
import { STUDIO_8, MEASUREMENT_POSITIONS } from '@/lib/utils/constants'

const currentRT60 = STUDIO_8.rt60ByFreq
const positions = MEASUREMENT_POSITIONS
```

---

## Environment Differences

### Development Environment
**Entry:** `npm run dev`
**Features:**
- Hot Module Replacement (HMR)
- Source maps enabled
- React StrictMode warnings
- Verbose error messages
- Unminified code

**Environment Variables:** None required (no API keys)

---

### Production Environment
**Entry:** Built via `npm run build`, served via Cloudflare Pages/Vercel
**Features:**
- Minified/optimized code
- No source maps (security)
- No StrictMode (performance)
- Code splitting
- Asset caching (1 year)

**Deployment:**
- Static files served from CDN
- HTTPS enforced
- Automatic compression (gzip/brotli)

---

## CLI Scripts Summary

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Development server |
| `build` | `tsc && vite build` | Production build |
| `preview` | `vite preview` | Preview production build |
| `test` | `vitest` | Run tests (watch mode) |
| `test:ui` | `vitest --ui` | Interactive test UI |
| `test:coverage` | `vitest run --coverage` | Coverage report |
| `lint` | `eslint . --ext .ts,.tsx` | Check code quality |
| `lint:fix` | `eslint . --ext .ts,.tsx --fix` | Auto-fix linting |
| `format` | `prettier --write "src/**/*"` | Format code |
| `typecheck` | `tsc --noEmit` | Validate types |

---

## Bootstrap Sequence (Detailed)

**From URL to Rendered App (in milliseconds):**

```
0ms:    User navigates to URL
50ms:   index.html fetched from CDN
100ms:  main.tsx JavaScript bundle loaded
150ms:  React initializes, StrictMode enabled
160ms:  App component mounts
165ms:  BrowserRouter initializes
170ms:  AcousticsProvider mounts
175ms:  Load STUDIO_8 constants
180ms:  Calculate initial RT60, STI, cost
185ms:  Router determines current path (/)
190ms:  Dashboard component mounts
200ms:  Dashboard calls useAcoustics()
205ms:  Visualization components mount
220ms:  RT60Comparison chart renders
240ms:  RoomGeometry displays dimensions
260ms:  All components rendered
300ms:  First Contentful Paint (FCP)
500ms:  Largest Contentful Paint (LCP)
1000ms: Fully interactive (TTI)
```

**Performance Targets:**
- FCP: <300ms
- LCP: <500ms
- TTI: <1000ms

---

## Related Diagrams

- `architecture-overview.mermaid.md` - System architecture layers
- `data-flow.mermaid.md` - Data flow through the application
- `deployment-infrastructure.mermaid.md` - Deployment architecture

---

**Last Updated:** Sprint 4 (ACU005)
**Entry Point Count:**
- 5 routes
- 10 npm scripts
- 1 main entry (main.tsx)
- 7 CSV data files
