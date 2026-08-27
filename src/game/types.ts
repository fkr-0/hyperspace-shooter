import type { DeterministicRngState } from '@arcade/runtime'

export type PlayerInput = Readonly<{
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  focus: boolean
  fire: boolean
}>

export type PlayerState = {
  id: string
  x: number
  y: number
  previousX: number
  previousY: number
  vx: number
  vy: number
  focus: boolean
  firing: boolean
  damageRadius: number
  grazeRadius: number
  shotCooldownTicks: number
}

export type ProjectileKind = 'player' | 'enemy'

export type Projectile = {
  id: string
  kind: ProjectileKind
  active: boolean
  x: number
  y: number
  previousX: number
  previousY: number
  vx: number
  vy: number
  ax: number
  ay: number
  radius: number
  damage: number
  ageTicks: number
  lifetimeTicks: number
  grazedByPlayerId: string | null
}

export type ProjectileSpawn = Readonly<{
  kind: ProjectileKind
  x: number
  y: number
  vx: number
  vy: number
  ax?: number
  ay?: number
  radius?: number
  damage?: number
  lifetimeTicks?: number
}>

export type TargetState = {
  id: string
  x: number
  y: number
  width: number
  height: number
  hp: number
  maxHp: number
  active: boolean
  respawnTicks: number
}

export type PatternKind = 'aimed' | 'spread' | 'ring' | 'spiral' | 'random-spread'

export type PatternDefinition = Readonly<{
  kind: PatternKind
  cadenceTicks: number
  warmupTicks?: number
  count: number
  speed: number
  spreadRadians?: number
  angleOffset?: number
  phaseStep?: number
  jitterAngle?: number
  jitterSpeed?: number
  radius?: number
  lifetimeTicks?: number
}>

export type PatternEmitterState = {
  id: string
  definition: PatternDefinition
  ticksUntilShot: number
  emissionIndex: number
  rng: DeterministicRngState
}

export type CameraState = {
  trauma: number
  shakeX: number
  shakeY: number
  reducedMotion: boolean
  slowMotionTicks: number
  slowMotionScale: number
  rng: DeterministicRngState
}

export type GameStats = {
  score: number
  graze: number
  hitsTaken: number
  targetHits: number
  targetsDestroyed: number
}

export type GameState = {
  tick: number
  player: PlayerState
  target: TargetState
  camera: CameraState
  stats: GameStats
}
