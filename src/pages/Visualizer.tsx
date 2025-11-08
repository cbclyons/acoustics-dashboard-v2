import { PageLayout } from '../components/layout/PageLayout'
import { RoomModel3D } from '../components/visualizations/RoomModel3D'
import { useAcoustics } from '../context/AcousticsContext'
import { MEASUREMENT_POSITIONS, getSTIQualityLabel } from '../lib/utils/positions'
import { Button } from '../components/ui/button'
import { GitCompare } from 'lucide-react'

export function Visualizer() {
  const { selectedPosition, comparisonMode, toggleComparisonMode } = useAcoustics()
  const positionData = MEASUREMENT_POSITIONS[selectedPosition]

  return (
    <PageLayout
      title="3D Room Visualizer"
      description="Interactive 3D visualization of Studio 8 with measurement positions"
    >
      <div className="space-y-4">
        {/* Comparison Mode Toggle */}
        <div className="flex justify-end">
          <Button
            variant={comparisonMode ? 'default' : 'outline'}
            onClick={toggleComparisonMode}
            className="gap-2"
          >
            <GitCompare className="h-4 w-4" />
            {comparisonMode ? 'Exit' : 'Enable'} Comparison Mode
          </Button>
        </div>

        {/* Selected Position Info */}
        {positionData && (
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{positionData.label}</h3>
                <p className="text-sm text-muted-foreground">
                  Position: ({positionData.x.toFixed(1)}', {positionData.y.toFixed(1)}', {positionData.z.toFixed(1)}')
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">STI: {positionData.sti.toFixed(2)}</div>
                <div className="text-sm font-medium" style={{ color: getSTIQualityLabel(positionData.degradation) === 'Excellent' ? '#10b981' : getSTIQualityLabel(positionData.degradation) === 'Good' ? '#3b82f6' : getSTIQualityLabel(positionData.degradation) === 'Fair' ? '#f59e0b' : '#ef4444' }}>
                  {getSTIQualityLabel(positionData.degradation)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Visualization */}
        <RoomModel3D />

        {/* Legend */}
        <div className="rounded-lg border bg-card p-4">
          <h4 className="font-semibold mb-3">Controls</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>Left Click + Drag:</strong> Rotate camera</li>
            <li><strong>Right Click + Drag:</strong> Pan camera</li>
            <li><strong>Scroll Wheel:</strong> Zoom in/out</li>
            <li><strong>Click Marker:</strong> Select measurement position</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  )
}
