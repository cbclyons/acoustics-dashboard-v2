import { STUDIO_8 } from '../../lib/utils/constants'

export function RoomGeometry() {
  const { width, depth, height } = STUDIO_8.dimensions

  return (
    <group>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[width / 2, 0, depth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Front Wall (y=0) */}
      <mesh
        receiveShadow
        position={[width / 2, height / 2, 0]}
      >
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.8} />
      </mesh>

      {/* Back Wall (y=depth) */}
      <mesh
        receiveShadow
        position={[width / 2, height / 2, depth]}
      >
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.8} />
      </mesh>

      {/* Left Wall (x=0) */}
      <mesh
        receiveShadow
        position={[0, height / 2, depth / 2]}
      >
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.8} />
      </mesh>

      {/* Right Wall (x=width) */}
      <mesh
        receiveShadow
        position={[width, height / 2, depth / 2]}
      >
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh
        receiveShadow
        position={[width / 2, height, depth / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#fafafa" transparent opacity={0.3} />
      </mesh>

      {/* Room outline for better visibility */}
      <lineSegments>
        <edgesGeometry
          attach="geometry"
          args={[
            new THREE.BoxGeometry(width, height, depth),
          ]}
        />
        <lineBasicMaterial attach="material" color="#64748b" linewidth={2} />
      </lineSegments>
    </group>
  )
}

// Import THREE for EdgesGeometry
import * as THREE from 'three'
