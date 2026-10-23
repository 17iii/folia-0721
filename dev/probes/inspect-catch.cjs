const http = require('http');
const WebSocket = require('ws');

const target = process.argv[2] || '127.0.0.1:9333';
const waitMs = Number(process.argv[3] || 12000);

const getJson = (path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port: target.split(':')[1], path }, (res) => {
    let body = '';
    res.on('data', (c) => { body += c; });
    res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

(async () => {
  const list = await getJson('/json/list');
  const url = list[0].webSocketDebuggerUrl;
  console.log('connecting', url);
  const ws = new WebSocket(url, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 });
  let id = 0;
  const send = (method, params) => ws.send(JSON.stringify({ id: ++id, method, params }));

  ws.on('open', () => {
    send('Runtime.enable');
    send('Log.enable');
    setTimeout(() => send('Runtime.runIfWaitingForDebugger'), 300);
  });

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      console.log('\n=== EXCEPTION ===');
      console.log('text:', d.text);
      console.log('url:', d.url, 'line:', d.lineNumber, 'col:', d.columnNumber);
      if (d.exception) {
        console.log('describe:', d.exception.description ? d.exception.description.slice(0, 4000) : '');
        if (d.exception.preview && d.exception.preview.properties) {
          console.log('props:', JSON.stringify(d.exception.preview.properties).slice(0, 1500));
        }
      }
      if (d.stackTrace && d.stackTrace.callFrames) {
        for (const f of d.stackTrace.callFrames.slice(0, 15)) {
          console.log(`  at ${f.functionName || '<anon>'} (${f.url}:${f.lineNumber + 1}:${f.columnNumber + 1})`);
        }
      }
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ');
      if (/error|fail|cannot|throw|invalid/i.test(text)) console.log('[console]', String(text).slice(0, 600));
    } else if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      console.log(`[log:${e.level}]`, String(e.text).slice(0, 400));
    } else if (msg.method === 'Runtime.executionContextDestroyed') {
      console.log('[context destroyed]');
    }
  });

  ws.on('error', (e) => console.log('ws error', e.message));

  setTimeout(() => process.exit(0), waitMs);
})();
