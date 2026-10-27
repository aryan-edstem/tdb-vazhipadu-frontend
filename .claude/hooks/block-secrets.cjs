#!/usr/bin/env node
'use strict';

const { readPayload, block, allow, extractFileEdit } = require('./_util.cjs');

const PATTERNS = [
  ['private key block', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['AWS secret access key', /\baws_secret_access_key\s*[:=]\s*['"]?[A-Za-z0-9/+]{40}\b/i],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_\-]{35}\b/],
  ['Stripe secret key', /\bsk_(?:live|test)_[0-9A-Za-z]{16,}\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  [
    'generic secret assignment',
    /\b(?:api[_-]?key|secret|password|passwd|token|client[_-]?secret)\s*[:=]\s*['"][^'"\s]{12,}['"]/i,
  ],
];

const PLACEHOLDER =
  /(your[_-]?|example|placeholder|changeme|dummy|fake|xxxx|<[^>]+>|\$\{|\benv\.|process\.env|import\.meta\.env|os\.environ|getenv)/i;

(async () => {
  const payload = await readPayload();
  const { filePath, content } = extractFileEdit(payload);
  if (!content) return allow();

  if (/\.env\.(example|sample|template)$/.test(filePath)) return allow();

  for (const [label, re] of PATTERNS) {
    const m = content.match(re);
    if (m && !PLACEHOLDER.test(m[0])) {
      return block(
        `Looks like a real ${label} is being written to ${filePath || 'a file'}: "${m[0].slice(0, 24)}…". ` +
          `Do not hardcode secrets. Read them from the environment (VITE_* in .env) / a secret store, and use a ` +
          `placeholder in committed files (e.g. .env.example). If this is a false positive, ` +
          `rename it to an obvious placeholder.`,
      );
    }
  }
  return allow();
})();
