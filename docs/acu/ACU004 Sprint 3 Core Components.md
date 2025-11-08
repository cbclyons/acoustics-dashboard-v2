# Sprint 3: Core Visualization Components

**Sprint Goal:** Build 3D room visualizer, frequency explorer, and treatment simulator
**Prerequisites:** ACU003 complete (app shell running, state management configured)
**Estimated Effort:** 4-6 days
**Status:** ✅ Complete (2025-11-07)

---

## Context

This sprint implements the three core visualization components that define the dashboard:
1. **3D Room Visualizer** - Interactive Studio 8 model with panel placement
2. **Frequency Explorer** - Multi-position response curves and modal analysis
3. **Treatment Simulator** - Real-time parameter controls with RT60/STI predictions

All visualizations must use calculation functions from Sprint 1 (validated against v1).

---

## Objectives

- [ ] Implement 3D Room Visualizer (Three.js)
- [ ] Implement Frequency Explorer (Recharts/D3)
- [ ] Implement Treatment Simulator (controls + calculations)
- [ ] Connect all components to AcousticsContext
- [ ] Add real-time recalculations
- [ ] Implement responsive layouts
- [ ] Add loading states and error handling
- [ ] Write integration tests

---

## Acceptance Criteria

### 3D Room Visualizer
- [ ] Room renders with correct dimensions (12.3' x 10.6' x 8.2')
- [ ] 7 measurement positions visible (HostA-C, Pos1-4)
- [ ] Positions color-coded by STI degradation
- [ ] Camera controls work (orbit, zoom, pan)
- [ ] Panel placement slider adds/removes panels visually
- [ ] Panels appear on walls (distributed by modal analysis)
- [ ] Hover shows position details (name, STI, RT60)
- [ ] Performance: 60fps on desktop, 30fps on mobile
- [ ] Responsive: scales to container size

### Frequency Explorer
- [ ] Multi-position frequency response curves (20Hz-20kHz)
- [ ] Position selector (dropdown or toggle buttons)
- [ ] Frequency range filter (slider: 20Hz-20kHz)
- [ ] Modal analysis overlay (highlight room resonances)
- [ ] Degradation heatmap (position vs frequency)
- [ ] Legend with STI color scale
- [ ] Interactive: hover shows exact values
- [ ] Responsive: readable on mobile

### Treatment Simulator
- [ ] Panel count slider (0-30)
- [ ] Panel thickness selector (2" or 4")
- [ ] Drape compensation slider (0.0-1.0)
- [ ] Real-time RT60 calculation display
- [ ] Real-time STI prediction display
- [ ] Cost tracker (stays within $1,200 budget)
- [ ] Budget warning when exceeded
- [ ] Before/after comparison (baseline vs treated)
- [ ] Reset button (back to baseline)

### Integration
- [ ] All components update when state changes
- [ ] Simulator changes reflected in 3D view
- [ ] Position selection syncs across components
- [ ] No prop-drilling (use context effectively)

---

## Implementation Notes

### Component 1: 3D Room Visualizer

**File:** `src/components/visualizations/RoomModel3D.tsx`

**Architecture:**
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

export function RoomModel3D() {
  const { panelCount, selectedPosition } = useAcoustics();
  
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[15, 10, 15]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      
      <RoomGeometry />
      <MeasurementPositions />
      <AcousticPanels count={panelCount} />
      <FloorGrid />
    </Canvas>
  );
}
```

**Room Geometry:**
```typescript
function RoomGeometry() {
  const roomDimensions = {
    width: 12.3,   // x
    depth: 10.6,   // y
    height: 8.2    // z
  };
  
  return (
    <group>
      {/* Floor */}
      <mesh position={[roomDimensions.width/2, 0, roomDimensions.depth/2]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[roomDimensions.width, roomDimensions.depth]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Walls (4 planes) */}
      <WallPlane position="front" dimensions={roomDimensions} />
      <WallPlane position="back" dimensions={roomDimensions} />
      <WallPlane position="left" dimensions={roomDimensions} />
      <WallPlane position="right" dimensions={roomDimensions} />
      
      {/* Ceiling */}
      <mesh position={[roomDimensions.width/2, roomDimensions.height, roomDimensions.depth/2]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[roomDimensions.width, roomDimensions.depth]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
```

**Measurement Positions:**
```typescript
// Preserve exact coordinates from v1
const POSITIONS = {
  HostA: { x: 1.0, y: 0.33, z: 4.0, stiDegradation: 0.0 },
  HostB: { x: 6.15, y: 5.3, z: 4.0, stiDegradation: 0.28 },
  HostC: { x: 11.0, y: 5.3, z: 4.0, stiDegradation: 0.35 },
  Pos1: { x: 3.0, y: 2.5, z: 4.0, stiDegradation: 0.22 },
  Pos2: { x: 9.0, y: 2.5, z: 4.0, stiDegradation: 0.30 },
  Pos3: { x: 3.0, y: 8.0, z: 4.0, stiDegradation: 0.25 },
  Pos4: { x: 9.0, y: 8.0, z: 4.0, stiDegradation: 0.32 }
};

function MeasurementPositions() {
  const { selectedPosition, setSelectedPosition } = useAcoustics();
  
  return (
    <group>
      {Object.entries(POSITIONS).map(([name, pos]) => (
        <PositionMarker
          key={name}
          name={name}
          position={[pos.x, pos.z, pos.y]} // Note: Three.js uses Y-up
          stiDegradation={pos.stiDegradation}
          isSelected={name === selectedPosition}
          onClick={() => setSelectedPosition(name)}
        />
      ))}
    </group>
  );
}

function PositionMarker({ name, position, stiDegradation, isSelected, onClick }) {
  const color = getSTIColor(stiDegradation);
  const size = isSelected ? 0.3 : 0.2;
  
  return (
    <mesh position={position} onClick={onClick}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={isSelected ? 0.5 : 0.2}
      />
      {/* Add HTML label using drei's <Html> component */}
    </mesh>
  );
}

function getSTIColor(degradation: number): string {
  if (degradation < 0.15) return '#10b981'; // excellent
  if (degradation < 0.25) return '#3b82f6'; // good
  if (degradation < 0.35) return '#f59e0b'; // fair
  return '#ef4444'; // poor
}
```

**Acoustic Panels:**
```typescript
function AcousticPanels({ count }: { count: number }) {
  // Calculate panel placement based on modal analysis
  // Prioritize high-pressure zones on walls
  const panelPositions = calculatePanelPlacement(count);
  
  return (
    <group>
      {panelPositions.map((pos, i) => (
        <Panel key={i} position={pos.position} rotation={pos.rotation} />
      ))}
    </group>
  );
}

function Panel({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[0.1, 2, 4]} /> {/* 2' x 4' panel, 4" thick */}
      <meshStandardMaterial color="#8b4513" roughness={0.8} />
    </mesh>
  );
}

function calculatePanelPlacement(count: number) {
  // Logic from v1: distribute panels on walls
  // Prioritize corners and parallel walls (modal pressure zones)
  // Return array of {position: [x,y,z], rotation: [rx,ry,rz]}
}
```

---

### Component 2: Frequency Explorer

**File:** `src/components/visualizations/FrequencyExplorer.tsx`

**Architecture:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function FrequencyExplorer() {
  const { measurementData, selectedPosition, frequencyRange } = useAcoustics();
  
  const filteredData = filterByFrequencyRange(measurementData, frequencyRange);
  const chartData = prepareChartData(filteredData);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PositionSelector />
        <FrequencyRangeSlider />
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="frequency" 
            label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
            scale="log"
            domain={[20, 20000]}
          />
          <YAxis 
            label={{ value: 'SPL (dB)', angle: -90, position: 'insideLeft' }}
            domain={[30, 110]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Reference line (HostA) */}
          <Line 
            type="monotone" 
            dataKey="HostA" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
          />
          
          {/* Selected position */}
          <Line 
            type="monotone" 
            dataKey={selectedPosition} 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={false}
          />
          
          {/* Modal analysis overlay */}
          <ModalAnalysisOverlay />
        </LineChart>
      </ResponsiveContainer>
      
      <DegradationHeatmap />
    </div>
  );
}
```

**Modal Analysis Overlay:**
```typescript
function ModalAnalysisOverlay() {
  const roomModes = calculateRoomModes(); // From Sprint 1 function
  
  return (
    <>
      {roomModes.map((mode, i) => (
        <ReferenceLine
          key={i}
          x={mode.frequency}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{
            value: `${mode.type} mode`,
            position: 'top',
            fill: '#ef4444',
            fontSize: 10
          }}
        />
      ))}
    </>
  );
}
```

**Degradation Heatmap:**
```typescript
function DegradationHeatmap() {
  const { measurementData } = useAcoustics();
  
  // Generate 2D grid: positions (y) vs frequency (x)
  const heatmapData = generateHeatmapData(measurementData);
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">STI Degradation Heatmap</h3>
      <svg width="100%" height="300" viewBox="0 0 800 300">
        {/* Render heatmap cells */}
        {heatmapData.map((cell, i) => (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            fill={getSTIColor(cell.degradation)}
            opacity={0.8}
          />
        ))}
        
        {/* Axes and labels */}
        <HeatmapAxes />
      </svg>
      <HeatmapLegend />
    </div>
  );
}
```

---

### Component 3: Treatment Simulator

**File:** `src/components/visualizations/TreatmentSimulator.tsx`

**Architecture:**
```typescript
export function TreatmentSimulator() {
  const {
    panelCount,
    updatePanelCount,
    panelThickness,
    updatePanelThickness,
    drapeCompensation,
    updateDrapeCompensation,
    currentRT60,
    currentSTI,
    estimatedCost
  } = useAcoustics();
  
  const baseline = { rt60: 0.92, sti: 0.48 };
  const target = { rt60: 0.3, sti: 0.75 };
  const budgetLimit = 1200;
  const budgetExceeded = estimatedCost > budgetLimit;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Panel Count Slider */}
          <div>
            <Label>Panel Count: {panelCount}</Label>
            <Slider
              min={0}
              max={30}
              step={1}
              value={[panelCount]}
              onValueChange={([val]) => updatePanelCount(val)}
            />
          </div>
          
          {/* Panel Thickness Selector */}
          <div>
            <Label>Panel Thickness</Label>
            <Select
              value={panelThickness.toString()}
              onValueChange={(val) => updatePanelThickness(Number(val) as 2 | 4)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 inches</SelectItem>
                <SelectItem value="4">4 inches</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Drape Compensation Slider */}
          <div>
            <Label>Drape Compensation: {drapeCompensation.toFixed(2)}</Label>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[drapeCompensation]}
              onValueChange={([val]) => updateDrapeCompensation(val)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Accounts for existing fabric/curtains
            </p>
          </div>
          
          {/* Reset Button */}
          <Button variant="outline" onClick={resetToBaseline}>
            Reset to Baseline
          </Button>
        </CardContent>
      </Card>
      
      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* RT60 Comparison */}
          <MetricComparison
            label="RT60 (Reverberation Time)"
            baseline={baseline.rt60}
            current={currentRT60}
            target={target.rt60}
            unit="s"
            format={(val) => val.toFixed(2)}
            colorScale="rt60"
          />
          
          {/* STI Comparison */}
          <MetricComparison
            label="STI (Speech Transmission Index)"
            baseline={baseline.sti}
            current={currentSTI}
            target={target.sti}
            unit=""
            format={(val) => val.toFixed(3)}
            colorScale="sti"
          />
          
          {/* Cost Tracker */}
          <div className={cn(
            "p-4 rounded-lg border",
            budgetExceeded ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"
          )}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Estimated Cost:</span>
              <span className={cn(
                "text-2xl font-bold",
                budgetExceeded ? "text-red-600" : "text-green-600"
              )}>
                ${estimatedCost.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Budget: ${budgetLimit.toFixed(2)}
            </div>
            {budgetExceeded && (
              <p className="text-sm text-red-600 mt-2">
                âš  Over budget by ${(estimatedCost - budgetLimit).toFixed(2)}
              </p>
            )}
          </div>
          
          {/* Improvement Summary */}
          <ImprovementSummary
            rt60Improvement={(baseline.rt60 - currentRT60) / baseline.rt60}
            stiImprovement={(currentSTI - baseline.sti) / (target.sti - baseline.sti)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Metric Comparison Component:**
```typescript
function MetricComparison({ label, baseline, current, target, unit, format, colorScale }) {
  const percentChange = ((current - baseline) / baseline) * 100;
  const progress = (current - baseline) / (target - baseline);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}% from baseline
        </span>
      </div>
      
      {/* Visual bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-300",
            colorScale === 'rt60' ? "bg-gradient-to-r from-red-500 to-green-500" : "bg-gradient-to-r from-red-500 to-green-500"
          )}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      
      {/* Values */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Baseline: {format(baseline)}{unit}
        </span>
        <span className="font-semibold">
          Current: {format(current)}{unit}
        </span>
        <span className="text-green-600">
          Target: {format(target)}{unit}
        </span>
      </div>
    </div>
  );
}
```

---

## Tasks Breakdown

### Phase 1: 3D Visualizer (12-16 hours)
- [ ] Set up Three.js Canvas component (2 hours)
- [ ] Implement room geometry (walls, floor, ceiling) (3 hours)
- [ ] Add measurement position markers (2 hours)
- [ ] Implement camera controls (1 hour)
- [ ] Add panel placement logic (4 hours)
- [ ] Add hover interactions and labels (2 hours)
- [ ] Optimize performance (lighting, shadows) (2-3 hours)
- [ ] Test responsive behavior (1 hour)

### Phase 2: Frequency Explorer (10-14 hours)
- [ ] Set up Recharts LineChart (2 hours)
- [ ] Load and prepare measurement data (2 hours)
- [ ] Implement multi-line plotting (2 hours)
- [ ] Add position selector UI (1 hour)
- [ ] Add frequency range filter (2 hours)
- [ ] Implement modal analysis overlay (2 hours)
- [ ] Create degradation heatmap (3-4 hours)
- [ ] Add interactive tooltips (1 hour)
- [ ] Test responsive layouts (1 hour)

### Phase 3: Treatment Simulator (8-12 hours)
- [ ] Create controls UI (sliders, selects) (2 hours)
- [ ] Wire up state management (1 hour)
- [ ] Implement real-time RT60 calculation (2 hours)
- [ ] Implement real-time STI calculation (2 hours)
- [ ] Add cost tracking logic (1 hour)
- [ ] Create metric comparison components (2 hours)
- [ ] Add before/after visualization (2-3 hours)
- [ ] Test all interactions (1 hour)

### Phase 4: Integration & Testing (6-8 hours)
- [ ] Connect 3D view to simulator state (2 hours)
- [ ] Sync position selection across components (1 hour)
- [ ] Add loading states for data (1 hour)
- [ ] Implement error boundaries (1 hour)
- [ ] Write integration tests (2-3 hours)
- [ ] Performance optimization (1-2 hours)

---

## Validation Checklist

### 3D Visualizer
- [ ] Room renders correctly (dimensions verified)
- [ ] All 7 positions visible and clickable
- [ ] Positions color-coded correctly (STI scale)
- [ ] Panels appear/disappear with slider
- [ ] Camera controls smooth and intuitive
- [ ] 60fps on desktop (Chrome DevTools Performance)
- [ ] 30fps on mobile (tested on actual device)
- [ ] No console errors
- [ ] Responsive (scales to container)

### Frequency Explorer
- [ ] Frequency curves render for all positions
- [ ] X-axis logarithmic scale (20Hz-20kHz)
- [ ] Y-axis linear scale (30-110 dB)
- [ ] Modal analysis lines at correct frequencies
- [ ] Heatmap shows degradation patterns
- [ ] Position selector updates chart
- [ ] Frequency range filter works
- [ ] Tooltips show exact values
- [ ] Responsive on mobile

### Treatment Simulator
- [ ] All controls functional
- [ ] RT60 updates in real-time (<100ms)
- [ ] STI updates in real-time (<100ms)
- [ ] Cost calculation accurate
- [ ] Budget warning appears when exceeded
- [ ] Reset button works
- [ ] Metric comparisons clear and accurate
- [ ] Before/after visualization works

### Integration
- [ ] 3D view updates when simulator changes
- [ ] Position selection syncs everywhere
- [ ] No unnecessary re-renders (React DevTools)
- [ ] State persists across route changes
- [ ] All calculations match Sprint 1 unit tests

---

## References

[1] Three.js examples: https://threejs.org/examples/  
[2] React Three Fiber: https://docs.pmnd.rs/react-three-fiber/  
[3] Recharts examples: https://recharts.org/en-US/examples  
[4] D3 scales: https://d3js.org/d3-scale  
[5] Room mode calculator: f = c / (2 * L), c = 1130 ft/s  

---

**Next:** ACU005 Sprint 4: Interactive Features & Polish

**For Claude Code:** Execute autonomously. Focus on performance and accuracy. Document any deviations in sprint notes.
