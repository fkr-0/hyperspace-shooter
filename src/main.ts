import { createKeyboardDevice, createPointerDevice } from '@arcade/runtime/core'
import { createArcadePixiFixedStepHost, createArcadePixiRuntime } from '@arcade/runtime/pixi'
import * as PIXI from 'pixi.js'
import { createHyperblastAudio } from './audio/game-audio'
import {
  CAMPAIGN_STAGES,
  nextStage,
  STAGE_BRIEFINGS,
  stageForRequestedNumber,
  stageNumberFor,
} from './game/campaign'
import { FIXED_STEP_SECONDS, PLAYFIELD } from './game/constants'
import {
  narrativeBeatFor,
  stageNarrativeFor,
  UNIVERSE_INTRO,
} from './game/narrative'
import { createHyperblastSimulation } from './game/simulation'
import type { PlayerInput } from './game/types'
import { fallbackKeyboardCode } from './input/keyboard-fallback'
import { createMobileTouchController } from './input/mobile-touch'
import { createBrowserHighScoreService } from './persistence/high-scores'
import { installEnvironmentTileBackground } from './render/environment-tiles'
import { installHyperblastPixiRenderer } from './render/pixi-game'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Hyperblast root element #app is missing')

const stageParam = new URLSearchParams(window.location.search).get('stage')
const stageDefinition = stageForRequestedNumber(stageParam)
const stageNumber = stageNumberFor(stageDefinition)
const followingStage = nextStage(stageDefinition)
const stageNarrative = stageNarrativeFor(stageDefinition.id)
const highScores = createBrowserHighScoreService()
let highScoreData = highScores.load().data
let persistedResultKey = ''
let latestResultWasBest = false

app.innerHTML = `
  <main class="game-shell" data-mode="title" data-stage-tick="0">
    <header class="game-header">
      <div>
        <p class="eyebrow">STAGE ${String(stageNumber).padStart(2, '0')} // ${stageDefinition.title.toUpperCase()}</p>
        <h1>HYPERBLAST SHOOTER</h1>
      </div>
      <p class="controls">MOVE <strong>WASD / ARROWS</strong> · FOCUS <strong>SHIFT</strong> · FIRE <strong>SPACE</strong> · BOMB <strong>X</strong> · PAUSE <strong>ESC</strong></p>
    </header>
    <section class="play-layout">
      <div class="playfield-wrap">
        <div class="playfield-frame" id="playfield"></div>
        <div class="touch-overlay" aria-hidden="true">
          <div class="touch-zone touch-zone-move">DRAG // MOVE</div>
          <div class="touch-zone touch-zone-fire" id="touch-fire-zone">HOLD // FIRE</div>
          <div class="touch-zone touch-zone-special" id="touch-special-zone">TAP // BOMB</div>
        </div>
        <div class="live-dialogue" id="live-dialogue" aria-live="polite" aria-atomic="true"></div>
        <div class="game-overlay" id="game-overlay" aria-live="polite"></div>
      </div>
      <aside class="telemetry" aria-live="polite">
        <div><span>SCORE</span><strong id="score">00000000</strong></div>
        <div><span>LOCAL BEST</span><strong id="best">00000000</strong></div>
        <div><span>GRAZE</span><strong id="graze">0</strong></div>
        <div><span>LIVES</span><strong id="lives">3</strong></div>
        <div><span>BOMBS</span><strong id="bombs">3</strong></div>
        <div><span>WEAPON</span><strong id="weapon">SPREAD P1</strong></div>
        <div><span>CHAIN</span><strong id="combo">1.00×</strong></div>
        <div><span>RANK</span><strong id="rank">250</strong></div>
        <div><span>PHASE</span><strong id="phase">READY</strong></div>
        <div><span>HOSTILES</span><strong id="hostiles">0</strong></div>
        <div><span>ENEMIES</span><strong id="enemies">0</strong></div>
        <label class="motion-control">
          <span>REDUCED MOTION</span>
          <input id="reduced-motion" type="checkbox" />
        </label>
        <label class="motion-control mobile-only-control">
          <span>MOBILE AUTO FIRE</span>
          <input id="mobile-auto-fire" type="checkbox" />
        </label>
        <label class="motion-control">
          <span>AUDIO MUTE</span>
          <input id="audio-muted" type="checkbox" />
        </label>
      </aside>
    </section>
    <footer>PRODUCTION SHIP + VFX BANKS // SAMPLE LAB / ACE-LINEAGE SCORE WITH PROCEDURAL FAIL-SAFE // STAGE 4/5 BOSSES REUSE PRODUCTION HULL CLIPS // @ARCADE/RUNTIME</footer>
  </main>
`

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Hyperblast shell element ${selector} is missing`)
  return element
}

const shell = requiredElement<HTMLElement>('.game-shell')
const playfield = requiredElement<HTMLElement>('#playfield')
const overlay = requiredElement<HTMLElement>('#game-overlay')
const liveDialogue = requiredElement<HTMLElement>('#live-dialogue')
const reducedMotionControl = requiredElement<HTMLInputElement>('#reduced-motion')
const mobileAutoFireControl = requiredElement<HTMLInputElement>('#mobile-auto-fire')
const audioMutedControl = requiredElement<HTMLInputElement>('#audio-muted')
const touchFireZone = requiredElement<HTMLElement>('#touch-fire-zone')
const touchSpecialZone = requiredElement<HTMLElement>('#touch-special-zone')

function text(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`)
  if (!element) throw new Error(`Hyperblast HUD element #${id} is missing`)
  return element
}

