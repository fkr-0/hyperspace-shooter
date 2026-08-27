import { createKeyboardDevice } from '@arcade/runtime/core'
import { createArcadePixiFixedStepHost, createArcadePixiRuntime } from '@arcade/runtime/pixi'
import * as PIXI from 'pixi.js'
import { FIXED_STEP_SECONDS, PLAYFIELD } from './game/constants'
import { createHyperblastSimulation } from './game/simulation'
import type { PlayerInput } from './game/types'
import { installHyperblastPixiRenderer } from './render/pixi-game'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Hyperblast root element #app is missing')

app.innerHTML = `
  <main class="game-shell">
    <header class="game-header">
      <div>
        <p class="eyebrow">@ARCADE/RUNTIME // FIXED 60 HZ</p>
        <h1>HYPERBLAST SHOOTER</h1>
      </div>
      <p class="controls">MOVE <strong>WASD / ARROWS</strong> · FOCUS <strong>SHIFT</strong> · FIRE <strong>SPACE</strong></p>
    </header>
    <section class="play-layout">
      <div class="playfield-frame" id="playfield" aria-label="Hyperblast vertical playfield"></div>
      <aside class="telemetry" aria-live="polite">
        <div><span>SCORE</span><strong id="score">000000</strong></div>
        <div><span>GRAZE</span><strong id="graze">0</strong></div>
        <div><span>CORE HITS</span><strong id="hits">0</strong></div>
        <div><span>DRONES</span><strong id="kills">0</strong></div>
        <div><span>MODE</span><strong id="mode">NORMAL</strong></div>
        <div><span>HOSTILES</span><strong id="hostiles">0</strong></div>
      </aside>
    </section>
    <footer>PHASE 2 TRAINING DRONE // graze magenta fire, hold Shift to expose the precision core.</footer>
  </main>
`

const playfield = document.querySelector<HTMLElement>('#playfield')
if (!playfield) throw new Error('Hyperblast playfield mount is missing')

function text(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`)
  if (!element) throw new Error(`Hyperblast HUD element #${id} is missing`)
  return element
}

const hud = {
  score: text('score'),
  graze: text('graze'),
  hits: text('hits'),
  kills: text('kills'),
  mode: text('mode'),
  hostiles: text('hostiles'),
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const simulation = createHyperblastSimulation({ seed: 'browser-training-run', reducedMotion: prefersReducedMotion })
const runtime = await createArcadePixiRuntime({
  PIXI,
  mount: playfield,
  logicalWidth: PLAYFIELD.width,
  logicalHeight: PLAYFIELD.height,
  layers: ['background', 'gameplay'],
  background: 0x050611,
  autoStart: false,
  autoRender: false,
  observeResize: false,
  antialias: false,
  canvasId: 'hyperblast-canvas',
})
runtime.canvas.setAttribute('role', 'img')
runtime.canvas.setAttribute('aria-label', 'Playable Hyperblast Shooter training field')
installHyperblastPixiRenderer(runtime, simulation)

const keyboard = createKeyboardDevice({
  target: window,
  preventDefaultCodes: [
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Space',
    'ShiftLeft',
    'ShiftRight',
  ],
})

function readInput(): PlayerInput {
  keyboard.advance()
  return {
    left: keyboard.isHeld('ArrowLeft') || keyboard.isHeld('KeyA'),
    right: keyboard.isHeld('ArrowRight') || keyboard.isHeld('KeyD'),
    up: keyboard.isHeld('ArrowUp') || keyboard.isHeld('KeyW'),
    down: keyboard.isHeld('ArrowDown') || keyboard.isHeld('KeyS'),
    focus: keyboard.isHeld('ShiftLeft') || keyboard.isHeld('ShiftRight'),
    fire: keyboard.isHeld('Space'),
  }
}

function updateHud(): void {
  const state = simulation.state
  hud.score.textContent = state.stats.score.toString().padStart(6, '0')
  hud.graze.textContent = String(state.stats.graze)
  hud.hits.textContent = String(state.stats.hitsTaken)
  hud.kills.textContent = String(state.stats.targetsDestroyed)
  hud.mode.textContent = state.player.focus ? 'FOCUS' : 'NORMAL'
  hud.hostiles.textContent = String(
    simulation.projectiles.values().filter((projectile) => projectile.kind === 'enemy').length,
  )
}

const host = createArcadePixiFixedStepHost({
  runtime,
  fixedStep: FIXED_STEP_SECONDS,
  maxFrame: 0.25,
  timeUnit: 'seconds',
  update: (delta) => simulation.step(readInput(), delta),
  afterPresent: updateHud,
  destroyRuntime: true,
})

updateHud()
host.start()

window.addEventListener('pagehide', () => {
  keyboard.destroy()
  host.destroy()
})
