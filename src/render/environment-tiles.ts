import type { ArcadePixiRuntime } from '@arcade/runtime/pixi'
import * as PIXI from 'pixi.js'
import { PLAYFIELD } from '../game/constants'
import type { StageTheme } from '../game/stage'

export const ENVIRONMENT_TILE_BASENAME_BY_THEME: Readonly<Record<StageTheme, string>> = Object.freeze({
  'neon-drift': 'neon_drift_expanse.png',
  'orbital-furnace': 'orbital_furnace.png',
  'chrome-meridian': 'chrome_meridian.png',
  'verdant-hive': 'verdant_hive.png',
  'hyperglass-corridor': 'hyperglass_corridor.png',
})

type EnvironmentTileModules = Readonly<Record<string, string>>

const ENVIRONMENT_TILE_MODULES = import.meta.glob('../assets/environment/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as EnvironmentTileModules

export function environmentTileModuleKey(theme: StageTheme): string {
  return `../assets/environment/${ENVIRONMENT_TILE_BASENAME_BY_THEME[theme]}`
}

export function resolveEnvironmentTileUrl(
  theme: StageTheme | string,
  modules: EnvironmentTileModules = ENVIRONMENT_TILE_MODULES,
): string | null {
  if (!(theme in ENVIRONMENT_TILE_BASENAME_BY_THEME)) return null
  const key = environmentTileModuleKey(theme as StageTheme)
  return modules[key] ?? null
}

type EnvironmentLayer = Readonly<{
  sprite: PIXI.TilingSprite
  speedX: number
  speedY: number
}>

type EnvironmentBackgroundState = {
  layers: EnvironmentLayer[]
}

export type EnvironmentBackgroundInstall = Readonly<{
  assetMode: 'campaign-environment-tile' | 'star-fallback'
  theme: StageTheme
  assetUrl: string | null
  destroy(): void
}>

const BACKGROUND_SCROLL_PIXELS_PER_SECOND = 18

function createEnvironmentLayers(container: PIXI.Container, texture: PIXI.Texture): EnvironmentLayer[] {
  const base = new PIXI.TilingSprite({
    texture,
    width: PLAYFIELD.width,
    height: PLAYFIELD.height,
  })
  base.label = 'environment-tile-base'
  base.alpha = 0.72
  base.tileScale.set(1)

  const parallax = new PIXI.TilingSprite({
    texture,
    width: PLAYFIELD.width,
    height: PLAYFIELD.height,
  })
  parallax.label = 'environment-tile-parallax'
  parallax.alpha = 0.16
  parallax.tileScale.set(0.72)

  container.addChild(base, parallax)
  return [
    { sprite: base, speedX: -0.18, speedY: 1 },
    { sprite: parallax, speedX: 0.27, speedY: 0.46 },
  ]
}

function updateEnvironmentLayers(layers: readonly EnvironmentLayer[], simulationTick: number, alpha: number): void {
  const seconds = (simulationTick + alpha) / 60
  for (const layer of layers) {
    const offset = seconds * BACKGROUND_SCROLL_PIXELS_PER_SECOND
    layer.sprite.tilePosition.set(offset * layer.speedX, offset * layer.speedY)
  }
}

export async function installEnvironmentTileBackground(
  runtime: ArcadePixiRuntime,
  theme: StageTheme,
  getSimulationTick: () => number,
): Promise<EnvironmentBackgroundInstall> {
  const assetUrl = resolveEnvironmentTileUrl(theme)
  if (!assetUrl) {
    return {
      assetMode: 'star-fallback',
      theme,
      assetUrl: null,
      destroy() {},
    }
  }

  let texture: PIXI.Texture
  try {
    texture = await PIXI.Assets.load<PIXI.Texture>(assetUrl)
  } catch {
    return {
      assetMode: 'star-fallback',
      theme,
      assetUrl,
      destroy() {},
    }
  }

  const pass = runtime.addPass<EnvironmentBackgroundState>('hyperblast-environment-tiles', {
    layer: 'background',
    create: ({ container }) => ({ layers: createEnvironmentLayers(container, texture) }),
    update: (frame, activePass) => {
      updateEnvironmentLayers(activePass.state.layers, getSimulationTick(), frame.alpha)
    },
  })

  return {
    assetMode: 'campaign-environment-tile',
    theme,
    assetUrl,
    destroy(): void {
      pass.remove()
      PIXI.Assets.unload(assetUrl).catch(() => undefined)
    },
  }
}
