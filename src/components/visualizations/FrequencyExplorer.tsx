import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useAcoustics } from '../../context/AcousticsContext'
import { generateFrequencyResponse, getRoomModes } from '../../lib/data/frequencyResponse'
import { MEASUREMENT_POSITIONS, getSTIColor } from '../../lib/utils/positions'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

export function FrequencyExplorer() {
  const { selectedPosition, setSelectedPosition } = useAcoustics()
  const [showModalAnalysis, setShowModalAnalysis] = useState(true)
  const [freqRange, setFreqRange] = useState<[number, number]>([20, 20000])

  // Generate frequency response data
  const frequencyData = useMemo(() => generateFrequencyResponse(), [])
  const roomModes = useMemo(() => getRoomModes(), [])

  // Filter data by frequency range
  const filteredData = frequencyData.filter(
    (d) => d.frequency >= freqRange[0] && d.frequency <= freqRange[1]
  )

  // Get reference position color
  const referenceColor = '#10b981' // green
  const selectedColor = getSTIColor(MEASUREMENT_POSITIONS[selectedPosition]?.degradation || 0)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Frequency Analysis Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Position Selector */}
            <div>
              <label className="text-sm font-medium block mb-2">Measurement Position</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(MEASUREMENT_POSITIONS).map((name) => (
                    <SelectItem key={name} value={name}>
                      {MEASUREMENT_POSITIONS[name].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frequency Range Preset */}
            <div>
              <label className="text-sm font-medium block mb-2">Frequency Range</label>
              <Select
                value={`${freqRange[0]}-${freqRange[1]}`}
                onValueChange={(val) => {
                  const [min, max] = val.split('-').map(Number)
                  setFreqRange([min, max])
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20-20000">Full Range (20Hz - 20kHz)</SelectItem>
                  <SelectItem value="20-500">Low Frequency (20Hz - 500Hz)</SelectItem>
                  <SelectItem value="500-4000">Speech Range (500Hz - 4kHz)</SelectItem>
                  <SelectItem value="4000-20000">High Frequency (4kHz - 20kHz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modal Analysis Toggle */}
            <div>
              <label className="text-sm font-medium block mb-2">Display Options</label>
              <button
                onClick={() => setShowModalAnalysis(!showModalAnalysis)}
                className={`w-full px-4 py-2 text-sm rounded-md border transition-colors ${
                  showModalAnalysis
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent'
                }`}
              >
                {showModalAnalysis ? 'Hide' : 'Show'} Room Modes
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Response Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Frequency Response Curves</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="frequency"
                label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10 }}
                scale="log"
                domain={[freqRange[0], freqRange[1]]}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${value / 1000}k`
                  return value.toString()
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{
                  value: 'Sound Pressure Level (dB)',
                  angle: -90,
                  position: 'insideLeft',
                }}
                domain={[60, 110]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">{label} Hz</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {Number(entry.value).toFixed(1)} dB
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ paddingBottom: '10px' }}
              />

              {/* Reference line (Host A) */}
              <Line
                type="monotone"
                dataKey="Host A (Reference)"
                stroke={referenceColor}
                strokeWidth={2}
                dot={false}
                name="Reference (Host A)"
              />

              {/* Selected position */}
              {selectedPosition !== 'Host A (Reference)' && (
                <Line
                  type="monotone"
                  dataKey={selectedPosition}
                  stroke={selectedColor}
                  strokeWidth={3}
                  dot={false}
                  name={MEASUREMENT_POSITIONS[selectedPosition]?.label || selectedPosition}
                />
              )}

              {/* Modal analysis overlay */}
              {showModalAnalysis &&
                roomModes
                  .filter((mode) => mode.frequency >= freqRange[0] && mode.frequency <= freqRange[1])
                  .map((mode, i) => (
                    <ReferenceLine
                      key={i}
                      x={mode.frequency}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      label={{
                        value: mode.label,
                        position: 'top',
                        fill: '#ef4444',
                        fontSize: 10,
                      }}
                    />
                  ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Legend for modal analysis */}
          {showModalAnalysis && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-900 mb-1">Room Mode Indicators</p>
              <p className="text-xs text-red-800">
                Red dashed lines show resonant frequencies where the room naturally amplifies sound.
                These are primary targets for acoustic treatment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
