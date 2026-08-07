const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name.startsWith('_audit')) continue;
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(js|jsx)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const root = __dirname;
const files = walk(root);
const contents = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));

function isImported(file) {
  const base = path.basename(file, path.extname(file));
  const rel = path.relative(root, file).split(path.sep).join('/');
  const stem = rel.replace(/\.(js|jsx)$/, '');
  const candidates = new Set([base, stem]);
  const parts = stem.split('/');
  if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
    candidates.add(parts.slice(0, -1).join('/'));
  }

  for (const [other, text] of contents) {
    if (other === file) continue;
    for (const c of candidates) {
      const esc = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(
        `(from\\s+['"\`][^'"\`]*${esc}(?:\\.(?:js|jsx))?['"\`]|import\\s*\\(\\s*['"\`][^'"\`]*${esc}(?:\\.(?:js|jsx))?['"\`]\\s*\\))`,
      );
      if (re.test(text)) return true;
    }
  }
  return false;
}

const entryish = new Set(['main.jsx', 'App.jsx', 'index.js', 'index.jsx']);
const unref = [];
for (const f of files) {
  if (entryish.has(path.basename(f))) continue;
  if (!isImported(f)) unref.push(path.relative(root, f).split(path.sep).join('/'));
}
console.log('UNREFERENCED (' + unref.length + '):');
unref.sort().forEach((u) => console.log('  ' + u));

// Unused named exports from utils + services
const targetDirs = ['utils', 'services', 'api', 'hooks', 'config'].map((d) =>
  path.join(root, d),
);
const exportRe =
  /^export\s+(?:async\s+)?(?:function|const|class|let|var)\s+([A-Za-z0-9_]+)|^export\s+\{([^}]+)\}/gm;

function collectExports(file, text) {
  const names = [];
  let m;
  const re = new RegExp(exportRe.source, 'gm');
  while ((m = re.exec(text))) {
    if (m[1]) names.push(m[1]);
    if (m[2]) {
      m[2].split(',').forEach((part) => {
        const cleaned = part.trim().split(/\s+as\s+/).pop().trim();
        if (cleaned) names.push(cleaned);
      });
    }
  }
  // export { X } from re-exports already covered
  return names;
}

console.log('\nUNUSED EXPORTS (utils/services/api/hooks/config):');
for (const f of files) {
  const rel = path.relative(root, f).split(path.sep).join('/');
  if (!/^(utils|services|api|hooks|config)\//.test(rel)) continue;
  const text = contents.get(f);
  const names = collectExports(f, text);
  for (const name of names) {
    let used = false;
    for (const [other, otherText] of contents) {
      if (other === f) continue;
      // crude: identifier as import binding or property access after import
      const re = new RegExp(
        `\\b${name}\\b`,
      );
      if (re.test(otherText)) {
        used = true;
        break;
      }
    }
    // also used inside same file (self-use) counts as used for public API check? report external unused
    if (!used) {
      // check self-use excluding the export line
      const selfUses = (text.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
      if (selfUses <= 1) {
        console.log(`  ${rel} :: ${name}`);
      } else {
        console.log(`  ${rel} :: ${name} (self-only)`);
      }
    }
  }
}
