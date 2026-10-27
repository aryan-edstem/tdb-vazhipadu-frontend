#!/usr/bin/env node
'use strict';

const path = require('path');
const { execSync } = require('child_process');
const { readPayload, block, allow } = require('./_util.cjs');

// Every problem lands on `main` through its own PR from a `feature/p<N>-<slug>` branch, so `main`
// stays releasable and each PR shows a clean, reviewable commit story. Never commit, merge, or
// rewrite history directly on it.
const PROTECTED_BRANCHES = new Set(['main', 'master']);

// `git` global options that don't change the subcommand — notably `-C <dir>`,
// which (like cd) makes the op target a different repo dir. One source of truth
// so op detection and the targetDir `-C` capture agree on what they skip.
const GIT_OPT = String.raw`(?:-C\s+(?:'[^']*'|"[^"]*"|\S+)|-c\s+\S+|-p|--no-pager)`;
const GIT = String.raw`\bgit\s+(?:` + GIT_OPT + String.raw`\s+)*`;

// Every match below is anchored to the start of its segment: a real git invocation opens the
// segment, while a mention inside `-m "…"` never does. Without the anchor a commit *message* is
// read as a command. The `-C` capture is the one that matters most — relocating the lookup to a
// directory that is not a repo makes `currentBranch` return '', and '' is in no protected set,
// so the commit sails through. Ordinary prose is enough to do it: "a git -C <dir> relocates the
// op" is a sentence about this very hook.
const AT = String.raw`^[\s(){]*`;

const GIT_OP = new RegExp(AT + GIT + String.raw`(?:commit|merge|rebase|reset)\b`);
// Same global-option prefix, but capturing the final `-C <dir>`.
const GIT_C = new RegExp(
  AT + String.raw`git\s+(?:` + GIT_OPT + String.raw`\s+)*-C\s+(?:(['"])(.*?)\1|(\S+))`,
);

// Creating a branch moves off the protected one, so a mutating op chained after it lands on the
// new branch instead. `git switch -c X` / `git checkout -b X` is the remedy this hook's own
// block message prescribes, and the routine first move off `main` — chaining it with the
// commit has to be allowed, or the fix reads as the violation. The new branch name is captured
// so the op is still judged against the branch it really lands on: `switch -c main` is not an
// escape hatch.
const BRANCH_CREATE = new RegExp(
  AT + GIT + String.raw`(?:switch\s+-c|checkout\s+-b)\s+(?:(['"])(.*?)\1|(\S+))`,
);

// The git op runs in whatever directory the command targets, not the hook
// process's inherited cwd: a leading `cd` (optionally inside a subshell) or a
// `git -C <dir>` both relocate it. Walk the command and resolve those so we
// check the branch of the repo the commit actually lands in — and the branch the
// command switches to before the op, if it creates one.
function resolveTarget(cmd, baseDir) {
  let dir = baseDir;
  for (const seg of cmd.split(/&&|\|\||;|\n/)) {
    const cd = seg.match(/^[\s(]*cd\s+(?:(['"])(.*?)\1|(\S+))/);
    if (cd) dir = path.resolve(dir, cd[2] != null ? cd[2] : cd[3]);
    const gitC = seg.match(GIT_C);
    if (gitC) dir = path.resolve(dir, gitC[2] != null ? gitC[2] : gitC[3]);
    // Anchoring (see AT above) keeps a commit *message* from posing as a command, so a segment
    // is never read as both an op and a create. Checking the op first is a backstop: a genuine
    // create-then-commit is split across segments by `&&`/`;`, so the create is seen in its own
    // segment, before the op.
    if (GIT_OP.test(seg)) break;
    const made = seg.match(BRANCH_CREATE);
    if (made) return { dir, createdBranch: made[2] != null ? made[2] : made[3] };
  }
  return { dir, createdBranch: null };
}

function currentBranch(cwd) {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

(async () => {
  const payload = await readPayload();
  const tool = payload.tool_name || '';

  if (tool !== 'Bash') return allow();

  const cmd = String((payload.tool_input && payload.tool_input.command) || '');
  const advancesBranch = new RegExp(GIT + String.raw`(?:commit|merge)\b`).test(cmd);
  const rewritesHistory =
    new RegExp(GIT + String.raw`rebase\b`).test(cmd) ||
    new RegExp(GIT + String.raw`reset\s+--hard\b`).test(cmd);
  const { dir, createdBranch } = resolveTarget(cmd, payload.cwd || process.cwd());
  const branch = createdBranch != null ? createdBranch : currentBranch(dir);
  if ((advancesBranch || rewritesHistory) && PROTECTED_BRANCHES.has(branch)) {
    return block(
      `You are on '${branch}', a protected branch — no commits, merges, or history rewrites ` +
        `here. Every problem lands via its own PR into main. Create a branch from an up-to-date ` +
        `main first:  git switch -c feature/p<N>-<slug> and work there.`,
    );
  }
  return allow();
})();
