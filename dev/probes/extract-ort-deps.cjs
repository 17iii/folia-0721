// 从已安装的 0.7.17 包里抠出 onnxruntime 及其依赖，补进本仓库 node_modules。
const asar = require('@electron/asar');
const fs = require('fs');
const path = require('path');

const pkg = 'D:/Folia/resources/app.asar';
const modules = process.argv.slice(2);
const roots = (modules.length ? modules : ['onnxruntime-common', 'adm-zip', 'global-agent'])
    .map((name) => `node_modules/${name}/`);
const files = asar.listPackage(pkg);
let written = 0;
for (const entry of files) {
    if (entry.endsWith('\\')) continue;
    const rel = entry.replace(/^\\/, '').replace(/\\/g, '/');
    if (!roots.some((r) => rel.startsWith(r))) continue;
    const dest = path.join(process.cwd(), rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const win = rel.split('/').join('\\');
    let body = null;
    try {
        body = asar.extractFile(pkg, win);
    } catch {
        continue; // 目录条目
    }
    fs.writeFileSync(dest, body);
    written += 1;
}
console.log('extracted', written);
