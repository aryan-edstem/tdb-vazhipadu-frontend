/* ============================================================
   protect-branches hook test (node .claude/hooks/tests/protect-branches.test.cjs)

   The guardrail blocks commits/merges/history-rewrites on a protected
   branch (main/master). Two things decide the verdict:

   1. The branch it checks must be the branch the git op actually lands
      on — the worktree the command `cd`s into rather than the hook
      process's inherited cwd, and the branch the command creates before
      the op if it creates one. `git switch -c feature/p<N> && git commit`
      is the remedy the block message itself prescribes and the routine
      first move off `main`, so it has to be allowed — while
      `switch -c main` must still be blocked.

   2. Matches must be anchored to the start of their segment, or a commit
      *message* is read as a command. `git commit -m "git -C /tmp/x
      commit"` relocates the branch lookup to a non-repo, where the branch
      reads as '' — and '' is in no protected set.

   Hermetic: builds a throwaway git repo on `main` with a `develop` branch
   and a feat-branch worktree, so the test does not depend on the branch
   this repo happens to be checked out on (CI runs on a detached merge
   ref). Cross-platform — spawns the hook the way Claude Code does (JSON
   on stdin) and uses Node path/fs APIs only.
   ============================================================ */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const HOOK = path.resolve(__dirname, '..', 'protect-branches.cjs');

let passed = 0,
  failed = 0;
function ok(cond, msg) {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

function git(args, cwd) {
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
}

// 2 = blocked, 0 = allowed
function bash(command, cwd) {
  const payload = { tool_name: 'Bash', cwd, tool_input: { command } };
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify(payload), encoding: 'utf8' })
    .status;
}

function main(root) {
  const repo = path.join(root, 'repo');
  const wt = path.join(root, 'feature-wt');
  fs.mkdirSync(repo, { recursive: true });

  // A fresh repo on `main` with one commit, a `develop` branch to switch to,
  // and a feat-branch worktree.
  git(['init', '-b', 'main'], repo);
  git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '--allow-empty', '-m', 'init'], repo);
  git(['branch', 'develop'], repo);
  git(['worktree', 'add', '-b', 'feat/x', wt, 'HEAD'], repo);

  // cd into a feat-branch worktree and commit — allowed even
  // though the shell's cwd is still a protected branch. The same op can target
  // the worktree via a subshell or `git -C <dir>` instead of a leading cd.
  ok(
    bash(`cd "${wt}" && git commit -m x`, repo) === 0,
    'cd worktree && git commit (shell on main) is allowed',
  );
  ok(
    bash(`cd "${wt}" ; git commit -m x`, repo) === 0,
    'cd worktree ; git commit (semicolon) is allowed',
  );
  ok(bash(`cd "${wt}" && git rebase main`, repo) === 0, 'cd worktree && git rebase is allowed');
  ok(
    bash(`(cd "${wt}" && git commit -m x)`, repo) === 0,
    'subshell (cd worktree && git commit) is allowed',
  );
  ok(
    bash(`git -C "${wt}" commit -m x`, repo) === 0,
    'git -C worktree commit (shell on main) is allowed',
  );
  ok(bash('git commit -m x', wt) === 0, 'plain git commit with cwd already in worktree is allowed');

  // The guardrail still bites: genuinely on a protected branch, however the
  // repo is addressed.
  ok(bash('git commit -m x', repo) === 2, 'plain git commit while on main is blocked');
  ok(bash('git merge feat/x', repo) === 2, 'git merge while on main is blocked');
  ok(bash('git rebase feat/x', repo) === 2, 'git rebase while on main is blocked');
  ok(bash('git reset --hard HEAD', repo) === 2, 'git reset --hard while on main is blocked');
  ok(
    bash('git -c core.hooksPath=/x commit -m x', repo) === 2,
    'git -c <kv> commit while on main is blocked',
  );
  ok(
    bash(`git -C "${repo}" commit -m x`, wt) === 2,
    'git -C main-repo commit (shell in worktree) is blocked',
  );

  // Non-mutating git on a protected branch is fine.
  ok(bash('git status', repo) === 0, 'git status on main is allowed');
  ok(bash(`git -C "${wt}" status`, repo) === 0, 'git -C worktree status is allowed');

  // The remedy the block message prescribes has to work: creating a branch
  // moves off the protected one, so the op chained after it lands on the new
  // branch. This is the routine first move off `main`.
  ok(
    bash('git switch -c feature/p1-offerings-list && git commit -m x', repo) === 0,
    'switch -c feature/p<N> && commit on main is allowed',
  );
  ok(
    bash('git checkout -b feature/p1-offerings-list ; git commit -m x', repo) === 0,
    'checkout -b feature/p<N> ; commit on main is allowed',
  );
  ok(
    bash("git switch -c 'feature/p1 with space' && git commit -m x", repo) === 0,
    'quoted new branch name is allowed',
  );
  // ...but the created branch is judged too, so it is not an escape hatch.
  ok(
    bash('git switch -c main && git commit -m x', repo) === 2,
    'switch -c main && commit is still blocked',
  );
  ok(
    bash('git checkout -b master && git commit -m x', wt) === 2,
    'checkout -b master && commit is still blocked',
  );

  // `develop` is not part of this repo's flow, so it is an ordinary branch here.
  git(['switch', 'develop'], repo);
  ok(bash('git commit -m x', repo) === 0, 'git commit on develop is allowed (not protected here)');

  // A commit *message* is not a command: without the anchor, `git -C <dir>` inside
  // `-m` relocates the branch lookup to a non-repo (branch '', in no protected set)
  // and the commit sails through.
  git(['switch', 'main'], repo);
  ok(
    bash('git commit -m "git -C /tmp/x commit"', repo) === 2,
    'message containing git -C is blocked on main',
  );
  ok(
    bash('git commit -m "a git -C <dir> relocates the op"', repo) === 2,
    'prose mentioning git -C is blocked on main',
  );
  ok(
    bash('git commit -m "git switch -c feature/p1-offerings-list fixes it"', repo) === 2,
    'message containing switch -c is blocked on main',
  );
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tdb-hooktest-'));
try {
  main(root);
} catch (e) {
  failed++;
  console.error(`  FAIL: harness error — ${e.message}`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log(`\nprotect-branches: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
