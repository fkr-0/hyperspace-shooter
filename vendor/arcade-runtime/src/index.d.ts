// GENERATED FILE — DO NOT EDIT DIRECTLY.
// Edit source/types/*.d.ts.inc and run `npm run source:build`.

import type { Application, Container, Texture } from 'pixi.js';

export type ArcadePixiNamespace = {
  Application: typeof import('pixi.js').Application;
  Container: typeof import('pixi.js').Container;
  Assets: typeof import('pixi.js').Assets;
  Graphics?: typeof import('pixi.js').Graphics;
  Text?: typeof import('pixi.js').Text;
  TextureStyle?: typeof import('pixi.js').TextureStyle;
  Texture?: typeof import('pixi.js').Texture;
  Sprite?: typeof import('pixi.js').Sprite;
};

export declare const ARCADE_RUNTIME_VERSION: string;
/** @deprecated Use ARCADE_RUNTIME_VERSION. */
export declare const ARCADE_PIXI_RUNTIME_VERSION: string;
/** @deprecated Use ARCADE_RUNTIME_VERSION. */
export declare const ARCADE_CORE_VERSION: string;
export declare const DEFAULT_ARCADE_LAYERS: readonly string[];

/** @deprecated Use clampNumber. */
export declare function clampArcadeValue(value: number, minimum: number, maximum: number): number;
/** @deprecated Use approach. */
export declare function approachArcadeValue(current: number, target: number, maximumDelta: number): number;
/** @deprecated Use approach(value, 0, drag * delta). */
export declare function applyArcadeDrag(value: number, drag: number, delta?: number): number;

export type ArcadeKinematicBody2D = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

/** @deprecated Use integrateBody. */
export declare function integrateArcadeBody2D<T extends ArcadeKinematicBody2D>(
  body: T,
  delta?: number,
): T;

export type ArcadeAnimationMode = 'loop' | 'once' | 'pingpong';

export type ArcadeAnimationClock = {
  frame: number;
  elapsed: number;
  direction: 1 | -1;
  playing: boolean;
  paused: boolean;
  completed: boolean;
  frameAdvances: number;
  advancedFrames: readonly number[];
};

export type ArcadeAnimationTimeline = {
  frameCount: number;
  frameDuration: number | readonly number[] | ((frame: number) => number);
  mode?: ArcadeAnimationMode;
  speed?: number;
  maxAdvances?: number;
  singleFrameMode?: 'hold' | 'complete';
};

export declare function createArcadeAnimationClock(
  initial?: Partial<ArcadeAnimationClock>,
): ArcadeAnimationClock;

export declare function playArcadeAnimationClock(
  state?: Partial<ArcadeAnimationClock>,
  options?: { restart?: boolean; frame?: number; direction?: 1 | -1 },
): ArcadeAnimationClock;

export declare function advanceArcadeAnimationClock(
  state: Partial<ArcadeAnimationClock>,
  deltaTime: number,
  timeline: ArcadeAnimationTimeline,
): ArcadeAnimationClock;

export type DeterministicRngState = {
  seed: number;
  calls: number;
};

export type DeterministicRngResult = {
  state: DeterministicRngState;
  value: number;
};

export declare function hashSeed(seed: string): number;
export declare function createDeterministicRng(seed?: number | string): DeterministicRngState;
export declare function nextRng(state: DeterministicRngState): DeterministicRngResult;
export declare function rngRange(
  state: DeterministicRngState,
  minimum: number,
  maximum: number,
): DeterministicRngResult;
export declare function rngInt(
  state: DeterministicRngState,
  minimumInclusive: number,
  maximumInclusive: number,
): DeterministicRngResult;
export declare function rngPick<T>(
  state: DeterministicRngState,
  values: readonly T[],
): { state: DeterministicRngState; value: T; index: number };
export declare function rngWeightedPick<T>(
  state: DeterministicRngState,
  values: readonly T[],
  weightOf?: (value: T, index: number) => number,
): {
  state: DeterministicRngState;
  value: T;
  index: number;
  roll: number;
  totalWeight: number;
};
export declare function rngShuffle<T>(
  state: DeterministicRngState,
  values: readonly T[],
): { state: DeterministicRngState; value: T[] };

export type SeededRandomSource = (() => number) & {
  snapshot(): DeterministicRngState;
  restore(state: DeterministicRngState): SeededRandomSource;
};

export declare function createSeededRandom(seed?: number | string): SeededRandomSource;

export type CooldownState = Readonly<Record<string, number>>;

export declare function createCooldownState(initial?: CooldownState): Record<string, number>;
export declare function startCooldown(
  state: CooldownState,
  key: string,
  duration: number,
): Record<string, number>;
export declare function clearCooldown(
  state: CooldownState,
  key?: string,
): Record<string, number>;
export declare function stepCooldownState(
  state: CooldownState,
  delta?: number,
): Record<string, number>;
export declare function cooldownRemaining(state: CooldownState, key: string): number;
export declare function isCooldownReady(state: CooldownState, key: string): boolean;
export declare function tryStartCooldown(
  state: CooldownState,
  key: string,
  duration: number,
): {
  started: boolean;
  state: Record<string, number>;
  remaining: number;
};
export declare function getElapsedCooldownStatus(
  now: number,
  lastTriggeredAt: number,
  duration: number,
): {
  ready: boolean;
  elapsed: number;
  remaining: number;
  progress: number;
};

export interface ArcadeSpriteBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export interface ArcadeSpriteFrameCollision {
  frame: number;
  hitboxes?: readonly ArcadeSpriteBox[];
  hurtboxes?: readonly ArcadeSpriteBox[];
}

export interface ArcadeSpriteAnimationEvent {
  frame: number;
  kind: string;
  name?: string;
  payload?: Readonly<Record<string, unknown>>;
}

export interface ArcadeSpriteGrid {
  columns: number;
  rows: number;
}

export interface ArcadeSpriteAnimation {
  frames: number;
  fps: number;
  order?: readonly number[];
  loop?: boolean;
  anchor?: readonly [number, number];
  hitboxes?: readonly ArcadeSpriteBox[];
  hurtboxes?: readonly ArcadeSpriteBox[];
  frameCollisions?: readonly ArcadeSpriteFrameCollision[];
  events?: readonly ArcadeSpriteAnimationEvent[];
  tags?: readonly string[];
}

export interface ArcadeSpriteSheet {
  id: string;
  file: string;
  frameSize: readonly [number, number];
  grid?: ArcadeSpriteGrid;
  animations: Readonly<Record<string, ArcadeSpriteAnimation>>;
  source?: Readonly<Record<string, unknown>>;
}

export interface ArcadeSpriteManifest {
  version: string;
  sheets: readonly ArcadeSpriteSheet[];
}

export interface ArcadeSpriteManifestSource {
  version?: string;
  schemaVersion?: string | number;
  sheets?: readonly ArcadeSpriteSheet[];
  spriteSheets?: readonly ArcadeSpriteSheet[];
  baseGrid?: number;
}

export interface ArcadeSpriteFrameAddress {
  sheetId: string;
  animationName: string;
  localFrame: number;
  absoluteFrame: number;
  sourceX: number;
  sourceY: number;
  frameWidth: number;
  frameHeight: number;
  anchorX: number;
  anchorY: number;
  pivotX: number;
  pivotY: number;
  anchorUnits: 'pixels';
}

export interface ArcadeSpriteCompiledFrame {
  frameIndex: number;
  duration: number;
  address: ArcadeSpriteFrameAddress;
  hitboxes: readonly ArcadeSpriteBox[];
  hurtboxes: readonly ArcadeSpriteBox[];
}

export interface ArcadeSpriteClip {
  id: string;
  sheetId: string;
  animationName: string;
  frameCount: number;
  fps: number;
  frameDuration: number;
  frameDurationMs: number;
  mode: 'loop' | 'once';
  anchor: readonly [number, number];
  hitboxes: readonly ArcadeSpriteBox[];
  hurtboxes: readonly ArcadeSpriteBox[];
  tags: readonly string[];
  frames: readonly ArcadeSpriteCompiledFrame[];
}

export interface ArcadeSpriteManifestIndex {
  manifest: ArcadeSpriteManifest;
  size: number;
  ids: readonly string[];
  has(id: string): boolean;
  get(id: string): ArcadeSpriteSheet | null;
}

export declare function validateArcadeSpriteManifest(value: unknown): value is ArcadeSpriteManifestSource;
export declare function normalizeArcadeSpriteManifest(value: unknown): ArcadeSpriteManifest;
export declare function resolveArcadeSpriteFrame(
  sheet: ArcadeSpriteSheet,
  animationName: string,
  frameIndex: number,
): ArcadeSpriteFrameAddress | null;
export declare function compileArcadeSpriteClip(
  sheet: ArcadeSpriteSheet,
  animationName: string,
): ArcadeSpriteClip | null;
export declare function collectArcadeSpriteAnimationEvents(
  animation: ArcadeSpriteAnimation | null | undefined,
  advancedFrames?: readonly number[],
): readonly ArcadeSpriteAnimationEvent[];
export declare function createArcadeSpriteManifestIndex(value: unknown): ArcadeSpriteManifestIndex;

export type ArcadeSpritePixelData = Readonly<{
  data: ArrayLike<number>;
  width: number;
  height: number;
}>;

export type ArcadeSpritePixelRectangle = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type ArcadeSpriteInspectableFrame = Readonly<{
  absoluteFrame?: number;
  index?: number;
  sourceX?: number;
  sourceY?: number;
  x?: number;
  y?: number;
  frameWidth?: number;
  frameHeight?: number;
  width?: number;
  height?: number;
  anchorX?: number;
  anchorY?: number;
  pivotX?: number;
  pivotY?: number;
  anchorUnits?: 'pixels' | 'normalized';
  anchor?: readonly [number, number] | Readonly<{ x: number; y: number }>;
  pivot?: readonly [number, number] | Readonly<{ x: number; y: number }>;
}>;

export type ArcadeSpritePixelSource = Readonly<{
  width: number;
  height: number;
  data?: ArrayLike<number>;
  id?: PropertyKey;
  cacheKey?: PropertyKey;
  readPixels?(
    rectangle: ArcadeSpritePixelRectangle,
    frame: ArcadeSpriteInspectableFrame,
  ): ArcadeSpritePixelData;
  getImageData?(x: number, y: number, width: number, height: number): ArcadeSpritePixelData;
}>;

export type ArcadeSpriteFrameDiagnostic =
  | 'transparent-frame'
  | 'low-opaque-coverage'
  | 'pivot-outside-frame'
  | 'background-leak';

export type ArcadeSpriteFrameInspection = Readonly<{
  frameIndex: number;
  width: number;
  height: number;
  sourceRect: ArcadeSpritePixelRectangle;
  opaqueBounds: ArcadeSpritePixelRectangle;
  opaquePixels: number;
  opaqueCoverage: number;
  topAndSideEdgeCoverage: number;
  boundsValid: true;
  pivotValid: boolean;
  transparent: boolean;
  opaque: boolean;
  blank: boolean;
  backgroundLeak: boolean;
  diagnostics: readonly ArcadeSpriteFrameDiagnostic[];
}>;

export type ArcadeSpriteFrameCache<Value> = {
  get(key: string): Value | undefined;
  set(key: string, value: Value): unknown;
};

export type ArcadeSpriteInspectionOptions = {
  alphaThreshold?: number;
  edgeWidth?: number;
  blankCoverageThreshold?: number;
  backgroundLeakCoverageThreshold?: number;
  backgroundLeakEdgeThreshold?: number;
  cacheKey?: PropertyKey | ((source: ArcadeSpritePixelSource, frame: ArcadeSpriteInspectableFrame) => PropertyKey | null | undefined);
  cache?: ArcadeSpriteFrameCache<ArcadeSpriteFrameInspection>;
  processedFrameCache?: ArcadeSpriteFrameCache<ArcadeSpritePixelData>;
  readPixels?(
    source: ArcadeSpritePixelSource | unknown,
    rectangle: ArcadeSpritePixelRectangle,
    frame: ArcadeSpriteInspectableFrame,
  ): ArcadeSpritePixelData;
  processPixels?(
    pixels: ArcadeSpritePixelData,
    context: Readonly<{
      source: ArcadeSpritePixelSource | unknown;
      frame: ArcadeSpriteInspectableFrame;
      rectangle: ArcadeSpritePixelRectangle;
    }>,
  ): ArcadeSpritePixelData | void;
};

export declare function inspectArcadeSpriteFrame(
  source: ArcadeSpritePixelSource | unknown,
  frame: ArcadeSpriteInspectableFrame,
  options?: ArcadeSpriteInspectionOptions,
): ArcadeSpriteFrameInspection;

export type ArcadeSpriteInspectableAtlas = Readonly<{
  source?: ArcadeSpritePixelSource | unknown;
  image?: ArcadeSpritePixelSource | unknown;
  frames: readonly ArcadeSpriteInspectableFrame[];
  frameHeight?: number;
}>;

export type ArcadeSpriteVisibleScaleOptions = {
  source?: ArcadeSpritePixelSource | unknown;
  frames?: readonly ArcadeSpriteInspectableFrame[];
  frameIndexes?: readonly number[];
  targetVisibleHeight?: number;
  fallbackVisibleHeight?: number;
  multiplier?: number;
  minimum?: number;
  maximum?: number;
  representative?: 'median' | 'mean' | 'min' | 'max' | ((orderedHeights: readonly number[]) => number);
  inspectionOptions?: ArcadeSpriteInspectionOptions;
  inspect?: (
    source: ArcadeSpritePixelSource | unknown,
    frame: ArcadeSpriteInspectableFrame,
    options?: ArcadeSpriteInspectionOptions,
  ) => ArcadeSpriteFrameInspection;
};

export declare function resolveArcadeSpriteVisibleScale(
  atlas: ArcadeSpriteInspectableAtlas,
  options?: ArcadeSpriteVisibleScaleOptions,
): number;

export type ArcadeSpriteFrameTransform = Readonly<{
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  flipX?: boolean;
}>;

export type ArcadeSpriteFrameGeometry = Readonly<{
  source: ArcadeSpritePixelRectangle;
  local: ArcadeSpritePixelRectangle;
  destination: ArcadeSpritePixelRectangle;
  pivot: Readonly<{
    sourceX: number;
    sourceY: number;
    x: number;
    y: number;
    destinationX: number;
    destinationY: number;
  }>;
  matrix: Readonly<{
    a: number;
    b: 0;
    c: 0;
    d: number;
    tx: number;
    ty: number;
  }>;
  flipX: boolean;
  scaleX: number;
  scaleY: number;
}>;

export declare function createArcadeSpriteFrameGeometry(
  frame: ArcadeSpriteInspectableFrame,
  transform?: ArcadeSpriteFrameTransform,
): ArcadeSpriteFrameGeometry;

export type ArcadeSpriteCanvasPlacement = 'pivot' | 'top-left';

export type ArcadeSpriteCanvasContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export type ArcadeSpriteCanvasDrawOptions = Readonly<{
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  flipX?: boolean;
  opacity?: number;
  placement?: ArcadeSpriteCanvasPlacement;
  imageSmoothingEnabled?: boolean;
  smoothing?: boolean;
  snapToPixels?: boolean;
  compositeOperation?: GlobalCompositeOperation;
}>;

export type ArcadeSpriteContactSheetOptions = ArcadeSpriteContactSheetDrawOptions;

export declare function drawArcadeSpriteCanvasFrame(
  context: ArcadeSpriteCanvasContext,
  image: CanvasImageSource,
  frame: ArcadeSpriteInspectableFrame,
  options?: ArcadeSpriteCanvasDrawOptions,
): ArcadeSpriteFrameGeometry;

export declare const drawArcadeSpriteCanvas: typeof drawArcadeSpriteCanvasFrame;

export type ArcadeSpriteContactSheetEntry = Readonly<{
  image?: CanvasImageSource;
  source?: CanvasImageSource;
  id?: string;
  frame: ArcadeSpriteInspectableFrame;
  label?: string;
  scale?: number;
  flipX?: boolean;
  opacity?: number;
}>;

export type ArcadeSpriteContactSheetLayoutOptions = Readonly<{
  columns?: number;
  cellWidth?: number;
  cellHeight?: number;
  gap?: number;
  padding?: number;
  labelHeight?: number;
  contentPadding?: number;
}>;

export type ArcadeSpriteContactSheetCell = Readonly<{
  index: number;
  column: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: ArcadeSpritePixelRectangle;
  label: string;
  labelBounds: ArcadeSpritePixelRectangle;
  scale: number;
  drawX: number;
  drawY: number;
  flipX: boolean;
  pivot: Readonly<{ x: number; y: number }>;
}>;

export type ArcadeSpriteContactSheetLayout = Readonly<{
  width: number;
  height: number;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  gap: number;
  padding: number;
  labelHeight: number;
  cells: readonly ArcadeSpriteContactSheetCell[];
}>;

export type ArcadeSpriteContactSheetDrawOptions = ArcadeSpriteContactSheetLayoutOptions & Readonly<{
  resizeCanvas?: boolean;
  maximumScale?: number;
  imageSmoothingEnabled?: boolean;
  smoothing?: boolean;
  snapToPixels?: boolean;
  showPivot?: boolean;
  debugPivot?: boolean;
  debugFrame?: boolean;
  pivotRadius?: number;
  background?: string | CanvasGradient | CanvasPattern | null;
  cellBackground?: string | CanvasGradient | CanvasPattern;
  cellBorder?: string | CanvasGradient | CanvasPattern;
  pivotColor?: string | CanvasGradient | CanvasPattern;
  labelColor?: string | CanvasGradient | CanvasPattern;
  font?: string;
}>;

export type ArcadeSpriteContactSheetRenderEntry = Readonly<{
  index: number;
  geometry: ArcadeSpriteFrameGeometry;
  scale: number;
  drawX: number;
  drawY: number;
}>;

