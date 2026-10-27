/* ============================================================
   block-secrets hook test
   (node .claude/hooks/tests/block-secrets.test.cjs)

   Blocks file writes that embed a real-looking credential, while
   letting placeholders and *.env.example/sample/template through.
   The hook never executes anything — it scans the write payload —
   so these cases are pure string matching and cross-platform.

   NOTE: secret-looking values are assembled at runtime via string
   concatenation so the literal patterns never appear contiguously
   in this source file — otherwise block-secrets would (correctly)
   refuse to let us write the test itself.
   ============================================================ */

'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const HOOK = path.join(__dirname, '..', 'block-secrets.cjs');

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
function write(filePath, content) {
  const payload = { tool_name: 'Write', tool_input: { file_path: filePath, content } };
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify(payload), encoding: 'utf8' })
    .status;
}

// Reassembled so this file does not itself contain a matchable secret.
const AWS_KEY = 'AKIA' + '1234567890ABCDEF';
const PRIVATE_KEY =
  '-----BEGIN RSA ' + 'PRIVATE KEY-----\nMIIabc...\n-----END RSA ' + 'PRIVATE KEY-----';
const GH_TOKEN = 'ghp_' + '0123456789abcdefABCDEF0123456789abcdef';
const ANTHROPIC_KEY = 'sk-ant-' + '0123456789abcdefghijABCDEF';
const SECRET_ASSIGN = 'password = "' + 'hunter2hunter2"';

// Blocked: real-looking secrets with no placeholder marker.
ok(write('src/a.js', `const k = "${AWS_KEY}";`) === 2, 'real AWS access key id is blocked');
ok(write('id_rsa', PRIVATE_KEY) === 2, 'private key block is blocked');
ok(write('src/a.js', GH_TOKEN) === 2, 'GitHub token is blocked');
ok(write('src/a.js', ANTHROPIC_KEY) === 2, 'Anthropic API key is blocked');
ok(write('config.py', SECRET_ASSIGN) === 2, 'generic secret assignment is blocked');

// Allowed: placeholders and env indirection.
ok(
  write('src/a.js', 'AKIAIOSFODNN7EXAMPLE') === 0,
  'placeholder AWS key (contains EXAMPLE) is allowed',
);
ok(
  write('config.py', 'api_key = "your-api-key-here"') === 0,
  'your-* placeholder value is allowed',
);
ok(write('config.py', 'password = "${DB_PASSWORD}"') === 0, '${...} interpolation is allowed');
ok(
  write('src/a.js', 'const token = import.meta.env.VITE_TOKEN') === 0,
  'import.meta.env indirection is allowed',
);

// Allowed: example env files are exempt even with real-looking values.
ok(write('.env.example', AWS_KEY) === 0, '.env.example is exempt');
ok(write('config/db.env.sample', SECRET_ASSIGN) === 0, '*.env.sample is exempt');

// Allowed: empty / no content.
ok(write('src/a.js', '') === 0, 'empty content is allowed');
ok(write('src/a.js', 'export const sum = (a, b) => a + b;') === 0, 'ordinary code is allowed');

console.log(`\nblock-secrets: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
