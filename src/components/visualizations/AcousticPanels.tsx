import { useMemo } from 'react'
import { PanelConfig } from '../../context/AcousticsContext'
import { STUDIO_8 } from '../../lib/utils/constants'
import * as THREE from 'three'

interface PanelPlacement {
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number] // width, height, depth
  thickness: string
}

interface AcousticPanelsProps {
  count: number
  panelConfig: PanelConfig
}

/**
 * Calculate panel placements based on modal analysis
 * Prioritizes corners and parallel walls for low-frequency control
 */
function calculatePanelPlacements(panelConfig: PanelConfig): PanelPlacement[] {
  const { width, depth, height } = STUDIO_8.dimensions
  const placements: PanelPlacement[] = []

  // Helper to convert inches to feet for panel thickness
  const inchesToFeet = (inches: number) => inches / 12

  // 1. Place 11" corner bass traps first (in vertical corners)
  const bassTraps = panelConfig['11_inch']
  const corners = [
    { x: 0.5, z: 0.5 }, // front-left
    { x: width - 0.5, z: 0.5 }, // front-right
    { x: 0.5, z: depth - 0.5 }, // back-left
    { x: width - 0.5, z: depth - 0.5 }, // back-right
  ]

  for (let i = 0; i < Math.min(bassTraps, corners.length); i++) {
    const corner = corners[i]
    placements.push({
      position: [corner.x, 4, corner.z],
      rotation: [0, Math.PI / 4, 0], // 45° angle in corner
      size: [inchesToFeet(11), 4, inchesToFeet(11)],
      thickness: '11_inch',
    })
  }

  // 2. Place 5.5" ceiling clouds (distributed across ceiling)
  const ceilingPanels = panelConfig['5_5_inch']
  const cloudPositions = [
    { x: width * 0.25, z: depth * 0.3 },
    { x: width * 0.75, z: depth * 0.3 },
    { x: width * 0.25, z: depth * 0.7 },
    { x: width * 0.75, z: depth * 0.7 },
    { x: width * 0.5, z: depth * 0.5 },
    { x: width * 0.5, z: depth * 0.2 },
    { x: width * 0.5, z: depth * 0.8 },
  ]

  for (let i = 0; i < Math.min(ceilingPanels, cloudPositions.length); i++) {
    const pos = cloudPositions[i]
    placements.push({
      position: [pos.x, height - 0.3, pos.z],
      rotation: [Math.PI / 2, 0, 0], // horizontal (ceiling mount)
      size: [2, 4, inchesToFeet(5.5)], // 2'x4' panel
      thickness: '5_5_inch',
    })
  }

  // 3. Place 3" wall panels (on parallel walls for flutter echo)
  const wall3Panels = panelConfig['3_inch']
  const wall3Positions = [
    { x: 0.15, y: 4, z: depth / 2, rotation: [0, Math.PI / 2, 0] }, // left wall
    { x: width - 0.15, y: 4, z: depth / 2, rotation: [0, -Math.PI / 2, 0] }, // right wall
    { x: width / 2, y: 4, z: 0.15, rotation: [0, 0, 0] }, // front wall
    { x: width / 2, y: 4, z: depth - 0.15, rotation: [0, Math.PI, 0] }, // back wall
  ]

  for (let i = 0; i < Math.min(wall3Panels, wall3Positions.length); i++) {
    const pos = wall3Positions[i]
    placements.push({
      position: [pos.x, pos.y, pos.z],
      rotation: pos.rotation as [number, number, number],
      size: [2, 4, inchesToFeet(3)],
      thickness: '3_inch',
    })
  }

  // 4. Place 2" panels (desk/speaker reflection points)
  const panel2Count = panelConfig['2_inch']
  const panel2Positions = [
    { x: 3, y: 2, z: 0.1, rotation: [0, 0, 0] }, // desk front
    { x: 9, y: 2, z: 0.1, rotation: [0, 0, 0] }, // desk front
    { x: 6, y: 2, z: 0.1, rotation: [0, 0, 0] }, // center desk
  ]

  for (let i = 0; i < Math.min(panel2Count, panel2Positions.length); i++) {
    const pos = panel2Positions[i]
    placements.push({
      position: [pos.x, pos.y, pos.z],
      rotation: pos.rotation as [number, number, number],
      size: [2, 4, inchesToFeet(2)],
      thickness: '2_inch',
    })
  }

  return placements
}

function Panel({ placement }: { placement: PanelPlacement }) {
  const { position, rotation, size } = placement

  // Panel colors by thickness
  const colorMap = {
    '11_inch': '#654321', // dark brown (bass traps)
    '5_5_inch': '#8b6f47', // medium brown
    '3_inch': '#a0826d', // light brown
    '2_inch': '#c4a57b', // tan
  }

  const color = colorMap[placement.thickness as keyof typeof colorMap] || '#8b4513'

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function AcousticPanels({ panelConfig }: AcousticPanelsProps) {
  const placements = useMemo(
    () => calculatePanelPlacements(panelConfig),
    [panelConfig]
  )

  return (
    <group>
      {placements.map((placement, i) => (
        <Panel key={i} placement={placement} />
      ))}
    </group>
  )
}