export type ArcadeSpriteContactSheetRenderResult = ArcadeSpriteContactSheetLayout & Readonly<{
  layout: ArcadeSpriteContactSheetLayout;
  rendered: readonly ArcadeSpriteContactSheetRenderEntry[];
}>;

export declare function createArcadeSpriteContactSheetLayout(
  entries: readonly unknown[],
  options?: ArcadeSpriteContactSheetLayoutOptions,
): ArcadeSpriteContactSheetLayout;

export declare function drawArcadeSpriteContactSheetCanvas(
  context: ArcadeSpriteCanvasContext,
  entries: readonly ArcadeSpriteContactSheetEntry[],
  options?: ArcadeSpriteContactSheetDrawOptions,
): ArcadeSpriteContactSheetRenderResult;

export type SnapshotValue =
  | null
  | boolean
  | number
  | string
  | SnapshotValue[]
  | { [key: string]: SnapshotValue | undefined };

export type SnapshotHashOptions = {
  precision?: number;
  ignoreKeys?: readonly string[];
};

export declare function stableSnapshot(
  value: SnapshotValue,
  options?: SnapshotHashOptions,
): SnapshotValue;
export declare function stableSnapshotString(
  value: SnapshotValue,
  options?: SnapshotHashOptions,
): string;
export declare function fnv1a32(input: string): string;
export declare function deterministicHash(
  value: SnapshotValue,
  options?: SnapshotHashOptions,
): string;

export type ArcadeCommandEntry<Command extends SnapshotValue = SnapshotValue> = {
  tick: number;
  sequence: number;
  command: Command;
};

export type ArcadeCommandStream<Command extends SnapshotValue = SnapshotValue> = {
  version: 1;
  startTick: number;
  endTick: number;
  metadata: SnapshotValue;
  entries: ArcadeCommandEntry<Command>[];
};

export type ArcadeCommandRecorder<Command extends SnapshotValue = SnapshotValue> = {
  record(command: Command, atTick?: number): ArcadeCommandEntry<Command>;
  advance(amount?: number): number;
  setTick(nextTick: number): number;
  snapshot(): ArcadeCommandStream<Command>;
  serialize(): string;
  clear(nextTick?: number): ArcadeCommandRecorder<Command>;
  readonly tick: number;
  readonly size: number;
};

export declare function createCommandRecorder<Command extends SnapshotValue = SnapshotValue>(
  options?: {
    startTick?: number;
    capacity?: number;
    metadata?: SnapshotValue;
  },
): ArcadeCommandRecorder<Command>;

export declare function serializeCommandStream<Command extends SnapshotValue>(
  stream: ArcadeCommandStream<Command>,
): string;
export declare function parseCommandStream(serialized: string): ArcadeCommandStream;

export type ArcadeReplayContext<Command extends SnapshotValue = SnapshotValue> = Readonly<{
  index: number;
  tick: number;
  sequence: number;
  command: Command | null;
  stream: ArcadeCommandStream<Command>;
}>;

export type ArcadeReplayFrame = {
  index: number;
  tick: number;
  sequence: number;
  hash: string;
  snapshot?: SnapshotValue;
};

export type ArcadeReplayResult<State, Command extends SnapshotValue = SnapshotValue> = {
  stream: ArcadeCommandStream<Command>;
  finalState: State;
  frames: ArcadeReplayFrame[];
  finalHash: string;
};

export declare function replayCommandStream<State, Command extends SnapshotValue>(options: {
  initialState: State;
  stream: ArcadeCommandStream<Command> | string;
  reduce: (
    state: State,
    command: Command,
    context: ArcadeReplayContext<Command>,
  ) => State;
  snapshot?: (state: State, context: ArcadeReplayContext<Command>) => SnapshotValue;
  cloneInitialState?: (state: State) => State;
  hashOptions?: SnapshotHashOptions;
  includeSnapshots?: boolean;
}): ArcadeReplayResult<State, Command>;

export type ReplayHashFrame = {
  hash?: string;
  frameHash?: string;
};

export type ReplayMismatch = {
  index: number;
  expected: string;
  actual: string;
};

export declare function verifyReplayHashes(
  actual: readonly ReplayHashFrame[] | { frames: readonly ReplayHashFrame[] },
  expectedHashes: readonly string[],
): ReplayMismatch[];

export type SnapshotDiffEntry = {
  path: string;
  left: SnapshotValue | undefined;
  right: SnapshotValue | undefined;
};

export declare function diffSnapshots(input: {
  left: SnapshotValue;
  right: SnapshotValue;
  ignorePaths?: readonly string[];
  hashOptions?: SnapshotHashOptions;
}): SnapshotDiffEntry[];

export type ArcadeEventHandler<Payload> = (payload: Payload) => void;

export type ArcadeEventBusSnapshot<EventKey = PropertyKey> = Readonly<{
  eventCount: number;
  listenerCount: number;
  emittedEvents: number;
  events: readonly Readonly<{ event: EventKey; listeners: number }>[];
}>;

export type ArcadeEventBus<Events extends object> = {
  on<Key extends keyof Events>(
    event: Key,
    handler: ArcadeEventHandler<Events[Key]>,
  ): () => void;
  once<Key extends keyof Events>(
    event: Key,
    handler: ArcadeEventHandler<Events[Key]>,
  ): () => void;
  off<Key extends keyof Events>(event?: Key, handler?: ArcadeEventHandler<Events[Key]>): boolean;
  clear<Key extends keyof Events>(event?: Key): boolean;
  emit<Key extends keyof Events>(event: Key, payload: Events[Key]): number;
  hasListeners<Key extends keyof Events>(event: Key): boolean;
  listenerCount<Key extends keyof Events>(event?: Key): number;
  snapshot(): ArcadeEventBusSnapshot<keyof Events>;
};

export declare function createEventBus<Events extends object>(): ArcadeEventBus<Events>;

export type RecyclingPoolResetReason = 'acquire' | 'release' | 'clear';

export type RecyclingPoolResetContext = Readonly<{
  index: number;
  reason: RecyclingPoolResetReason;
  recycled: boolean;
  generation: number;
}>;

export type RecyclingPoolAcquireContext = Readonly<{
  index: number;
  recycled: boolean;
  generation: number;
}>;

export type RecyclingPoolSnapshot = Readonly<{
  capacity: number;
  active: number;
  acquired: number;
  released: number;
  recycled: number;
}>;

export type RecyclingPool<Value> = {
  acquire(initializer?: (value: Value, context: RecyclingPoolAcquireContext) => void): Value;
  release(value: Value): boolean;
  clear(): number;
  forEachActive(callback: (value: Value, index: number, generation: number) => void): void;
  activeValues(): Value[];
  values(): Value[];
  isActive(value: Value): boolean;
  snapshot(): RecyclingPoolSnapshot;
  readonly capacity: number;
};

export declare function createRecyclingPool<Value>(options: {
  capacity: number;
  create: (index: number) => Value;
  reset?: (value: Value, context: RecyclingPoolResetContext) => void;
}): RecyclingPool<Value>;

export type BufferedInputEntry<Value> = Readonly<{ value: Value; at: number; sequence: number }>;
export type BufferedInputQueue<Value> = Readonly<{
  window: number;
  capacity: number;
  nextSequence: number;
  entries: readonly BufferedInputEntry<Value>[];
}>;
export type BufferedInputSearchOptions<Value> = Readonly<{
  predicate?: (value: Value, entry: BufferedInputEntry<Value>) => boolean;
  order?: 'latest' | 'oldest';
}>;
export declare function createBufferedInputQueue<Value = unknown>(options?: { window?: number; capacity?: number }): BufferedInputQueue<Value>;
export declare function pruneBufferedInputQueue<Value>(queue: BufferedInputQueue<Value>, now: number): BufferedInputQueue<Value>;
export declare function pushBufferedInput<Value>(queue: BufferedInputQueue<Value>, value: Value, at: number): BufferedInputQueue<Value>;
export declare function peekBufferedInput<Value>(queue: BufferedInputQueue<Value>, now: number, options?: BufferedInputSearchOptions<Value>): Readonly<{ entry: BufferedInputEntry<Value> | null; value: Value | null; queue: BufferedInputQueue<Value> }>;
export declare function consumeBufferedInput<Value>(queue: BufferedInputQueue<Value>, now: number, options?: BufferedInputSearchOptions<Value>): Readonly<{ entry: BufferedInputEntry<Value> | null; value: Value | null; queue: BufferedInputQueue<Value> }>;

export type ArcadeGridDirection = 'left' | 'right' | 'up' | 'down' | 'next' | 'previous';
export type ArcadeGridFocusOptions = Readonly<{
  columns?: number;
  wrap?: boolean;
  wrapX?: boolean;
  wrapY?: boolean;
  horizontalMode?: 'row' | 'sequence';
  preferredColumn?: number;
  isAvailable?: (index: number) => boolean;
}>;
export declare function resolveGridFocusIndex(index: number, direction: ArcadeGridDirection, itemCount: number, options?: ArcadeGridFocusOptions): number;

export type ArcadeGridFocusItem = Readonly<{
  id: string;
  disabled?: boolean;
  hidden?: boolean;
  onActivate?(item: ArcadeGridFocusItem): void;
}>;
export declare function createGridFocusNavigator(options?: {
  items?: readonly ArcadeGridFocusItem[];
  columns?: number;
  initialId?: string;
  wrap?: boolean;
  wrapX?: boolean;
  wrapY?: boolean;
  horizontalMode?: 'row' | 'sequence';
  events?: ArcadeEventBus<any>;
}): {
  events: ArcadeEventBus<any>;
  setItems(items: readonly ArcadeGridFocusItem[], columns?: number): ArcadeGridFocusItem | null;
  current(): ArcadeGridFocusItem | null;
  index(): number;
  focus(id: string, reason?: string): boolean;
  focusIndex(index: number, reason?: string): boolean;
  move(direction: ArcadeGridDirection): ArcadeGridFocusItem | null;
  moveBy(direction: ArcadeGridDirection, amount?: number): ArcadeGridFocusItem | null;
  activate(): boolean;
  snapshot(): Readonly<{ focusedId: string | null; focusedIndex: number; preferredColumn: number; columns: number; items: readonly unknown[] }>;
};

export type ArcadeUiNavigationDirection = 'up' | 'down' | 'left' | 'right' | string;
export declare function createUiNavigationRepeater<Direction extends ArcadeUiNavigationDirection = 'up' | 'down' | 'left' | 'right'>(options?: {
  directions?: readonly Direction[];
  initialDelay?: number;
  repeatInterval?: number;
  maximumTriggersPerStep?: number;
  mode?: 'all' | 'dominant';
  events?: ArcadeEventBus<any>;
}): {
  events: ArcadeEventBus<any>;
  step(input?: Partial<Record<Direction, boolean>>, delta?: number): readonly Direction[];
  reset(direction?: Direction): Readonly<Record<string, unknown>>;
  snapshot(): Readonly<{ directions: readonly Direction[]; initialDelay: number; repeatInterval: number; states: Readonly<Record<Direction, Readonly<{ held: boolean; untilRepeat: number }>>> }>;
};

export type TimelineQueueEntry<Value> = Readonly<{
  at: number;
  sequence: number;
  value: Value;
}>;
export type TimelineQueueState<Value> = Readonly<{
  time: number;
  nextSequence: number;
  entries: readonly TimelineQueueEntry<Value>[];
}>;
export declare function createTimelineQueue<Value>(
  values?: readonly Value[],
  options?: { time?: number; getAt?: (value: Value, time: number, sequence: number) => number },
): TimelineQueueState<Value>;
export declare function enqueueTimelineEntry<Value>(
  state: TimelineQueueState<Value>,
  value: Value,
  options?: { at?: number; getAt?: (value: Value, time: number, sequence: number) => number },
): TimelineQueueState<Value>;
export declare function stepTimelineQueue<Value>(
  state: TimelineQueueState<Value>,
  delta: number,
): Readonly<{
  state: TimelineQueueState<Value>;
  due: readonly Value[];
  pending: readonly Value[];
}>;

export type TimedEffectState<Kind extends string = string, Payload = unknown> = {
  id: string;
  kind: Kind;
  sourceId?: string;
  duration: number;
  remaining: number;
  stacks: number;
  maxStacks: number;
  magnitude: number;
  tickInterval?: number;
  tickTimer?: number;
  payload?: Payload;
};
export type TimedEffectEvent<Effect extends TimedEffectState = TimedEffectState> = Readonly<
  | { kind: 'tick'; effect: Readonly<Effect>; tickIndex: number }
  | { kind: 'expired'; effect: Readonly<Effect> }
>;
export declare function applyTimedEffect<Effect extends TimedEffectState>(
  effects: readonly Effect[],
  incoming: Effect,
  options?: {
    match?: 'id' | 'kind' | 'id-or-kind';
    merge?: 'replace' | 'stack';
    refreshDuration?: 'max' | 'incoming';
    magnitude?: 'max' | 'incoming' | 'add';
    position?: 'replace' | 'append';
  },
): Readonly<{
  effects: readonly Effect[];
  event: Readonly<{ kind: 'applied' | 'replaced' | 'stacked'; effect: Readonly<Effect> }>;
}>;
export declare function stepTimedEffects<Effect extends TimedEffectState>(
  effects: readonly Effect[],
  delta: number,
): Readonly<{
  effects: readonly Effect[];
  advanced: readonly Readonly<Effect>[];
  events: readonly TimedEffectEvent<Effect>[];
}>;
export declare function hasTimedEffect<Effect extends TimedEffectState>(
  effects: readonly Effect[],
  value: string,
  options?: { field?: 'id' | 'kind' },
): boolean;

export type ActionPhase = 'startup' | 'active' | 'recovery' | 'done';
export type ActionOutcome = 'none' | 'hit' | 'block' | 'whiff';
export type ActionCancelRule = Readonly<{
  into?: string;
  fromPhase?: ActionPhase;
  requiresHitConfirm?: boolean;
  onHitCancelInto?: readonly string[];
  onBlockCancelInto?: readonly string[];
  onWhiffCancelInto?: readonly string[];
}>;
export type ActionPhaseDefinition = Readonly<{
  id: string;
  startup: number;
  active: number;
  recovery: number;
  cancelInto?: readonly string[];
  cancelRules?: readonly ActionCancelRule[];
  requiresHitConfirm?: boolean;
  onHitCancelInto?: readonly string[];
  onBlockCancelInto?: readonly string[];
  onWhiffCancelInto?: readonly string[];
}>;
export type ActionPhaseState = Readonly<{
  actionId: string;
  elapsed: number;
  phase: ActionPhase;
  hitConfirmed: boolean;
  lastOutcome: ActionOutcome;
}>;
export type ActionCancelRouteResult = Readonly<{
  allowed: boolean;
  routes: readonly string[];
  reason?: 'phase' | 'requires-hit-confirm' | 'not-routed';
}>;
export type ActionPhaseEvent = Readonly<{
  kind: 'phase-enter' | 'completed';
  phase: ActionPhase;
  actionId: string;
  elapsed: number;
}>;
export type ActionPhaseStepResult = Readonly<{
  state: ActionPhaseState;
  previousPhase: ActionPhase;
  enteredPhases: readonly ActionPhase[];
  events: readonly ActionPhaseEvent[];
  becameActive: boolean;
  canCancel: boolean;
  finished: boolean;
}>;
export type ActionPhaseProgress = Readonly<{
  phase: ActionPhase;
  elapsed: number;
  elapsedInPhase: number;
  duration: number;
  progress: number;
  phaseStart: number;
  phaseEnd: number;
  totalDuration: number;
}>;
export declare const ARCADE_ACTION_PHASES: readonly ActionPhase[];
export declare const ARCADE_ACTION_OUTCOMES: readonly ActionOutcome[];
export declare function getActionPhase(definition: ActionPhaseDefinition, elapsed: number): ActionPhase;
export declare function getActionPhaseProgress(
  definition: ActionPhaseDefinition,
  stateOrElapsed: ActionPhaseState | number,
): ActionPhaseProgress;
export declare function createActionPhaseState(
  definition: ActionPhaseDefinition,
  options?: { elapsed?: number; hitConfirmed?: boolean; lastOutcome?: ActionOutcome },
): ActionPhaseState;
export declare function markActionOutcome(
  state: ActionPhaseState,
  outcome?: Exclude<ActionOutcome, 'none'>,
): ActionPhaseState;
export declare function getActionCancelRoutes(
  definition: ActionPhaseDefinition,
  state: ActionPhaseState,
): ActionCancelRouteResult;
export declare function canCancelActionInto(
  definition: ActionPhaseDefinition,
  state: ActionPhaseState,
  nextActionId: string,
): boolean;
export declare function isActionPhaseActive(state: ActionPhaseState | null | undefined): boolean;
export declare function stepActionPhase(
  definition: ActionPhaseDefinition,
  state: ActionPhaseState,
  delta: number,
): ActionPhaseStepResult;

export type SystemPipelineControl = Readonly<{
  halt?: boolean;
  skipPhase?: boolean | string;
  skipPhases?: readonly string[];
}>;
export type SystemPipelineFrame<Context> = Readonly<{
  pipeline: SystemPipeline<Context>;
  run: number;
  index: number;
  name: string;
  phase: string;
}>;
export type SystemPipelineOptions<Context> = {
  phase?: string;
  order?: number;
  priority?: number;
  enabled?: boolean;
  before?: string | readonly string[];
  after?: string | readonly string[];
  when?: (context: Context) => boolean;
};
export type SystemPipelineSnapshot = Readonly<{
  phases: readonly string[];
  runs: number;
  executions: number;
  systems: readonly Readonly<{
    name: string;
    phase: string;
    order: number;
    priority: number;
    enabled: boolean;
    before: readonly string[];
    after: readonly string[];
    sequence: number;
    executions: number;
  }>[];
}>;
export type SystemPipelineRunResult<Context> = Readonly<{
  context: Context;
  halted: boolean;
  executed: readonly string[];
  skippedPhases: readonly string[];
  results: readonly Readonly<{ name: string; phase: string; result: unknown }>[];
}>;
export type SystemPipeline<Context> = {
  add(
    name: string,
    update: (context: Context, frame: SystemPipelineFrame<Context>) => void | SystemPipelineControl,
    options?: SystemPipelineOptions<Context>,
  ): () => boolean;
  remove(name: string): boolean;
  has(name: string): boolean;
  setEnabled(name: string, enabled: boolean): SystemPipeline<Context>;
  run(context: Context, options?: { phases?: string | readonly string[] }): SystemPipelineRunResult<Context>;
  names(): string[];
  snapshot(): SystemPipelineSnapshot;
};
export declare function createSystemPipeline<Context = unknown>(options?: {
  phases?: readonly string[];
}): SystemPipeline<Context>;

