// 设置背景模式后重载并截图，用来肉眼确认新背景真的渲染出来了。
// 用法: node dev/probes/bg-shot.cjs <port> <mode> <out.png>
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const port = process.argv[2] || '9555';
const mode = process.argv[3] || 'aurora';
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
  console.log('page:', page.title);
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  const send = (method, params) => new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('[EXCEPTION]', String(msg.params.exceptionDetails.exception?.description || '').slice(0, 300));
    }
  });

  await new Promise((r) => ws.on('open', r));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('visualizer_background_mode', ${JSON.stringify(mode)}); 'ok'`,
  });
  console.log('mode set ->', mode);
  await send('Page.reload', { ignoreCache: false });
  await sleep(9000);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outFile, Buffer.from(shot.data, 'base64'));
  console.log('screenshot ->', outFile);
  process.exit(0);
})();
