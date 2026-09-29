import type { DeterministicRngState } from '@arcade/runtime'

export type PlayerInput = Readonly<{
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  focus: boolean
  fire: boolean
  bomb?: boolean
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
  lives: number
  bombs: number
  invulnerableTicks: number
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
  acceleration?: number
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

export type EnemyKind =
  | 'drifter'
  | 'turret'
  | 'chaser'
  | 'shield'
  | 'relay-scorpion'
  | 'vector-warden'
  | 'dockmaster-array'
  | 'helix-foundry'
  | 'skyline-pursuer'
  | 'municipal-ghost'
  | 'brood-lens'
  | 'queen-recursor'
  | 'echo-composite'
  | 'hyperblast-engine'
export type EnemyPathKind = 'drift' | 'straight' | 'chase' | 'boss'
export type PickupKind = 'power' | 'bomb' | 'score'

export type BossPhaseDefinition = Readonly<{
  id: string
  hp: number
  timeoutTicks: number
  pattern: PatternDefinition
}>

export type BossRuntimeState = {
  id: string
  phaseIndex: number
  phaseTick: number
  transitionTicks: number
  pendingDefeat: boolean
  finalEncounter: boolean
  amplitude: number
  phases: readonly BossPhaseDefinition[]
}

export type EnemyState = TargetState & {
  kind: EnemyKind
  waveId: string
  ageTicks: number
  baseX: number
  vx: number
  vy: number
  path: EnemyPathKind
  scoreValue: number
  drop: PickupKind | null
  shieldHp: number
  maxShieldHp: number
  emitter: PatternEmitterState | null
  boss: BossRuntimeState | null
}

export type PickupState = {
  id: string
  kind: PickupKind
  x: number
  y: number
  vy: number
  active: boolean
}

export type StageMode = 'title' | 'combat' | 'midboss' | 'boss' | 'result' | 'gameover'

export type ScoringState = {
  comboCount: number
  comboMultiplier: number
  chainTicks: number
  maxCombo: number
  grazeMeter: number
  grazeStreak: number
  rank: number
}

export type StageResult = Readonly<{
  stageId: string
  score: number
  destructionRatio: number
  maxCombo: number
  graze: number
  livesLost: number
  bombsUsed: number
  bossPhaseClearTicks: readonly number[]
  grade: 'D' | 'C' | 'B' | 'A' | 'S'
}>

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
  stageScore: number
  graze: number
  hitsTaken: number
  targetHits: number
  targetsDestroyed: number
  enemiesSpawned: number
  enemiesDestroyed: number
  livesLost: number
  bombsUsed: number
  pickupsCollected: number
  bossPhaseClearTicks: number[]
}

export type GameState = {
  tick: number
  stageTick: number
  stageId: string
  mode: StageMode
  paused: boolean
  player: PlayerState
  enemies: EnemyState[]
  pickups: PickupState[]
  activeEncounterId: string | null
  camera: CameraState
  scoring: ScoringState
  stats: GameStats
  result: StageResult | null
}
