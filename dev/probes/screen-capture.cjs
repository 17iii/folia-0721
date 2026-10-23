// 用 Electron 的 desktopCapturer 截一张全屏，方便确认"屏幕上到底是什么"。
// 用法: ./node_modules/electron/dist/electron.exe dev/probes/screen-capture.cjs <out.png> [scale]
const { app, desktopCapturer, screen } = require('electron');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'screen.png';
const scale = Number(process.argv[3] || 1);

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
    const display = screen.getPrimaryDisplay();
    const size = display.size;
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
            width: Math.round(size.width * scale),
            height: Math.round(size.height * scale),
        },
    });
    if (!sources.length) {
        console.error('no screen source');
        app.exit(1);
        return;
    }
    const image = sources[0].thumbnail;
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    fs.writeFileSync(out, image.toPNG());
    console.log('saved', out, image.getSize());
    app.exit(0);
});
