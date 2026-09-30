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

export declare function validateArcadeSpriteManifest(value: unknown): value is ArcadeSpriteManifestSource;
export declare function normalizeArcadeSpriteManifest(value: unknown): ArcadeSpriteManifest;
