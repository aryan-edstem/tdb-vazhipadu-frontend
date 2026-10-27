#!/usr/bin/env node
'use strict';

const { readPayload, block, allow } = require('./_util.cjs');

const RULES = [
  [
    'pipe-to-shell from the network (curl|wget | sh)',
    /\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba)?sh\b/i,
    'Download to a file, inspect it, then run it.',
  ],
  [
    'force push',
    /\bgit\s+push\b[^\n;&|]*--force(?!-with-lease)\b|\bgit\s+push\b[^\n;&|]*\s-f\b/i,
    'Use --force-with-lease, and never against main.',
  ],
  [
    'bypassing git hooks',
    /\bgit\s+commit\b[^\n]*\s(?:-n|--no-verify)\b|\bgit\s+push\b[^\n]*\s--no-verify\b/i,
    'Hooks exist to catch bad changes early — fix the cause instead.',
  ],
  [
    'irreversible history rewrite',
    /\bgit\s+(filter-branch|reflog\s+expire)\b/i,
    'This permanently rewrites history; prefer a new commit.',
  ],
  [
    'world-writable chmod',
    /\bchmod\s+(-[a-zR]+\s+)*0?777\b/i,
    'Grant the narrowest permissions that work.',
  ],
  [
    'disabling TLS verification',
    /\b(curl\s+(-k|--insecure)|git\s+-c\s+http\.sslverify=false)\b/i,
    null,
  ],
  [
    'piping secrets to the network',
    /\b(cat|type)\b[^\n]*\.(env|pem|key)\b[^\n]*\|\s*(curl|wget|nc)\b/i,
    null,
  ],
];

const DANGEROUS_RM_TARGET =
  /\brm\s+(-[a-z]*\s+)*(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)[a-z]*\s+(\/(\s|$)|\/\*|~\/?(\s|$)|\$HOME|\.\s*$|\*\s*$)/i;

(async () => {
  const payload = await readPayload();
  const cmd = String((payload.tool_input && payload.tool_input.command) || '');
  if (!cmd.trim()) return allow();

  if (/\brm\b/.test(cmd) && DANGEROUS_RM_TARGET.test(cmd)) {
    return block(
      `Refusing 'rm -rf' against a root/home/glob target in: ${cmd.slice(0, 120)}. ` +
        `Scope the delete to an explicit project subdirectory.`,
    );
  }

  for (const [label, re, hint] of RULES) {
    if (re.test(cmd)) {
      return block(
        `Blocked unsafe command (${label}): ${cmd.slice(0, 120)}.${hint ? ' ' + hint : ''}`,
      );
    }
  }
  return allow();
})();
