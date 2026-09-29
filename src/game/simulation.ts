import { deterministicHash } from '@arcade/runtime'
import { FIXED_STEP_SECONDS, ENEMY_SOFT_CAP, PICKUP_SOFT_CAP, PLAYER, PLAYFIELD } from './constants'
import {
  addCameraTrauma,
  createCameraState,
  setReducedMotion as setCameraReducedMotion,
  stepCamera,
  triggerBossKillSlowMotion,
} from './camera'
import { resolveHostileProjectileContacts, resolvePlayerProjectileTargets } from './collision'
import { createPatternEmitter, stepPatternEmitter } from './patterns'
import { createPlayerState, respawnPlayer, stepPlayer } from './player'
import { createProjectileSystem } from './projectiles'
import type { ProjectileSystem } from './projectiles'
import {
  addSurvivalRank,
  breakChain,
  buildStageResult,
  createScoringState,
  registerGraze,
  registerKill,
  stepScoring,
} from './scoring'
import { createStageScheduler, stepStageScheduler } from './stage'
import type { BossEncounterDefinition, StageDefinition, StageEnemySpawn, StageEvent } from './stage'
import { STAGE_1 } from './stage1'
import type { EnemyState, GameState, PickupKind, PlayerInput } from './types'
import {
  createBaselineWeaponEmitter,
  gainWeaponPower,
  loseWeaponPower,
  stepBaselineWeapon,
} from './weapon'
import type { WeaponEmitterState } from './weapon'

const IDLE_INPUT: PlayerInput = Object.freeze({
  left: false,
  right: false,
  up: false,
  down: false,
  focus: false,
  fire: false,
  bomb: false,
})

const BOSS_TRANSITION_TICKS = 48
const MAX_BOMBS = 5

export type HyperblastSimulation = ReturnType<typeof createHyperblastSimulation>

function enemySize(kind: EnemyState['kind']): Readonly<{ width: number; height: number }> {
  switch (kind) {
    case 'shield':
      return { width: 28, height: 24 }
    case 'turret':
      return { width: 30, height: 26 }
    case 'chaser':
      return { width: 24, height: 24 }
    case 'relay-scorpion':
      return { width: 88, height: 44 }
    case 'vector-warden':
      return { width: 112, height: 52 }
    case 'dockmaster-array':
      return { width: 96, height: 52 }
    case 'helix-foundry':
      return { width: 124, height: 62 }
    case 'skyline-pursuer':
      return { width: 82, height: 44 }
    case 'municipal-ghost':
      return { width: 118, height: 56 }
    case 'brood-lens':
      return { width: 94, height: 48 }
    case 'queen-recursor':
      return { width: 126, height: 64 }
    case 'echo-composite':
      return { width: 108, height: 54 }
    case 'hyperblast-engine':
      return { width: 132, height: 68 }
    default:
      return { width: 22, height: 18 }
  }
}

function rounded(value: number): number {
  return Number(value.toFixed(9))
}

