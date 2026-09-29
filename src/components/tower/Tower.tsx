'use client'

import { Box, Cylinder, Edges } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  CROWN_BASE_Y,
  FLOOR_COUNT,
  FLOOR_HEIGHT,
  PODIUM_HEIGHT,
  SKY_LOBBY_FLOORS,
  TERRACE_FLOORS,
  deterministic01,
  profileForFloor
} from '@/lib/towerConfig'

const champagne = '#b79a69'
const champagneLight = '#e0c394'
const darkMetal = '#10161d'
const glassBlue = '#10283d'
const warmWindow = '#f6c98d'

function matrixAt(
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  rotationY = 0
) {
  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3(x, y, z)
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationY, 0))
  const scale = new THREE.Vector3(sx, sy, sz)
  matrix.compose(position, quaternion, scale)
  return matrix
}

function applyFloorTransform(localX: number, localZ: number, floor: number) {
  const profile = profileForFloor(floor)
  const c = Math.cos(profile.rotationY)
  const s = Math.sin(profile.rotationY)
  return {
    x: profile.x + localX * c + localZ * s,
    z: profile.z - localX * s + localZ * c,
    rotationY: profile.rotationY
  }
}

function InstanceBatch({ matrices, material }: { matrices: THREE.Matrix4[]; material: React.ReactNode }) {
  const ref = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    matrices.forEach((matrix, index) => ref.current!.setMatrixAt(index, matrix))
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [matrices])

  if (!matrices.length) return null

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {material}
    </instancedMesh>
  )
}

