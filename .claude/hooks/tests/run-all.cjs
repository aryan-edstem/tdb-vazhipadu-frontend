/* ============================================================
   Guardrail hook test runner (node .claude/hooks/tests/run-all.cjs)

   Runs every *.test.cjs in this directory and aggregates the result.
   Exits non-zero if any suite fails, so CI can gate on it.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = __dirname;
const suites = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.test.cjs'))
  .sort();

let failures = 0;
for (const suite of suites) {
  const r = spawnSync(process.execPath, [path.join(dir, suite)], { encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) failures++;
}

console.log(`\n${suites.length} suites run, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
