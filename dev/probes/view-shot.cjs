// 只切背景 + 直接把视图设成 player 再截图，用来单独看背景长什么样。
// 用法: node dev/probes/view-shot.cjs <port> <mode> <out.png>
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const port = process.argv[2] || '9562';
const mode = process.argv[3] || 'grain';
const outFile = process.argv[4] || 'shot.png';

const getJson = (path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (res) => {
    let body = '';
    res.on('data', (c) => { body += c; });
    res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const list = await getJson('/json/list');
  const page = list.find((t) => t.type === 'page');
  if (!page) { console.log('no page'); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  const send = (method, params) => new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
    setTimeout(() => reject(new Error('timeout ' + method)), 15000);
  });
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('[EXCEPTION]', String(msg.params.exceptionDetails.exception?.description || '').slice(0, 400));
    }
  });

  await new Promise((r) => ws.on('open', r));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('visualizer_background_mode', ${JSON.stringify(mode)}); localStorage.setItem('last_app_view', 'player'); 'ok'`,
  });
  await send('Page.reload');
  await sleep(9000);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outFile, Buffer.from(shot.data, 'base64'));
  const info = await send('Runtime.evaluate', { expression: `document.querySelectorAll('canvas').length`, returnByValue: true });
  console.log('canvases:', info.result?.value, '->', outFile);
  process.exit(0);
})().catch((e) => { console.log('failed:', e.message); process.exit(1); });