function TowerCore() {
  const fullHeight = FLOOR_COUNT * FLOOR_HEIGHT
  return (
    <group>
      <Box args={[4.4, fullHeight, 3.1]} position={[0, PODIUM_HEIGHT + fullHeight / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#101821" roughness={0.62} metalness={0.3} />
      </Box>
      {[
        [-1.62, -1.15],
        [1.62, -1.15],
        [-1.62, 1.15],
        [1.62, 1.15]
      ].map(([x, z]) => (
        <Box key={`${x}-${z}`} args={[0.28, fullHeight, 0.28]} position={[x, PODIUM_HEIGHT + fullHeight / 2, z]}>
          <meshStandardMaterial color="#464a4c" roughness={0.3} metalness={0.88} />
        </Box>
      ))}
    </group>
  )
}

function FloorSlabs() {
  const floors = useMemo(
    () => Array.from({ length: FLOOR_COUNT }, (_, floor) => profileForFloor(floor)),
    []
  )

  return (
    <group>
      {floors.map((profile) => (
        <group
          key={profile.floor}
          position={[profile.x, profile.y, profile.z]}
          rotation={[0, profile.rotationY, 0]}
        >
          <Box
            args={[
              profile.width * (profile.mechanical ? 1.018 : 0.992),
              profile.mechanical ? 0.14 : 0.08,
              profile.depth * (profile.mechanical ? 1.018 : 0.992)
            ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={profile.mechanical ? '#1b2025' : '#25292b'}
              roughness={profile.mechanical ? 0.42 : 0.3}
              metalness={0.72}
            />
          </Box>
        </group>
      ))}
    </group>
  )
}

type PanelTone = 'dark' | 'cool' | 'warm' | 'bright'

type PanelBuckets = Record<PanelTone, THREE.Matrix4[]>

function panelTone(floor: number, panel: number, side: number): PanelTone {
  const profile = profileForFloor(floor)
  if (profile.mechanical) return 'dark'
  if (SKY_LOBBY_FLOORS.has(floor)) return deterministic01(floor * 9 + panel + side) > 0.12 ? 'bright' : 'warm'

  const use = floor < 48 ? 'office' : floor < 82 ? 'hotel' : 'residential'
  const clusterSeed = Math.floor(panel / 2) + floor * 7 + side * 31
  const cluster = deterministic01(clusterSeed)
  const detail = deterministic01(clusterSeed * 3.7 + panel)

  if (use === 'office') {
    if (cluster > 0.68 && detail > 0.25) return 'warm'
    if (cluster > 0.5) return 'cool'
    return 'dark'
  }
  if (use === 'hotel') {
    if (cluster > 0.78) return 'bright'
    if (cluster > 0.58 && detail > 0.35) return 'warm'
    if (cluster > 0.42) return 'cool'
    return 'dark'
  }
  if (cluster > 0.86) return 'bright'
  if (cluster > 0.7) return 'warm'
  if (cluster > 0.52 && detail > 0.5) return 'cool'
  return 'dark'
}

function GlassFacade() {
  const buckets = useMemo<PanelBuckets>(() => {
    const result: PanelBuckets = { dark: [], cool: [], warm: [], bright: [] }

    for (let floor = 0; floor < FLOOR_COUNT; floor += 1) {
      const profile = profileForFloor(floor)
      const panelHeight = profile.mechanical ? FLOOR_HEIGHT * 0.42 : FLOOR_HEIGHT * 0.72
      const frontCols = Math.max(7, Math.round(profile.width / 0.82))
      const sideCols = Math.max(5, Math.round(profile.depth / 0.82))
      const frontPanelW = (profile.width - 0.25) / frontCols
      const sidePanelW = (profile.depth - 0.25) / sideCols

      for (let side = 0; side < 2; side += 1) {
        const localZ = (profile.depth / 2 + 0.016) * (side === 0 ? 1 : -1)
        for (let col = 0; col < frontCols; col += 1) {
          const localX = -profile.width / 2 + frontPanelW * (col + 0.5) + 0.125
          const transformed = applyFloorTransform(localX, localZ, floor)
          const tone = panelTone(floor, col, side)
          result[tone].push(
            matrixAt(
              transformed.x,
              profile.y,
              transformed.z,
              frontPanelW * 0.92,
              panelHeight,
              0.045,
              transformed.rotationY
            )
          )
        }
      }

      for (let side = 0; side < 2; side += 1) {
        const localX = (profile.width / 2 + 0.016) * (side === 0 ? 1 : -1)
        for (let col = 0; col < sideCols; col += 1) {
          const localZ = -profile.depth / 2 + sidePanelW * (col + 0.5) + 0.125
          const transformed = applyFloorTransform(localX, localZ, floor)
          const tone = panelTone(floor, col, side + 2)
          result[tone].push(
            matrixAt(
              transformed.x,
              profile.y,
              transformed.z,
              0.045,
              panelHeight,
              sidePanelW * 0.92,
              transformed.rotationY
            )
          )
        }
      }
    }

    return result
  }, [])

  return (
    <group>
      <InstanceBatch
        matrices={buckets.dark}
        material={<meshPhysicalMaterial color="#07131f" roughness={0.16} metalness={0.7} clearcoat={0.85} clearcoatRoughness={0.18} />}
      />
      <InstanceBatch
        matrices={buckets.cool}
        material={<meshPhysicalMaterial color={glassBlue} emissive="#27445c" emissiveIntensity={0.16} roughness={0.12} metalness={0.64} clearcoat={0.92} clearcoatRoughness={0.12} />}
      />
      <InstanceBatch
        matrices={buckets.warm}
        material={<meshPhysicalMaterial color="#26313a" emissive={warmWindow} emissiveIntensity={0.58} roughness={0.2} metalness={0.38} clearcoat={0.75} />}
      />
      <InstanceBatch
        matrices={buckets.bright}
        material={<meshPhysicalMaterial color="#594d40" emissive="#ffd7a3" emissiveIntensity={1.25} roughness={0.24} metalness={0.2} clearcoat={0.7} />}
      />
    </group>
  )
}

function CurtainWallGrid() {
  const { verticals, horizontals } = useMemo(() => {
    const verticals: THREE.Matrix4[] = []
    const horizontals: THREE.Matrix4[] = []

    for (let floor = 0; floor < FLOOR_COUNT; floor += 1) {
      const profile = profileForFloor(floor)
      const frontCols = Math.max(7, Math.round(profile.width / 0.82))
      const sideCols = Math.max(5, Math.round(profile.depth / 0.82))
      const frontStep = (profile.width - 0.25) / frontCols
      const sideStep = (profile.depth - 0.25) / sideCols

      for (let side = 0; side < 2; side += 1) {
        const localZ = (profile.depth / 2 + 0.048) * (side === 0 ? 1 : -1)
        for (let col = 0; col <= frontCols; col += 1) {
          const localX = -profile.width / 2 + 0.125 + frontStep * col
          const transformed = applyFloorTransform(localX, localZ, floor)
          verticals.push(matrixAt(transformed.x, profile.y, transformed.z, 0.027, FLOOR_HEIGHT * 0.78, 0.035, transformed.rotationY))
        }
      }

      for (let side = 0; side < 2; side += 1) {
        const localX = (profile.width / 2 + 0.048) * (side === 0 ? 1 : -1)
        for (let col = 0; col <= sideCols; col += 1) {
          const localZ = -profile.depth / 2 + 0.125 + sideStep * col
          const transformed = applyFloorTransform(localX, localZ, floor)
          verticals.push(matrixAt(transformed.x, profile.y, transformed.z, 0.035, FLOOR_HEIGHT * 0.78, 0.027, transformed.rotationY))
        }
      }

      for (let side = 0; side < 2; side += 1) {
        const localZ = (profile.depth / 2 + 0.052) * (side === 0 ? 1 : -1)
        const transformed = applyFloorTransform(0, localZ, floor)
        horizontals.push(matrixAt(transformed.x, profile.y - FLOOR_HEIGHT * 0.42, transformed.z, profile.width, 0.035, 0.04, transformed.rotationY))
      }

      for (let side = 0; side < 2; side += 1) {
        const localX = (profile.width / 2 + 0.052) * (side === 0 ? 1 : -1)
        const transformed = applyFloorTransform(localX, 0, floor)
        horizontals.push(matrixAt(transformed.x, profile.y - FLOOR_HEIGHT * 0.42, transformed.z, 0.04, 0.035, profile.depth, transformed.rotationY))
      }
    }

    return { verticals, horizontals }
  }, [])

  const material = <meshStandardMaterial color="#31383d" roughness={0.28} metalness={0.9} />

  return (
    <group>
      <InstanceBatch matrices={verticals} material={material} />
      <InstanceBatch matrices={horizontals} material={<meshStandardMaterial color="#252d31" roughness={0.34} metalness={0.85} />} />
    </group>
  )
}

function MechanicalFloors() {
  const floors = [19, 40, 62, 82, 98]
  return (
    <group>
      {floors.map((floor) => {
        const p = profileForFloor(floor)
        return (
          <group key={floor} position={[p.x, p.y, p.z]} rotation={[0, p.rotationY, 0]}>
            <Box args={[p.width + 0.32, FLOOR_HEIGHT * 1.18, p.depth + 0.32]} castShadow>
              <meshStandardMaterial color="#151a1d" roughness={0.34} metalness={0.85} />
            </Box>
            {Array.from({ length: 14 }, (_, i) => {
              const x = -p.width / 2 + ((i + 0.5) / 14) * p.width
              return (
                <Box key={i} args={[0.045, FLOOR_HEIGHT * 0.68, 0.08]} position={[x, 0, p.depth / 2 + 0.2]}>
                  <meshStandardMaterial color="#8b7758" roughness={0.32} metalness={0.85} />
                </Box>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

function StructuralFins() {
  const finSpecs = [
    { x: -5.25, z: 0, y0: 4.0, y1: 33.5, width: 0.18, depth: 0.36 },
    { x: 5.25, z: 0, y0: 4.0, y1: 37.5, width: 0.18, depth: 0.36 },
    { x: -4.3, z: 3.7, y0: 4.0, y1: 46.5, width: 0.16, depth: 0.26 },
    { x: 4.3, z: 3.7, y0: 4.0, y1: 49.5, width: 0.16, depth: 0.26 },
    { x: -3.45, z: -3.25, y0: 15.0, y1: 55.0, width: 0.15, depth: 0.24 },
    { x: 3.45, z: -3.25, y0: 20.0, y1: 52.0, width: 0.15, depth: 0.24 }
  ]

  return (
    <group>
      {finSpecs.map((fin, index) => {
        const height = fin.y1 - fin.y0
        return (
          <group key={index} position={[fin.x, fin.y0 + height / 2, fin.z]}>
            <Box args={[fin.width, height, fin.depth]} castShadow>
              <meshStandardMaterial color={champagne} roughness={0.26} metalness={0.9} />
            </Box>
            <Box args={[0.035, height * 0.98, fin.depth + 0.018]} position={[fin.x > 0 ? -0.105 : 0.105, 0, 0]}>
              <meshStandardMaterial color="#f5d7a6" emissive="#e9b969" emissiveIntensity={1.1} toneMapped={false} />
            </Box>
          </group>
        )
      })}
    </group>
  )
}

function BalconyBand({ floor }: { floor: number }) {
  const p = profileForFloor(floor)
  return (
    <group position={[p.x, p.y + 0.17, p.z]} rotation={[0, p.rotationY, 0]}>
      <Box args={[p.width + 0.9, 0.12, p.depth + 0.9]} castShadow receiveShadow>
        <meshStandardMaterial color="#c8c0ad" roughness={0.4} metalness={0.2} />
      </Box>
      <Box args={[p.width + 0.68, 0.32, 0.04]} position={[0, 0.2, p.depth / 2 + 0.42]}>
        <meshPhysicalMaterial color="#8fb1c8" roughness={0.12} metalness={0.2} transparent opacity={0.42} />
      </Box>
      <Box args={[p.width + 0.68, 0.035, 0.08]} position={[0, -0.03, p.depth / 2 + 0.48]}>
        <meshStandardMaterial color="#e8c88e" emissive="#c98d48" emissiveIntensity={0.95} toneMapped={false} />
      </Box>
      {[-0.3, 0.25].map((zOffset, index) => (
        <Box key={index} args={[p.width * 0.28, 0.18, 0.4]} position={[index === 0 ? -p.width * 0.25 : p.width * 0.25, 0.12, p.depth / 2 + zOffset]}>
          <meshStandardMaterial color="#25321f" roughness={0.8} />
        </Box>
      ))}
    </group>
  )
}

function Crown() {
  const tiers = [
    { y: CROWN_BASE_Y + 1.2, w: 4.55, d: 3.75, h: 2.4, r: 0.15 },
    { y: CROWN_BASE_Y + 3.15, w: 3.8, d: 3.1, h: 1.9, r: 0.18 },
    { y: CROWN_BASE_Y + 4.8, w: 3.0, d: 2.45, h: 1.45, r: 0.22 }
  ]

  return (
    <group>
      {tiers.map((tier, index) => (
        <group key={index} position={[0.02 - index * 0.04, tier.y, 0]} rotation={[0, tier.r, 0]}>
          <Box args={[tier.w, tier.h, tier.d]} castShadow>
            <meshPhysicalMaterial color="#152d3e" roughness={0.12} metalness={0.58} clearcoat={1} />
            <Edges color={champagneLight} threshold={12} />
          </Box>
          {[-1, 1].flatMap((sx) =>
            [-1, 1].map((sz) => (
              <Box
                key={`${sx}-${sz}`}
                args={[0.12, tier.h + 0.55, 0.18]}
                position={[sx * (tier.w / 2 + 0.05), 0.14, sz * (tier.d / 2 - 0.08)]}
              >
                <meshStandardMaterial color={champagne} roughness={0.24} metalness={0.92} />
              </Box>
            ))
          )}
          <Box args={[tier.w * 0.84, 0.05, tier.d + 0.08]} position={[0, tier.h * 0.28, tier.d * 0.04]}>
            <meshStandardMaterial color="#f4d5a0" emissive="#e2ae62" emissiveIntensity={1.2} toneMapped={false} />
          </Box>
        </group>
      ))}

      <group position={[0, CROWN_BASE_Y + 5.75, 0]}>
        <Cylinder args={[1.35, 1.7, 0.75, 8]} castShadow>
          <meshStandardMaterial color="#171c20" roughness={0.3} metalness={0.86} />
        </Cylinder>
        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index / 8) * Math.PI * 2
          return (
            <Box
              key={index}
              args={[0.08, 1.5, 0.18]}
              position={[Math.sin(angle) * 1.48, 0.42, Math.cos(angle) * 1.48]}
              rotation={[0, angle, 0]}
            >
              <meshStandardMaterial color={champagne} roughness={0.24} metalness={0.92} />
            </Box>
          )
        })}
      </group>
      <pointLight position={[0, CROWN_BASE_Y + 5.9, 0]} intensity={24} distance={11} color="#f3c77e" />
    </group>
  )
}

function Spire() {
  const base = CROWN_BASE_Y + 6.15
  return (
    <group>
      <Cylinder args={[0.45, 0.7, 1.3, 10]} position={[0, base + 0.65, 0]} castShadow>
        <meshStandardMaterial color={champagne} roughness={0.2} metalness={0.95} />
      </Cylinder>
      <Cylinder args={[0.22, 0.42, 2.1, 10]} position={[0, base + 2.3, 0]}>
        <meshStandardMaterial color="#bda16e" roughness={0.22} metalness={0.95} />
      </Cylinder>
      <Cylinder args={[0.09, 0.2, 3.1, 10]} position={[0, base + 4.9, 0]}>
        <meshStandardMaterial color="#d3b77f" roughness={0.18} metalness={0.96} />
      </Cylinder>
      <Cylinder args={[0.018, 0.07, 4.2, 8]} position={[0, base + 8.55, 0]}>
        <meshStandardMaterial color="#e4c68f" roughness={0.16} metalness={0.98} />
      </Cylinder>
      {[base + 1.4, base + 3.45, base + 6.0].map((y) => (
        <Cylinder key={y} args={[0.64, 0.64, 0.045, 12]} position={[0, y, 0]}>
          <meshStandardMaterial color="#ffd79a" emissive="#e8ae59" emissiveIntensity={1.5} toneMapped={false} />
        </Cylinder>
      ))}
    </group>
  )
}

function PodiumLobby() {
  return (
    <group>
      <Box args={[16.2, PODIUM_HEIGHT, 13.6]} position={[0, PODIUM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#c5beaf" roughness={0.43} metalness={0.12} />
      </Box>
      <Box args={[12.6, 2.65, 0.12]} position={[0, 1.65, 6.86]}>
        <meshPhysicalMaterial color="#193248" roughness={0.11} metalness={0.42} transparent opacity={0.72} clearcoat={0.95} />
      </Box>
      <Box args={[6.8, 0.18, 4.4]} position={[0, 2.95, 8.55]} castShadow>
        <meshStandardMaterial color="#b4996b" roughness={0.27} metalness={0.88} />
      </Box>
      <Box args={[6.3, 0.055, 4.08]} position={[0, 2.83, 8.6]}>
        <meshStandardMaterial color="#ffe0aa" emissive="#f2b965" emissiveIntensity={1.25} toneMapped={false} />
      </Box>

      {[-5.4, -3.6, 3.6, 5.4].map((x) => (
        <Cylinder key={x} args={[0.24, 0.29, 3.05, 24]} position={[x, 1.52, 6.45]} castShadow>
          <meshStandardMaterial color="#d8d1c2" roughness={0.3} metalness={0.16} />
        </Cylinder>
      ))}

      <Box args={[10.8, 0.12, 6.2]} position={[0, 0.42, 3.55]} receiveShadow>
        <meshStandardMaterial color="#ece6dc" roughness={0.2} metalness={0.15} />
      </Box>
      {[-3.4, 3.4].map((x) => (
        <Cylinder key={x} args={[0.32, 0.32, 2.55, 24]} position={[x, 1.62, 5.95]}>
          <meshStandardMaterial color="#d1c5b2" roughness={0.32} metalness={0.13} />
        </Cylinder>
      ))}
      <Box args={[3.2, 0.72, 0.72]} position={[0, 0.86, 5.55]}>
        <meshStandardMaterial color="#6f675c" roughness={0.38} metalness={0.25} />
      </Box>
      <Box args={[5.2, 0.18, 1.15]} position={[0, 2.15, 4.75]}>
        <meshStandardMaterial color="#b89a68" roughness={0.23} metalness={0.9} />
      </Box>
      {Array.from({ length: 18 }, (_, index) => {
        const angle = (index / 18) * Math.PI * 2
        const radius = 1.2 + (index % 3) * 0.16
        return (
          <mesh key={index} position={[Math.cos(angle) * radius, 2.0 + Math.sin(index * 1.7) * 0.22, 4.82 + Math.sin(angle) * 0.46]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#ffdca0" emissive="#f5b65a" emissiveIntensity={2.1} toneMapped={false} />
          </mesh>
        )
      })}

      {[-4.4, -2.2, 0, 2.2, 4.4].map((x) => (
        <Box key={x} args={[1.6, 2.2, 0.1]} position={[x, 1.48, -6.86]}>
          <meshPhysicalMaterial color="#152d3d" roughness={0.14} metalness={0.4} clearcoat={0.9} />
        </Box>
      ))}
    </group>
  )
}

export default function Tower() {
  return (
    <group>
      <PodiumLobby />
      <TowerCore />
      <FloorSlabs />
      <GlassFacade />
      <CurtainWallGrid />
      <MechanicalFloors />
      <StructuralFins />
      {TERRACE_FLOORS.map((floor) => (
        <BalconyBand key={floor} floor={floor} />
      ))}
      <Crown />
      <Spire />
    </group>
  )
}