const hud = {
  score: text('score'),
  best: text('best'),
  graze: text('graze'),
  lives: text('lives'),
  bombs: text('bombs'),
  weapon: text('weapon'),
  combo: text('combo'),
  rank: text('rank'),
  phase: text('phase'),
  hostiles: text('hostiles'),
  enemies: text('enemies'),
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const coarsePointer = window.matchMedia('(pointer: coarse)').matches
const touchCapable = coarsePointer || navigator.maxTouchPoints > 0
shell.dataset.touch = String(touchCapable)
reducedMotionControl.checked = prefersReducedMotion
mobileAutoFireControl.checked = touchCapable
const simulation = createHyperblastSimulation({
  seed: `browser:${stageDefinition.id}`,
  reducedMotion: prefersReducedMotion,
  stageDefinition,
})

const runtime = await createArcadePixiRuntime({
  PIXI,
  mount: playfield,
  logicalWidth: PLAYFIELD.width,
  logicalHeight: PLAYFIELD.height,
  layers: ['background', 'gameplay'],
  background: 0x050611,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  autoStart: false,
  autoRender: false,
  observeResize: false,
  pauseWhenHidden: true,
  antialias: false,
  canvasId: 'hyperblast-canvas',
})
runtime.canvas.setAttribute('role', 'img')
runtime.canvas.setAttribute('aria-label', `Playable Hyperblast Shooter ${stageDefinition.title} field`)
runtime.canvas.style.width = '100%'
runtime.canvas.style.height = '100%'
runtime.canvas.style.touchAction = 'none'
const environmentBackground = await installEnvironmentTileBackground(
  runtime,
  stageDefinition.theme,
  () => simulation.state.tick,
)
const renderer = await installHyperblastPixiRenderer(runtime, simulation)
let audio: ReturnType<typeof createHyperblastAudio> | null = null

audioMutedControl.addEventListener('change', () => {
  audio?.mute(audioMutedControl.checked)
})

async function startAudio(): Promise<void> {
  audio ??= createHyperblastAudio()
  audio.mute(audioMutedControl.checked)
  await audio.start(stageDefinition.theme)
  audio.sync(simulation.state)
}

const pointer = createPointerDevice({ target: window })
const mobileTouch = createMobileTouchController({
  pointer,
  playfieldRect: () => playfield.getBoundingClientRect(),
  fireRect: () => touchFireZone.getBoundingClientRect(),
  specialRect: () => touchSpecialZone.getBoundingClientRect(),
  logicalWidth: PLAYFIELD.width,
  logicalHeight: PLAYFIELD.height,
  deadZone: 7,
})

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
    'KeyX',
  ],
})

