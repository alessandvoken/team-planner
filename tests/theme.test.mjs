import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

import { themeBootstrap } from '../src/components/theme/theme-bootstrap.ts';

test('theme before first paint respects saved choice, system and blocked storage', () => {
  for (const [saved, systemDark, expected, preference] of [
    [null, false, 'light', 'system'],
    [null, true, 'dark', 'system'],
    ['light', true, 'light', 'manual'],
    ['dark', false, 'dark', 'manual'],
    ['invalid', true, 'dark', 'system'],
    [new Error('Storage blocked'), true, 'dark', 'system'],
  ]) {
    const dataset = {};
    runInNewContext(themeBootstrap, {
      document: { documentElement: { dataset } },
      localStorage: {
        getItem(key) {
          assert.equal(key, 'team-planner-theme');
          if (saved instanceof Error) throw saved;
          return saved;
        },
      },
      window: {
        matchMedia(query) {
          assert.equal(query, '(prefers-color-scheme: dark)');
          return { matches: systemDark };
        },
      },
    });

    assert.equal(dataset.theme, expected);
    assert.equal(dataset.themePreference, preference);
  }
});