export type EntityWorldEntry<Entity> = Readonly<{
  id: string;
  sequence: number;
  entity: Entity;
}>;
export type EntityWorldState<Entity> = Readonly<{
  revision: number;
  nextSequence: number;
  entities: readonly EntityWorldEntry<Entity>[];
}>;
export type EntityCommand<Entity> = Readonly<
  | { kind: 'spawn'; id: string; sequence: number; entity: Entity; onDuplicate: 'error' | 'replace' | 'ignore' }
  | { kind: 'despawn'; id: string; sequence: number; onMissing: 'error' | 'ignore' }
  | { kind: 'replace'; id: string; sequence: number; entity: Entity; onMissing: 'error' | 'ignore' | 'spawn' }
  | { kind: 'patch'; id: string; sequence: number; patch: Partial<Entity>; onMissing: 'error' | 'ignore' }
>;
export type EntityCommandBuffer<Entity> = Readonly<{
  nextSequence: number;
  commands: readonly EntityCommand<Entity>[];
}>;
export type EntityCommandEvent<Entity> = Readonly<{
  kind: 'spawned' | 'despawned' | 'replaced' | 'patched' | 'ignored';
  id: string;
  commandKind: EntityCommand<Entity>['kind'];
  commandSequence: number;
  reason?: 'duplicate' | 'missing';
  previous?: Entity;
  entity?: Entity;
}>;
export declare function createEntityWorld<Entity>(
  entities?: readonly Entity[],
  options?: { getId?: (entity: Entity) => string; revision?: number },
): EntityWorldState<Entity>;
export declare function createEntityCommandBuffer<Entity>(
  commands?: readonly EntityCommand<Entity>[],
  options?: { nextSequence?: number },
): EntityCommandBuffer<Entity>;
export declare function queueEntitySpawn<Entity>(
  buffer: EntityCommandBuffer<Entity>,
  entity: Entity,
  options?: { id?: string; getId?: (entity: Entity) => string; onDuplicate?: 'error' | 'replace' | 'ignore' },
): EntityCommandBuffer<Entity>;
export declare function queueEntityDespawn<Entity>(
  buffer: EntityCommandBuffer<Entity>,
  id: string,
  options?: { onMissing?: 'error' | 'ignore' },
): EntityCommandBuffer<Entity>;
export declare function queueEntityReplace<Entity>(
  buffer: EntityCommandBuffer<Entity>,
  id: string,
  entity: Entity,
  options?: { onMissing?: 'error' | 'ignore' | 'spawn' },
): EntityCommandBuffer<Entity>;
export declare function queueEntityPatch<Entity>(
  buffer: EntityCommandBuffer<Entity>,
  id: string,
  patch: Partial<Entity>,
  options?: { onMissing?: 'error' | 'ignore' },
): EntityCommandBuffer<Entity>;
export declare function flushEntityCommands<Entity>(
  world: EntityWorldState<Entity>,
  buffer: EntityCommandBuffer<Entity>,
): Readonly<{
  world: EntityWorldState<Entity>;
  buffer: EntityCommandBuffer<Entity>;
  events: readonly EntityCommandEvent<Entity>[];
  changed: boolean;
}>;
export declare function getEntityWorldEntry<Entity>(world: EntityWorldState<Entity>, id: string): EntityWorldEntry<Entity> | undefined;
export declare function getEntityWorldValue<Entity>(world: EntityWorldState<Entity>, id: string): Entity | undefined;
export declare function hasEntityWorldValue<Entity>(world: EntityWorldState<Entity>, id: string): boolean;
export declare function entityWorldIds<Entity>(world: EntityWorldState<Entity>): readonly string[];
export declare function entityWorldValues<Entity>(world: EntityWorldState<Entity>): readonly Entity[];
export declare function queryEntityWorld<Entity>(
  world: EntityWorldState<Entity>,
  options?: { ids?: readonly string[]; predicate?: (entity: Entity, entry: EntityWorldEntry<Entity>) => boolean },
): readonly Entity[];
export type EntityRegistry<Entity> = {
  queueSpawn(entity: Entity, options?: { id?: string; onDuplicate?: 'error' | 'replace' | 'ignore' }): EntityRegistry<Entity>;
  queueDespawn(id: string, options?: { onMissing?: 'error' | 'ignore' }): EntityRegistry<Entity>;
  queueReplace(id: string, entity: Entity, options?: { onMissing?: 'error' | 'ignore' | 'spawn' }): EntityRegistry<Entity>;
  queuePatch(id: string, patch: Partial<Entity>, options?: { onMissing?: 'error' | 'ignore' }): EntityRegistry<Entity>;
  flush(): ReturnType<typeof flushEntityCommands<Entity>>;
  reset(entities?: readonly Entity[]): EntityRegistry<Entity>;
  get(id: string): Entity | undefined;
  has(id: string): boolean;
  ids(): readonly string[];
  values(): readonly Entity[];
  query(options?: { ids?: readonly string[]; predicate?: (entity: Entity, entry: EntityWorldEntry<Entity>) => boolean }): readonly Entity[];
  snapshot(): EntityWorldState<Entity>;
  pending(): EntityCommandBuffer<Entity>;
};
export declare function createEntityRegistry<Entity>(
  entities?: readonly Entity[],
  options?: { getId?: (entity: Entity) => string; revision?: number },
): EntityRegistry<Entity>;

export type ArcadeResourcePool = Readonly<{
  id: string;
  value: number;
  min: number;
  max: number;
  regenPerUnit: number;
  decayPerUnit: number;
  precision: number;
  metadata?: unknown;
}>;
export type ArcadeResourcePoolInput = Readonly<{
  id?: string;
  kind?: string;
  value: number;
  min?: number;
  minimum?: number;
  max?: number;
  maximum?: number;
  regenPerUnit?: number;
  regenPerSecond?: number;
  decayPerUnit?: number;
  decayPerSecond?: number;
  precision?: number;
  metadata?: unknown;
}>;
export type ArcadeResourcePoolState = Readonly<{
  ownerId: string;
  revision: number;
  pools: readonly ArcadeResourcePool[];
}>;
export type ArcadeResourceCost = Readonly<{ resourceId?: string; id?: string; kind?: string; amount: number }>;
export type ArcadeResourceEventKind = 'regenerated' | 'decayed' | 'blocked' | 'spent' | 'gained' | 'set';
export type ArcadeResourceEvent = Readonly<{
  kind: ArcadeResourceEventKind;
  ownerId: string;
  resourceId: string;
  amount: number;
  before: number;
  after: number;
  reason?: string;
}>;
export declare function createResourcePoolState(ownerId: PropertyKey, pools?: readonly ArcadeResourcePoolInput[], options?: { revision?: number }): ArcadeResourcePoolState;
export declare function getResourcePool(state: ArcadeResourcePoolState, resourceId: PropertyKey): ArcadeResourcePool | null;
export declare function getResourceRatio(state: ArcadeResourcePoolState, resourceId: PropertyKey): number;
export declare function stepResourcePools(state: ArcadeResourcePoolState, delta: number, options?: {
  canRegenerate?: (pool: ArcadeResourcePool, state: ArcadeResourcePoolState) => boolean;
  canDecay?: (pool: ArcadeResourcePool, state: ArcadeResourcePoolState) => boolean;
}): Readonly<{ state: ArcadeResourcePoolState; events: readonly ArcadeResourceEvent[]; changed: boolean }>;
export declare function canPayResourceCosts(state: ArcadeResourcePoolState, costs: readonly ArcadeResourceCost[]): boolean;
export declare function payResourceCosts(state: ArcadeResourcePoolState, costs: readonly ArcadeResourceCost[], options?: { reason?: string }): Readonly<{ state: ArcadeResourcePoolState; events: readonly ArcadeResourceEvent[]; ok: boolean }>;
export declare function gainResource(state: ArcadeResourcePoolState, resourceId: PropertyKey, amount: number, options?: { reason?: string }): Readonly<{ state: ArcadeResourcePoolState; events: readonly ArcadeResourceEvent[]; changed: boolean }>;
export declare function setResourceValue(state: ArcadeResourcePoolState, resourceId: PropertyKey, value: number, options?: { reason?: string }): Readonly<{ state: ArcadeResourcePoolState; events: readonly ArcadeResourceEvent[]; changed: boolean }>;

export type ArcadeGameplayActionDefinition = Readonly<{
  id: string;
  cooldown?: number;
  costs?: readonly ArcadeResourceCost[];
  queueWindow?: number;
  metadata?: unknown;
}>;
export type ArcadeGameplayActionState = Readonly<{
  ownerId: string;
  cooldowns: Readonly<Record<string, number>>;
  resources: ArcadeResourcePoolState;
  queuedActionId: string | null;
  queueRemaining: number;
  revision: number;
}>;
export type ArcadeGameplayActionEvent = Readonly<{
  kind: 'started' | 'cooldown' | 'blocked' | 'queued' | 'queue-expired' | 'resource';
  ownerId: string;
  actionId?: string;
  remaining?: number;
  resourceEvent?: ArcadeResourceEvent;
}>;
export declare function createGameplayActionState(ownerId: PropertyKey, resources: ArcadeResourcePoolState, options?: {
  cooldowns?: Record<string, number>;
  queuedActionId?: string | null;
  queueRemaining?: number;
  revision?: number;
}): ArcadeGameplayActionState;
export declare function stepGameplayActionState(state: ArcadeGameplayActionState, delta: number, options?: {
  resources?: Parameters<typeof stepResourcePools>[2];
}): Readonly<{ state: ArcadeGameplayActionState; events: readonly ArcadeGameplayActionEvent[]; changed: boolean }>;
export declare function tryStartGameplayAction(state: ArcadeGameplayActionState, action: ArcadeGameplayActionDefinition, options?: {
  queueIfBlocked?: boolean;
  reason?: string;
}): Readonly<{
  state: ArcadeGameplayActionState;
  events: readonly ArcadeGameplayActionEvent[];
  ok: boolean;
  reason: 'cooldown' | 'resource' | null;
}>;

export type ArcadeActionGraceState = Readonly<{
  graceDuration: number;
  bufferDuration: number;
  graceRemaining: number;
  bufferRemaining: number;
  revision: number;
}>;
export type ArcadeActionGraceEvent = Readonly<{ kind: 'grace-expired' | 'buffer-expired' | 'buffered' | 'activated' }>;
export declare function createActionGraceState(options?: Partial<ArcadeActionGraceState>): ArcadeActionGraceState;
export declare function stepActionGrace(state: ArcadeActionGraceState, input?: {
  delta?: number;
  available?: boolean;
  requested?: boolean;
  enabled?: boolean;
  consumeOnActivate?: boolean;
  graceDuration?: number;
  bufferDuration?: number;
}): Readonly<{
  state: ArcadeActionGraceState;
  activated: boolean;
  available: boolean;
  requested: boolean;
  events: readonly ArcadeActionGraceEvent[];
}>;

export type ArcadeHudGaugeState = 'empty' | 'critical' | 'low' | 'normal' | 'full';
export type ArcadeHudGaugeSegment = Readonly<{ index: number; fill: number; active: boolean; full: boolean }>;
export interface ArcadeHudGaugeInput {
  value?: number;
  min?: number;
  minimum?: number;
  max?: number;
  maximum?: number;
  lowThreshold?: number;
  criticalThreshold?: number;
  segments?: number;
  direction?: 'forward' | 'reverse';
  time?: number;
  pulsePeriod?: number;
  pulseAmount?: number;
}
export declare function resolveHudGauge(input?: ArcadeHudGaugeInput): Readonly<{
  value: number;
  min: number;
  max: number;
  ratio: number;
  missingRatio: number;
  state: ArcadeHudGaugeState;
  warning: boolean;
  pulse: number;
  direction: 'forward' | 'reverse';
  segments: readonly ArcadeHudGaugeSegment[];
}>;

export type ArcadeResolutionEvidenceBase = Readonly<{
  approaches: readonly string[];
  counters: Readonly<Record<string, number>>;
  flags: Readonly<Record<string, boolean>>;
  durations: Readonly<Record<string, number>>;
  revision: number;
}>;

export type ArcadeResolutionEvidenceSnapshot = ArcadeResolutionEvidenceBase & Readonly<{
  constraints: Readonly<Record<string, boolean>>;
}>;

export declare function createResolutionEvidenceTracker(options?: {
  knownApproaches?: readonly string[];
  approaches?: readonly string[];
  counters?: Readonly<Record<string, number>>;
  flags?: Readonly<Record<string, boolean>>;
  durations?: Readonly<Record<string, number>>;
  constraints?: Readonly<Record<string, (snapshot: ArcadeResolutionEvidenceBase) => boolean>>;
  revision?: number;
  events?: ArcadeEventBus<any>;
}): {
  events: ArcadeEventBus<any>;
  recordApproach(id: string, metadata?: unknown): boolean;
  hasApproach(id: string): boolean;
  incrementCounter(id: string, amount?: number, metadata?: unknown): number;
  setFlag(id: string, enabled?: boolean, metadata?: unknown): boolean;
  addDuration(id: string, delta: number, metadata?: unknown): number;
  snapshot(): ArcadeResolutionEvidenceSnapshot;
  decorate<T extends object>(value: T, options?: {
    approachesKey?: string;
    constraintsKey?: string;
    evidenceKey?: string;
  }): T & Record<string, unknown>;
};

export interface ArcadeStageIssue {
  code: string;
  path: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  nodeId?: string;
  transitionId?: string;
  targetNodeId?: string;
}

export interface ArcadeStageReferenceCatalogs {
  actors?: readonly unknown[] | ReadonlySet<unknown> | ReadonlyMap<unknown, unknown> | Record<string, unknown>;
  assets?: readonly unknown[] | ReadonlySet<unknown> | ReadonlyMap<unknown, unknown> | Record<string, unknown>;
  spawnTables?: readonly unknown[] | ReadonlySet<unknown> | ReadonlyMap<unknown, unknown> | Record<string, unknown>;
  objectives?: readonly unknown[] | ReadonlySet<unknown> | ReadonlyMap<unknown, unknown> | Record<string, unknown>;
  services?: readonly unknown[] | ReadonlySet<unknown> | ReadonlyMap<unknown, unknown> | Record<string, unknown>;
  encounterPlans?: readonly unknown[] | ReadonlySet<unknown> | ReadonlyMap<unknown, unknown> | Record<string, unknown>;
}

export interface ArcadeStageTransitionDefinition {
  id?: string;
  to: string;
  signal?: string;
  on?: string;
  priority?: number;
  completeCurrent?: boolean;
  metadata?: unknown;
}

export interface ArcadeStageNodeDefinition {
  id: string;
  kind?: string;
  terminal?: boolean;
  transitions?: readonly (string | ArcadeStageTransitionDefinition)[];
  next?: string | ArcadeStageTransitionDefinition | readonly (string | ArcadeStageTransitionDefinition)[];
  actorIds?: readonly string[];
  actors?: readonly string[];
  assetIds?: readonly string[];
  assets?: readonly string[];
  spawnTableIds?: readonly string[];
  spawnTables?: readonly string[];
  objectiveIds?: readonly string[];
  objectives?: readonly string[];
  serviceIds?: readonly string[];
  services?: readonly string[];
  encounterPlanIds?: readonly string[];
  encounterPlans?: readonly string[];
  metadata?: unknown;
}

export interface ArcadeStageGraphDefinition {
  id: string;
  startNodeId?: string;
  start?: string;
  nodes: readonly ArcadeStageNodeDefinition[];
  metadata?: unknown;
}

export interface ArcadeStageTransition {
  readonly id: string;
  readonly to: string;
  readonly signal: string;
  readonly priority: number;
  readonly order: number;
  readonly completeCurrent: boolean;
  readonly metadata?: unknown;
}

export interface ArcadeStageNode {
  readonly id: string;
  readonly kind: string;
  readonly terminal: boolean;
  readonly transitions: readonly ArcadeStageTransition[];
  readonly actorIds: readonly string[];
  readonly assetIds: readonly string[];
  readonly spawnTableIds: readonly string[];
  readonly objectiveIds: readonly string[];
  readonly serviceIds: readonly string[];
  readonly encounterPlanIds: readonly string[];
  readonly metadata?: unknown;
}

export interface ArcadeStageGraph {
  readonly id: string;
  readonly startNodeId: string;
  readonly nodes: readonly ArcadeStageNode[];
  readonly metadata?: unknown;
}

export interface ArcadeStageGraphState {
  readonly graphId: string;
  readonly currentNodeId: string;
  readonly completedNodeIds: readonly string[];
  readonly visitedNodeIds: readonly string[];
  readonly status: 'active' | 'complete';
  readonly sequence: number;
  readonly revision: number;
}

