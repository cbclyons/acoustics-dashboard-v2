import { useMemo } from 'react'
import { generateDegradationHeatmap } from '../../lib/data/frequencyResponse'
import { getSTIColor } from '../../lib/utils/positions'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

export function DegradationHeatmap() {
  const heatmapData = useMemo(() => generateDegradationHeatmap(), [])

  // Get unique positions and frequencies
  const positions = Array.from(new Set(heatmapData.map((d) => d.position)))
  const frequencies = Array.from(new Set(heatmapData.map((d) => d.frequency))).sort((a, b) => a - b)

  // Create 2D grid
  const cellWidth = 100 / frequencies.length
  const cellHeight = 100 / positions.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>STI Degradation Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap */}
          <div className="relative w-full" style={{ paddingBottom: '60%' }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Cells */}
              {heatmapData.map((cell, i) => {
                const x = frequencies.indexOf(cell.frequency) * cellWidth
                const y = positions.indexOf(cell.position) * cellHeight
                const color = getSTIColor(cell.degradation)

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={cellWidth}
                      height={cellHeight}
                      fill={color}
                      opacity={0.7}
                      stroke="#fff"
                      strokeWidth={0.2}
                    />
                  </g>
                )
              })}
            </svg>

            {/* Overlays for labels */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Y-axis labels (positions) */}
              <div className="absolute left-0 top-0 bottom-0 -ml-2 flex flex-col justify-around">
                {positions.map((pos, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium -translate-x-full pr-2 text-right"
                  >
                    {pos.replace(' (Reference)', '').replace(' (Talent)', '')}
                  </div>
                ))}
              </div>

              {/* X-axis labels (frequencies) */}
              <div className="absolute left-0 right-0 bottom-0 -mb-6 flex justify-around">
                {frequencies.map((freq, i) => (
                  <div key={i} className="text-xs font-medium">
                    {freq >= 1000 ? `${freq / 1000}k` : freq}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Axis labels */}
          <div className="text-center text-sm font-medium text-muted-foreground mt-8">
            Frequency (Hz)
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-xs">Excellent (&lt;15% degradation)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-xs">Good (15-25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-xs">Fair (25-35%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-xs">Poor (&gt;35%)</span>
            </div>
          </div>

          {/* Interpretation */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-1">Interpretation</p>
            <p className="text-xs text-blue-800">
              This heatmap shows how speech intelligibility (STI) degrades across different positions
              and frequencies. Darker colors indicate worse performance. Notice how corner positions
              and low frequencies show the most degradation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
