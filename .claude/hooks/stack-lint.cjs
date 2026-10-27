#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { readPayload, allow, surfaceToModel, extractFileEdit } = require('./_util.cjs');

function have(bin) {
  try {
    execSync(process.platform === 'win32' ? `where ${bin}` : `command -v ${bin}`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

// Only lint when eslint is actually installed locally. If node_modules isn't set up,
// no-op rather than block every edit with a spurious "eslint not found" — CI and the
// husky pre-commit still enforce linting.
function eslintInstalled(root) {
  const dir = path.join(root, 'node_modules', '.bin');
  return ['eslint', 'eslint.cmd', 'eslint.CMD', 'eslint.ps1'].some((b) =>
    fs.existsSync(path.join(dir, b)),
  );
}

// The edited file may live in a git worktree (`.worktrees/p1/src/...`) rather than the
// session's project dir, so resolve the package root from the file itself, not from cwd.
function packageRoot(file) {
  let dir = path.dirname(path.resolve(file));
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function run(cmd, cwd) {
  try {
    execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return null;
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).trim() || `lint failed: ${cmd}`;
  }
}

function lintCommand(p) {
  const root = packageRoot(p);
  if (!root) return null;
  // Write/Edit pass an absolute file_path — make it package-relative before matching src/.
  const rel = path.relative(root, path.resolve(p)).replace(/\\/g, '/');
  if (!/^src\/.*\.tsx?$/.test(rel)) return null;
  if (!eslintInstalled(root)) return null;
  // pnpm project — resolve the locally-installed eslint (npx --no-install does not find it).
  if (have('pnpm')) return { cmd: `pnpm exec eslint --max-warnings=0 "${rel}"`, root };
  if (have('npx')) return { cmd: `npx --no-install eslint --max-warnings=0 "${rel}"`, root };
  return null;
}

(async () => {
  const payload = await readPayload();
  const { filePath } = extractFileEdit(payload);
  if (!filePath) return allow();

  const lint = lintCommand(filePath);
  if (!lint) return allow();

  const out = run(lint.cmd, lint.root);
  if (out) {
    return surfaceToModel(
      `ESLint flagged ${filePath} — fix before moving on (this would fail CI, which runs with --max-warnings=0):\n${out.slice(0, 2000)}`,
    );
  }
  return allow();
})();