export declare function validateStageGraph(definition: ArcadeStageGraphDefinition, catalogs?: ArcadeStageReferenceCatalogs): Readonly<{
  ok: boolean;
  graph: ArcadeStageGraph | null;
  errors: readonly ArcadeStageIssue[];
  warnings: readonly ArcadeStageIssue[];
}>;
export declare function createStageGraph(definition: ArcadeStageGraphDefinition, catalogs?: ArcadeStageReferenceCatalogs): ArcadeStageGraph;
export declare function getStageNode(graph: ArcadeStageGraph, nodeId: string): ArcadeStageNode | null;
export declare function createStageGraphState(graph: ArcadeStageGraph, raw?: Partial<ArcadeStageGraphState>): ArcadeStageGraphState;
export declare function getCurrentStageNode(graph: ArcadeStageGraph, state: ArcadeStageGraphState): ArcadeStageNode | null;
export declare function advanceStageGraph(
  graph: ArcadeStageGraph,
  state: ArcadeStageGraphState,
  signal?: string,
  options?: { canTransition?: (transition: ArcadeStageTransition, node: ArcadeStageNode, state: ArcadeStageGraphState, graph: ArcadeStageGraph) => boolean },
): Readonly<{ state: ArcadeStageGraphState; changed: boolean; transition: ArcadeStageTransition | null; events: readonly Readonly<Record<string, unknown>>[] }>;
export declare function inspectStageGraphState(graph: ArcadeStageGraph, state: ArcadeStageGraphState): Readonly<{
  graphId: string;
  currentNodeId: string;
  currentKind: string | null;
  status: 'active' | 'complete';
  completed: number;
  total: number;
  ratio: number;
  availableSignals: readonly string[];
  sequence: number;
  revision: number;
}>;

export interface ArcadeEncounterDefinition {
  id: string;
  kind?: string;
  delay?: number;
  actorIds?: readonly string[];
  actors?: readonly string[];
  assetIds?: readonly string[];
  assets?: readonly string[];
  spawnTableIds?: readonly string[];
  spawnTables?: readonly string[];
  objectiveIds?: readonly string[];
  objectives?: readonly string[];
  serviceIds?: readonly string[];
  services?: readonly string[];
  metadata?: unknown;
}

export interface ArcadeEncounterPlanDefinition {
  id: string;
  encounters?: readonly ArcadeEncounterDefinition[];
  steps?: readonly ArcadeEncounterDefinition[];
  metadata?: unknown;
}

export interface ArcadeEncounter {
  readonly id: string;
  readonly kind: string;
  readonly delay: number;
  readonly actorIds: readonly string[];
  readonly assetIds: readonly string[];
  readonly spawnTableIds: readonly string[];
  readonly objectiveIds: readonly string[];
  readonly serviceIds: readonly string[];
  readonly encounterPlanIds: readonly string[];
  readonly metadata?: unknown;
}

export interface ArcadeEncounterPlan {
  readonly id: string;
  readonly encounters: readonly ArcadeEncounter[];
  readonly metadata?: unknown;
}

export interface ArcadeEncounterState {
  readonly planId: string;
  readonly index: number;
  readonly currentEncounterId: string | null;
  readonly completedEncounterIds: readonly string[];
  readonly status: 'active' | 'complete';
  readonly sequence: number;
  readonly revision: number;
}

export declare function validateEncounterPlan(definition: ArcadeEncounterPlanDefinition, catalogs?: ArcadeStageReferenceCatalogs): Readonly<{
  ok: boolean;
  plan: ArcadeEncounterPlan | null;
  errors: readonly ArcadeStageIssue[];
}>;
export declare function createEncounterPlan(definition: ArcadeEncounterPlanDefinition, catalogs?: ArcadeStageReferenceCatalogs): ArcadeEncounterPlan;
export declare function createEncounterState(plan: ArcadeEncounterPlan, raw?: Partial<ArcadeEncounterState>): ArcadeEncounterState;
export declare function getCurrentEncounter(plan: ArcadeEncounterPlan, state: ArcadeEncounterState): ArcadeEncounter | null;
export declare function advanceEncounter(
  plan: ArcadeEncounterPlan,
  state: ArcadeEncounterState,
  options?: { canAdvance?: (encounter: ArcadeEncounter, state: ArcadeEncounterState, plan: ArcadeEncounterPlan) => boolean },
): Readonly<{ state: ArcadeEncounterState; changed: boolean; encounter: ArcadeEncounter | null; events: readonly Readonly<Record<string, unknown>>[] }>;
export declare function inspectEncounterState(plan: ArcadeEncounterPlan, state: ArcadeEncounterState): Readonly<{
  planId: string;
  currentEncounterId: string | null;
  status: 'active' | 'complete';
  completed: number;
  total: number;
  ratio: number;
  sequence: number;
  revision: number;
}>;

export interface ArcadeStageAssetProgress {
  readonly graphId: string;
  readonly nodeId: string;
  readonly id: string | null;
  readonly loadedCount: number;
  readonly totalCount: number;
  readonly loadedBytes: number;
  readonly declaredBytes: number;
  readonly progress: number;
}

export interface ArcadeStageAssetReadiness {
  readonly graphId: string;
  readonly nodeId: string;
  readonly assetIds: readonly string[];
  readonly scope: ReturnType<typeof createResourceScope>;
  readonly assets: Map<string, unknown>;
  readonly loadedBytes: number;
  readonly declaredBytes: number;
  readonly prewarmed: unknown | null;
  get(assetId: string): unknown;
  release(): Promise<boolean>;
}

export declare function prepareStageAssets(
  graph: ArcadeStageGraph,
  stateOrNodeId: ArcadeStageGraphState | string,
  assetLoader: ReturnType<typeof createAssetLoader>,
  manifest: ArcadeAssetManifest,
  options?: {
    scope?: ReturnType<typeof createResourceScope>;
    scopeName?: string;
    budgetBytes?: number;
    signal?: AbortSignal;
    loaders?: Record<string, Function>;
    onProgress?: (progress: ArcadeStageAssetProgress) => void;
    prewarm?: (context: Readonly<{
      graph: ArcadeStageGraph;
      node: ArcadeStageNode;
      scope: ReturnType<typeof createResourceScope>;
      assets: Map<string, unknown>;
      get(assetId: string): unknown;
      signal?: AbortSignal;
    }>) => unknown | ArcadeStageServiceInstallation | Promise<unknown | ArcadeStageServiceInstallation>;
  },
): Promise<ArcadeStageAssetReadiness>;

export interface ArcadeStageServiceScope {
  name: string;
  track<T>(resource: T, disposer?: (resource: T) => unknown | Promise<unknown>): T;
  release(): Promise<boolean>;
  snapshot(): Readonly<Record<string, unknown>>;
}

export interface ArcadeStageServiceInstallation<T = unknown> {
  resource: T;
  dispose?: (resource: T) => unknown | Promise<unknown>;
}

export type ArcadeStageServiceInstaller = (context: Readonly<{
  graph: ArcadeStageGraph;
  node: ArcadeStageNode;
  scope: ArcadeStageServiceScope;
  serviceId: string;
  options: Record<string, unknown>;
}>) => unknown | ArcadeStageServiceInstallation | Promise<unknown | ArcadeStageServiceInstallation>;

export declare function installStageServices(
  graph: ArcadeStageGraph,
  stateOrNodeId: ArcadeStageGraphState | string,
  installers: Record<string, ArcadeStageServiceInstaller> | ReadonlyMap<string, ArcadeStageServiceInstaller>,
  options?: { scope?: ArcadeStageServiceScope; scopeName?: string; [key: string]: unknown },
): Promise<Readonly<{
  graphId: string;
  nodeId: string;
  scope: ArcadeStageServiceScope;
  services: Readonly<Record<string, unknown>>;
  get(serviceId: string): unknown | null;
  release(): Promise<boolean>;
}>>;

export type HitContactRecord = Readonly<{ hits: number; lastHitTick: number }>;
export type HitContactPolicy = Readonly<{ maxHitsPerTarget?: number; rehitDelayTicks?: number; rehitDelayFrames?: number }>;
export type HitContactLedger = {
  canRegister(targetId: string, tick: number, policy?: HitContactPolicy): boolean;
  register(targetId: string, tick: number, amount?: number): HitContactRecord;
  get(targetId: string): HitContactRecord | undefined;
  has(targetId: string): boolean;
  clear(targetId?: string): number | boolean;
  targetIds(): string[];
  snapshot(): Readonly<{ size: number; records: readonly Readonly<{ targetId: string; hits: number; lastHitTick: number }>[] }>;
};
export declare function createHitContactLedger(options?: {
  records?: Map<string, Partial<HitContactRecord> & { lastHitFrame?: number }> | readonly (string | ({ targetId: string } & Partial<HitContactRecord> & { lastHitFrame?: number }))[] | Record<string, Partial<HitContactRecord> & { lastHitFrame?: number }>;
}): HitContactLedger;

export type CameraRigState = {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  lookaheadX: number;
  lookaheadY: number;
  shake: number;
  shakeX: number;
  shakeY: number;
};
export type CameraRig = CameraRigState & {
  set(patch?: Partial<CameraRigState> & { shakeOffsetX?: number; shakeOffsetY?: number }): CameraRig;
  follow(targets: readonly { x: number; y: number; weight?: number }[], options?: { offsetX?: number; offsetY?: number }): CameraRig;
  target(x: number, y?: number): CameraRig;
  addShake(intensity: number): CameraRig;
  step(delta?: number, options?: {
    velocityX?: number;
    velocityY?: number;
    lookaheadScaleX?: number;
    lookaheadScaleY?: number;
    lookaheadMinX?: number;
    lookaheadMaxX?: number;
    lookaheadMinY?: number;
    lookaheadMaxY?: number;
    lookaheadBlend?: number;
    lookaheadBlendX?: number;
    lookaheadBlendY?: number;
    lookaheadRate?: number;
    lookaheadRateX?: number;
    lookaheadRateY?: number;
    lookaheadRateSame?: number;
    lookaheadRateOpposite?: number;
    lookaheadRateSameX?: number;
    lookaheadRateOppositeX?: number;
    lookaheadRateSameY?: number;
    lookaheadRateOppositeY?: number;
    offsetX?: number;
    offsetY?: number;
    followBlend?: number;
    followBlendX?: number;
    followBlendY?: number;
    followRate?: number;
    followRateX?: number;
    followRateY?: number;
    followRateFar?: number;
    followRateFarX?: number;
    followRateFarY?: number;
    farThreshold?: number;
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    zoomTarget?: number;
    zoomBlend?: number;
    zoomRate?: number;
    rateMode?: 'linear' | 'exponential';
    shakeDecayMultiplier?: number;
    shakeDecayRate?: number;
    shakeScale?: number;
    shakeEpsilon?: number;
    random?: () => number;
  }): Readonly<CameraRigState>;
  snapshot(): Readonly<CameraRigState>;
};
export declare function createCameraRig(initial?: Partial<CameraRigState> & { shakeOffsetX?: number; shakeOffsetY?: number }): CameraRig;

export type ArcadeComputeCapability = 'aabb-overlap-pairs' | string;
export type ArcadeComputeBackendKind = 'scalar' | 'wasm' | 'webgpu' | 'custom';
export type ArcadeComputeNumericFormat = 'f64' | 'f32' | 'fixed';

export type ArcadeSpatialBatch = Readonly<{
  numericFormat: 'f64' | 'f32';
  length: number;
  ids: readonly string[];
  x: Float64Array | Float32Array;
  y: Float64Array | Float32Array;
  width: Float64Array | Float32Array;
  height: Float64Array | Float32Array;
  bodies: readonly SpatialBody[];
}>;

export interface ArcadeComputeBackend {
  readonly id: string;
  readonly kind: ArcadeComputeBackendKind;
  readonly authoritative: boolean;
  readonly numericFormat: ArcadeComputeNumericFormat;
  readonly capabilities: readonly ArcadeComputeCapability[];
  filterAabbPairs(batch: ArcadeSpatialBatch, candidatePairs: Uint32Array): Uint32Array;
}

export declare const ARCADE_COMPUTE_CAPABILITIES: readonly ArcadeComputeCapability[];
export declare function createArcadeSpatialBatch(
  bodies?: readonly SpatialBody[],
  options?: { numericFormat?: 'f64' | 'f32' },
): ArcadeSpatialBatch;
export declare function createArcadeAabbPairBuffer(
  batch: ArcadeSpatialBatch,
  pairs?: readonly (SpatialPair | readonly [SpatialBody | string, SpatialBody | string])[],
): Uint32Array;
export declare function filterArcadeAabbPairs(
  batch: ArcadeSpatialBatch,
  candidatePairs: Uint32Array,
): Uint32Array;
export declare function createArcadeScalarComputeBackend(options?: {
  id?: string;
  numericFormat?: 'f64' | 'f32';
  authoritative?: boolean;
}): ArcadeComputeBackend;
export declare function validateArcadeComputeBackend(backend: unknown): backend is ArcadeComputeBackend;
export declare function selectArcadeComputeBackend(
  backends?: readonly ArcadeComputeBackend[],
  options?: {
    capability?: ArcadeComputeCapability;
    authoritative?: boolean;
    preference?: readonly ArcadeComputeBackendKind[];
  },
): ArcadeComputeBackend | null;
export type ArcadeCameraState = {
  x: number;
  y: number;
  zoom: number;
  shakeX: number;
  shakeY: number;
  viewportWidth: number;
  viewportHeight: number;
  anchorX: number;
  anchorY: number;
};

export type ArcadeCameraTransform = {
  set(next?: Partial<ArcadeCameraState>): ArcadeCameraTransform;
  resize(viewportWidth: number, viewportHeight: number): ArcadeCameraTransform;
  snapshot(): Readonly<ArcadeCameraState>;
  worldToScreen(point: { x: number; y: number }): { x: number; y: number };
  screenToWorld(point: { x: number; y: number }): { x: number; y: number };
  applyToCanvas(context: CanvasRenderingContext2D): ArcadeCameraTransform;
  applyToContainer(container: Container): ArcadeCameraTransform;
};

export declare function createArcadeCameraTransform(
  initial?: Partial<ArcadeCameraState>,
): ArcadeCameraTransform;

export type ArcadePerformanceSummary = {
  count: number;
  lastMs: number;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
};

export type ArcadeFrameProfiler = {
  record(name: string, durationMs: number): number;
  measure<T>(name: string, callback: () => T): T;
  measureAsync<T>(name: string, callback: () => Promise<T>): Promise<T>;
  snapshot(name: string): ArcadePerformanceSummary;
  snapshot(): Readonly<Record<string, ArcadePerformanceSummary>>;
  compare(baselineName: string, candidateName: string): Readonly<{
    baseline: ArcadePerformanceSummary;
    candidate: ArcadePerformanceSummary;
    meanRatio: number;
    p95Ratio: number;
  }>;
  reset(name?: string): void;
};

export declare function createArcadeFrameProfiler(options?: {
  sampleSize?: number;
  now?: () => number;
}): ArcadeFrameProfiler;

export type ArcadeRenderPlanEntry = {
  name: string;
  layer: string;
  order?: number;
  priority?: number;
  enabled?: boolean;
  required?: boolean;
  [key: string]: unknown;
};

export declare function defineArcadeRenderPlan<T extends ArcadeRenderPlanEntry>(
  entries: readonly T[],
  options?: { layers?: readonly string[] },
): readonly Readonly<T & { order: number; priority: number; enabled: boolean }>[];

export declare function installArcadeRenderPlan(
  runtime: ArcadePixiRuntime,
  plan: readonly ArcadeRenderPlanEntry[],
  implementations: Record<
    string,
    | ArcadePixiPassOptions<any>
    | ((descriptor: ArcadeRenderPlanEntry, runtime: ArcadePixiRuntime) => ArcadePixiPassOptions<any>)
  >,
): Readonly<Record<string, ArcadePixiPassHandle<any>>>;

export type ArcadePixiFrame = {
  runtime: ArcadePixiRuntime;
  deltaMs: number;
  deltaSeconds: number;
  timeMs: number;
  tick: number;
  alpha: number;
};

export type ArcadePixiPresentation = Readonly<{
  alpha: number;
  deltaMs: number;
  timeMs: number;
  runtime: ArcadePixiRuntime;
}>;

export type ArcadePixiFixedStepHost = {
  readonly runtime: ArcadePixiRuntime;
  readonly loop: FixedStepLoop;
  readonly renderEnabled: boolean;
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  advance(elapsed: number, timeMs?: number): { updates: number; alpha: number };
  resetClock(): void;
  snapshot(): Readonly<{
    destroyed: boolean;
    suspended: boolean;
    renderEnabled: boolean;
    presentationTimeMs: number;
    presentationDeltaMs: number;
    loop: ReturnType<FixedStepLoop['snapshot']>;
  }>;
  destroy(): boolean;
};

export declare function createArcadePixiFixedStepHost(options: {
  runtime: ArcadePixiRuntime;
  update(delta: number): void;
  fixedStep?: number;
  maxFrame?: number;
  timeUnit?: TimeUnit;
  render?: boolean;
  pauseWhenHidden?: boolean;
  documentTarget?: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>;
  now?: () => number;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
  beforePresent?(presentation: ArcadePixiPresentation): void;
  afterPresent?(presentation: ArcadePixiPresentation): void;
  onSuspend?(reason: 'context-lost' | 'document-hidden'): void;
  onResume?(reason: 'context-restored' | 'document-visible'): void;
  destroyRuntime?: boolean;
}): ArcadePixiFixedStepHost;

export type ArcadePixiSpriteFrameBinding = Readonly<{
  texture: Texture;
  address: ArcadeSpriteFrameAddress;
}>;

export type ArcadePixiSpriteBank = {
  readonly manifest: ArcadeSpriteManifest;
  readonly ids: readonly string[];
  readonly loaded: boolean;
  readonly destroyed: boolean;
  sheet(sheetId: string): ArcadeSpriteSheet;
  clip(sheetId: string, animationName: string): ArcadeSpriteClip;
  load(): Promise<ArcadePixiSpriteBank>;
  frame(sheetId: string, animationName: string, frameIndex?: number): ArcadePixiSpriteFrameBinding;
  applyFrame(
    sprite: import('pixi.js').Sprite,
    sheetId: string,
    animationName: string,
    frameIndex?: number,
  ): ArcadePixiSpriteFrameBinding;
  createSprite(sheetId: string, animationName: string, frameIndex?: number): import('pixi.js').Sprite;
  destroy(options?: { unload?: boolean }): Promise<boolean>;
};

