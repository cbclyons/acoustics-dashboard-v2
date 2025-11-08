import { PageLayout } from '../components/layout/PageLayout'
import { FrequencyExplorer } from '../components/visualizations/FrequencyExplorer'
import { DegradationHeatmap } from '../components/visualizations/DegradationHeatmap'

export function Frequency() {
  return (
    <PageLayout
      title="Frequency Analysis"
      description="Frequency response curves, modal analysis, and position heatmaps"
    >
      <div className="space-y-6">
        <FrequencyExplorer />
        <DegradationHeatmap />
      </div>
    </PageLayout>
  )
}
