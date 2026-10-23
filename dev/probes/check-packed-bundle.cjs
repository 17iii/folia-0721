// 比对 dist/ 与包内 asar 的入口 bundle 名字，确认打进去的是刚构建的那一份。
const asar = require('@electron/asar');
const fs = require('fs');

const archive = process.argv[2];
const distHtml = fs.readFileSync(process.argv[3], 'utf8');
const packed = asar.extractFile(archive, 'dist\\index.html').toString('utf8');

const pick = (html) => (html.match(/assets\/main-[A-Za-z0-9_-]+\.js/) || [null])[0];
const a = pick(distHtml);
const b = pick(packed);
console.log('dist  :', a);
console.log('packed:', b);
console.log(a && a === b ? 'MATCH' : 'MISMATCH');

const entry = b ? b.replace('assets/', 'dist\\assets\\').replace('/', '\\') : null;
if (entry) {
    const js = asar.extractFile(archive, entry).toString('utf8');
    for (const token of ['soft-light', 'auroraSettings', 'musicFollowThemeDesc', 'linear-gradient(155deg']) {
        console.log(token, js.includes(token) ? 'present' : 'absent');
    }
}