export declare function createArcadePixiSpriteBank(options: {
  PIXI: ArcadePixiNamespace;
  runtime: ArcadePixiRuntime;
  manifest: ArcadeSpriteManifestSource;
  aliasPrefix?: string;
}): ArcadePixiSpriteBank;

export type ArcadePixiSpritePlayerSnapshot = Readonly<{
  sheetId: string;
  animationName: string;
  frame: number;
  playing: boolean;
  completed: boolean;
  facing: 1 | -1;
  destroyed: boolean;
}>;

export type ArcadePixiSpritePlayerAdvance = Readonly<{
  clock: ArcadeAnimationClock;
  events: readonly ArcadeSpriteAnimationEvent[];
  texture: Texture;
  address: ArcadeSpriteFrameAddress;
}>;

export type ArcadePixiSpritePlayer = {
  readonly sprite: import('pixi.js').Sprite;
  readonly sheetId: string;
  readonly animationName: string;
  readonly clip: ArcadeSpriteClip;
  readonly clock: ArcadeAnimationClock;
  readonly facing: 1 | -1;
  readonly destroyed: boolean;
  play(animationName: string, options?: { sheetId?: string; restart?: boolean }): ArcadePixiSpritePlayer;
  advance(deltaSeconds: number): ArcadePixiSpritePlayerAdvance;
  setFacing(facing: 1 | -1): 1 | -1;
  snapshot(): ArcadePixiSpritePlayerSnapshot;
  destroy(options?: { destroySprite?: boolean }): boolean;
};

export declare function createArcadePixiSpritePlayer(options: {
  bank: ArcadePixiSpriteBank;
  sheetId: string;
  animationName: string;
  sprite?: import('pixi.js').Sprite;
  facing?: 1 | -1;
  onEvent?: (event: ArcadeSpriteAnimationEvent, player: ArcadePixiSpritePlayer) => void;
}): ArcadePixiSpritePlayer;

export type ArcadePixiTelemetry = {
  version: string;
  backend: unknown;
  contextLosses: number;
  contextRestores: number;
  contextState: 'ready' | 'lost';
  assetsLoaded: number;
  framesRendered: number;
  ticks: number;
  elapsedMs: number;
  lastDeltaMs: number;
  resizeCount: number;
  logicalWidth: number;
  logicalHeight: number;
  running: boolean;
  paused: boolean;
  destroyed: boolean;
  layerNames: string[];
  systemNames: string[];
  passNames: string[];
  activePassNames: string[];
  performance: Record<string, ArcadePerformanceSummary>;
};

export type ArcadePixiPassContext<State = unknown> = {
  runtime: ArcadePixiRuntime;
  name: string;
  layerName: string;
  layer: Container;
  container: Container;
  readonly state: State;
};

export type ArcadePixiPassOptions<State = unknown> = {
  layer: string;
  priority?: number;
  order?: number;
  enabled?: boolean;
  destroyChildren?: boolean;
  cullable?: boolean;
  cullableChildren?: boolean;
  cullArea?: unknown;
  renderGroup?: boolean;
  create?: (pass: ArcadePixiPassContext<State>) => State;
  update?: (frame: ArcadePixiFrame, pass: ArcadePixiPassContext<State>) => void;
  resize?: (
    size: { width: number; height: number; runtime: ArcadePixiRuntime },
    pass: ArcadePixiPassContext<State>,
  ) => void;
  destroy?: (pass: ArcadePixiPassContext<State>) => void;
};

export type ArcadePixiPassHandle<State = unknown> = {
  readonly name: string;
  readonly layerName: string;
  readonly container: Container;
  readonly state: State;
  readonly enabled: boolean;
  setEnabled(enabled: boolean): void;
  clear(options?: { destroy?: boolean; children?: boolean; texture?: boolean; textureSource?: boolean }): number;
  remove(): boolean;
};

export type ArcadePixiRuntimeOptions = {
  PIXI: ArcadePixiNamespace;
  mount?: HTMLElement | (() => HTMLElement | null) | null;
  logicalWidth: number;
  logicalHeight: number;
  layers?: readonly string[];
  background?: number | string;
  backgroundAlpha?: number;
  canvasId?: string;
  resolution?: number;
  preference?: 'webgl' | 'webgpu';
  antialias?: boolean;
  autoStart?: boolean;
  autoRender?: boolean;
  observeResize?: boolean | HTMLElement | (() => HTMLElement | null);
  pauseWhenHidden?: boolean;
  onTelemetry?: (telemetry: ArcadePixiTelemetry) => void;
  onResize?: (size: { width: number; height: number; runtime: ArcadePixiRuntime }) => void;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
  performanceNow?: () => number;
  performanceSampleSize?: number;
  performanceSummaryEvery?: number;
};

export type ArcadePixiRuntime = {
  readonly version: string;
  readonly app: Application;
  readonly canvas: HTMLCanvasElement;
  readonly stage: Container;
  readonly layers: Map<string, Container>;
  readonly running: boolean;
  readonly destroyed: boolean;
  layer(name: string): Container;
  clearLayer(name: string, options?: { destroy?: boolean; children?: boolean; texture?: boolean; textureSource?: boolean }): number;
  addPass<State = unknown>(name: string, options: ArcadePixiPassOptions<State>): ArcadePixiPassHandle<State>;
  pass<State = unknown>(name: string): ArcadePixiPassHandle<State>;
  clearPass(name: string, options?: { destroy?: boolean; children?: boolean; texture?: boolean; textureSource?: boolean }): number;
  removePass(name: string): boolean;
  setPassEnabled(name: string, enabled: boolean): void;
  addSystem(name: string, update: (frame: ArcadePixiFrame) => void, options?: { priority?: number; enabled?: boolean }): () => boolean;
  removeSystem(name: string): boolean;
  setSystemEnabled(name: string, enabled: boolean): void;
  on(eventName: string, callback: (payload: unknown) => void): () => void;
  emit(eventName: string, payload?: unknown): void;
  track(disposer: () => void): () => boolean;
  loadTexture(alias: string, src: string): Promise<Texture>;
  unloadTexture(alias: string): Promise<boolean>;
  loadTextures(manifest: Record<string, string> | Array<{ alias: string; src: string }>): Promise<Record<string, Texture>>;
  texture(alias: string): Texture | undefined;
  resize(width: number, height: number): void;
  resizeFromTarget(): void;
  render(): void;
  step(deltaMs?: number, timeMs?: number, render?: boolean, alpha?: number): void;
  start(reason?: string): void;
  pause(reason?: string): void;
  resume(reason?: string): void;
  snapshot(): ArcadePixiTelemetry;
  performanceSnapshot(name: string): ArcadePerformanceSummary;
  performanceSnapshot(): Readonly<Record<string, ArcadePerformanceSummary>>;
  resetPerformance(name?: string): void;
  destroy(removeCanvas?: boolean): void;
};

export declare function createArcadePixiRuntime(options: ArcadePixiRuntimeOptions): Promise<ArcadePixiRuntime>;

export type CanvasTexturePassState = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: Texture;
  sprite: import('pixi.js').Sprite;
  width: number;
  height: number;
  dirty: boolean;
  redraws: number;
  skippedFrames: number;
  invalidate(): void;
};

export type CanvasTexturePassOptions = {
  PIXI: ArcadePixiNamespace;
  name?: string;
  layer?: string;
  draw: (
    context: CanvasRenderingContext2D,
    frame: ArcadePixiFrame,
    pass: ArcadePixiPassContext<CanvasTexturePassState>,
  ) => void;
  width?: number;
  height?: number;
  priority?: number;
  order?: number;
  enabled?: boolean;
  clear?: boolean;
  resizeWithRuntime?: boolean;
  shouldDraw?: (
    frame: ArcadePixiFrame,
    pass: ArcadePixiPassContext<CanvasTexturePassState>,
  ) => boolean;
  canvasFactory?: (width: number, height: number) => HTMLCanvasElement;
  onResize?: (
    size: { width: number; height: number; runtime: ArcadePixiRuntime },
    pass: ArcadePixiPassContext<CanvasTexturePassState>,
  ) => void;
};

export declare function createCanvasTexturePassOptions(
  options: CanvasTexturePassOptions,
): ArcadePixiPassOptions<CanvasTexturePassState>;

export declare function createCanvasTexturePass(
  runtime: ArcadePixiRuntime,
  options: CanvasTexturePassOptions & { name: string; layer: string },
): ArcadePixiPassHandle<CanvasTexturePassState>;
// BEGIN MERGED ARCADE CORE TYPES

export declare function clampNumber(value: number, minimum?: number, maximum?: number): number;
export declare function approach(current: number, target: number, maxDelta: number): number;
export declare function integrateAcceleration(
  value: number, acceleration: number, dt?: number, minimum?: number, maximum?: number
): number;
export declare function integrateBody<T extends { x: number; y: number; vx?: number; vy?: number; velocityX?: number; velocityY?: number }>(
  body: T,
  dt?: number,
  acceleration?: { x?: number; y?: number; minX?: number; maxX?: number; minY?: number; maxY?: number },
): Readonly<T>;
export type ArcadeRect = { x: number; y: number; w?: number; h?: number; width?: number; height?: number };
export declare function aabbOverlap(a: ArcadeRect, b: ArcadeRect): boolean;
export declare function resolveOneWayPlatforms<T extends ArcadeRect>(options: {
  body: ArcadeRect & { vx?: number; vy?: number; velocityX?: number; velocityY?: number };
  previous: ArcadeRect;
  velocityY?: number;
  downwardSign?: 1 | -1;
  tolerance?: number;
  platforms: readonly T[];
}): Readonly<{ platform: T; x: number; y: number; velocityY: 0 }> | null;

export type TimeUnit = 'seconds' | 'milliseconds';
export type FixedStepLoop = {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  advance(elapsed: number): { updates: number; alpha: number };
  resetClock(): void;
  snapshot(): Readonly<Record<string, number | boolean>>;
  getFPS(): number;
  getFrameCount(): number;
  isPaused(): boolean;
  isRunning(): boolean;
};
export declare function createFixedStepLoop(options: {
  update(delta: number): void;
  render(alpha: number): void;
  fixedStep?: number;
  maxFrame?: number;
  timeUnit?: TimeUnit;
  now?: () => number;
  requestFrame?: (callback: (timestamp: number) => void) => number;
  cancelFrame?: (id: number) => void;
}): FixedStepLoop;

export type KeyboardDevice = {
  advance(): void;
  clearEdges(): void;
  isHeld(code: string): boolean;
  isPressed(code: string): boolean;
  isReleased(code: string): boolean;
  getState(code: string): Readonly<{ isPressed: boolean; wasJustPressed: boolean; wasJustReleased: boolean; pressTime: number; releaseTime: number }>;
  getHoldDuration(code: string): number;
  consumeLatestPressed(exclusions?: string[]): string | null;
  reset(): void;
  destroy(): void;
};
export declare function createKeyboardDevice(options?: {
  target?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  now?: () => number;
  preventDefaultCodes?: string[];
}): KeyboardDevice;

export type GamepadButtonState = Readonly<{
  value: number;
  held: boolean;
  pressed: boolean;
  released: boolean;
}>;
export type GamepadDeviceSnapshot = Readonly<{
  connected: boolean;
  index: number;
  id: string;
  mapping: string;
  timestamp: number;
  buttons: readonly GamepadButtonState[];
  axes: readonly number[];
}>;
export type GamepadDevice = {
  advance(): GamepadDeviceSnapshot;
  refresh(): GamepadDeviceSnapshot;
  snapshot(): GamepadDeviceSnapshot;
  clearEdges(): void;
  isConnected(): boolean;
  getButton(index: number): GamepadButtonState;
  getAxis(index: number): number;
  reset(): void;
  destroy(): void;
};
export declare function createGamepadDevice(options?: {
  index?: number;
  deadzone?: number;
  buttonThreshold?: number;
  getGamepads?: () => ArrayLike<Gamepad | null>;
}): GamepadDevice;

export type PointerType = 'mouse' | 'pen' | 'touch';
export type PointerContactState = Readonly<{
  pointerId: number;
  pointerType: PointerType;
  x: number;
  y: number;
  pressure: number;
  buttons: number;
  isPrimary: boolean;
  sequence: number;
}>;
export type PointerButtonState = Readonly<{
  held: boolean;
  pressed: boolean;
  released: boolean;
  pointerType: PointerType | null;
  pointerId: number | null;
  x: number;
  y: number;
  pressure: number;
}>;
export type PointerDeviceSnapshot = Readonly<{ pointers: readonly PointerContactState[] }>;
export type PointerDevice = {
  advance(): PointerDeviceSnapshot;
  snapshot(): PointerDeviceSnapshot;
  clearEdges(): void;
  getButton(button?: number, pointerType?: PointerType): PointerButtonState;
  isHeld(button?: number, pointerType?: PointerType): boolean;
  isPressed(button?: number, pointerType?: PointerType): boolean;
  isReleased(button?: number, pointerType?: PointerType): boolean;
  reset(): void;
  destroy(): void;
};
export declare function createPointerDevice(options?: {
  target?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  preventDefault?: boolean;
}): PointerDevice;

export type KeyBinding = { type: 'key'; code: string };
export type ButtonBinding = { type: 'button'; index: number };
export type AxisBinding = { type: 'axis'; index: number; direction?: number; threshold?: number };
export type PointerBinding = { type: 'pointer'; button?: number; pointerType?: PointerType };
export type ActionBinding = string | KeyBinding | ButtonBinding | AxisBinding | PointerBinding;
export type ActionBindings<Action extends string> = Record<Action, ActionBinding[]>;
export type ActionState = Readonly<{
  held: boolean;
  pressed: boolean;
  released: boolean;
  value: number;
  source: string | null;
}>;
export declare function cloneActionBindings<Action extends string>(
  actions: readonly Action[], bindings?: Partial<ActionBindings<Action>>
): ActionBindings<Action>;
export declare function updateActionBinding<Action extends string>(
  actions: readonly Action[], bindings: Partial<ActionBindings<Action>>, action: Action,
  binding: ActionBinding, options?: { replace?: boolean; removeConflicts?: boolean }
): ActionBindings<Action>;
export declare function createActionInput<Action extends string>(options: {
  actions: readonly Action[];
  bindings: Partial<ActionBindings<Action>>;
  keyboard?: KeyboardDevice;
  keyboardOptions?: Parameters<typeof createKeyboardDevice>[0];
  gamepad?: GamepadDevice;
  gamepadOptions?: Parameters<typeof createGamepadDevice>[0];
  pointer?: PointerDevice;
  pointerOptions?: Parameters<typeof createPointerDevice>[0];
  gamepadIndex?: number;
  getGamepads?: () => ArrayLike<Gamepad | null>;
}): {
  advance(): Readonly<Record<Action, ActionState>>;
  refresh(): Readonly<Record<Action, ActionState>>;
  snapshot(): Readonly<Record<Action, ActionState>>;
  clearEdges(): void;
  setBindings(bindings: Partial<ActionBindings<Action>>): void;
  getBindings(): ActionBindings<Action>;
  reset(): void;
  destroy(): void;
  keyboard: KeyboardDevice;
  gamepad: GamepadDevice;
  pointer: PointerDevice;
};

export declare function createSceneStack<Context, Scene extends {
  name: string;
  onEnter?(context: Context): void;
  onExit?(): void;
  update?(delta: number): void;
  render?(...args: any[]): void;
}>(options?: { context?: Context }): {
  push(scene: Scene): Scene;
  pop(): Scene | undefined;
  replace(scene: Scene): Scene;
  clear(): void;
  current(): Scene | undefined;
  depth(): number;
  update(delta: number): void;
  render(...args: any[]): void;
  snapshot(): readonly string[];
};

export declare function createTransitionSceneManager<Name extends string, RenderContext, Params = Record<string, unknown>>(options: {
  scenes: Array<{
    name: Name;
    enter?(params?: Params): void | Promise<void>;
    exit?(): void | Promise<void>;
    update?(delta: number): void;
    render?(context: RenderContext): void;
  }>;
  initialScene: Name;
  transitions?: Partial<Record<Name, readonly Name[]>>;
  renderContext?: RenderContext;
  clear?(context: RenderContext, scene: Name | null): void;
}): {
  init(context: RenderContext): void;
  start(): Promise<boolean>;
  getCurrentScene(): Name | null;
  getCurrent(): unknown;
  getParams(): Params | undefined;
  isTransitioning(): boolean;
  canTransitionTo(target: Name): boolean;
  transitionTo(target: Name, params?: Params): Promise<boolean>;
  update(delta: number): void;
  render(): void;
};

export declare function createLifecycleController(options?: {
  documentTarget?: Document;
  windowTarget?: Window;
  loop?: Pick<FixedStepLoop, 'pause' | 'resume'>;
  input?: { reset(): void };
  onSuspend?(reason: 'hidden' | 'blur'): void;
  onResume?(reason: 'visible'): void;
}): { destroy(): void };
// END MERGED ARCADE CORE TYPES


// BEGIN ARCADE SERVICES 0.13-0.16 TYPES

export type ArcadeRuntimeHost = {
  readonly version: string;
  readonly events: ArcadeEventBus<any>;
  register<T>(name: string, service: T, disposer?: () => void): T;
  service<T = unknown>(name: string): T;
  has(name: string): boolean;
  track(disposer: () => void): () => void;
  start(reason?: string): boolean;
  pause(reason?: string): boolean;
  resume(reason?: string): boolean;
  stop(reason?: string): boolean;
  step(delta: number, command?: unknown): Readonly<{ tick: number; delta: number; command: unknown; host: ArcadeRuntimeHost }>;
  render(alpha?: number): Readonly<{ tick: number; alpha: number; host: ArcadeRuntimeHost }>;
  snapshot(): Readonly<{ version: string; state: string; tick: number; destroyed: boolean; services: readonly string[] }>;
  destroy(): boolean;
};
export declare function createArcadeRuntimeHost(options?: {
  events?: ArcadeEventBus<any>;
  services?: Record<string, unknown>;
  loop?: { start?(): void; stop?(): void; pause?(): void; resume?(): void };
  update?(delta: number, command: unknown, frame: unknown): void;
  render?(alpha: number, frame: unknown): void;
}): ArcadeRuntimeHost;

