export const FLOOR_COUNT = 106
export const FLOOR_HEIGHT = 0.5
export const PODIUM_HEIGHT = 3.6
export const TOWER_BASE_Y = PODIUM_HEIGHT
export const CROWN_BASE_Y = TOWER_BASE_Y + FLOOR_COUNT * FLOOR_HEIGHT

export const MECHANICAL_FLOORS = new Set([19, 20, 40, 41, 62, 63, 82, 83, 98])
export const SKY_LOBBY_FLOORS = new Set([34, 35, 68, 69, 90, 91])
export const TERRACE_FLOORS = [23, 47, 70, 89, 97]

type Tier = {
  start: number
  end: number
  width0: number
  width1: number
  depth0: number
  depth1: number
  x0: number
  x1: number
  z0: number
  z1: number
  r0: number
  r1: number
}

const tiers: Tier[] = [
  { start: 0, end: 23, width0: 11.4, width1: 10.8, depth0: 8.9, depth1: 8.4, x0: 0, x1: 0.14, z0: 0, z1: 0.06, r0: 0, r1: 0.012 },
  { start: 24, end: 47, width0: 10.2, width1: 9.3, depth0: 7.9, depth1: 7.15, x0: 0.22, x1: 0.48, z0: 0.08, z1: 0.15, r0: 0.016, r1: 0.045 },
  { start: 48, end: 70, width0: 8.7, width1: 7.8, depth0: 6.8, depth1: 6.05, x0: 0.4, x1: 0.08, z0: 0.2, z1: 0.35, r0: 0.05, r1: 0.082 },
  { start: 71, end: 89, width0: 7.3, width1: 6.35, depth0: 5.72, depth1: 5.1, x0: 0.05, x1: -0.26, z0: 0.31, z1: 0.22, r0: 0.084, r1: 0.112 },
  { start: 90, end: 105, width0: 5.95, width1: 4.7, depth0: 4.85, depth1: 3.95, x0: -0.18, x1: 0.02, z0: 0.16, z1: 0.02, r0: 0.114, r1: 0.145 }
]

export type FloorProfile = {
  floor: number
  y: number
  width: number
  depth: number
  x: number
  z: number
  rotationY: number
  mechanical: boolean
  skyLobby: boolean
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function profileForFloor(floor: number): FloorProfile {
  const tier = tiers.find((entry) => floor >= entry.start && floor <= entry.end) ?? tiers[tiers.length - 1]
  const span = Math.max(1, tier.end - tier.start)
  const t = (floor - tier.start) / span

  return {
    floor,
    y: TOWER_BASE_Y + floor * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
    width: lerp(tier.width0, tier.width1, t),
    depth: lerp(tier.depth0, tier.depth1, t),
    x: lerp(tier.x0, tier.x1, t),
    z: lerp(tier.z0, tier.z1, t),
    rotationY: lerp(tier.r0, tier.r1, t),
    mechanical: MECHANICAL_FLOORS.has(floor),
    skyLobby: SKY_LOBBY_FLOORS.has(floor)
  }
}

export function deterministic01(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
