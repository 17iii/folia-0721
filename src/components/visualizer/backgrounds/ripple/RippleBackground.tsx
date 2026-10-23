import React, { useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { DEFAULT_RIPPLE_BACKGROUND_TUNING, type RippleBackgroundTuning, type Theme } from '../../../../types';
import { colorWithAlpha } from '../../colorMix';
import { resolveBackgroundTint, tintedBackdrop } from '../themeTint';

// src/components/visualizer/backgrounds/ripple/RippleBackground.tsx
// 涟漪：以音频能量驱动的同心圆波纹。圆环数量、扩散速度、强度与粗细由参数面板决定。
//
// 底色与圆环都取主题色（背景色打底，强调色/辅色画环），换主题时这一层会跟着变。
const RippleBackground: React.FC<{
    theme: Theme;
    isDaylight: boolean;
    audioPower?: MotionValue<number>;
    frozen?: boolean;
    tuning?: RippleBackgroundTuning;
}> = ({ theme, isDaylight, audioPower, frozen = false, tuning = DEFAULT_RIPPLE_BACKGROUND_TUNING }) => {
    const tint = resolveBackgroundTint(theme);
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
    // 亮底上圆环要更实一点才看得见。
    const ringAlpha = tint.isLightBase ? 0.75 : 0.55;

    return (
        <div
            className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
            style={{ background: tintedBackdrop(tint) }}
        >
            {rings.map((index) => (
                <motion.div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                        border: `${ringWidth.toFixed(1)}px solid ${colorWithAlpha(
                            index % 2 === 0 ? tint.accent : tint.secondary,
                            ringAlpha,
                        )}`,
                        width: '42vmax',
                        height: '42vmax',
                    }}
                    animate={frozen ? undefined : { scale: [0.18, reach * boost], opacity: [0.55 * tuning.strength, 0] }}
                    transition={frozen ? undefined : { duration, repeat: Infinity, delay: (index * duration) / ringCount, ease: 'easeOut' }}
                />
            ))}
            {/* 中心一团柔光，颜色取强调色，静止时也有主题感。 */}
            <div
                className="absolute rounded-full"
                style={{
                    width: '22vmax',
                    height: '22vmax',
                    background: `radial-gradient(circle, ${colorWithAlpha(tint.accent, tint.isLightBase ? 0.16 : 0.3)}, transparent 70%)`,
                    filter: 'blur(24px)',
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: isDaylight
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0.04) 100%)'
                        : 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.26) 100%)',
                }}
            />
        </div>
    );
};

export default RippleBackground;