export type SpatialBody = ArcadeRect & {
  id: string;
  layer?: string;
  mask?: readonly string[];
  enabled?: boolean;
  isTrigger?: boolean;
};
export type SpatialIndex = Readonly<{ cellSize: number; cells: Map<string, SpatialBody[]>; bodies: readonly SpatialBody[] }>;
export type SpatialPair = Readonly<{ a: SpatialBody; b: SpatialBody }>;
export declare function collisionLayersMatch(a: SpatialBody, b: SpatialBody): boolean;
export declare function buildSpatialIndex(bodies: readonly SpatialBody[], cellSize?: number): SpatialIndex;
export declare function querySpatialIndex(index: SpatialIndex, rect: ArcadeRect, options?: { layers?: readonly string[]; predicate?: (body: SpatialBody) => boolean }): SpatialBody[];
export declare function spatialCollisionPairs(index: SpatialIndex, options?: { computeBackend?: ArcadeComputeBackend }): SpatialPair[];
export type CollisionManifold = Readonly<{ a: string; b: string; normalX: number; normalY: number; penetration: number; overlapX: number; overlapY: number }>;
export declare function computeCollisionManifold(a: SpatialBody, b: SpatialBody): CollisionManifold | null;
export declare function manifoldsFromSpatialPairs(pairs: readonly SpatialPair[]): CollisionManifold[];
export type SweptObstacle = ArcadeRect & { id: string; oneWay?: boolean };
export declare function sweepAabb(input: { body: ArcadeRect; vx: number; vy: number; dt: number; epsilon?: number; obstacles: readonly SweptObstacle[] }): Readonly<{ x: number; y: number; vx: number; vy: number; hit: null | Readonly<{ obstacle: SweptObstacle; time: number; normalX: number; normalY: number; remainingTime: number }> }>;
export declare function createCollisionWorld(options?: { cellSize?: number; events?: ArcadeEventBus<any>; computeBackend?: ArcadeComputeBackend }): {
  events: ArcadeEventBus<any>;
  upsert<T extends SpatialBody>(body: T): Readonly<T>;
  remove(id: string): boolean;
  get(id: string): SpatialBody | undefined;
  clear(): number;
  query(rect: ArcadeRect, options?: { layers?: readonly string[]; predicate?: (body: SpatialBody) => boolean }): SpatialBody[];
  step(): Readonly<{ index: SpatialIndex; pairs: readonly SpatialPair[]; contacts: readonly unknown[] }>;
  snapshot(): Readonly<{ bodyCount: number; contactCount: number; cellSize: number; bodyIds: readonly string[] }>;
};
export type HitboxBody<OwnerId = string, Team = unknown> = SpatialBody & { ownerId: OwnerId; team?: Team; damage?: number; tags?: readonly string[]; active?: boolean };
export type HurtboxBody<ActorId = string, Team = unknown> = SpatialBody & { actorId: ActorId; team?: Team; active?: boolean };
export declare function resolveHitboxContacts<OwnerId = string, ActorId = string, Team = unknown>(input: { hitboxes: readonly HitboxBody<OwnerId, Team>[]; hurtboxes: readonly HurtboxBody<ActorId, Team>[] }): readonly Readonly<{ hitboxId: string; hurtboxId: string; attackerId: OwnerId; targetId: ActorId; damage: number; tags: readonly string[] }>[];
export declare function createProjectilePool<T>(options: { capacity: number; create(index: number): T; reset?(value: T, context: RecyclingPoolResetContext): void }): {
  spawn(initializer?: (value: T, context: RecyclingPoolAcquireContext) => void): T;
  despawn(projectile: T): boolean;
  step(delta: number, update: (projectile: T, delta: number, context: Readonly<{ index: number; generation: number }>) => void, shouldDespawn?: (projectile: T) => boolean): number;
  activeValues(): T[];
  clear(): number;
  snapshot(): RecyclingPoolSnapshot;
  pool: RecyclingPool<T>;
};

export declare function createPixiSceneGraph(options: { PIXI: ArcadePixiNamespace; stage: Container; label?: string }): {
  root: Container;
  world: Container;
  hud: Container;
  overlay: Container;
  addParallaxLayer(name: string, options?: { container?: Container; factorX?: number; factorY?: number; order?: number }): Container;
  layer(name: string): Container;
  applyCamera(camera: Partial<ArcadeCameraState>): unknown;
  snapshot(): Readonly<{ destroyed: boolean; parallax: readonly unknown[] }>;
  destroy(): boolean;
};
export declare function createPixiSpritePool<T extends { visible: boolean; renderable: boolean; destroy?(): void }>(options: {
  container: { addChild(sprite: T): void };
  capacity: number;
  createSprite(index: number): T;
  reset?(sprite: T, context: RecyclingPoolResetContext): void;
}): {
  acquire(initializer?: (sprite: T, context: RecyclingPoolAcquireContext) => void): T;
  release(sprite: T): boolean;
  clear(): number;
  activeValues(): T[];
  snapshot(): RecyclingPoolSnapshot;
  destroy(): void;
};

export type ArcadeAssetDefinition = Readonly<{ id: string; type: string; src: string; groups?: readonly string[]; group?: string; dependencies?: readonly string[]; fallbackId?: string; bytes?: number; retries?: number; dispose?: (value: unknown) => void }>;
export type ArcadeAssetManifest = Readonly<{ version?: number; assets: readonly ArcadeAssetDefinition[] }>;
export declare function validateAssetManifest(manifest: ArcadeAssetManifest): Readonly<{ version: number; assets: readonly ArcadeAssetDefinition[] }>;
export declare function createResourceScope(options?: { name?: string }): {
  readonly name: string;
  track<T>(resource: T, disposer?: (resource: T) => void | Promise<void>): T;
  child(name: string): ReturnType<typeof createResourceScope>;
  release(): Promise<boolean>;
  snapshot(): Readonly<{ name: string; released: boolean; resources: number; children: number }>;
};
export declare function createAssetLoader(options?: { retries?: number; loaders?: Record<string, (asset: ArcadeAssetDefinition, context: unknown) => unknown | Promise<unknown>>; load?: (asset: ArcadeAssetDefinition, context: unknown) => unknown | Promise<unknown> }): {
  cache: Map<string, unknown>;
  has(id: string): boolean;
  get(id: string): unknown;
  clear(id?: string): number | boolean;
  loadManifest(manifest: ArcadeAssetManifest, options?: { ids?: readonly string[]; groups?: readonly string[]; budgetBytes?: number; signal?: AbortSignal; scope?: ReturnType<typeof createResourceScope>; scopeName?: string; loaders?: Record<string, Function>; onProgress?: (progress: unknown) => void }): Promise<Readonly<{ assets: Map<string, unknown>; scope: ReturnType<typeof createResourceScope>; get(id: string): unknown; loadedBytes: number; declaredBytes: number }>>;
};
export declare function createAudioMixer(options: { context?: AudioContext; createContext?: () => AudioContext; buses?: readonly string[]; masterVolume?: number }): {
  context: AudioContext;
  master: GainNode;
  setMasterVolume(volume: number): void;
  setVolume(name: string, volume: number): void;
  mute(name: string, muted?: boolean): void;
  duck(name: string, factor: number, token?: PropertyKey): () => boolean;
  playBuffer(buffer: AudioBuffer, options?: { bus?: string; volume?: number; loop?: boolean; pan?: number; when?: number; offset?: number }): { source: AudioBufferSourceNode; stop(): boolean };
  resume(): Promise<void>;
  suspend(): Promise<void>;
  snapshot(): Readonly<{ state: string; master: number; buses: Readonly<Record<string, number>>; activeSources: number }>;
  destroy(): Promise<void>;
};

export type ArcadeUiCanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type ArcadeUiTheme = Readonly<{
  background: string;
  backgroundRaised: string;
  panel: string;
  panelStrong: string;
  text: string;
  muted: string;
  accent: string;
  accentAlt: string;
  warning: string;
  danger: string;
  line: string;
}>;
export type ArcadePanelOptions = Readonly<{ x: number; y: number; width: number; height: number; accent?: string; strong?: boolean; label?: string }>;
export type ArcadeChipOptions = Readonly<{ x: number; y: number; text: string; accent?: string; active?: boolean; align?: 'left' | 'center' | 'right'; width?: number }>;
export type ArcadeMeterOptions = Readonly<{ x: number; y: number; width: number; height?: number; value: number; min?: number; minimum?: number; max?: number; maximum?: number; accent?: string; label?: string; valueLabel?: string; reverse?: boolean }>;
export type ArcadeScreenTitleOptions = Readonly<{ eyebrow: string; title: string; subtitle?: string; y?: number; accent?: string; titleSize?: number }>;
export declare const ARCADE_UI_UNIT: number;
export declare const ARCADE_UI_FONT: string;
export declare const DEFAULT_ARCADE_UI_THEME: ArcadeUiTheme;
export declare function createArcadeUiTheme(theme?: Partial<ArcadeUiTheme>): ArcadeUiTheme;
export declare function drawArcadeBackdropCanvas(context: ArcadeUiCanvasContext, theme?: ArcadeUiTheme): void;
export declare function drawArcadePanelCanvas(context: ArcadeUiCanvasContext, options: ArcadePanelOptions, theme?: ArcadeUiTheme): void;
export declare function drawArcadeMenuRowCanvas(context: ArcadeUiCanvasContext, label: string, x: number, y: number, width: number, selected: boolean, theme?: ArcadeUiTheme): void;
export declare function drawArcadeFooterCanvas(context: ArcadeUiCanvasContext, text: string, theme?: ArcadeUiTheme): void;
export declare function drawArcadeChipCanvas(context: ArcadeUiCanvasContext, options: ArcadeChipOptions, theme?: ArcadeUiTheme): void;
export declare function drawArcadeMeterCanvas(context: ArcadeUiCanvasContext, options: ArcadeMeterOptions, theme?: ArcadeUiTheme): ReturnType<typeof resolveHudGauge>;
export declare function drawArcadeScreenTitleCanvas(context: ArcadeUiCanvasContext, options: ArcadeScreenTitleOptions, theme?: ArcadeUiTheme): void;

export type ArcadePersistenceFeedback<Reason extends string = string> = Readonly<{
  reason: Reason;
  label: string;
  timestamp: number;
} & Record<string, unknown>>;
export declare function createPersistenceFeedback<Reason extends string = string>(options?: {
  labels?: Readonly<Partial<Record<Reason, string>>>;
  now?: () => number;
  eventName?: string | null;
  target?: { dispatchEvent?(event: Event): boolean; CustomEvent?: typeof CustomEvent };
  CustomEvent?: typeof CustomEvent;
  createEvent?: (eventName: string, feedback: ArcadePersistenceFeedback<Reason>) => Event;
  onFeedback?: (feedback: ArcadePersistenceFeedback<Reason>) => void;
  events?: ArcadeEventBus<any>;
}): {
  events: ArcadeEventBus<any>;
  create(reason: Reason, detail?: Readonly<Record<string, unknown>>): ArcadePersistenceFeedback<Reason>;
  dispatch(feedback: ArcadePersistenceFeedback<Reason>): ArcadePersistenceFeedback<Reason>;
  emit(reason: Reason, detail?: Readonly<Record<string, unknown>>): ArcadePersistenceFeedback<Reason>;
  snapshot(): Readonly<{ count: number; last: ArcadePersistenceFeedback<Reason> | null }>;
};

export declare function resolveSafeAreaLayout(input: { viewportWidth: number; viewportHeight: number; designWidth?: number; designHeight?: number; safeArea?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>; mode?: 'contain' | 'cover' | 'stretch' }): Readonly<{ viewport: Readonly<ArcadeRect>; safeArea: Readonly<Record<'top' | 'right' | 'bottom' | 'left', number>>; available: Readonly<ArcadeRect>; content: Readonly<ArcadeRect>; scale: Readonly<{ x: number; y: number }> }>;
export type FocusItem = { id: string; disabled?: boolean; hidden?: boolean; onActivate?(item: FocusItem): void };
export declare function createFocusNavigator(options?: { items?: readonly FocusItem[]; initialId?: string; wrap?: boolean; events?: ArcadeEventBus<any> }): {
  events: ArcadeEventBus<any>;
  setItems(items: readonly FocusItem[]): FocusItem | null;
  current(): FocusItem | null;
  focus(id: string, reason?: string): boolean;
  move(direction: 'next' | 'previous' | 'left' | 'right' | 'up' | 'down'): FocusItem | null;
  activate(): boolean;
  snapshot(): Readonly<{ focusedId: string | null; items: readonly unknown[] }>;
};
export declare function createInputHintTracker(options?: { initialDevice?: 'keyboard' | 'gamepad' | 'pointer' | 'touch'; now?: () => number; events?: ArcadeEventBus<any> }): {
  events: ArcadeEventBus<any>;
  note(device: 'keyboard' | 'gamepad' | 'pointer' | 'touch', timestamp?: number): boolean;
  noteActionState(state: Record<string, ActionState>, timestamp?: number): boolean;
  snapshot(): Readonly<{ device: string; changedAt: number }>;
};
export declare function createAccessibilityPreferences(initial?: { reducedMotion?: boolean; highContrast?: boolean; captions?: boolean; screenReader?: boolean; textScale?: number }): {
  events: ArcadeEventBus<any>;
  set(patch: Record<string, unknown>, reason?: string): Readonly<Record<string, unknown>>;
  snapshot(): Readonly<Record<string, unknown>>;
  motion(duration: number): number;
};
export declare function createMessageCatalog(options: { locale?: string; fallbackLocale?: string; messages?: Record<string, unknown>; missing?: (key: string, locale: string) => string }): {
  setLocale(locale: string): void;
  addMessages(locale: string, messages: Record<string, unknown>): void;
  translate(key: string, variables?: Record<string, unknown>): string;
  has(key: string): boolean;
  snapshot(): Readonly<{ locale: string; fallbackLocale: string; locales: readonly string[] }>;
};
export declare function createTextMeasureCache<T>(options: { measure(text: string, style: Record<string, unknown>): T }): { measure(text: string, style?: Record<string, unknown>): T; clear(): number; snapshot(): Readonly<{ size: number }> };