// Some assistive/synthetic browser input can provide `key` while leaving
// `code` empty. Keep @arcade/runtime authoritative for normal physical events
// and use this narrow browser-only fallback solely for those code-less events.
const fallbackHeldCodes = new Set<string>()
const onFallbackKeyDown = (event: KeyboardEvent) => {
  const code = fallbackKeyboardCode(event)
  if (!code) return
  fallbackHeldCodes.add(code)
  event.preventDefault()
}
const onFallbackKeyUp = (event: KeyboardEvent) => {
  const code = fallbackKeyboardCode(event)
  if (!code) return
  fallbackHeldCodes.delete(code)
  event.preventDefault()
}
const clearFallbackHeldCodes = () => fallbackHeldCodes.clear()
window.addEventListener('keydown', onFallbackKeyDown)
window.addEventListener('keyup', onFallbackKeyUp)
window.addEventListener('blur', clearFallbackHeldCodes)

function isGameplayKeyHeld(code: string): boolean {
  return keyboard.isHeld(code) || fallbackHeldCodes.has(code)
}

function readInput(): PlayerInput {
  keyboard.advance()
  pointer.advance()
  const touch = mobileTouch.read(simulation.state.player, mobileAutoFireControl.checked)
  return {
    left: touch.input.left || isGameplayKeyHeld('ArrowLeft') || isGameplayKeyHeld('KeyA'),
    right: touch.input.right || isGameplayKeyHeld('ArrowRight') || isGameplayKeyHeld('KeyD'),
    up: touch.input.up || isGameplayKeyHeld('ArrowUp') || isGameplayKeyHeld('KeyW'),
    down: touch.input.down || isGameplayKeyHeld('ArrowDown') || isGameplayKeyHeld('KeyS'),
    focus: touch.input.focus || isGameplayKeyHeld('ShiftLeft') || isGameplayKeyHeld('ShiftRight'),
    fire: touch.input.fire || isGameplayKeyHeld('Space'),
    bomb: touch.input.bomb || isGameplayKeyHeld('KeyX'),
  }
}

let overlayKey = ''
let narrativeBeatKey = ''

function renderLiveDialogue(): void {
  const state = simulation.state
  const beat = narrativeBeatFor(stageDefinition.id, state.stageTick, state.mode)
  const key = beat?.id ?? ''
  if (key === narrativeBeatKey) return
  narrativeBeatKey = key

  if (!beat) {
    liveDialogue.classList.remove('visible')
    liveDialogue.replaceChildren()
    return
  }

  liveDialogue.classList.add('visible')
  liveDialogue.innerHTML = `
    <p class="dialogue-label">${beat.label}</p>
    ${beat.lines
      .map(
        (line) => `
          <p class="dialogue-line">
            <strong>${line.speaker}</strong>
            <span>${line.text}</span>
          </p>
        `,
      )
      .join('')}
  `
}

function persistResultIfNeeded(): void {
  const result = simulation.state.result
  if (!result) return
  const key = `${result.stageId}:${simulation.state.tick}:${result.score}:${result.grade}`
  if (key === persistedResultKey) return
  const saved = highScores.recordResult(result)
  persistedResultKey = key
  latestResultWasBest = saved.isNewBest
  highScoreData = saved.data
}