export function createHyperblastSimulation(options?: {
  seed?: number | string
  reducedMotion?: boolean
  projectileCapacity?: number
  stageDefinition?: StageDefinition
}) {
  const stageDefinition = options?.stageDefinition ?? STAGE_1
  const seed = options?.seed ?? `hyperblast:${stageDefinition.id}`
  const projectiles = createProjectileSystem(options?.projectileCapacity)
  const weapon = createBaselineWeaponEmitter()
  const scheduler = createStageScheduler(stageDefinition)
  let pickupSequence = 0
  let bombWasHeld = false

  const state: GameState = {
    tick: 0,
    stageTick: 0,
    stageId: stageDefinition.id,
    mode: 'title',
    paused: false,
    player: createPlayerState(),
    enemies: [],
    pickups: [],
    activeEncounterId: null,
    camera: createCameraState(seed, options?.reducedMotion ?? false),
    scoring: createScoringState(),
    stats: {
      score: 0,
      stageScore: 0,
      graze: 0,
      hitsTaken: 0,
      targetHits: 0,
      targetsDestroyed: 0,
      enemiesSpawned: 0,
      enemiesDestroyed: 0,
      livesLost: 0,
      bombsUsed: 0,
      pickupsCollected: 0,
      bossPhaseClearTicks: [],
    },
    result: null,
  }

  const metrics = {
    steps: 0,
    maxProjectiles: 0,
    maxEnemies: 0,
    maxPickups: 0,
  }

  function addScore(points: number): void {
    const amount = Math.max(0, Math.floor(points))
    state.stats.score += amount
    state.stats.stageScore += amount
  }

  function createEnemy(
    waveId: string,
    spec: StageEnemySpawn,
    patternSeed: number | string,
  ): EnemyState {
    const size = enemySize(spec.kind)
    return {
      id: `${waveId}:${spec.id}`,
      kind: spec.kind,
      waveId,
      x: spec.x,
      y: spec.y,
      width: size.width,
      height: size.height,
      hp: spec.hp,
      maxHp: spec.hp,
      active: true,
      respawnTicks: 0,
      ageTicks: 0,
      baseX: spec.x,
      vx: spec.vx ?? 0,
      vy: spec.vy,
      path: spec.path,
      scoreValue: spec.scoreValue,
      drop: spec.drop ?? null,
      shieldHp: spec.shieldHp ?? 0,
      maxShieldHp: spec.shieldHp ?? 0,
      emitter: spec.pattern
        ? createPatternEmitter(`${stageDefinition.id}:${waveId}:${spec.id}:emitter`, spec.pattern, patternSeed)
        : null,
      boss: null,
    }
  }

  function createBoss(encounter: BossEncounterDefinition, finalEncounter: boolean): EnemyState {
    const first = encounter.phases[0]
    if (!first) throw new Error(`Boss ${encounter.id} has no authored phases`)
    const size = enemySize(encounter.kind)
    return {
      id: encounter.id,
      kind: encounter.kind,
      waveId: encounter.id,
      x: PLAYFIELD.width / 2,
      y: encounter.y ?? 110,
      width: size.width,
      height: size.height,
      hp: first.hp,
      maxHp: first.hp,
      active: true,
      respawnTicks: 0,
      ageTicks: 0,
      baseX: PLAYFIELD.width / 2,
      vx: 0,
      vy: 0,
      path: 'boss',
      scoreValue: encounter.scoreValue,
      drop: encounter.drop ?? null,
      shieldHp: 0,
      maxShieldHp: 0,
      emitter: createPatternEmitter(
        `${stageDefinition.id}:${first.id}:emitter`,
        first.pattern,
        `${String(seed)}:${encounter.id}`,
      ),
      boss: {
        id: encounter.id,
        phaseIndex: 0,
        phaseTick: 0,
        transitionTicks: 0,
        pendingDefeat: false,
        finalEncounter,
        amplitude: encounter.amplitude ?? 72,
        phases: encounter.phases,
      },
    }
  }

  function pushEnemy(enemy: EnemyState): void {
    if (state.enemies.length >= ENEMY_SOFT_CAP) {
      throw new Error(`Hyperblast enemy soft cap exceeded (${ENEMY_SOFT_CAP})`)
    }
    state.enemies.push(enemy)
    state.stats.enemiesSpawned += 1
  }

  function spawnWave(event: Extract<StageEvent, { kind: 'wave' }>): void {
    for (const spec of event.wave.enemies) {
      pushEnemy(createEnemy(event.wave.id, spec, `${String(seed)}:${stageDefinition.id}:${event.wave.id}`))
    }
  }

  function spawnEncounter(event: Extract<StageEvent, { kind: 'midboss' | 'boss' }>): void {
    state.activeEncounterId = event.id
    projectiles.clearKind('enemy')
    // Encounter gates are authored clean beats: surviving minor enemies escape
    // instead of stacking their emitters on top of the mid/final boss grammar.
    state.enemies = state.enemies.filter((enemy) => enemy.boss !== null)
    if (event.kind === 'midboss') {
      state.mode = 'midboss'
      pushEnemy(createBoss(event.encounter, false))
    } else {
      state.mode = 'boss'
      pushEnemy(createBoss(event.encounter, true))
    }
  }

  function handleStageEvent(event: StageEvent): void {
    if (event.kind === 'wave') spawnWave(event)
    else spawnEncounter(event)
  }

  function spawnPickup(kind: PickupKind, x: number, y: number): void {
    if (state.pickups.length >= PICKUP_SOFT_CAP) return
    pickupSequence += 1
    state.pickups.push({
      id: `pickup:${kind}:${pickupSequence}`,
      kind,
      x,
      y,
      vy: 82,
      active: true,
    })
  }

  function finishEncounter(enemy: EnemyState): void {
    enemy.active = false
    state.stats.targetsDestroyed += 1
    state.stats.enemiesDestroyed += 1
    addScore(registerKill(state.scoring, enemy.scoreValue))
    if (enemy.drop) spawnPickup(enemy.drop, enemy.x, enemy.y)
    state.activeEncounterId = null
    projectiles.clearKind('enemy')
    if (enemy.boss?.finalEncounter) {
      triggerBossKillSlowMotion(state.camera, 72, 0.4)
      state.result = buildStageResult({
        stageId: stageDefinition.id,
        score: state.stats.stageScore,
        enemiesSpawned: state.stats.enemiesSpawned,
        enemiesDestroyed: state.stats.enemiesDestroyed,
        maxCombo: state.scoring.maxCombo,
        graze: state.stats.graze,
        livesLost: state.stats.livesLost,
        bombsUsed: state.stats.bombsUsed,
        bossPhaseClearTicks: state.stats.bossPhaseClearTicks,
      })
      state.mode = 'result'
    } else {
      state.mode = 'combat'
    }
  }

  function beginBossTransition(enemy: EnemyState): void {
    const boss = enemy.boss
    if (!boss || boss.transitionTicks > 0) return
    const currentPhase = boss.phases[boss.phaseIndex]
    if (!currentPhase) throw new Error(`Boss ${enemy.id} entered an invalid phase ${boss.phaseIndex}`)
    if (boss.finalEncounter) state.stats.bossPhaseClearTicks.push(boss.phaseTick)
    boss.transitionTicks = BOSS_TRANSITION_TICKS
    boss.pendingDefeat = boss.phaseIndex >= boss.phases.length - 1
    enemy.hp = 0
    enemy.emitter = null
    projectiles.clearKind('enemy')
    addCameraTrauma(state.camera, boss.finalEncounter ? 0.62 : 0.42)
  }

  function stepBoss(enemy: EnemyState): void {
    const boss = enemy.boss
    if (!boss) return
    if (boss.transitionTicks > 0) {
      boss.transitionTicks -= 1
      if (boss.transitionTicks > 0) return
      if (boss.pendingDefeat) {
        finishEncounter(enemy)
        return
      }
      boss.phaseIndex += 1
      boss.phaseTick = 0
      const phase = boss.phases[boss.phaseIndex]
      if (!phase) throw new Error(`Boss ${enemy.id} transition advanced beyond authored phases`)
      enemy.hp = phase.hp
      enemy.maxHp = phase.hp
      enemy.emitter = createPatternEmitter(
        `${stageDefinition.id}:${phase.id}:emitter`,
        phase.pattern,
        `${String(seed)}:${enemy.id}`,
      )
      return
    }

    boss.phaseTick += 1
    const phase = boss.phases[boss.phaseIndex]
    if (!phase) throw new Error(`Boss ${enemy.id} has no phase ${boss.phaseIndex}`)
    if (boss.phaseTick >= phase.timeoutTicks) beginBossTransition(enemy)
  }

  function damageEnemy(enemy: EnemyState, damage: number): void {
    if (!enemy.active || damage <= 0) return
    if (enemy.boss?.transitionTicks) return
    let remainingDamage = damage
    if (enemy.shieldHp > 0) {
      const absorbed = Math.min(enemy.shieldHp, remainingDamage)
      enemy.shieldHp -= absorbed
      remainingDamage -= absorbed
      if (remainingDamage <= 0) return
    }
    enemy.hp -= remainingDamage
    if (enemy.hp > 0) return

    if (enemy.boss) {
      beginBossTransition(enemy)
      return
    }

    enemy.hp = 0
    enemy.active = false
    state.stats.targetsDestroyed += 1
    state.stats.enemiesDestroyed += 1
    addScore(registerKill(state.scoring, enemy.scoreValue))
    if (enemy.drop) spawnPickup(enemy.drop, enemy.x, enemy.y)
    addCameraTrauma(state.camera, 0.16)
  }

  function useBomb(): boolean {
    if (state.player.bombs <= 0 || state.player.lives <= 0) return false
    state.player.bombs -= 1
    state.stats.bombsUsed += 1
    state.player.invulnerableTicks = Math.max(state.player.invulnerableTicks, PLAYER.bombInvulnerabilityTicks)
    breakChain(state.scoring, 50)
    projectiles.clearKind('enemy')
    for (const enemy of [...state.enemies].filter((candidate) => candidate.active).sort((a, b) => a.id.localeCompare(b.id))) {
      damageEnemy(enemy, enemy.boss ? 42 : 30)
    }
    addCameraTrauma(state.camera, 0.5)
    return true
  }

  function moveEnemy(enemy: EnemyState, delta: number): void {
    enemy.ageTicks += 1
    if (enemy.path === 'boss') {
      enemy.x = enemy.baseX + Math.sin(enemy.ageTicks * 0.018) * (enemy.boss?.amplitude ?? 72)
      return
    }
    if (enemy.path === 'drift') {
      enemy.x = enemy.baseX + Math.sin(enemy.ageTicks * 0.042 + enemy.baseX * 0.01) * 28
    } else if (enemy.path === 'chase') {
      const desired = Math.max(-105, Math.min(105, (state.player.x - enemy.x) * 0.8))
      enemy.vx += Math.max(-4, Math.min(4, desired - enemy.vx))
      enemy.x += enemy.vx * delta
      enemy.x = Math.max(28, Math.min(PLAYFIELD.width - 28, enemy.x))
    }
    enemy.y += enemy.vy * delta
    if (enemy.y > PLAYFIELD.height + 70) enemy.active = false
  }

  function stepEnemies(delta: number): void {
    const ordered = [...state.enemies].filter((enemy) => enemy.active).sort((a, b) => a.id.localeCompare(b.id))
    for (const enemy of ordered) {
      moveEnemy(enemy, delta)
      if (!enemy.active) continue
      if (enemy.boss) stepBoss(enemy)
      if (!enemy.active || enemy.boss?.transitionTicks) continue
      if (enemy.emitter && enemy.y >= 16) {
        stepPatternEmitter(
          enemy.emitter,
          projectiles,
          { x: enemy.x, y: enemy.y + enemy.height / 2 },
          state.player,
        )
      }
    }
  }

  function collectPickups(delta: number): void {
    for (const pickup of state.pickups) {
      if (!pickup.active) continue
      pickup.y += pickup.vy * delta
      const dx = pickup.x - state.player.x
      const dy = pickup.y - state.player.y
      if (dx * dx + dy * dy <= (state.player.grazeRadius + 10) ** 2) {
        pickup.active = false
        state.stats.pickupsCollected += 1
        if (pickup.kind === 'power') gainWeaponPower(weapon)
        else if (pickup.kind === 'bomb') state.player.bombs = Math.min(MAX_BOMBS, state.player.bombs + 1)
        else addScore(1_000)
      } else if (pickup.y > PLAYFIELD.height + 32) {
        pickup.active = false
      }
    }
  }

  function loseLife(): void {
    state.stats.hitsTaken += 1
    state.stats.livesLost += 1
    state.player.lives = Math.max(0, state.player.lives - 1)
    loseWeaponPower(weapon)
    breakChain(state.scoring, 160)
    projectiles.clearKind('enemy')
    addCameraTrauma(state.camera, 0.72)
    if (state.player.lives <= 0) {
      state.mode = 'gameover'
      return
    }
    respawnPlayer(state.player)
  }

  function updateMetrics(): void {
    metrics.steps += 1
    metrics.maxProjectiles = Math.max(metrics.maxProjectiles, projectiles.values().length)
    metrics.maxEnemies = Math.max(metrics.maxEnemies, state.enemies.filter((enemy) => enemy.active).length)
    metrics.maxPickups = Math.max(metrics.maxPickups, state.pickups.filter((pickup) => pickup.active).length)
  }

  function startRun(): boolean {
    if (state.mode !== 'title') return false
    state.mode = 'combat'
    state.player.invulnerableTicks = 45
    return true
  }

  function setPaused(paused: boolean): boolean {
    if (state.mode === 'title' || state.mode === 'result' || state.mode === 'gameover') return false
    state.paused = paused
    return true
  }

  function togglePause(): boolean {
    return setPaused(!state.paused)
  }

  function setReducedMotion(reduced: boolean): void {
    setCameraReducedMotion(state.camera, reduced)
  }

  function step(input: PlayerInput = IDLE_INPUT, delta = FIXED_STEP_SECONDS): void {
    bombWasHeld = Boolean(input.bomb) && bombWasHeld
    if (state.mode === 'title' || state.mode === 'result' || state.mode === 'gameover' || state.paused) return

    state.tick += 1
    stepScoring(state.scoring)
    if (state.tick % 60 === 0) addSurvivalRank(state.scoring)
    stepPlayer(state.player, input, delta)

    const bombHeld = Boolean(input.bomb)
    if (bombHeld && !bombWasHeld) useBomb()
    bombWasHeld = bombHeld

    stepBaselineWeapon(state.player, weapon, projectiles)

    if (!state.activeEncounterId) {
      for (const event of stepStageScheduler(scheduler)) handleStageEvent(event)
      state.stageTick = scheduler.tick
    }

    stepEnemies(delta)
    projectiles.step(delta)

    const hostile = resolveHostileProjectileContacts(state.player, projectiles, {
      canTakeHit: state.player.invulnerableTicks <= 0,
      canGraze: state.player.invulnerableTicks <= 0,
    })
    if (hostile.grazes > 0) {
      state.stats.graze += hostile.grazes
      addScore(registerGraze(state.scoring, hostile.grazes))
    }
    if (hostile.hits > 0) loseLife()

    if (state.player.lives > 0) {
      const damageable = state.enemies.filter(
        (enemy) => enemy.active && (!enemy.boss || enemy.boss.transitionTicks === 0),
      )
      const targetHits = resolvePlayerProjectileTargets(projectiles, damageable)
      for (const hit of targetHits) {
        const enemy = state.enemies.find((candidate) => candidate.id === hit.targetId)
        if (!enemy?.active) continue
        state.stats.targetHits += 1
        damageEnemy(enemy, hit.damage)
      }
      collectPickups(delta)
    }

    state.enemies = state.enemies.filter((enemy) => enemy.active)
    state.pickups = state.pickups.filter((pickup) => pickup.active)
    stepCamera(state.camera)
    updateMetrics()
  }

  return {
    state,
    stageDefinition,
    projectiles,
    weapon,
    scheduler,
    metrics,
    startRun,
    setPaused,
    togglePause,
    setReducedMotion,
    step,
    snapshot: () => snapshotSimulation(state, projectiles, weapon, scheduler.firedEventIds),
    hash: () => deterministicHash(snapshotSimulation(state, projectiles, weapon, scheduler.firedEventIds)),
  }
}