export type ArcadeStorageAdapter = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem?(key: string): unknown; keys?(): string[] };
export declare function createMemoryStorageAdapter(seed?: Record<string, string>): ArcadeStorageAdapter & { snapshot(): Readonly<Record<string, string>> };
export declare function createStorageAdapter(storage: Storage): ArcadeStorageAdapter;
export declare function createBrowserStorageAdapter(options?: { storage?: Storage; prefix?: string; separator?: string }): ArcadeStorageAdapter;
export declare const ARCADE_STATE_BUNDLE_FORMAT: 'arcade-state-bundle';
export declare const ARCADE_STATE_BUNDLE_VERSION: 1;
export type ArcadeStateStoreDefinition<T = unknown> = Readonly<{
  version: number;
  defaults?: T | (() => T);
  migrations?: Record<number, (data: unknown, context: Readonly<{ from: number; to: number }>) => unknown>;
  preEnvelopeMigration?: ArcadePreEnvelopeMigration;
  validate?: (data: unknown) => boolean;
  backupKey?: string;
}>;
export type ArcadeStateStoreData<Definition> = Definition extends ArcadeStateStoreDefinition<infer T> ? T : unknown;
export type ArcadeStateBundleEntry<T = unknown> = Readonly<{ version: number; data: T }>;
export type ArcadeStateBundle = Readonly<{
  format: typeof ARCADE_STATE_BUNDLE_FORMAT;
  formatVersion: typeof ARCADE_STATE_BUNDLE_VERSION;
  namespace: string;
  runtimeVersion: string;
  exportedAt: number;
  entries: Readonly<Record<string, ArcadeStateBundleEntry>>;
  metadata: SnapshotValue;
  checksum: string;
}>;
export declare function createStateBundleStore<Stores extends Record<string, ArcadeStateStoreDefinition>>(options: {
  namespace: string;
  stores: Stores;
  adapter?: ArcadeStorageAdapter;
  storage?: Storage;
  storagePrefix?: string;
  now?: () => number;
}): {
  adapter: ArcadeStorageAdapter;
  list(): readonly (keyof Stores & string)[];
  load<Name extends keyof Stores & string>(name: Name): Readonly<{ data: ArcadeStateStoreData<Stores[Name]>; source: string; migrated: boolean; recovered: boolean; version: number }>;
  save<Name extends keyof Stores & string>(name: Name, data: ArcadeStateStoreData<Stores[Name]>, metadata?: { savedAt?: number; revision?: number }): unknown;
  clear(name?: keyof Stores & string): number;
  exportBundle(metadata?: SnapshotValue): ArcadeStateBundle;
  serialize(metadata?: SnapshotValue, space?: number): string;
  importBundle(input: ArcadeStateBundle | string, options?: { allowNamespaceMismatch?: boolean; allowPartial?: boolean }): Readonly<{ namespace: string; imported: readonly string[]; sourceRuntimeVersion: string | null; exportedAt: number; metadata: unknown }>;
  download(options?: { filename?: string; metadata?: SnapshotValue; space?: number; Blob?: typeof Blob; URL?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>; document?: Pick<Document, 'createElement' | 'body'> }): Readonly<{ filename: string; bytes: number; serialized: string }>;
  upload(file: Pick<Blob, 'text'>, options?: { allowNamespaceMismatch?: boolean; allowPartial?: boolean }): Promise<Readonly<{ namespace: string; imported: readonly string[]; sourceRuntimeVersion: string | null; exportedAt: number; metadata: unknown }>>;
};
export type ArcadePreEnvelopeMigrationResult<T = unknown> = Readonly<{ data: T; version?: number; savedAt?: number; revision?: number }>;
export type ArcadePreEnvelopeMigration<T = unknown> = (record: unknown, context: Readonly<{ source: 'primary' | 'temporary' | 'backup'; key: string; targetVersion: number }>) => ArcadePreEnvelopeMigrationResult<T>;
export declare function createVersionedStore<T>(options: { adapter?: ArcadeStorageAdapter; key: string; version: number; defaults?: T | (() => T); migrations?: Record<number, (data: unknown, context: Readonly<{ from: number; to: number }>) => unknown>; preEnvelopeMigration?: ArcadePreEnvelopeMigration; validate?: (data: unknown) => boolean; backupKey?: string; now?: () => number; onCorruption?: (context: unknown) => void }): {
  save(data: T, metadata?: { savedAt?: number; revision?: number }): Readonly<{ format: 1; version: number; savedAt: number; revision: number; data: T; checksum: string }>;
  load(): Readonly<{ data: T; source: string; migrated: boolean; recovered: boolean; version: number }>;
  clear(): void;
  inspect(): Readonly<Record<string, unknown>>;
};
export declare function createProfileStore<T>(options: { adapter?: ArcadeStorageAdapter; key: string; version: number; maxSlots?: number; defaults?: T | (() => T); migrations?: Record<number, Function>; preEnvelopeMigration?: ArcadePreEnvelopeMigration; validate?: (data: unknown) => boolean }): {
  list(): readonly string[];
  load(id: string): Readonly<{ data: T; source: string; migrated: boolean; recovered: boolean; version: number }>;
  save(id: string, data: T, metadata?: { savedAt?: number; revision?: number }): unknown;
  remove(id: string): void;
};
export declare function resolveStorageConflict<T extends { savedAt?: number }>(local: T | null, remote: T | null, options?: { strategy?: 'newer' | 'local' | 'remote'; merge?: (local: T, remote: T) => T }): Readonly<{ winner: 'local' | 'remote' | 'merged'; value: T }>;
export declare function createStatisticsService(initial?: Record<string, number>): { increment(key: string, amount?: number): number; set(key: string, value: number): number; max(key: string, value: number): number; min(key: string, value: number): number; get(key: string): number; snapshot(): Readonly<Record<string, number>>; reset(): void };
export type AchievementDefinition = { id: string; target?: number; event?: PropertyKey; select?: (payload: unknown) => number; reduce?: (current: number, amount: number, context: unknown) => number };
export declare function createAchievementService(options?: { definitions?: readonly AchievementDefinition[]; initial?: { progress?: Record<string, number>; unlocked?: readonly string[] }; events?: ArcadeEventBus<any> }): {
  events: ArcadeEventBus<any>;
  record(id: string, amount?: number, context?: unknown): boolean;
  consume(event: PropertyKey, payload?: unknown): number;
  unlock(id: string, context?: unknown): boolean;
  isUnlocked(id: string): boolean;
  snapshot(): Readonly<{ progress: Readonly<Record<string, number>>; unlocked: readonly string[] }>;
};
export declare function createRunSummary(input?: { game?: string; mode?: string; seed?: string | number; startedAt?: number; endedAt?: number; result?: SnapshotValue; score?: number; stats?: SnapshotValue; achievements?: readonly string[]; commands?: ArcadeCommandStream | string; finalState?: SnapshotValue; metadata?: SnapshotValue }): Readonly<Record<string, SnapshotValue>> & { summaryHash: string };
export declare function verifyRunSummary(summary: Record<string, SnapshotValue> & { summaryHash: string }): boolean;

// END ARCADE SERVICES 0.13-0.16 TYPES

// BEGIN ARCADE SERVICES 0.17-1.0 TYPES

export type ArcadeTextLayout = Readonly<{
  lines: readonly string[];
  truncated: boolean;
  width: number;
  lineHeight: number;
  height: number;
}>;

export declare function fitArcadeTextCanvas(
  context: ArcadeUiCanvasContext,
  text: unknown,
  maxWidth: number,
  options?: { ellipsis?: string },
): string;

export declare function wrapArcadeTextCanvas(
  context: ArcadeUiCanvasContext,
  text: unknown,
  maxWidth: number,
  options?: { maxLines?: number; lineHeight?: number; ellipsis?: string },
): ArcadeTextLayout;

export declare function drawArcadeTextBlockCanvas(
  context: ArcadeUiCanvasContext,
  options: Readonly<{
    x: number;
    y: number;
    width: number;
    text: unknown;
    font?: string;
    lineHeight?: number;
    maxLines?: number;
    ellipsis?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    color?: string;
  }>,
  theme?: ArcadeUiTheme,
): ArcadeTextLayout;

export type ArcadeCommandDevice = 'keyboard' | 'gamepad' | 'pointer' | 'touch';
export type ArcadeCommandHintInput = string | readonly string[];
export type ArcadeCommandAction = Readonly<{
  id: string;
  label: string;
  inputs?: Readonly<Partial<Record<ArcadeCommandDevice, ArcadeCommandHintInput>>>;
  hidden?: boolean;
  disabled?: boolean;
  priority?: number;
}>;
export type ArcadeResolvedCommandHint = Readonly<{
  id: string;
  label: string;
  input: string;
  text: string;
  disabled: boolean;
  priority: number;
  index: number;
}>;
export declare function resolveArcadeCommandHints(
  actions?: readonly ArcadeCommandAction[],
  options?: { device?: ArcadeCommandDevice },
): Readonly<{ device: ArcadeCommandDevice; hints: readonly ArcadeResolvedCommandHint[] }>;

export declare function drawArcadeCommandBarCanvas(
  context: ArcadeUiCanvasContext,
  options: Readonly<{
    actions: readonly ArcadeCommandAction[];
    device?: ArcadeCommandDevice;
    x?: number;
    y?: number;
    width?: number;
    lineHeight?: number;
    font?: string;
    separator?: string;
    maxLines?: number;
    backgroundAlpha?: number;
    strong?: boolean;
    accent?: string;
    align?: CanvasTextAlign;
  }>,
  theme?: ArcadeUiTheme,
): Readonly<{
  device: ArcadeCommandDevice;
  hints: readonly ArcadeResolvedCommandHint[];
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lines: readonly string[];
  truncated: boolean;
}>;

export type ArcadeNoticeKind = 'info' | 'success' | 'warning' | 'danger';
export type ArcadeNotice = Readonly<{
  id: string;
  key: string;
  message: string;
  title: string;
  kind: ArcadeNoticeKind;
  priority: number;
  duration: number;
  remaining: number;
  sequence: number;
  detail: Readonly<Record<string, unknown>>;
}>;
export type ArcadeNoticeInput = string | Readonly<{
  id?: string;
  key?: string;
  message: string;
  title?: string;
  kind?: ArcadeNoticeKind;
  priority?: number;
  duration?: number;
  dedupe?: boolean;
  detail?: Readonly<Record<string, unknown>>;
}>;
export declare function createArcadeNoticeQueue(options?: {
  capacity?: number;
  defaultDuration?: number;
  events?: ArcadeEventBus<any>;
}): {
  events: ArcadeEventBus<any>;
  push(input: ArcadeNoticeInput, detail?: Readonly<Record<string, unknown>>): ArcadeNotice;
  current(): ArcadeNotice | null;
  step(delta?: number): ArcadeNotice | null;
  dismiss(id: string, reason?: string): boolean;
  clear(reason?: string): number;
  snapshot(): Readonly<{
    capacity: number;
    defaultDuration: number;
    currentId: string | null;
    notices: readonly ArcadeNotice[];
  }>;
};

export declare function drawArcadeNoticeCanvas(
  context: ArcadeUiCanvasContext,
  notice: ArcadeNotice | null,
  options?: Readonly<{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    accent?: string;
    font?: string;
    lineHeight?: number;
    maxLines?: number;
  }>,
  theme?: ArcadeUiTheme,
): Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  ratio: number;
  textLayout: ArcadeTextLayout;
}> | null;
export interface ArcadePixiFramePoolSnapshot {
  readonly frame: number;
  readonly frameOpen: boolean;
  readonly active: number;
  readonly capacity: number;
  readonly maxCapacity: number;
  readonly created: number;
  readonly dropped: number;
  readonly frameDropped: number;
  readonly peakActive: number;
  readonly destroyed: boolean;
}

export declare function createPixiFramePool<
  Sprite extends { visible: boolean; renderable: boolean; removeFromParent?(): void; destroy?(): void },
  Payload = unknown,
>(options: {
  container: { addChild(sprite: Sprite): unknown };
  maxCapacity?: number;
  capacity?: number;
  initialCapacity?: number;
  createSprite(index: number): Sprite;
  activate?(sprite: Sprite, payload: Payload, context: Readonly<{ index: number; frame: number; reused: boolean }>): void;
  deactivate?(sprite: Sprite, context: Readonly<{ index: number; frame: number; reason: 'create' | 'frame-end' | 'clear' }>): void;
  destroySprite?(sprite: Sprite, context: Readonly<{ index: number; frame: number }>): void;
}): {
  beginFrame(): ArcadePixiFramePoolSnapshot;
  acquire(payload: Payload): Sprite | null;
  endFrame(): ArcadePixiFramePoolSnapshot;
  clear(): number;
  values(): Sprite[];
  activeValues(): Sprite[];
  snapshot(): ArcadePixiFramePoolSnapshot;
  destroy(): boolean;
};

export interface ArcadePixiHudGaugeLayout {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  gap?: number;
}

export interface ArcadePixiHudGaugeStyle {
  background?: number | string;
  fill?: number | string;
  warning?: number | string;
  border?: number | string;
  borderWidth?: number;
  warningAlpha?: number;
  backgroundAlpha?: number;
  fillAlpha?: number;
}

export declare function createPixiHudGauge(options: ArcadeHudGaugeInput & ArcadePixiHudGaugeLayout & {
  PIXI: {
    Container: typeof import('pixi.js').Container;
    Graphics: typeof import('pixi.js').Graphics;
  };
  container: { addChild(value: unknown): unknown };
  label?: string;
  layout?: ArcadePixiHudGaugeLayout;
  style?: ArcadePixiHudGaugeStyle;
}): Readonly<{
  root: import('pixi.js').Container;
  graphics: import('pixi.js').Graphics;
  update(input?: ArcadeHudGaugeInput, options?: {
    layout?: ArcadePixiHudGaugeLayout;
    style?: ArcadePixiHudGaugeStyle;
    visible?: boolean;
  }): ReturnType<typeof resolveHudGauge>;
  setLayout(layout: ArcadePixiHudGaugeLayout): ReturnType<typeof resolveHudGauge>;
  snapshot(): Readonly<Record<string, unknown>>;
  destroy(): boolean;
}>;

export declare const ARCADE_RUNTIME_API_LEVEL: number;
export declare const ARCADE_RUNTIME_CAPABILITIES: readonly string[];
export declare function getArcadeRuntimeCapabilities(): Readonly<{ package: string; version: string; apiLevel: number; capabilities: readonly string[] }>;
export declare function assertArcadeRuntimeCompatibility(requirements?: { apiLevel?: number; capabilities?: readonly string[]; major?: number }): ReturnType<typeof getArcadeRuntimeCapabilities>;

export declare function createInputDelayBuffer<Input>(options?: { delayFrames?: number; clone?: (input: Input) => Input }): {
  readonly delayFrames: number;
  put(playerId: string, inputFrame: number, input: Input): number;
  has(playerId: string, inputFrame: number): boolean;
  get(playerId: string, inputFrame: number): Input | undefined;
  resolve(simulationFrame: number, playerIds: readonly string[], fallback?: Input | ((playerId: string, inputFrame: number) => Input)): Readonly<{ simulationFrame: number; sourceFrame: number; inputs: Readonly<Record<string, Input>>; missing: readonly string[]; predicted: boolean }>;
  prune(beforeInputFrame: number): number;
  snapshot(): Readonly<{ delayFrames: number; writes: number; frames: readonly number[] }>;
};

export type ArcadeHardwareTier = 'low' | 'balanced' | 'high';
export interface ArcadeHardwareBudgetProfile {
  frameMeanMs?: number;
  frameP95Ms?: number;
  frameMaxMs?: number;
  allocationBytesPerFrame?: number;
  uploadBytesPerFrame?: number;
  bundleBytes?: number;
  heapBytes?: number;
  minimumSamples?: number;
}
export interface ArcadeHardwareSample {
  frameMs?: number;
  allocationBytes?: number;
  uploadBytes?: number;
  heapBytes?: number;
}
export declare const ARCADE_HARDWARE_TIERS: readonly ArcadeHardwareTier[];
export declare const DEFAULT_ARCADE_HARDWARE_BUDGETS: Readonly<Record<ArcadeHardwareTier, Readonly<ArcadeHardwareBudgetProfile>>>;
export declare function detectArcadeHardwareTier(input?: {
  deviceMemory?: number;
  deviceMemoryGb?: number;
  hardwareConcurrency?: number;
  devicePixelRatio?: number;
  softwareRenderer?: boolean;
  renderer?: string;
}): ArcadeHardwareTier;
export declare function createHardwareBudgetMonitor(options?: {
  tier?: ArcadeHardwareTier;
  device?: Parameters<typeof detectArcadeHardwareTier>[0];
  profiles?: Partial<Record<ArcadeHardwareTier, ArcadeHardwareBudgetProfile>>;
  sampleSize?: number;
  bundleBytes?: number;
}): {
  readonly tier: ArcadeHardwareTier;
  readonly budget: Readonly<ArcadeHardwareBudgetProfile>;
  record(sample?: ArcadeHardwareSample): Readonly<Required<ArcadeHardwareSample>>;
  setBundleBytes(value: number): number;
  evaluate(): Readonly<Record<string, unknown>>;
  snapshot(): Readonly<Record<string, unknown>>;
  reset(): number;
};

export interface ArcadeBrowserPerformanceSample {
  bundleBytes: number;
  heapBytes: number;
  samples: number;
  refreshes: number;
}
export declare function createBrowserPerformanceSampler(options?: {
  refreshEverySamples?: number;
  performance?: {
    getEntriesByType?: (type: string) => readonly { name?: string; encodedBodySize?: number }[];
    memory?: { usedJSHeapSize?: number };
  };
  resourcePattern?: RegExp;
}): {
  sample(options?: { force?: boolean }): Readonly<ArcadeBrowserPerformanceSample>;
  invalidate(): true;
  snapshot(): Readonly<ArcadeBrowserPerformanceSample & { refreshEverySamples: number; invalidated: boolean }>;
  reset(): number;
};

export type ArcadeStateHistoryEntry<State> = Readonly<{ frame: number; state: State; hash: string; metadata: SnapshotValue }>;
export declare function createStateHistory<State>(options?: { capacity?: number; clone?: (state: State) => State; snapshot?: (state: State) => SnapshotValue; hash?: (state: State) => string }): {
  readonly capacity: number;
  save(frame: number, state: State, metadata?: SnapshotValue): ArcadeStateHistoryEntry<State>;
  has(frame: number): boolean;
  get(frame: number): ArcadeStateHistoryEntry<State> | null;
  nearestAtOrBefore(frame: number): ArcadeStateHistoryEntry<State> | null;
  pruneAfter(frame: number): number;
  clear(): number;
  frames(): readonly number[];
  snapshot(): Readonly<{ capacity: number; size: number; firstFrame: number | null; lastFrame: number | null }>;
};

export declare function createRollbackSession<State, Input>(options: {
  initialState: State;
  players: readonly string[];
  step(state: State, inputs: Readonly<Record<string, Input>>, context: Readonly<{ frame: number; sourceFrame: number; predictedPlayers: readonly string[]; resimulation: boolean }>): State;
  inputDelayFrames?: number;
  historyFrames?: number;
  defaultInput?: Input | ((playerId: string, inputFrame: number) => Input);
  /** @deprecated Use cloneState. */
  clone?: (state: State) => State;
  cloneState?: (state: State) => State;
  cloneInput?: (input: Input) => Input;
  snapshot?: (state: State) => SnapshotValue;
  events?: ArcadeEventBus<any>;
}): {
  events: ArcadeEventBus<any>;
  players: readonly string[];
  delay: ReturnType<typeof createInputDelayBuffer<Input>>;
  history: ReturnType<typeof createStateHistory<State>>;
  submitInput(playerId: string, inputFrame: number, input: Input): number;
  receiveInput(playerId: string, inputFrame: number, input: Input): number;
  advance(inputs?: Partial<Record<string, Input>>): State;
  advanceTo(targetFrame: number, inputProvider?: (frame: number, session: unknown) => Partial<Record<string, Input>>): State;
  rollbackTo(targetFrame: number): State;
  checksum(frame?: number): string | null;
  compareRemoteChecksum(peerId: string, frame: number, checksum: string): Readonly<{ peerId: string; frame: number; local: string | null; remote: string; match: boolean }>;
  getState(): State;
  snapshot(): Readonly<{
    frame: number;
    checksum: string | null;
    rollbackCount: number;
    resimulatedFrames: number;
    rejectedLateInputs: number;
    inputDelayFrames: number;
    history: Readonly<{ capacity: number; size: number; firstFrame: number | null; lastFrame: number | null }>;
    retainedInputFrames: number;
    bufferedInputFrames: number;
    remoteChecksums: number;
  }>;
};

export type ArcadeLocalTransport = {
  readonly name: string;
  readonly closed: boolean;
  send(message: unknown): boolean;
  onMessage(listener: (message: unknown) => void): () => boolean;
  close(): boolean;
  snapshot(): Readonly<{ name: string; closed: boolean; sent: number; received: number; dropped: number }>;
};
export declare function createLocalTransportPair(options?: { firstName?: string; secondName?: string; latencyMs?: number; clone?: (message: unknown) => unknown; schedule?: (deliver: () => void, latencyMs: number) => void; drop?: (message: unknown, context: Readonly<{ from: string; sent: number }>) => boolean }): readonly [ArcadeLocalTransport, ArcadeLocalTransport];

