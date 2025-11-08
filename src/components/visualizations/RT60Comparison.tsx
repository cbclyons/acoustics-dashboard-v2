import { useRef } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useAcoustics } from '../../context/AcousticsContext'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Download, FileDown } from 'lucide-react'
import { exportToCSV, exportChartAsPNG, generateFilename } from '../../lib/utils/export'

export function RT60Comparison() {
  const { currentRT60, predictedRT60 } = useAcoustics()
  const chartRef = useRef<HTMLDivElement>(null)

  // Prepare data for chart
  const data = Object.keys(currentRT60).map((freq) => ({
    frequency: `${freq}Hz`,
    current: currentRT60[Number(freq)],
    predicted: predictedRT60[Number(freq)],
    target: 0.3, // ITU-R BS.1116 target
  }))

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(data, generateFilename('rt60-comparison', 'csv'))
  }

  const handleExportPNG = async () => {
    const svgElement = chartRef.current?.querySelector('svg')
    if (svgElement) {
      try {
        await exportChartAsPNG(svgElement, generateFilename('rt60-comparison', 'png'))
      } catch (error) {
        console.error('Export failed:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>RT60 Comparison (Before/After Treatment)</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPNG} className="gap-2">
              <Download className="h-4 w-4" />
              Export PNG
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={chartRef}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="frequency"
              label={{ value: 'Frequency Band', position: 'insideBottom', offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: 'RT60 (seconds)',
                angle: -90,
                position: 'insideLeft',
              }}
              domain={[0, 1.2]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{payload[0].payload.frequency}</p>
                      <p className="text-sm text-red-600">
                        Current: {payload[0].value?.toFixed(2)}s
                      </p>
                      <p className="text-sm text-blue-600">
                        Predicted: {payload[1].value?.toFixed(2)}s
                      </p>
                      <p className="text-sm text-green-600">
                        Target: {payload[0].payload.target}s
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Improvement: {(((payload[0].value as number) - (payload[1].value as number)) * 100).toFixed(0)}%
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend verticalAlign="top" height={36} />

            {/* Target line */}
            <ReferenceLine
              y={0.3}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'ITU-R Target (0.3s)',
                position: 'right',
                fill: '#10b981',
                fontSize: 11,
              }}
            />

            <Bar dataKey="current" fill="#ef4444" name="Current (No Treatment)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="predicted" fill="#3b82f6" name="Predicted (With Panels)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Current Avg RT60</div>
            <div className="text-xl font-bold text-red-600">
              {(Object.values(currentRT60).reduce((a, b) => a + b, 0) / Object.values(currentRT60).length).toFixed(2)}s
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Predicted Avg RT60</div>
            <div className="text-xl font-bold text-blue-600">
              {(Object.values(predictedRT60).reduce((a, b) => a + b, 0) / Object.values(predictedRT60).length).toFixed(2)}s
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Improvement</div>
            <div className="text-xl font-bold text-green-600">
              {(
                ((Object.values(currentRT60).reduce((a, b) => a + b, 0) / Object.values(currentRT60).length -
                  Object.values(predictedRT60).reduce((a, b) => a + b, 0) / Object.values(predictedRT60).length) /
                  (Object.values(currentRT60).reduce((a, b) => a + b, 0) / Object.values(currentRT60).length)) *
                100
              ).toFixed(0)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
