import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_GRAIN_BACKGROUND_TUNING, type GrainBackgroundTuning, type Theme } from '../../../../types';
import { colorWithAlpha } from '../../colorMix';
import { resolveBackgroundTint, tintedBackdrop } from '../themeTint';

// src/components/visualizer/backgrounds/grain/GrainBackground.tsx
// 噪点：胶片颗粒质感，叠在主题色晕染上。颗粒的浓度、大小、爬行速度与晕染强度由参数面板决定。
// 颗粒贴图按固定分辨率生成一次，参数里的「大小」是它在屏幕上的平铺尺寸。
//
// 颜色全部来自主题：底 = 主题背景色，雾/晕染 = 强调色 + 辅色。之前底色和晕染都写死成
// 近黑 + 文字色，所以换主题时这块完全不动。
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
            image.data[i + 3] = Math.random() * 64;
        }
        context.putImageData(image, 0, 0);
        setNoiseUrl(canvas.toDataURL());
    }, []);

    const tileSize = Math.max(40, Math.min(300, Math.round(tuning.grainSize)));
    const driftDuration = 0.7 / Math.max(0.05, tuning.driftSpeed);
    const wash = Math.max(0, Math.min(1, tuning.washStrength));
    // 低到"能看出色相"就够：再高就成了一层灰雾，反而看不出主题。
    const washAlpha = wash * (tint.isLightBase ? 0.09 : 0.15);

    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden"
            style={{ background: tintedBackdrop(tint) }}
        >
            {/* 主题色的斜向晕染：让颗粒躺在有颜色的空气里，而不是躺在纯黑上。 */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(155deg, ${colorWithAlpha(tint.accent, washAlpha)} 0%, transparent 58%, ${colorWithAlpha(tint.secondary, washAlpha * 0.7)} 100%)`,
                }}
            />
            {noiseUrl && (
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("${noiseUrl}")`,
                        backgroundSize: `${tileSize}px ${tileSize}px`,
                        mixBlendMode: tint.isLightBase ? 'multiply' : 'overlay',
                        // 颗粒是质感，不是主体：封顶 0.5（原来是 1.0，整页会发灰）。
                        opacity: Math.max(0.03, Math.min(0.5, tuning.grainAmount * 1.4)),
                    }}
                    animate={frozen ? undefined : { x: [0, -9, 4, 0], y: [0, 7, -5, 0] }}
                    transition={frozen ? undefined : { duration: driftDuration, repeat: Infinity, ease: 'linear' }}
                />
            )}
            {/* 颗粒本身也带一点主题色：soft-light 只染颜色不动明暗。 */}
            <div
                className="absolute inset-0"
                style={{
                    background: tint.accent,
                    mixBlendMode: 'soft-light',
                    opacity: 0.12 * wash,
                }}
            />
            {/* 四角压暗，把注意力收到中间；颜色取辅色而不是纯黑，避免和主题脱节。 */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(120% 120% at 50% 40%, transparent ${tint.isLightBase ? 58 : 46}%, ${tint.isLightBase ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.32)'} 100%)`,
                }}
            />
        </div>
    );
};

export default GrainBackground;
