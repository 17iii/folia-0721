// 量一下噪点层的实际位移速度：两次采样之间应该是"匀速小位移"，不是"跳一下回原点"。
// 用法: node dev/probes/measure-drift.cjs <port> [gapMs]
const http = require('http');
const WebSocket = require('ws');

const port = process.argv[2] || '9564';
const gap = Number(process.argv[3] || 400);

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
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
  });
  await new Promise((r) => ws.on('open', r));
  await send('Runtime.enable');

  const probe = `(() => {
    const layers = [...document.querySelectorAll('div')].filter((el) => {
      const bg = el.style.backgroundImage || '';
      return bg.startsWith('url("data:image');
    });
    const el = layers[0];
    if (!el) return { found: false };
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return { found: true, x: m.m41, y: m.m42, width: el.getBoundingClientRect().width };
  })()`;

  const read = async () => {
    const out = await send('Runtime.evaluate', { expression: probe, returnByValue: true });
    return out.result?.value;
  };

  const a = await read();
  await sleep(gap);
  const b = await read();
  console.log('t0', a);
  console.log('t1', b);
  if (a?.found && b?.found) {
    console.log(`Δx=${(b.x - a.x).toFixed(2)}px  Δy=${(b.y - a.y).toFixed(2)}px in ${gap}ms`);
  }
  process.exit(0);
})();
