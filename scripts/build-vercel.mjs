import { spawnSync } from 'node:child_process';

const commands =
  process.env.VERCEL_ENV === 'production' ? ['db:migrate', 'build'] : ['build'];

for (const command of commands) {
  const result = spawnSync('pnpm', [command], { stdio: 'inherit' });
  if (result.error) {
    console.error(`Unable to run pnpm ${command}: ${result.error.code}`);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
