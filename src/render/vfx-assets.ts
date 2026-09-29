import type { ArcadeSpriteManifestSource } from '@arcade/runtime/sprites'
import vfxUrl from '../assets/production-vfx.png?url'
import manifestRaw from '../assets/production-vfx.manifest.json?raw'
import type { PickupKind, ProjectileKind } from '../game/types'

const parsedManifest = JSON.parse(manifestRaw) as ArcadeSpriteManifestSource
const sheet = parsedManifest.sheets?.[0]
if (!sheet) throw new Error('Hyperblast production VFX manifest has no sheet')

export const PRODUCTION_VFX_SHEET_ID = 'hyperblast-production-vfx'
export const PRODUCTION_VFX_SOURCE_SHA256 =
  'b9026070d4b506d68e5f2e56cb025a2a8457539eaddf69e8a3ac2bdc78a173b0'
export const PRODUCTION_VFX_REFERENCE_ATLAS_SHA256 =
  '68cea95a39d4ef6e328725fcfeb2c781a05b3e3adde5063fdb299c99b5f75741'

export const PRODUCTION_VFX_MANIFEST: ArcadeSpriteManifestSource = Object.freeze({
  ...parsedManifest,
  sheets: Object.freeze([
    Object.freeze({
      ...sheet,
      file: vfxUrl,
    }),
  ]),
})

/** The reviewed production hull atlas is authored nose-right. */
export const PLAYER_SHIP_ROTATION = -Math.PI / 2
export const ENEMY_SHIP_ROTATION = Math.PI / 2

export function projectileVfxAnimation(kind: ProjectileKind): 'player-bolt' | 'enemy-burst' {
  return kind === 'player' ? 'player-bolt' : 'enemy-burst'
}

export function pickupVfxAnimation(_kind: PickupKind): 'pickup-ring' {
  return 'pickup-ring'
}
