const http = require('http');
const WebSocket = require('ws');

const port = process.argv[2] || '9333';
const waitMs = Number(process.argv[3] || 15000);

const getJson = (path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (res) => {
    let body = '';
    res.on('data', (c) => { body += c; });
    res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

(async () => {
  const list = await getJson('/json/list');
  if (!list.length) { console.log('no targets'); return; }
  const url = list[0].webSocketDebuggerUrl;
  console.log('connecting', url);
  const ws = new WebSocket(url, { perMessageDeflate: false });
  let id = 0;
  const send = (method, params) => {
    const payload = JSON.stringify({ id: ++id, method, params });
    console.log('->', payload.slice(0, 120));
    ws.send(payload);
  };

  ws.on('open', () => {
    console.log('[open]');
    send('Runtime.runIfWaitingForDebugger');
    setTimeout(() => { send('Runtime.enable'); send('Runtime.discardConsoleEntries'); }, 500);
  });

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id) { console.log('<- ack', msg.id, msg.error ? JSON.stringify(msg.error) : 'ok'); return; }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      console.log('\n=== EXCEPTION ===');
      console.log('text:', d.text);
      console.log('url:', d.url, 'line:', d.lineNumber, 'col:', d.columnNumber);
      if (d.exception) console.log('describe:', String(d.exception.description || '').slice(0, 4000));
      if (d.stackTrace && d.stackTrace.callFrames) {
        for (const f of d.stackTrace.callFrames.slice(0, 15)) {
          console.log(`  at ${f.functionName || '<anon>'} (${f.url}:${f.lineNumber + 1}:${f.columnNumber + 1})`);
        }
      }
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ');
      console.log(`[console.${msg.params.type}]`, String(text).slice(0, 800));
    } else if (msg.method === 'Runtime.executionContextCreated') {
      console.log('[ctx]', msg.params.context.name, msg.params.context.origin || '');
    } else {
      console.log('[event]', msg.method);
    }
  });

  ws.on('close', () => console.log('[close]'));
  ws.on('error', (e) => console.log('[ws error]', e.message));

  setTimeout(() => process.exit(0), waitMs);
})();
