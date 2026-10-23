// 抓指定窗口（默认 Folia）而不是整屏，用户在用电脑时也能看到播放页当前的样子。
// 用法: electron dev/probes/window-capture.cjs <out.png> [窗口名关键字]
const { app, desktopCapturer, screen } = require('electron');
const fs = require('fs');

const out = process.argv[2] || 'window.png';
const keyword = (process.argv[3] || 'Folia').toLowerCase();

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
    const display = screen.getPrimaryDisplay();
    const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: display.size.width * 2, height: display.size.height * 2 },
        fetchWindowIcons: false,
    });
    const matches = sources.filter((s) => s.name.toLowerCase().includes(keyword));
    if (!matches.length) {
        console.log('no window matched:', sources.map((s) => s.name).slice(0, 20));
        app.exit(1);
        return;
    }
    console.log('matched:', matches.map((m) => m.name));
    fs.writeFileSync(out, matches[0].thumbnail.toPNG());
    console.log('saved', out, matches[0].thumbnail.getSize());
    app.exit(0);
});
