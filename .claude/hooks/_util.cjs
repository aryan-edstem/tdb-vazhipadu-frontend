'use strict';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    if (process.stdin.isTTY) resolve('');
  });
}

async function readPayload() {
  const raw = await readStdin();
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function block(reason) {
  process.stderr.write(`[blocked by hook] ${reason}\n`);
  process.exit(2);
}

function allow(note) {
  if (note) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: note },
      }),
    );
  }
  process.exit(0);
}

function permit(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

function surfaceToModel(note) {
  process.stderr.write(note + '\n');
  process.exit(2);
}

function extractFileEdit(payload) {
  const ti = payload.tool_input || {};
  const filePath = ti.file_path || ti.path || '';
  const content = ti.content || ti.new_string || '';
  return { filePath: String(filePath).replace(/\\/g, '/'), content: String(content) };
}

module.exports = { readPayload, block, allow, permit, surfaceToModel, extractFileEdit };
