import type { ArcadeSpriteManifestSource } from '@arcade/runtime/sprites'
import lateBossesUrl from '../assets/hyperblast-late-bosses.png?url'
import shipsUrl from '../assets/hyperblast-ships.png?url'
import lateBossManifestRaw from '../assets/late-bosses.manifest.json?raw'
import manifestRaw from '../assets/production-ships.manifest.json?raw'
import type { EnemyKind } from '../game/types'

const parsedManifest = JSON.parse(manifestRaw) as ArcadeSpriteManifestSource
const sheet = parsedManifest.sheets?.[0]
if (!sheet) throw new Error('Hyperblast production sprite manifest has no sheet')

const parsedLateBossManifest = JSON.parse(lateBossManifestRaw) as ArcadeSpriteManifestSource
const lateBossSheet = parsedLateBossManifest.sheets?.[0]
if (!lateBossSheet) throw new Error('Hyperblast late-boss sprite manifest has no sheet')

export const PRODUCTION_SHIP_SHEET_ID = 'hyperblast-production-ships'
export const LATE_BOSS_SHEET_ID = 'hyperblast-late-bosses'
export const PRODUCTION_SHIP_SOURCE_SHA256 =
  '68cea95a39d4ef6e328725fcfeb2c781a05b3e3adde5063fdb299c99b5f75741'
export const LATE_BOSS_SOURCE_SHA256 =
  '29fa0660401abe95bb3360e02da8d8f5ba7fea964c9ee4c9a6d4d7c778227313'

export const PRODUCTION_SPRITE_MANIFEST: ArcadeSpriteManifestSource = Object.freeze({
  ...parsedManifest,
  sheets: Object.freeze([
    Object.freeze({
      ...sheet,
      file: shipsUrl,
    }),
    Object.freeze({
      ...lateBossSheet,
      file: lateBossesUrl,
    }),
  ]),
})

type EnemySpriteClip = Readonly<{
  sheetId: string
  animation: string
}>

const ENEMY_SPRITE_CLIPS: Readonly<Record<EnemyKind, EnemySpriteClip>> = Object.freeze({
  drifter: Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'drifter' }),
  turret: Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'turret' }),
  chaser: Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'chaser' }),
  shield: Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'shield' }),
  'relay-scorpion': Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'relay-scorpion' }),
  'vector-warden': Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'vector-warden' }),
  'dockmaster-array': Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'dockmaster-array' }),
  'helix-foundry': Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'helix-foundry' }),
  'skyline-pursuer': Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'skyline-pursuer' }),
  'municipal-ghost': Object.freeze({ sheetId: PRODUCTION_SHIP_SHEET_ID, animation: 'municipal-ghost' }),
  'brood-lens': Object.freeze({ sheetId: LATE_BOSS_SHEET_ID, animation: 'brood-lens' }),
  'queen-recursor': Object.freeze({ sheetId: LATE_BOSS_SHEET_ID, animation: 'queen-recursor' }),
  'echo-composite': Object.freeze({ sheetId: LATE_BOSS_SHEET_ID, animation: 'echo-composite' }),
  'hyperblast-engine': Object.freeze({ sheetId: LATE_BOSS_SHEET_ID, animation: 'hyperblast-engine' }),
})

export function enemySpriteClip(kind: EnemyKind): EnemySpriteClip {
  return ENEMY_SPRITE_CLIPS[kind]
}

export function enemySpriteAnimation(kind: EnemyKind): string {
  return enemySpriteClip(kind).animation
}
