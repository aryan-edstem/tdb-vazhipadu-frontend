/* ============================================================
   block-ps-heredoc hook test
   (node .claude/hooks/tests/block-ps-heredoc.test.cjs)

   Blocks the PowerShell here-string form (@'...'@ / @"..."@) in
   Bash-tool commands — the Bash tool is POSIX sh (Git Bash), where
   that form is not a heredoc and leaks a stray @ into the command.
   The hook only regex-matches the command string — it never runs it.
   ============================================================ */

'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const HOOK = path.join(__dirname, '..', 'block-ps-heredoc.cjs');

let passed = 0,
  failed = 0;
function ok(cond, msg) {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

// 2 = blocked, 0 = allowed
function bash(command) {
  const payload = { tool_name: 'Bash', tool_input: { command } };
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify(payload), encoding: 'utf8' })
    .status;
}

// Blocked — opening `@'` / `@"` at end-of-line.
ok(bash("git commit -m @'\nfix: title\n'@") === 2, 'single-quoted here-string commit is blocked');
ok(bash('git commit -m @"\nfix: title\n"@') === 2, 'double-quoted here-string commit is blocked');
ok(bash("cat @'\nline\n'@") === 2, "bare @' opener at EOL is blocked");
ok(bash("git commit -m @'   \nmsg\n'@") === 2, "trailing spaces after @' opener still blocked");

// Blocked — closing `'@` / `"@` at start-of-line (incl. indented).
ok(bash("printf %s <<X\nfoo\n'@") === 2, "closing '@ at start-of-line is blocked");
ok(bash('printf %s <<X\nfoo\n"@') === 2, 'closing "@ at start-of-line is blocked');
ok(bash("printf %s\n  '@") === 2, "indented closing '@ is blocked");

// Allowed.
ok(bash('') === 0, 'empty command is allowed');
ok(bash('git commit -m "normal commit"') === 0, 'ordinary git commit is allowed');
ok(bash("git commit -F - <<'EOF'\nfix: title\nEOF") === 0, 'POSIX heredoc commit is allowed');
ok(bash('git commit -F message.txt') === 0, 'git commit -F <file> is allowed');
ok(bash('git config user.email "a@example.com"') === 0, 'email address is not a false positive');
ok(bash("echo 'a@b'") === 0, '@ inside a quoted arg mid-line is not a false positive');
ok(bash('npm install') === 0, 'npm install is allowed');

console.log(`\nblock-ps-heredoc: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
