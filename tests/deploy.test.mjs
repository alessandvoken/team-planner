import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('deploy migrates only Production, before build, and stops on failure', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'team-planner-deploy-'));
  try {
    // Stub the command runner so these checks never reach Vercel or a database.
    await writeFile(
      join(directory, 'pnpm'),
      `#!${process.execPath}
const command = process.argv[2];
console.log(command);
process.exit(command === process.env.FAIL_COMMAND ? 7 : 0);
`,
      { mode: 0o755 },
    );
    for (const [environment, failCommand, expectedCommands, expectedStatus] of [
      ['production', '', ['db:migrate', 'build'], 0],
      ['preview', '', ['build'], 0],
      ['development', '', ['build'], 0],
      ['', '', ['build'], 0],
      ['production', 'db:migrate', ['db:migrate'], 7],
      ['production', 'build', ['db:migrate', 'build'], 7],
    ]) {
      const result = spawnSync(
        process.execPath,
        [
          fileURLToPath(
            new URL('../scripts/build-vercel.mjs', import.meta.url),
          ),
        ],
        {
          env: {
            ...process.env,
            PATH: `${directory}${delimiter}${process.env.PATH}`,
            VERCEL_ENV: environment,
            FAIL_COMMAND: failCommand,
          },
          encoding: 'utf8',
        },
      );
      assert.equal(result.status, expectedStatus, result.stderr);
      assert.deepEqual(result.stdout.trim().split('\n'), expectedCommands);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('migration command refuses to run without its dedicated database URL', () => {
  const result = spawnSync('pnpm', ['db:migrate'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, MIGRATION_DATABASE_URL: '' },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /MIGRATION_DATABASE_URL is not set/);
});
