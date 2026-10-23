// 通过 CDP 连到渲染进程：收集报错并截一张图。
// 用法: node dev/probes/renderer-shot.cjs <port> <out.png> [waitMs]
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const port = process.argv[2] || '9444';
const outFile = process.argv[3] || 'shot.png';
const waitMs = Number(process.argv[4] || 6000);

const getJson = (path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (res) => {
    let body = '';
    res.on('data', (c) => { body += c; });
    res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

(async () => {
  const list = await getJson('/json/list');
  const page = list.find((t) => t.type === 'page');
  if (!page) { console.log('no page target'); process.exit(1); }
  console.log('page:', page.title, page.url);
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const send = (method, params) => ws.send(JSON.stringify({ id: ++id, method, params }));

  ws.on('open', () => {
    send('Runtime.enable');
    send('Log.enable');
    send('Page.enable');
    setTimeout(() => send('Page.captureScreenshot', { format: 'png' }), waitMs);
  });

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      console.log('[EXCEPTION]', String(d.exception && d.exception.description || d.text).slice(0, 700));
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ');
      console.log('[console.error]', String(text).slice(0, 500));
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      console.log('[log.error]', String(msg.params.entry.text).slice(0, 400));
    } else if (msg.id && msg.result && msg.result.data) {
      fs.writeFileSync(outFile, Buffer.from(msg.result.data, 'base64'));
      console.log('screenshot ->', outFile);
      setTimeout(() => process.exit(0), 800);
    }
  });

  ws.on('error', (e) => { console.log('ws error', e.message); process.exit(1); });
  setTimeout(() => process.exit(0), waitMs + 8000);
})();
