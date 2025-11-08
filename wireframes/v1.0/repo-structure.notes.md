# Repository Structure - Documentation

**Version:** 1.0
**Last Updated:** 2025-11-08
**Related Diagram:** `repo-structure.mermaid.md`

---

## Overview

The CBC Acoustics v2 repository follows a modern TypeScript/React project structure optimized for maintainability and autonomous development via Claude Code. The organization separates concerns clearly: configuration, documentation, source code, data, and testing.

---

## Directory Purposes

### Root Level Configuration

**Critical Files:**
- `package.json` - All dependencies, scripts, and project metadata
- `tsconfig.json` - TypeScript compiler configuration (strict mode enabled)
- `vite.config.ts` - Build tool configuration for development and production
- `tailwind.config.js` - Tailwind CSS customization (colors, spacing, responsive breakpoints)
- `eslint.config.js` - Linting rules for code quality
- `index.html` - SPA entry point (loads main.tsx)

**Purpose:** These files define the technical stack and build/development workflow.

---

### Documentation (`docs/`)

**Structure:**
- `docs/acu/` - Sprint-based project documentation following ACU### naming convention
- `docs/DEPLOYMENT.md` - Production deployment guide for Cloudflare Pages/Vercel

**Sprint Documents:**
- **ACU001** - Project vision and original implementation analysis
- **ACU002** - Sprint 1: Setup and data migration
- **ACU003** - Sprint 2: Architecture decisions (tech stack selection)
- **ACU004** - Sprint 3: Core visualization components
- **ACU005** - Sprint 4: Interactive features and polish
- **ACU006/ACU007** - Sprint completion reports (retrospectives)

**Purpose:** Provides context for autonomous Claude Code operation and tracks development decisions.

---

### Source Code (`src/`)

**Organization Pattern:** Feature-based structure with clear separation of concerns.

#### Entry Points
- `main.tsx` - React application initialization (ReactDOM.createRoot)
- `App.tsx` - Root component with routing setup (BrowserRouter, Routes)

#### Pages (`pages/`)
Each page is a top-level route in the application:
- `Dashboard.tsx` - Home page with overview metrics
- `Visualizer.tsx` - 3D room visualization with acoustic panels
- `Frequency.tsx` - Frequency response analysis and exploration
- `Simulator.tsx` - Treatment configuration and prediction
- `About.tsx` - Project context and methodology

#### Components (`components/`)

**Layout Components:**
- `Header.tsx` - Navigation bar with route links
- `PageLayout.tsx` - Consistent page wrapper

**UI Components (`ui/`):**
Reusable primitives built on Radix UI + Tailwind:
- `button.tsx`, `card.tsx`, `select.tsx`, `slider.tsx`, `label.tsx`
- Exported via `index.ts` for clean imports

**Visualization Components (`visualizations/`):**
Domain-specific acoustic visualizations:
- `RoomModel3D.tsx` - Three.js-based 3D room rendering
- `RoomGeometry.tsx` - Room dimension display
- `AcousticPanels.tsx` - Panel placement visualization
- `MeasurementPositions.tsx` - Microphone position markers
- `RT60Comparison.tsx` - Reverberation time charts (Recharts)
- `FrequencyExplorer.tsx` - Interactive frequency response graphs
- `DegradationHeatmap.tsx` - STI degradation visualization

#### Context (`context/`)
- `AcousticsContext.tsx` - Global state management for room configuration, panel settings, and calculated metrics

#### Library (`lib/`)

**Acoustics Module (`lib/acoustics/`):**
Pure calculation functions preserving original v1 formulas:
- `rt60.ts` - Sabine/Eyring RT60 calculations
- `sti.ts` - Speech Transmission Index predictions
- `modes.ts` - Room mode frequency identification
- `absorption.ts` - Material absorption coefficients
- `index.ts` - Barrel exports

**Data Module (`lib/data/`):**
- `frequencyResponse.ts` - Processes CSV measurement data

**Utils Module (`lib/utils/`):**
- `constants.ts` - Room dimensions, measurement positions, target specs
- `positions.ts` - Position coordinate helpers
- `conversions.ts` - Unit conversion utilities (ft → m, cubic conversions)
- `export.ts` - Chart/data export functions (PNG, CSV)
- `cn.ts` - Classname merging utility (clsx + tailwind-merge)

#### Styles (`styles/`)
- `globals.css` - Tailwind imports and global CSS variables

---

### Data Files (`data/`)

**Structure:**
- `data/measurements/` - Real acoustic measurement data from July 15, 2025 Smaart tests

**Data Format:** CSV files with columns:
- Timestamp, Frequency (Hz), SPL (dB), Phase (degrees)

