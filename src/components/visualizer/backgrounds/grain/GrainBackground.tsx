import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_GRAIN_BACKGROUND_TUNING, type GrainBackgroundTuning, type Theme } from '../../../../types';

// src/components/visualizer/backgrounds/grain/GrainBackground.tsx
// 噪点：胶片颗粒质感，叠加主题色晕染。颗粒的浓度、大小、爬行速度与晕染强度由参数面板决定。
// 颗粒贴图按固定分辨率生成一次，参数里的「大小」是它在屏幕上的平铺尺寸。
const GRAIN_TEXTURE_SIZE = 128;

const GrainBackground: React.FC<{
    theme: Theme;
    isDaylight: boolean;
    frozen?: boolean;
    tuning?: GrainBackgroundTuning;
}> = ({
    theme,
    isDaylight,
    frozen = false,
    tuning = DEFAULT_GRAIN_BACKGROUND_TUNING,
}) => {
    const base = isDaylight ? '#eef0f4' : '#07080d';
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
    const washAlpha = Math.round(Math.max(0, Math.min(1, tuning.washStrength)) * 255).toString(16).padStart(2, '0');

    return (
        <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: base }}>
            {noiseUrl && (
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("${noiseUrl}")`,
                        backgroundSize: `${tileSize}px ${tileSize}px`,
                        mixBlendMode: 'overlay',
                        opacity: tuning.grainAmount,
                    }}
                    animate={frozen ? undefined : { x: [0, -9, 4, 0], y: [0, 7, -5, 0] }}
                    transition={frozen ? undefined : { duration: driftDuration, repeat: Infinity, ease: 'linear' }}
                />
            )}
            <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(125% 125% at 50% 38%, transparent 28%, ${theme.primaryColor}${washAlpha} 100%)` }}
            />
        </div>
    );
};

export default GrainBackground;