function renderOverlay(): void {
  const state = simulation.state
  const bestScore = highScoreData.stageBests[stageDefinition.id]?.score ?? 0
  const key = `${state.mode}:${state.paused}:${state.result?.grade ?? ''}:${bestScore}:${latestResultWasBest}`
  if (key === overlayKey) return
  overlayKey = key

  if (state.paused) {
    overlay.classList.add('visible')
    overlay.innerHTML = `
      <div class="overlay-card">
        <p class="eyebrow">SYSTEM HOLD</p>
        <h2>PAUSED</h2>
        <p>Simulation ticks are frozen. Rendering and layout remain live.</p>
        <button type="button" data-action="resume">RESUME</button>
      </div>
    `
    return
  }

  if (state.mode === 'title') {
    overlay.classList.add('visible')
    overlay.innerHTML = `
      <div class="overlay-card">
        <p class="eyebrow">ARCADE RUN // FIXED 60 HZ</p>
        <h2>${stageDefinition.title.toUpperCase()}</h2>
        <p class="story-kicker">${stageNarrative.sector}</p>
        <p class="story-universe">${UNIVERSE_INTRO}</p>
        <p class="story-premise">${stageNarrative.premise}</p>
        <div class="mission-copy">
          <span>MISSION</span>
          <p>${STAGE_BRIEFINGS[stageDefinition.id] ?? stageNarrative.objective}</p>
          <small>${stageNarrative.objective}</small>
        </div>
        <p class="best-line">LOCAL BEST <strong>${bestScore.toLocaleString()}</strong></p>
        <button type="button" data-action="start">START STAGE ${stageNumber}</button>
        <nav class="stage-links" aria-label="Five-stage campaign selection">
          ${CAMPAIGN_STAGES.map(
            (stage, index) =>
              `<a href="?stage=${index + 1}" aria-label="Stage ${index + 1}: ${stage.title}"${stage.id === stageDefinition.id ? ' aria-current="page"' : ''}>${index + 1}${highScoreData.clearedStages.includes(stage.id) ? '<span aria-hidden="true">✓</span>' : ''}</a>`,
          ).join('')}
        </nav>
        <small>Enter also starts. Shift reveals the precision core.</small>
        ${stageNumber >= 4 ? '<small>Boss gameplay identities use reused production hull silhouettes; no bespoke boss-art claim is made.</small>' : ''}
      </div>
    `
    return
  }

  if (state.mode === 'result' && state.result) {
    const result = state.result
    overlay.classList.add('visible')
    overlay.innerHTML = `
      <div class="overlay-card result-card">
        <p class="eyebrow">STAGE CLEAR</p>
        <h2>GRADE ${result.grade}</h2>
        <p class="story-outcome">${stageNarrative.clear}</p>
        ${latestResultWasBest ? '<p class="new-best" role="status">NEW LOCAL STAGE BEST</p>' : ''}
        <dl>
          <div><dt>SCORE</dt><dd>${result.score.toLocaleString()}</dd></div>
          <div><dt>LOCAL BEST</dt><dd>${(highScoreData.stageBests[result.stageId]?.score ?? result.score).toLocaleString()}</dd></div>
          <div><dt>DESTROYED</dt><dd>${Math.round(result.destructionRatio * 100)}%</dd></div>
          <div><dt>MAX CHAIN</dt><dd>${result.maxCombo}</dd></div>
          <div><dt>GRAZE</dt><dd>${result.graze}</dd></div>
          <div><dt>LIVES LOST</dt><dd>${result.livesLost}</dd></div>
          <div><dt>BOMBS USED</dt><dd>${result.bombsUsed}</dd></div>
        </dl>
        <div class="overlay-actions">
          <button type="button" data-action="restart">RESTART STAGE</button>
          ${
            followingStage
              ? `<a class="overlay-button secondary" href="?stage=${stageNumber + 1}">NEXT // ${followingStage.title.toUpperCase()}</a>`
              : '<a class="overlay-button secondary" href="?stage=1">CAMPAIGN SELECT</a>'
          }
        </div>
      </div>
    `
    return
  }

  if (state.mode === 'gameover') {
    overlay.classList.add('visible')
    overlay.innerHTML = `
      <div class="overlay-card">
        <p class="eyebrow">SIGNAL LOST</p>
        <h2>RUN OVER</h2>
        <p>${stageNarrative.gameover}</p>
        <small>Signal integrity collapsed. Re-enter ${stageDefinition.title} from a clean deterministic seed.</small>
        <button type="button" data-action="restart">RETRY</button>
      </div>
    `
    return
  }

  overlay.classList.remove('visible')
  overlay.replaceChildren()
}

function updateHud(): void {
  const state = simulation.state
  persistResultIfNeeded()
  const boss = state.enemies.find((enemy) => enemy.boss)?.boss
  const hostileCount = simulation.projectiles.values().filter((projectile) => projectile.kind === 'enemy').length
  shell.dataset.mode = state.paused ? 'paused' : state.mode
  shell.dataset.stageTick = String(state.stageTick)
  shell.dataset.bossPhase = boss ? String(boss.phaseIndex + 1) : ''
  hud.score.textContent = state.stats.score.toString().padStart(8, '0')
  hud.best.textContent = String(highScoreData.stageBests[stageDefinition.id]?.score ?? 0).padStart(8, '0')
  hud.graze.textContent = String(state.stats.graze)
  hud.lives.textContent = String(state.player.lives)
  hud.bombs.textContent = String(state.player.bombs)
  hud.weapon.textContent = `${simulation.weapon.family.toUpperCase()} P${simulation.weapon.powerLevel}`
  hud.combo.textContent = `${state.scoring.comboMultiplier.toFixed(2)}× / ${state.scoring.comboCount}`
  hud.rank.textContent = String(state.scoring.rank)
  hud.phase.textContent = boss
    ? `${boss.phaseIndex + 1}/${boss.phases.length}${boss.transitionTicks > 0 ? ' SHIFT' : ''}`
    : state.mode.toUpperCase()
  hud.hostiles.textContent = String(hostileCount)
  hud.enemies.textContent = String(state.enemies.length)
  audio?.sync(state)
  renderLiveDialogue()
  renderOverlay()
}

overlay.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLButtonElement)) return
  const action = target.dataset.action
  if (action === 'start') {
    simulation.startRun()
    void startAudio()
  }
  else if (action === 'resume') simulation.setPaused(false)
  else if (action === 'restart') window.location.reload()
  updateHud()
})

reducedMotionControl.addEventListener('change', () => {
  simulation.setReducedMotion(reducedMotionControl.checked)
  updateHud()
})

window.addEventListener('keydown', (event) => {
  if (event.code === 'Enter' && simulation.state.mode === 'title') {
    event.preventDefault()
    simulation.startRun()
    void startAudio()
    updateHud()
  } else if (event.code === 'Escape' && !event.repeat) {
    event.preventDefault()
    simulation.togglePause()
    updateHud()
  }
})

const host = createArcadePixiFixedStepHost({
  runtime,
  fixedStep: FIXED_STEP_SECONDS,
  maxFrame: 0.25,
  timeUnit: 'seconds',
  update: (delta) => simulation.step(readInput(), delta),
  afterPresent: updateHud,
  destroyRuntime: true,
})

const diagnosticsWindow = window as Window & {
  __hyperblastDiagnostics?: () => Readonly<Record<string, unknown>>
}
diagnosticsWindow.__hyperblastDiagnostics = () => ({
  snapshot: simulation.snapshot(),
  hash: simulation.hash(),
  metrics: { ...simulation.metrics },
  stage: { id: stageDefinition.id, title: stageDefinition.title, theme: stageDefinition.theme },
  renderer: {
    assetMode: renderer.assetMode,
    spriteSheetId: renderer.spriteSheetId,
    vfxSheetId: renderer.vfxSheetId,
    runtime: runtime.snapshot(),
    performance: runtime.performanceSnapshot(),
  },
  audio: audio?.snapshot() ?? { started: false },
  mobile: {
    coarsePointer,
    touchCapable,
    autoFire: mobileAutoFireControl.checked,
    devicePixelRatio: window.devicePixelRatio || 1,
    renderResolution: Math.min(window.devicePixelRatio || 1, 2),
    orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape',
  },
  persistence: {
    ...highScores.diagnostics(),
    currentBest: highScoreData.stageBests[stageDefinition.id] ?? null,
    clearedStages: [...highScoreData.clearedStages],
    recentRuns: highScoreData.recentRuns.length,
    latestResultWasBest,
  },
})

updateHud()
host.start()

window.addEventListener('pagehide', (event) => {
  mobileTouch.reset()
  pointer.reset()
  keyboard.reset()
  fallbackHeldCodes.clear()

  // Keep the live runtime intact when a mobile browser places the page in the
  // back/forward cache. visibility handling in @arcade/runtime already pauses
  // hidden work and resumes it when the document becomes visible again.
  if (event.persisted) return

  window.removeEventListener('keydown', onFallbackKeyDown)
  window.removeEventListener('keyup', onFallbackKeyUp)
  window.removeEventListener('blur', clearFallbackHeldCodes)
  pointer.destroy()
  keyboard.destroy()
  environmentBackground.destroy()
  renderer.destroy()
  void audio?.destroy()
  host.destroy()
  delete diagnosticsWindow.__hyperblastDiagnostics
})
