// 设背景模式 → 用命令面板起播 → 截播放页，用来看背景到底长什么样。
// 用法: node dev/probes/player-shot.cjs <port> <mode> <out.png> [query]
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const port = process.argv[2] || '9555';
const mode = process.argv[3] || 'grain';
const outFile = process.argv[4] || 'shot.png';
const query = process.argv[5] || '播放';
const follow = process.argv[6] === 'follow';

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
      console.log('[EXCEPTION]', String(msg.params.exceptionDetails.exception?.description || '').slice(0, 300));
    }
  });

  await new Promise((r) => ws.on('open', r));
  await send('Runtime.enable');
  await send('Page.enable');

  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('visualizer_background_mode', ${JSON.stringify(mode)}); localStorage.setItem('music_follow_enabled', '${follow}'); 'ok'`,
  });
  await send('Page.reload');
  await sleep(8000);

  // Ctrl+K 打开命令面板，输入关键词后回车
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'k', code: 'KeyK', windowsVirtualKeyCode: 75, modifiers: 2 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'k', code: 'KeyK', windowsVirtualKeyCode: 75, modifiers: 2 });
  await sleep(1200);
  await send('Input.insertText', { text: query });
  await sleep(1500);
  for (const type of ['keyDown', 'keyUp']) {
    await send('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  }
  await sleep(follow ? 14000 : 6000);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outFile, Buffer.from(shot.data, 'base64'));
  console.log('mode', mode, '-> screenshot', outFile);
  process.exit(0);
})().catch((error) => { console.log('failed:', error.message); process.exit(1); });