export function snapshotSimulation(
  state: GameState,
  projectiles: ProjectileSystem,
  weapon: WeaponEmitterState,
  firedEventIds: readonly string[] = [],
) {
  return {
    tick: state.tick,
    stageTick: state.stageTick,
    stageId: state.stageId,
    mode: state.mode,
    paused: state.paused,
    activeEncounterId: state.activeEncounterId,
    player: {
      x: rounded(state.player.x),
      y: rounded(state.player.y),
      vx: rounded(state.player.vx),
      vy: rounded(state.player.vy),
      focus: state.player.focus,
      shotCooldownTicks: state.player.shotCooldownTicks,
      lives: state.player.lives,
      bombs: state.player.bombs,
      invulnerableTicks: state.player.invulnerableTicks,
    },
    scoring: { ...state.scoring },
    stats: {
      ...state.stats,
      bossPhaseClearTicks: [...state.stats.bossPhaseClearTicks],
    },
    result: state.result ? { ...state.result, bossPhaseClearTicks: [...state.result.bossPhaseClearTicks] } : null,
    camera: {
      trauma: rounded(state.camera.trauma),
      shakeX: rounded(state.camera.shakeX),
      shakeY: rounded(state.camera.shakeY),
      slowMotionTicks: state.camera.slowMotionTicks,
      slowMotionScale: state.camera.slowMotionScale,
      reducedMotion: state.camera.reducedMotion,
      rng: { ...state.camera.rng },
    },
    weapon: { ...weapon },
    firedEventIds: [...firedEventIds],
    enemies: state.enemies
      .map((enemy) => ({
        id: enemy.id,
        kind: enemy.kind,
        waveId: enemy.waveId,
        x: rounded(enemy.x),
        y: rounded(enemy.y),
        hp: enemy.hp,
        maxHp: enemy.maxHp,
        shieldHp: enemy.shieldHp,
        maxShieldHp: enemy.maxShieldHp,
        ageTicks: enemy.ageTicks,
        boss: enemy.boss
          ? {
              phaseIndex: enemy.boss.phaseIndex,
              phaseTick: enemy.boss.phaseTick,
              transitionTicks: enemy.boss.transitionTicks,
              pendingDefeat: enemy.boss.pendingDefeat,
              finalEncounter: enemy.boss.finalEncounter,
            }
          : null,
        emitter: enemy.emitter
          ? {
              id: enemy.emitter.id,
              ticksUntilShot: enemy.emitter.ticksUntilShot,
              emissionIndex: enemy.emitter.emissionIndex,
              rng: { ...enemy.emitter.rng },
            }
          : null,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    pickups: state.pickups
      .map((pickup) => ({ ...pickup, x: rounded(pickup.x), y: rounded(pickup.y) }))
      .sort((left, right) => left.id.localeCompare(right.id)),
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
