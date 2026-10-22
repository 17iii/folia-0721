import React, { useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { DEFAULT_RIPPLE_BACKGROUND_TUNING, type RippleBackgroundTuning, type Theme } from '../../../../types';

// src/components/visualizer/backgrounds/ripple/RippleBackground.tsx
// 涟漪：以音频能量驱动的同心圆波纹。圆环的数量、扩散速度、强度与粗细由参数面板决定。
const RippleBackground: React.FC<{
    theme: Theme;
    isDaylight: boolean;
    audioPower?: MotionValue<number>;
    frozen?: boolean;
    tuning?: RippleBackgroundTuning;
}> = ({ theme, isDaylight, audioPower, frozen = false, tuning = DEFAULT_RIPPLE_BACKGROUND_TUNING }) => {
    const base = isDaylight ? '#f1f3f7' : '#06070c';
    const [boost, setBoost] = useState(1);
    const fallbackPower = useMotionValue(0);

    useMotionValueEvent(audioPower ?? fallbackPower, 'change', (value) => {
        if (typeof value === 'number') {
            setBoost(1 + Math.min(0.7, Math.max(0, value)));
        }
    });

    const ringCount = Math.max(1, Math.min(10, Math.round(tuning.ringCount)));
    const rings = Array.from({ length: ringCount }, (_, index) => index);
    const duration = 6 / Math.max(0.2, tuning.speed);
    const reach = 1.45 * tuning.strength;
    const ringWidth = Math.max(0.5, tuning.ringWidthPx);

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden" style={{ background: base }}>
            {rings.map((index) => (
                <motion.div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                        border: `${ringWidth.toFixed(1)}px solid ${theme.accentColor}`,
                        width: '42vmax',
                        height: '42vmax',
                    }}
                    animate={frozen ? undefined : { scale: [0.18, reach * boost], opacity: [0.55 * tuning.strength, 0] }}
                    transition={frozen ? undefined : { duration, repeat: Infinity, delay: (index * duration) / ringCount, ease: 'easeOut' }}
                />
            ))}
            <div
                className="absolute rounded-full"
                style={{
                    width: '20vmax',
                    height: '20vmax',
                    background: `radial-gradient(circle, ${theme.primaryColor}55, transparent 70%)`,
                    filter: 'blur(22px)',
                }}
            />
        </div>
    );
};

export default RippleBackground;
