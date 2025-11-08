import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei'
import { RoomGeometry } from './RoomGeometry'
import { MeasurementPositions } from './MeasurementPositions'
import { AcousticPanels } from './AcousticPanels'
import { useAcoustics } from '../../context/AcousticsContext'

export function RoomModel3D() {
  const { panelConfig } = useAcoustics()

  // Calculate total panels from config
  const totalPanels =
    panelConfig['2_inch'] +
    panelConfig['3_inch'] +
    panelConfig['5_5_inch'] +
    panelConfig['11_inch']

  return (
    <div className="w-full h-[600px] rounded-lg border bg-card overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={50} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2} // Prevent camera going below floor
        />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-10, 5, -5]} intensity={0.3} />

        {/* Floor Grid */}
        <Grid
          args={[15, 15]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#374151"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[0, 0, 0]}
        />

        {/* Room Components */}
        <RoomGeometry />
        <MeasurementPositions />
        <AcousticPanels count={totalPanels} panelConfig={panelConfig} />
      </Canvas>
    </div>
  )
}
