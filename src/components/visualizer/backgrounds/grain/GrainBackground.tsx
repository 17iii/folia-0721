import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_GRAIN_BACKGROUND_TUNING, type GrainBackgroundTuning, type Theme } from '../../../../types';
import { resolveBackgroundTint } from '../themeTint';

// src/components/visualizer/backgrounds/grain/GrainBackground.tsx
// 噪点：主题底色 + 均匀染色 + 胶片颗粒 + 暗角。
//
// 这一版刻意**没有**渐变色块：这里只要"质感"，一旦铺上斜向/径向的大范围渐变，看起来就像极光了。
// 主题色靠两件事进来：底色用 theme.backgroundColor；再盖一层 mix-blend-mode: color 的均匀染色，
// 它只改色相不造亮斑。
const GRAIN_TEXTURE_SIZE = 128;

const GrainBackground: React.FC<{
    theme: Theme;
    /** 日/夜由主题底色决定（见 resolveBackgroundTint），这个 prop 只为对齐 registry 的签名。 */
    isDaylight?: boolean;
    frozen?: boolean;
    tuning?: GrainBackgroundTuning;
}> = ({
    theme,
    frozen = false,
    tuning = DEFAULT_GRAIN_BACKGROUND_TUNING,
}) => {
    const tint = resolveBackgroundTint(theme);
    const [noiseUrl, setNoiseUrl] = useState<string>('');

    useEffect(() => {
        const size = GRAIN_TEXTURE_SIZE;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) return;
        const image = context.createImageData(size, size);
        for (let i = 0; i < image.data.length; i += 4) {
            const value = Math.random() * 255;
            image.data[i] = value;
            image.data[i + 1] = value;
            image.data[i + 2] = value;
            // 颗粒本身要碎：单个像素透明度不高，靠密度叠出质感。
            image.data[i + 3] = Math.random() * 130;
        }
        context.putImageData(image, 0, 0);
        setNoiseUrl(canvas.toDataURL());
    }, []);

    const tileSize = Math.max(40, Math.min(300, Math.round(tuning.grainSize)));
    // 颗粒是平铺贴图：位移正好走完**一个贴图**时，画面与起点逐像素相同，循环因此无缝。
    // 0 就是完全静止（默认）——噪点是质感，不该自己抖；想要"颗粒在爬"再把爬行速度往上加，
    // 速度 1 约 18 秒走一张贴图。
    const driftDistance = tileSize;
    const driftSpeed = Math.max(0, tuning.driftSpeed);
    const isDrifting = !frozen && driftSpeed > 0.05;
    const driftDuration = 18 / Math.max(0.05, driftSpeed);
    const wash = Math.max(0, Math.min(1, tuning.washStrength));
    // 亮底上同样的颗粒会显得像电视雪花，压掉近一半。
    const grainOpacity = Math.max(0.04, Math.min(0.5, tuning.grainAmount * (tint.isLightBase ? 0.9 : 1.7)));
    // 均匀染色：暗底给多一点才看得出色相，亮底压到很低免得发黄发脏。
    const tintOpacity = wash * (tint.isLightBase ? 0.14 : 0.3);

    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden"
            style={{ backgroundColor: tint.base }}
        >
            {/* 主题色均匀染色：不带任何方向，避免出现"幕帘"或"光斑"。 */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: tint.accent,
                    mixBlendMode: 'color',
                    opacity: tintOpacity,
                }}
            />
            {/* 胶片颗粒。底色越亮，颗粒越该往下压（multiply），否则会发白。 */}
            {noiseUrl && (
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("${noiseUrl}")`,
                        backgroundSize: `${tileSize}px ${tileSize}px`,
                        mixBlendMode: tint.isLightBase ? 'multiply' : 'overlay',
                        opacity: grainOpacity,
                    }}
                    animate={isDrifting ? { x: [0, -driftDistance], y: [0, driftDistance] } : undefined}
                    transition={isDrifting ? { duration: driftDuration, repeat: Infinity, ease: 'linear' } : undefined}
                />
            )}
            {/* 四角极轻地压一下，把注意力收到中间；不用辅色，免得又出现色块。 */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(130% 130% at 50% 45%, transparent ${tint.isLightBase ? 62 : 52}%, ${tint.isLightBase ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.22)'} 100%)`,
                }}
            />
        </div>
    );
};

export default GrainBackground;
