import { Html } from '@react-three/drei'
import { useAcoustics } from '../../context/AcousticsContext'
import { MEASUREMENT_POSITIONS, getSTIColor, getSTIQualityLabel } from '../../lib/utils/positions'
import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

interface PositionMarkerProps {
  x: number
  y: number
  z: number
  sti: number
  degradation: number
  label: string
  isSelected: boolean
  onClick: () => void
}

function PositionMarker({
  x,
  y,
  z,
  sti,
  degradation,
  label,
  isSelected,
  onClick,
}: PositionMarkerProps) {
  const [hovered, setHovered] = useState(false)
  const color = getSTIColor(degradation)
  const quality = getSTIQualityLabel(degradation)
  const size = isSelected ? 0.3 : hovered ? 0.25 : 0.2

  return (
    <group position={[x, z, y]}>
      {/* Marker Sphere */}
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(false)
        }}
        castShadow
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Label (always visible for selected, on hover for others) */}
      {(isSelected || hovered) && (
        <Html position={[0, 0.5, 0]} center distanceFactor={10}>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none">
            <div className="font-semibold">{label}</div>
            <div className="text-xs opacity-90">STI: {sti.toFixed(2)}</div>
            <div className="text-xs opacity-90" style={{ color }}>
              {quality}
            </div>
          </div>
        </Html>
      )}

      {/* Selection indicator ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size + 0.1, size + 0.15, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

export function MeasurementPositions() {
  const { selectedPosition, setSelectedPosition } = useAcoustics()

  return (
    <group>
      {Object.entries(MEASUREMENT_POSITIONS).map(([posName, pos]) => (
        <PositionMarker
          key={posName}
          x={pos.x}
          y={pos.y}
          z={pos.z}
          sti={pos.sti}
          degradation={pos.degradation}
          label={pos.label}
          isSelected={posName === selectedPosition}
          onClick={() => setSelectedPosition(posName)}
        />
      ))}
    </group>
  )
}
