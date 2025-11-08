import { PageLayout } from '../components/layout/PageLayout'
import { useAcoustics } from '../context/AcousticsContext'
import { Sliders, Info } from 'lucide-react'
import { cn } from '../lib/utils/cn'
import { classifySTI } from '../lib/acoustics'
import { RT60Comparison } from '../components/visualizations/RT60Comparison'

export function Simulator() {
  const {
    panelConfig,
    updatePanelCount,
    drapeRemoval,
    setDrapeRemoval,
    predictedSTI,
    totalCost,
    totalPanels,
    resetPanelConfig,
  } = useAcoustics()

  const stiQuality = classifySTI(predictedSTI)

  return (
    <PageLayout
      title="Treatment Simulator"
      description="Design your acoustic treatment package and see predicted improvements"
    >
      {/* Panel Configuration */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sliders className="mr-2 h-5 w-5" />
            Panel Configuration
          </h3>

          <div className="space-y-4">
            {/* 11" Bass Traps */}
            <div>
              <label className="text-sm font-medium mb-2 block">11" Corner Bass Traps ($45 ea)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={panelConfig['11_inch']}
                onChange={e => updatePanelCount('11_inch', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Superior low-frequency absorption (63Hz+)
              </p>
            </div>

            {/* 5.5" Panels */}
            <div>
              <label className="text-sm font-medium mb-2 block">5.5" Panels ($30 ea)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={panelConfig['5_5_inch']}
                onChange={e => updatePanelCount('5_5_inch', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Excellent broadband absorption (125Hz+)
              </p>
            </div>

            {/* 3" Panels */}
            <div>
              <label className="text-sm font-medium mb-2 block">3" Panels ($25 ea)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={panelConfig['3_inch']}
                onChange={e => updatePanelCount('3_inch', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">Mid-to-high frequency (500Hz+)</p>
            </div>

            {/* 2" Panels */}
            <div>
              <label className="text-sm font-medium mb-2 block">2" Panels ($20 ea)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={panelConfig['2_inch']}
                onChange={e => updatePanelCount('2_inch', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Budget option for high frequencies (1kHz+)
              </p>
            </div>

            {/* Drape Removal */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={drapeRemoval}
                  onChange={e => setDrapeRemoval(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">Account for drape removal</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Lighting grid velvet drape provides mid-frequency absorption
              </p>
            </div>
          </div>

          <button
            onClick={resetPanelConfig}
            className="mt-6 w-full px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
          >
            Reset to Default Configuration
          </button>
        </div>

        {/* Predicted Results */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Predicted Results</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium">Speech Clarity (STI)</span>
                  <span className="text-2xl font-bold">{predictedSTI.toFixed(2)}</span>
                </div>
                <div
                  className={cn(
                    'text-xs font-medium',
                    stiQuality === 'Excellent' && 'text-green-600',
                    stiQuality === 'Good' && 'text-blue-600',
                    stiQuality === 'Fair' && 'text-yellow-600',
                    stiQuality === 'Poor' && 'text-red-600'
                  )}
                >
                  {stiQuality}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium">Total Panels</span>
                  <span className="text-xl font-semibold">{totalPanels}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium">Total Cost</span>
                  <span className="text-2xl font-bold">${totalCost}</span>
                </div>
                <div
                  className={cn(
                    'text-xs font-medium',
                    totalCost <= 1200 ? 'text-green-600' : 'text-orange-600'
                  )}
                >
                  {totalCost <= 1200
                    ? `$${1200 - totalCost} under budget`
                    : `$${totalCost - 1200} over budget`}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-blue-50 p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Studio 8 Recommended Plan</h4>
                <p className="text-xs text-blue-800">
                  4× 11" bass traps + 12× 5.5" ceiling clouds + 3× 2" desk clouds + 6× 3" wall
                  panels = 25 panels for comprehensive treatment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RT60 Comparison Visualization */}
      <RT60Comparison />
    </PageLayout>
  )
}
