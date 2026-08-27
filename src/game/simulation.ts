import { FIXED_STEP_SECONDS, PLAYFIELD } from './constants'
import { addCameraTrauma, createCameraState, stepCamera } from './camera'
import { resolveHostileProjectileContacts, resolvePlayerProjectileTargets } from './collision'
import { createPatternEmitter, stepPatternEmitter } from './patterns'
import { createPlayerState, stepPlayer } from './player'
import { createProjectileSystem } from './projectiles'
import type { ProjectileSystem } from './projectiles'
import type { GameState, PatternEmitterState, PlayerInput } from './types'
import { createBaselineWeaponEmitter, stepBaselineWeapon } from './weapon'
import type { WeaponEmitterState } from './weapon'

const IDLE_INPUT: PlayerInput = Object.freeze({
  left: false,
  right: false,
  up: false,
  down: false,
  focus: false,
  fire: false,
})

export type HyperblastSimulation = ReturnType<typeof createHyperblastSimulation>

export function createHyperblastSimulation(options?: {
  seed?: number | string
  reducedMotion?: boolean
  projectileCapacity?: number
}) {
  const seed = options?.seed ?? 'hyperblast-phase-2'
  const projectiles = createProjectileSystem(options?.projectileCapacity)
  const weapon = createBaselineWeaponEmitter()
  const emitters: PatternEmitterState[] = [
    createPatternEmitter(
      'training-fan',
      {
        kind: 'spread',
        cadenceTicks: 42,
        warmupTicks: 30,
        count: 5,
        speed: 155,
        spreadRadians: 0.78,
        radius: 4,
      },
      seed,
    ),
    createPatternEmitter(
      'training-spiral',
      {
        kind: 'spiral',
        cadenceTicks: 16,
        warmupTicks: 90,
        count: 2,
        speed: 110,
        phaseStep: 0.17,
        radius: 3,
      },
      seed,
    ),
  ]
  const state: GameState = {
    tick: 0,
    player: createPlayerState(),
    target: {
      id: 'training-drone',
      x: PLAYFIELD.width / 2,
      y: 112,
      width: 54,
      height: 30,
      hp: 80,
      maxHp: 80,
      active: true,
      respawnTicks: 0,
    },
    camera: createCameraState(seed, options?.reducedMotion ?? false),
    stats: {
      score: 0,
      graze: 0,
      hitsTaken: 0,
      targetHits: 0,
      targetsDestroyed: 0,
    },
  }

  function step(input: PlayerInput = IDLE_INPUT, delta = FIXED_STEP_SECONDS): void {
    state.tick += 1
    stepPlayer(state.player, input, delta)
    stepBaselineWeapon(state.player, weapon, projectiles)

    if (!state.target.active) {
      state.target.respawnTicks -= 1
      if (state.target.respawnTicks <= 0) {
        state.target.active = true
        state.target.hp = state.target.maxHp
      }
    }

    for (const emitter of emitters) {
      stepPatternEmitter(
        emitter,
        projectiles,
        { x: state.target.x, y: state.target.y + state.target.height / 2 },
        state.player,
      )
    }

    projectiles.step(delta)
    const hostile = resolveHostileProjectileContacts(state.player, projectiles)
    state.stats.hitsTaken += hostile.hits
    state.stats.graze += hostile.grazes
    state.stats.score += hostile.grazes * 100
    if (hostile.hits > 0) addCameraTrauma(state.camera, Math.min(0.8, hostile.hits * 0.35))

    const targetHits = resolvePlayerProjectileTargets(projectiles, [state.target])
    for (const hit of targetHits) {
      if (!state.target.active || hit.targetId !== state.target.id) continue
      state.target.hp -= hit.damage
      state.stats.targetHits += 1
      state.stats.score += 10
      if (state.target.hp <= 0) {
        state.target.hp = 0
        state.target.active = false
        state.target.respawnTicks = 90
        state.stats.targetsDestroyed += 1
        state.stats.score += 500
        addCameraTrauma(state.camera, 0.65)
      }
    }
    stepCamera(state.camera)
  }

  return {
    state,
    projectiles,
    weapon,
    emitters,
    step,
    snapshot: () => snapshotSimulation(state, projectiles, weapon, emitters),
  }
}

function rounded(value: number): number {
  return Number(value.toFixed(9))
}

export function snapshotSimulation(
  state: GameState,
  projectiles: ProjectileSystem,
  weapon: WeaponEmitterState,
  emitters: readonly PatternEmitterState[],
) {
  return {
    tick: state.tick,
    player: {
      x: rounded(state.player.x),
      y: rounded(state.player.y),
      vx: rounded(state.player.vx),
      vy: rounded(state.player.vy),
      focus: state.player.focus,
      shotCooldownTicks: state.player.shotCooldownTicks,
    },
    target: {
      hp: state.target.hp,
      active: state.target.active,
      respawnTicks: state.target.respawnTicks,
    },
    stats: { ...state.stats },
    camera: {
      trauma: rounded(state.camera.trauma),
      shakeX: rounded(state.camera.shakeX),
      shakeY: rounded(state.camera.shakeY),
      slowMotionTicks: state.camera.slowMotionTicks,
      slowMotionScale: state.camera.slowMotionScale,
      rng: { ...state.camera.rng },
    },
    weapon: { ...weapon },
    emitters: emitters.map((emitter) => ({
      id: emitter.id,
      ticksUntilShot: emitter.ticksUntilShot,
      emissionIndex: emitter.emissionIndex,
      rng: { ...emitter.rng },
    })),
    projectiles: projectiles
      .values()
      .map((projectile) => ({
        id: projectile.id,
        kind: projectile.kind,
        x: rounded(projectile.x),
        y: rounded(projectile.y),
        vx: rounded(projectile.vx),
        vy: rounded(projectile.vy),
        ageTicks: projectile.ageTicks,
        grazedByPlayerId: projectile.grazedByPlayerId,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  }
}
