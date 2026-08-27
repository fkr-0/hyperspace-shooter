import heroAtlsSource from '../assets/hero.atls?raw';
import { describe, expect, it } from 'vitest';

const project = JSON.parse(heroAtlsSource);

describe('Hyperblast .atls authoring contract', () => {
  it('keeps the current hero geometry and center-based ship semantics explicit', () => {
    expect(project.schema).toBe('arcade-atlas-project/v1');
    expect(project.id).toBe('hyperblast-hero');
    const sheet = project.runtime.manifest.sheets[0];
    expect(sheet.id).toBe('hyperblast-hero');
    expect(sheet.file).toBe('hero.png');
    expect(sheet.frameSize).toEqual([343, 361]);
    expect(sheet.animations.idle.anchor).toEqual([171.5, 180.5]);
    expect(project.instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ship-center-anchor', data: { role: 'ship-center', policy: 'center' } }),
        expect.objectContaining({ id: 'procedural-facing', namespace: 'app.hyperblast-shooter' }),
      ]),
    );
  });

  it('does not pretend the authored image has replaced the procedural renderer yet', () => {
    expect(project.extensions['app.hyperblast-shooter']).toMatchObject({
      currentRenderer: 'procedural-pixi-fallback',
      physicsAnchorRole: 'ship-center',
    });
  });
});
