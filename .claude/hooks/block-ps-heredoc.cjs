#!/usr/bin/env node
'use strict';

/*
 * PreToolUse/Bash guard: block the PowerShell here-string form (@'...'@ / @"..."@)
 * in Bash-tool commands. The Bash tool is POSIX sh (Git Bash on Windows), where that
 * form is NOT a heredoc — the leading/trailing @ leaks into the command. The classic
 * failure is `git commit -m @'...'@` landing a commit whose subject is a bare @ with
 * the real title pushed to line 2. The PowerShell tool is unaffected (Bash matcher only).
 */

const { readPayload, block, allow } = require('./_util.cjs');

// Opening `@'` or `@"` at end-of-line, OR closing `'@` or `"@` at start-of-line.
const PS_HEREDOC = /@["'][ \t]*$|^[ \t]*["']@/m;

(async () => {
  const payload = await readPayload();
  const cmd = String((payload.tool_input && payload.tool_input.command) || '');
  if (!cmd.trim()) return allow();

  if (PS_HEREDOC.test(cmd)) {
    return block(
      'PowerShell here-string syntax (@\'...\'@ / @"..."@) detected in a Bash-tool command. ' +
        'The Bash tool is POSIX sh (Git Bash), not PowerShell — this form is not a heredoc there ' +
        'and leaks a stray @ into the command. Use `git commit -F <file>` (or `git commit -F -`) ' +
        "or a POSIX heredoc instead, e.g.  git commit -F - <<'EOF'  ... your message ...  EOF  " +
        "(the @'...'@ form is only valid in the PowerShell tool).",
    );
  }
  return allow();
})();