export type RuntimeInspectorCapture = Readonly<{
  index: number;
  label: string;
  time: number;
  metadata: SnapshotValue;
  values: Readonly<Record<string, SnapshotValue>>;
  hash: string;
}>;
export type RuntimeInspectorChange = Readonly<{
  kind: 'added' | 'removed' | 'changed';
  path: string;
  before?: SnapshotValue;
  after?: SnapshotValue;
}>;
export type RuntimeInspectorManifestDiff = Readonly<{
  addedAnimations: readonly string[];
  removedAnimations: readonly string[];
  frameCountChanges: readonly Readonly<{ animation: string; before: number; after: number }>[];
  hitboxChanges: readonly Readonly<{ animation: string; before: readonly unknown[]; after: readonly unknown[] }>[];
  hurtboxChanges: readonly Readonly<{ animation: string; before: readonly unknown[]; after: readonly unknown[] }>[];
  textureChanges: readonly Readonly<{ sheetId: string; before: string; after: string }>[];
  changed: boolean;
}>;
export type RuntimeInspectorTelemetrySample = Readonly<{
  simulationMs: number;
  renderMs: number;
  idleMs: number;
  frameMs: number;
  allocationBytes: number;
  gcBytes: number;
  textureBytes: number;
  audioBytes: number;
  inputLatencyMs: number;
  inspectorMs: number;
}>;
export type RuntimeInspectorTelemetry = {
  readonly historyFrames: number;
  recordFrame(sample?: Partial<RuntimeInspectorTelemetrySample> & { heapBytes?: number }): RuntimeInspectorTelemetrySample;
  noteInput(id: PropertyKey, time?: number): number;
  consumeInput(id: PropertyKey, time?: number): number | null;
  setPool(name: string, snapshot: unknown): void;
  history(name: keyof RuntimeInspectorTelemetrySample | string): readonly number[];
  latest(): RuntimeInspectorTelemetrySample;
  snapshot(): Readonly<{ latest: RuntimeInspectorTelemetrySample; pools: Readonly<Record<string, unknown>>; historyFrames: number }>;
  clear(): boolean;
};
export type RuntimeInspectorPoolAdapter<Entity = any, Pool = any> = {
  values?(pool: Pool): Entity[];
  patch?(entity: Entity, patch: Record<string, unknown>, pool: Pool): void;
  kill?(entity: Entity, pool: Pool): boolean;
  spawn?(initial: Record<string, unknown>, pool: Pool): Entity;
};
export declare const ARCADE_AUTHORING_IR_VERSION: 1;
export type ArcadeAuthoringDocumentKind = 'asset-manifest' | 'encounter-plan' | 'sprite-manifest' | 'stage-graph';
export type ArcadeAuthoringSourceLocation = Readonly<{ line: number; column: number }>;
export type ArcadeAuthoringSourceDocument = Readonly<{
  kind: ArcadeAuthoringDocumentKind;
  id: string;
  source: string;
  location?: Partial<ArcadeAuthoringSourceLocation>;
  value: unknown;
}>;
export type ArcadeAuthoringBundle = Readonly<{
  version: 1;
  source?: string;
  location?: Partial<ArcadeAuthoringSourceLocation>;
  documents: readonly ArcadeAuthoringSourceDocument[];
}>;
export type ArcadeAuthoringReloadBoundary = 'state-preserving' | 'validation-only';
export type ArcadeAuthoringCompiledDocument = Readonly<{
  kind: ArcadeAuthoringDocumentKind;
  id: string;
  source: string;
  location: ArcadeAuthoringSourceLocation;
  reloadBoundary: ArcadeAuthoringReloadBoundary;
  value: unknown;
}>;
export type ArcadeAuthoringDiagnostic = Readonly<{
  severity: 'error' | 'warning';
  code: string;
  source: string;
  path: string;
  message: string;
  documentId: string | null;
  kind: string | null;
  location: ArcadeAuthoringSourceLocation;
  referenceType?: string;
  referenceId?: string;
  previousSource?: string;
  expectedVersion?: number;
  actualVersion?: unknown;
}>;
export type ArcadeAuthoringCompilation = Readonly<{
  ok: boolean;
  version: 1;
  hash: string;
  documents: readonly ArcadeAuthoringCompiledDocument[];
  diagnostics: readonly ArcadeAuthoringDiagnostic[];
}>;
export type ArcadeAuthoringCompileOptions = Readonly<{
  source?: string;
  catalogs?: ArcadeStageReferenceCatalogs;
}>;
export declare function compileArcadeAuthoringBundle(
  bundle: ArcadeAuthoringBundle | unknown,
  options?: ArcadeAuthoringCompileOptions,
): ArcadeAuthoringCompilation;
export type RuntimeInspectorHotReloadOptions = {
  enabled?: boolean;
  manifestDir?: string;
  wsPort?: number;
  url?: string;
  host?: string;
  reconnect?: boolean;
  reconnectMs?: number;
  WebSocket?: typeof globalThis.WebSocket;
  fetch?: typeof globalThis.fetch;
  socketFactory?: (url: string) => WebSocket;
  eventTarget?: EventTarget;
  eventName?: string;
  PIXI?: ArcadePixiNamespace;
  textureAlias?: (manifestId: string, sheet: ArcadeSpriteSheet) => string;
  reloadTexture?: (sheet: ArcadeSpriteSheet, context: Readonly<{ manifestId: string; reason: string }>) => unknown | Promise<unknown>;
  onManifestReload?: (result: unknown) => void;
  onError?: (error: unknown) => void;
};
export type RuntimeInspectorOverlayOptions = {
  grid?: boolean;
  collision?: boolean;
  hitboxes?: boolean;
  hurtboxes?: boolean;
  contacts?: boolean;
  camera?: boolean;
  classifyBody?: (body: any) => 'static' | 'dynamic' | 'trigger';
  keys?: Partial<Record<'grid' | 'collision' | 'hitboxes' | 'hurtboxes' | 'contacts' | 'camera', string>>;
  source?: unknown;
  sources?: Record<string, unknown>;
  PIXI?: ArcadePixiNamespace;
  stage?: Container;
  canvas?: HTMLCanvasElement;
  render?: (commands: readonly Readonly<Record<string, unknown>>[]) => unknown;
  destroy?: () => void;
};
export type RuntimeInspectorOptions = {
  capacity?: number;
  snapshotCapacity?: number;
  now?: () => number;
  performanceNow?: () => number;
  sources?: Record<string, unknown>;
  host?: ArcadeRuntimeHost;
  onCapture?: (capture: RuntimeInspectorCapture) => void;
  onExport?: (json: string) => void;
  onEvent?: (name: string, payload: unknown) => void;
  restoreSnapshot?: (capture: RuntimeInspectorCapture, host: ArcadeRuntimeHost | null) => void;
  hotReload?: RuntimeInspectorHotReloadOptions;
  overlay?: RuntimeInspectorOverlayOptions;
  telemetry?: boolean | { historyFrames?: number; textureBytes?: () => number; audioBytes?: () => number };
  sceneGraph?: boolean | { root?: unknown | (() => unknown) };
  entityInspector?: boolean;
  pools?: Record<string, unknown>;
  pixiRuntime?: ArcadePixiRuntime;
  PIXI?: ArcadePixiNamespace;
  camera?: ArcadeCameraTransform | Readonly<ArcadeCameraState> | (() => ArcadeCameraTransform | Readonly<ArcadeCameraState>);
  canvas?: HTMLCanvasElement;
  document?: Document;
  mount?: HTMLElement;
  panel?: boolean;
  panelRefreshMs?: number;
  ui?: boolean;
  open?: boolean;
  keyToggle?: string | false;
};
export type RuntimeInspector = {
  readonly host: ArcadeRuntimeHost | null;
  readonly telemetry: RuntimeInspectorTelemetry;
  readonly sceneGraph: {
    root(): unknown;
    tree(filter?: string | null): unknown;
    select(idOrObject: string | unknown): unknown;
    selected(): unknown;
    reorder(idOrObject: string | unknown, index: number): boolean;
    snapshot(): SnapshotValue;
    filter?: string;
  };
  readonly entities: {
    registerPool<Entity = any, Pool = any>(name: string, pool: Pool, adapter?: RuntimeInspectorPoolAdapter<Entity, Pool>): () => boolean;
    list(): readonly Readonly<{ name: string; capacity: number; active: number; free: number; snapshot: SnapshotValue }>[];
    values<Entity = any>(name: string): Entity[];
    select<Entity = any>(name: string, idOrIndex: string | number | Entity): Entity | null;
    edit<Entity = any>(name: string, idOrIndex: string | number | Entity, patch: Record<string, unknown>): Entity;
    kill(name: string, idOrIndex: string | number | unknown): boolean;
    spawn<Entity = any>(name: string, initial?: Record<string, unknown>): Entity;
    selected(): unknown;
    snapshot(): readonly unknown[];
  };
  on(name: string, listener: (payload: unknown) => void): () => boolean;
  register(name: string, source: unknown): () => boolean;
  inspect(name: string): SnapshotValue;
  capture(label?: string, metadata?: SnapshotValue): RuntimeInspectorCapture;
  history(): readonly RuntimeInspectorCapture[];
  diff(before: RuntimeInspectorCapture | number | SnapshotValue, after: RuntimeInspectorCapture | number | SnapshotValue): readonly RuntimeInspectorChange[];
  seek(position: number): RuntimeInspectorCapture | null;
  current(): RuntimeInspectorCapture | null;
  export(): string;
  import(serialized: string | { captures: readonly RuntimeInspectorCapture[] }, options?: { append?: boolean }): number;
  clear(): number;
  registerManifest(id: string, manifest: ArcadeSpriteManifest | ArcadeSpriteManifestSource, options?: Record<string, unknown>): Readonly<{ id: string; manifest: ArcadeSpriteManifest; unregister(): boolean }>;
  manifest(id: string): ArcadeSpriteManifest | null;
  manifestDiff(before: ArcadeSpriteManifest | ArcadeSpriteManifestSource, after: ArcadeSpriteManifest | ArcadeSpriteManifestSource): RuntimeInspectorManifestDiff;
  registerSpriteInstance(manifestId: string, instance: any, adapter?: { sheetId?: string; animation?: (instance: any) => string; frame?: (instance: any) => number; apply?: (instance: any, context: unknown) => void | Promise<void> }): () => boolean;
  applyManifestReload(message: Record<string, unknown>): Promise<unknown>;
  registerOverlaySource(name: string, source: unknown): () => boolean;
  toggleOverlay(name: 'grid' | 'collision' | 'hitboxes' | 'hurtboxes' | 'contacts' | 'camera' | 'selection', force?: boolean): boolean;
  overlaySnapshot(): Readonly<{ enabled: Readonly<Record<string, boolean>>; commands: readonly unknown[] }>;
  renderOverlay(): boolean;
  open(): boolean;
  close(): boolean;
  toggle(): boolean;
  refresh(options?: { panel?: boolean }): number;
  profileOverhead(iterations?: number): Readonly<{ iterations: number; totalMs: number; meanMs: number; budgetMs: number; pass: boolean }>;
  snapshot(): Readonly<Record<string, unknown>>;
  destroy(): boolean;
};
export declare function registerArcadeAuthoringBundle(
  inspector: RuntimeInspector,
  bundleOrCompilation: ArcadeAuthoringBundle | ArcadeAuthoringCompilation | unknown,
  options?: ArcadeAuthoringCompileOptions,
): Readonly<{
  compilation: ArcadeAuthoringCompilation;
  registeredManifestIds: readonly string[];
  validationOnlyIds: readonly string[];
  unregister(): boolean;
}>;
export declare function createRuntimeInspector(options?: RuntimeInspectorOptions): RuntimeInspector;
export declare function createRuntimeInspector(host: ArcadeRuntimeHost, options?: RuntimeInspectorOptions): RuntimeInspector;
export declare namespace createRuntimeInspector {
  function vitePlugin(options?: { manifestDir?: string; eventName?: string }): Readonly<Record<string, unknown>>;
}
export declare function createReplayTimeline(options: { stream: ArcadeCommandStream | string; frames?: readonly ArcadeReplayFrame[] }): {
  stream: ArcadeCommandStream;
  entries: readonly ArcadeCommandEntry[];
  frames: readonly ArcadeReplayFrame[];
  current(): ArcadeCommandEntry | null;
  seekIndex(index: number): ArcadeCommandEntry | null;
  seekTick(tick: number): ArcadeCommandEntry | null;
  next(): ArcadeCommandEntry | null;
  previous(): ArcadeCommandEntry | null;
  frameAtCursor(): ArcadeReplayFrame | null;
  range(fromTick: number, toTick: number): readonly ArcadeCommandEntry[];
  snapshot(): Readonly<Record<string, unknown>>;
};
export type PerformanceBudget = { meanMs?: number; p95Ms?: number; maxMs?: number; minimumSamples?: number };
export declare function createPerformanceBudgetMonitor(options?: { budgets?: Record<string, PerformanceBudget>; profiler?: ArcadeFrameProfiler; sampleSize?: number; now?: () => number }): {
  profiler: ArcadeFrameProfiler;
  setBudget(name: string, budget: PerformanceBudget): void;
  record(name: string, durationMs: number): number;
  measure<T>(name: string, callback: () => T): T;
  measureAsync<T>(name: string, callback: () => Promise<T>): Promise<T>;
  evaluate(name: string): Readonly<Record<string, unknown>>;
  evaluateAll(): readonly Readonly<Record<string, unknown>>[];
  assert(name: string): Readonly<Record<string, unknown>>;
  snapshot(): Readonly<{ pass: boolean; results: readonly unknown[] }>;
};
export declare function runHeadlessScenario<State, Command>(options: { name?: string; ticks: number; initialState?: State; setup?: () => State | Promise<State>; command?: (tick: number, state: State) => Command; step(state: State, command: Command | null, context: Readonly<{ tick: number }>): State | Promise<State>; snapshot?: (state: State, tick: number) => SnapshotValue; assert?: (frame: unknown, state: State) => void; teardown?: (state: State, result: unknown) => void }): Promise<Readonly<{ name: string; ticks: number; state: State; frames: readonly unknown[]; finalHash: string }>>;

// END ARCADE SERVICES 0.17-1.0 TYPES
export type ArcadeCertificationEvidenceKind = 'lifecycle' | 'visual';
export type ArcadeCertificationSource = 'local-browser' | 'physical-device' | 'driver-lab' | 'imported';
export type ArcadeCertificationContextLossMode = 'synthetic-event' | 'webgl-lose-context' | 'driver-reset' | 'not-applicable';
export interface ArcadeCertificationPolicy {
  requiredConsumers: readonly string[];
  requiredBrowsers: readonly string[];
  requiredPhysicalTiers: readonly string[];
  minimumLongSessionSeconds: number;
  maximumUploadP95Bytes: number;
  requireVisualEvidence: boolean;
  requireDriverResetPerConsumer: boolean;
}
export interface ArcadeCertificationEvidence {
  schemaVersion: number;
  id: string;
  kind: ArcadeCertificationEvidenceKind;
  project: string;
  projectVersion: string;
  runtimeVersion: string;
  recordedAt: string;
  source: ArcadeCertificationSource;
  browser: Readonly<{ name: string; version: string; userAgent: string }>;
  device: Readonly<{
    tier: string;
    os: string;
    cpu: string;
    gpu: string;
    memoryGiB: number | null;
    logicalCores: number | null;
    devicePixelRatio: number | null;
    powerMode: string;
    thermalState: string;
  }>;
  checks: Readonly<{
    resize: boolean;
    pauseResume: boolean;
    contextLossRestore: boolean;
    teardown: boolean;
    visual: boolean | null;
    errors: readonly unknown[];
  }>;
  session: Readonly<{
    durationSeconds: number;
    framesBefore: number;
    framesAfter: number;
    heapBeforeBytes: number | null;
    heapAfterBytes: number | null;
    uploadP95Bytes: number;
    contextLossMode: ArcadeCertificationContextLossMode;
    contextLosses: number;
    contextRestores: number;
  }> | null;
  visual: Readonly<{
    semanticPassed: boolean;
    imageStatisticsPassed: boolean;
    metrics: unknown;
  }> | null;
  budget: Readonly<Record<string, unknown>> | null;
  artifacts: readonly unknown[];
  notes: readonly unknown[];
}
export declare const ARCADE_CERTIFICATION_SCHEMA_VERSION: number;
export declare const ARCADE_CERTIFICATION_EVIDENCE_KINDS: readonly ArcadeCertificationEvidenceKind[];
export declare const ARCADE_CERTIFICATION_SOURCES: readonly ArcadeCertificationSource[];
export declare const ARCADE_CERTIFICATION_CONTEXT_LOSS_MODES: readonly ArcadeCertificationContextLossMode[];
export declare function createCertificationPolicy(overrides?: Partial<ArcadeCertificationPolicy>): Readonly<ArcadeCertificationPolicy>;
export declare function createCertificationEvidence(input?: Partial<ArcadeCertificationEvidence> & Record<string, any>): Readonly<ArcadeCertificationEvidence>;
export declare function validateCertificationEvidence(input: unknown, options?: { requirePhysicalMetadata?: boolean }): Readonly<{ valid: boolean; evidence: Readonly<ArcadeCertificationEvidence>; errors: readonly string[] }>;
export declare function assertCertificationEvidence(input: unknown, options?: { requirePhysicalMetadata?: boolean }): Readonly<ArcadeCertificationEvidence>;
export declare function summarizeCertificationEvidence(inputs?: readonly unknown[], policy?: Partial<ArcadeCertificationPolicy>): Readonly<Record<string, any>>;
export declare function createCertificationEvidenceIndex(inputs?: readonly unknown[], policy?: Partial<ArcadeCertificationPolicy>, options?: { generatedAt?: string }): Readonly<Record<string, any>>;

// END ARCADE CERTIFICATION 1.11 TYPES
