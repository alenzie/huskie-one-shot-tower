'use client'

import { Box, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

function Palm({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <Cylinder args={[0.12, 0.19, 2.7, 9]} position={[0, 1.35, 0]} castShadow>
        <meshStandardMaterial color="#63533d" roughness={0.9} />
      </Cylinder>
      <group position={[0, 2.7, 0]}>
        {Array.from({ length: 7 }, (_, index) => {
          const angle = (index / 7) * Math.PI * 2
          return (
            <mesh key={index} rotation={[0.15, -angle, -0.55]} position={[Math.sin(angle) * 0.26, 0, Math.cos(angle) * 0.26]} castShadow>
              <boxGeometry args={[0.11, 0.035, 1.55]} />
              <meshStandardMaterial color="#273d2c" roughness={0.78} side={THREE.DoubleSide} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function Human({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <Cylinder args={[0.08, 0.095, 0.72, 10]} position={[0, 0.51, 0]} castShadow>
        <meshStandardMaterial color="#17181a" roughness={0.78} />
      </Cylinder>
      <mesh position={[0, 0.94, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color="#3a3029" roughness={0.85} />
      </mesh>
    </group>
  )
}

function Vehicle({ x, z, rotation = 0, length = 2 }: { x: number; z: number; rotation?: number; length?: number }) {
  return (
    <group position={[x, 0.18, z]} rotation={[0, rotation, 0]}>
      <Box args={[0.86, 0.32, length]} castShadow>
        <meshStandardMaterial color="#20262c" roughness={0.3} metalness={0.75} />
      </Box>
      <Box args={[0.73, 0.3, length * 0.48]} position={[0, 0.26, -0.05]} castShadow>
        <meshPhysicalMaterial color="#142633" roughness={0.11} metalness={0.62} clearcoat={0.95} />
      </Box>
      {[[-0.48, -0.62], [0.48, -0.62], [-0.48, 0.62], [0.48, 0.62]].map(([wx, wz], index) => (
        <Cylinder key={index} args={[0.13, 0.13, 0.1, 12]} position={[wx, -0.1, wz * (length / 2)]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#090b0d" roughness={0.95} />
        </Cylinder>
      ))}
    </group>
  )
}

function Bollard({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.27, z]}>
      <Cylinder args={[0.08, 0.1, 0.54, 10]} castShadow>
        <meshStandardMaterial color="#25282a" roughness={0.34} metalness={0.82} />
      </Cylinder>
      <Cylinder args={[0.055, 0.055, 0.035, 10]} position={[0, 0.21, 0]}>
        <meshStandardMaterial color="#ffda9d" emissive="#e8aa50" emissiveIntensity={1.4} toneMapped={false} />
      </Cylinder>
    </group>
  )
}

function DistantTower({ x, z, h, w }: { x: number; z: number; h: number; w: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box args={[w, h, w * 0.72]} position={[0, h / 2, 0]}>
        <meshStandardMaterial color="#0b1621" roughness={0.45} metalness={0.38} />
      </Box>
      <Box args={[w * 0.72, h * 0.62, 0.03]} position={[0, h * 0.54, w * 0.37]}>
        <meshStandardMaterial color="#183047" emissive="#20364a" emissiveIntensity={0.12} />
      </Box>
    </group>
  )
}

export default function SiteEnvironment() {
  return (
    <group>
      <Box args={[74, 0.25, 70]} position={[0, -0.13, 0]} receiveShadow>
        <meshStandardMaterial color="#202329" roughness={0.82} metalness={0.08} />
      </Box>
      <Box args={[38, 0.12, 34]} position={[0, 0.02, 1]} receiveShadow>
        <meshStandardMaterial color="#b5aea2" roughness={0.5} metalness={0.08} />
      </Box>

      <Box args={[12, 0.12, 25]} position={[-12.6, 0.09, 2]} receiveShadow>
        <meshPhysicalMaterial color="#153344" roughness={0.08} metalness={0.25} clearcoat={1} />
      </Box>
      <Box args={[12, 0.12, 25]} position={[12.6, 0.09, 2]} receiveShadow>
        <meshPhysicalMaterial color="#153344" roughness={0.08} metalness={0.25} clearcoat={1} />
      </Box>
      <Box args={[10.7, 0.035, 23.5]} position={[-12.6, 0.17, 2]}>
        <meshStandardMaterial color="#315565" emissive="#17384a" emissiveIntensity={0.22} />
      </Box>
      <Box args={[10.7, 0.035, 23.5]} position={[12.6, 0.17, 2]}>
        <meshStandardMaterial color="#315565" emissive="#17384a" emissiveIntensity={0.22} />
      </Box>

      <Box args={[58, 0.08, 8]} position={[0, 0.01, 20]} receiveShadow>
        <meshStandardMaterial color="#171a1f" roughness={0.88} />
      </Box>
      {[-11, 0, 11].map((x) => (
        <Box key={x} args={[4.3, 0.02, 0.12]} position={[x, 0.07, 20]}>
          <meshStandardMaterial color="#d7cdb8" emissive="#6f674f" emissiveIntensity={0.15} />
        </Box>
      ))}

      {[-8.2, -6.1, -4.0, 4.0, 6.1, 8.2].map((x) => (
        <Box key={x} args={[1.85, 0.18, 2.4]} position={[x, 0.15 + Math.abs(x) * 0.005, 10.4]} castShadow>
          <meshStandardMaterial color="#cbc3b5" roughness={0.47} />
        </Box>
      ))}
      <Box args={[7.6, 0.16, 12]} position={[8.9, 0.08, 11.8]} rotation={[0, -0.12, 0]} receiveShadow>
        <meshStandardMaterial color="#aea79c" roughness={0.52} />
      </Box>

      {[
        [-17.2, -8], [-17.2, 5], [-17.2, 13],
        [17.2, -8], [17.2, 5], [17.2, 13]
      ].map(([x, z], index) => (
        <Palm key={index} x={x} z={z} scale={index % 2 ? 1.05 : 0.92} />
      ))}

      {[-9.8, -7.4, 7.4, 9.8].map((x) => (
        <Bollard key={x} x={x} z={11.9} />
      ))}
      {[-14.5, -11.2, 11.2, 14.5].map((x) => (
        <Bollard key={x} x={x} z={15.8} />
      ))}

      <Vehicle x={-7.4} z={19.8} rotation={Math.PI / 2} length={2.25} />
      <Vehicle x={3.5} z={20.2} rotation={Math.PI / 2} length={2.5} />
      <Vehicle x={12.7} z={19.6} rotation={Math.PI / 2} length={1.95} />

      <Human x={-2.8} z={10.6} rotation={0.2} />
      <Human x={-1.8} z={11.3} rotation={-0.4} />
      <Human x={2.6} z={12.2} rotation={0.5} />
      <Human x={5.6} z={9.7} rotation={-0.2} />
      <Human x={8.8} z={13.8} rotation={0.7} />
      <Human x={-10.6} z={14.6} rotation={-0.7} />

      <pointLight position={[-11, 0.7, 13]} intensity={7} distance={4} color="#ffd49b" />
      <pointLight position={[11, 0.7, 13]} intensity={7} distance={4} color="#ffd49b" />
      <pointLight position={[0, 0.8, 13]} intensity={8} distance={5} color="#ffd49b" />

      <DistantTower x={-31} z={-26} h={22} w={6.2} />
      <DistantTower x={29} z={-30} h={28} w={5.4} />
      <DistantTower x={19} z={-38} h={16} w={4.3} />
      <DistantTower x={-20} z={-42} h={18} w={4.8} />
    </group>
  )
}
