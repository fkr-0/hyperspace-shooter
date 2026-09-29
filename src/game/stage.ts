import { createTimelineQueue, stepTimelineQueue, type TimelineQueueState } from '@arcade/runtime/core'
import type {
  BossPhaseDefinition,
  EnemyKind,
  EnemyPathKind,
  PatternDefinition,
  PickupKind,
} from './types'

export type StageTheme =
  | 'neon-drift'
  | 'orbital-furnace'
  | 'chrome-meridian'
  | 'verdant-hive'
  | 'hyperglass-corridor'
export type BossEnemyKind = Exclude<EnemyKind, 'drifter' | 'turret' | 'chaser' | 'shield'>

export type BossEncounterDefinition = Readonly<{
  id: string
  kind: BossEnemyKind
  phases: readonly BossPhaseDefinition[]
  scoreValue: number
  drop?: PickupKind
  y?: number
  amplitude?: number
}>

export type StageEnemySpawn = Readonly<{
  id: string
  kind: Exclude<EnemyKind, BossEnemyKind>
  x: number
  y: number
  hp: number
  vx?: number
  vy: number
  path: EnemyPathKind
  scoreValue: number
  drop?: PickupKind
  shieldHp?: number
  pattern?: PatternDefinition
}>

export type StageWaveDefinition = Readonly<{
  id: string
  enemies: readonly StageEnemySpawn[]
}>

export type StageEvent =
  | Readonly<{ id: string; atTick: number; kind: 'wave'; wave: StageWaveDefinition }>
  | Readonly<{ id: string; atTick: number; kind: 'midboss'; encounter: BossEncounterDefinition }>
  | Readonly<{ id: string; atTick: number; kind: 'boss'; encounter: BossEncounterDefinition }>

export type StageDefinition = Readonly<{
  id: string
  title: string
  theme: StageTheme
  events: readonly StageEvent[]
}>

export type StageSchedulerState = {
  tick: number
  queue: TimelineQueueState<StageEvent>
  firedEventIds: string[]
}

export function validateStageDefinition(definition: StageDefinition): readonly string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  let previousTick = -1
  for (const event of definition.events) {
    if (!event.id.trim()) errors.push('stage event id must be non-empty')
    if (ids.has(event.id)) errors.push(`duplicate stage event id: ${event.id}`)
    ids.add(event.id)
    if (!Number.isInteger(event.atTick) || event.atTick < 0) errors.push(`invalid atTick for ${event.id}`)
    if (event.atTick < previousTick) errors.push(`stage events are not tick-ordered at ${event.id}`)
    previousTick = event.atTick
    if (event.kind === 'wave') {
      const enemyIds = new Set<string>()
      for (const enemy of event.wave.enemies) {
        if (enemyIds.has(enemy.id)) errors.push(`duplicate enemy id ${enemy.id} in wave ${event.wave.id}`)
        enemyIds.add(enemy.id)
      }
    } else if (event.encounter.phases.length === 0) {
      errors.push(`encounter ${event.encounter.id} has no phases`)
    }
  }
  return errors
}

export function createStageScheduler(definition: StageDefinition): StageSchedulerState {
  const errors = validateStageDefinition(definition)
  if (errors.length > 0) throw new Error(`Invalid stage ${definition.id}: ${errors.join('; ')}`)
  return {
    tick: 0,
    queue: createTimelineQueue(definition.events, { getAt: (event) => event.atTick }),
    firedEventIds: [],
  }
}

export function stepStageScheduler(state: StageSchedulerState): readonly StageEvent[] {
  const stepped = stepTimelineQueue(state.queue, 1)
  state.queue = stepped.state
  state.tick = Math.round(stepped.state.time)
  const due = [...stepped.due].sort((left, right) => left.id.localeCompare(right.id))
  for (const event of due) state.firedEventIds.push(event.id)
  return due
}
