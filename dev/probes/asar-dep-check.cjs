// 诊断：对比解包后的 app.asar 与依赖声明，找出打包时被漏掉的模块。
// 用法: node dev/probes/asar-dep-check.cjs <解包目录>
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
if (!root || !fs.existsSync(root)) {
  console.error('usage: node asar-dep-check.cjs <extracted-asar-dir>');
  process.exit(1);
}

const pkgCache = new Map();
const readPkg = (dir) => {
  if (pkgCache.has(dir)) return pkgCache.get(dir);
  const file = path.join(dir, 'package.json');
  let value = null;
  try { value = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { value = null; }
  pkgCache.set(dir, value);
  return value;
};

const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

const resolveFrom = (fromDir, name) => {
  let dir = fromDir;
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name);
    if (isDir(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    if (dir === root) return null;
    dir = parent;
  }
};

// 收集所有已打包的包目录（含嵌套 node_modules 里的包）
const packages = [];
const walk = (dir, depth) => {
  if (depth > 6) return;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (dir.endsWith('node_modules')) {
      if (entry.name.startsWith('@')) { walk(full, depth + 1); continue; }
      packages.push(full);
      walk(path.join(full, 'node_modules'), depth + 1);
    } else if (entry.name === 'node_modules') {
      walk(full, depth);
    }
  }
};
walk(path.join(root, 'node_modules'), 0);

const missing = new Map();
for (const dir of packages) {
  const pkg = readPkg(dir);
  if (!pkg) continue;
  const declared = {
    ...(pkg.dependencies || {}),
    ...(pkg.peerDependencies || {}),
  };
  for (const name of Object.keys(declared)) {
    if (!resolveFrom(dir, name)) {
      const rel = path.relative(root, dir).replace(/\\/g, '/');
      if (!missing.has(name)) missing.set(name, new Set());
      missing.get(name).add(rel);
    }
  }
}

// 自家代码里的裸 require
const ownMissing = new Map();
const ownDirs = ['electron', 'shared'].map((d) => path.join(root, d)).filter(isDir);
const scanOwn = (dir) => {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { scanOwn(full); continue; }
    if (!/\.(cjs|js|mjs)$/.test(entry.name)) continue;
    const code = fs.readFileSync(full, 'utf8');
    const re = /require\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g;
    let m;
    while ((m = re.exec(code))) {
      const raw = m[1];
      const name = raw.startsWith('@') ? raw.split('/').slice(0, 2).join('/') : raw.split('/')[0];
      if (name.startsWith('node:')) continue;
      if (require('module').builtinModules.includes(name)) continue;
      if (!resolveFrom(dir, name)) {
        const rel = path.relative(root, full).replace(/\\/g, '/');
        if (!ownMissing.has(name)) ownMissing.set(name, new Set());
        ownMissing.get(name).add(rel);
      }
    }
  }
};
ownDirs.forEach(scanOwn);

const show = (title, map) => {
  console.log(`\n## ${title} (${map.size})`);
  for (const [name, where] of [...map.entries()].sort()) {
    console.log(`  ${name}  <- ${[...where].slice(0, 4).join(', ')}`);
  }
};

console.log(`packages scanned: ${packages.length}`);
show('自家代码 require 缺失', ownMissing);
show('包声明的依赖缺失', missing);