**Immutability:** These files are ground truth and MUST NOT be modified.

**Reference:** Host A position is the baseline measurement (4" from source).

---

### Testing (`tests/`)

**Structure:**
- `tests/unit/acoustics/` - Unit tests for calculation modules

**Test Coverage:**
- RT60 calculation accuracy
- STI prediction models
- Modal analysis algorithms
- Absorption coefficient lookups

**Tools:** Vitest + Testing Library

---

### Claude Code Configuration (`.claude/`)

**Structure:**
- `.claude/context/` - Distilled knowledge about original v1 implementation

**Purpose:** Maintains context about architectural decisions and original codebase patterns.

---

## Code Organization Patterns

### Import Structure
```typescript
// External dependencies first
import { useState } from 'react'

// Internal lib imports
import { calculateRT60 } from '../lib/acoustics'

// Component imports
import { Button } from '../components/ui'

// Type imports
import type { PanelConfig } from '../context/AcousticsContext'
```

### File Naming Conventions
- **Components:** PascalCase (e.g., `RoomModel3D.tsx`)
- **Utilities:** camelCase (e.g., `conversions.ts`)
- **Types:** PascalCase interfaces/types
- **Constants:** UPPER_SNAKE_CASE

### Module Boundaries
- **No circular dependencies** - Enforced via linting
- **Context at top level** - Only `AcousticsContext` for global state
- **Pure functions in lib/** - No side effects, easily testable
- **Components consume context** - Via `useAcoustics()` hook

---

## Where to Find Specific Code

**Need to...**
- **Add a new page?** → Create in `src/pages/`, add route to `App.tsx`
- **Modify calculations?** → `src/lib/acoustics/` (preserve formulas!)
- **Change room data?** → `src/lib/utils/constants.ts`
- **Add UI component?** → `src/components/ui/` (follow Radix patterns)
- **Adjust 3D visualization?** → `src/components/visualizations/RoomModel3D.tsx`
- **Update global state?** → `src/context/AcousticsContext.tsx`
- **Add measurement data?** → `data/measurements/` (CSV format)
- **Change styling?** → `tailwind.config.js` or component-level Tailwind classes

---

## Configuration Files Deep Dive

### package.json
**Key Scripts:**
- `dev` - Vite dev server (hot reload)
- `build` - TypeScript compile + production build
- `test` - Run Vitest in watch mode
- `lint` - ESLint check
- `typecheck` - TypeScript validation without emitting

**Dependencies of Note:**
- React 18.3.1 (concurrent features)
- Three.js + R3F for 3D rendering
- Recharts for 2D charts
- React Router for navigation
- Tailwind CSS for styling

### tsconfig.json
**Key Settings:**
- `strict: true` - Maximum type safety
- `target: "ES2020"` - Modern JavaScript features
- `moduleResolution: "bundler"` - Vite-compatible

### vite.config.ts
**Configuration:**
- React plugin enabled
- Aliasing for clean imports
- Build optimization settings

---

## Common Workflows

### Adding a New Acoustic Calculation
1. Create function in `src/lib/acoustics/{module}.ts`
2. Export from `src/lib/acoustics/index.ts`
3. Add unit tests in `tests/unit/acoustics/`
4. Import in `AcousticsContext.tsx` if needed for global state
5. Document in ACU technical notes

### Creating a New Visualization
1. Create component in `src/components/visualizations/{Name}.tsx`
2. Import required data via `useAcoustics()` hook
3. Use Recharts or Three.js as appropriate
4. Add to relevant page component
5. Test responsiveness and performance

### Modifying Room Data
1. Edit `src/lib/utils/constants.ts`
2. Ensure measurements reference real data in `data/measurements/`
3. Update TypeScript types if structure changes
4. Rerun tests to verify calculations
5. Document changes in sprint notes

---

## Technical Debt & Complexity

### Current Areas of Complexity
1. **3D Rendering Performance** - RoomModel3D.tsx can be resource-intensive with many panels
2. **State Management** - AcousticsContext is growing large; consider splitting
3. **Data Loading** - CSV data currently imported statically; could support dynamic loading
4. **Test Coverage** - UI components lack visual regression tests

### Future Improvements
- Consider React Query for data fetching
- Split AcousticsContext into domain-specific contexts
- Add Playwright for E2E testing
- Implement code splitting for faster initial load

---

## Related Diagrams

- `architecture-overview.mermaid.md` - High-level system design
- `component-map.mermaid.md` - Detailed component relationships
- `data-flow.mermaid.md` - How data moves through the system

---

**Maintained By:** Claude Code (Autonomous)
**Last Sprint:** Sprint 4 (ACU005)
**Current Status:** Production-ready
