import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { DEFAULT_RIPPLE_BACKGROUND_TUNING, type RippleBackgroundTuning, type Theme } from '../../../../types';
import { colorWithAlpha } from '../../colorMix';
import { resolveBackgroundTint, tintedBackdrop } from '../themeTint';

// src/components/visualizer/backgrounds/ripple/RippleBackground.tsx
// 涟漪：以音频能量驱动的同心圆波纹。圆环数量、扩散速度、强度与粗细由参数面板决定。
//
// 音频能量必须走 MotionValue，不能进 React state：之前每帧 setState 会让组件重渲染、
// framer-motion 收到新的 animate 目标后把正在扩散的环**从头重启**——环刚到最大的那一下就闪。
// 现在能量只作用在最外层容器的 scale 上，环自己的关键帧不随渲染变化。
const RippleBackground: React.FC<{
    theme: Theme;
    isDaylight: boolean;
    audioPower?: MotionValue<number>;
    frozen?: boolean;
    tuning?: RippleBackgroundTuning;
}> = ({ theme, audioPower, frozen = false, tuning = DEFAULT_RIPPLE_BACKGROUND_TUNING }) => {
    const tint = resolveBackgroundTint(theme);
    const fallbackPower = useMotionValue(0);
    // audioPower 的实时刻度是 0..255（预览时是 0..1），这里只取一个温和的放大倍率。
    const boostTarget = useTransform(audioPower ?? fallbackPower, [0, 1, 255], [1, 1, 1.35]);
    const boost = useSpring(boostTarget, { stiffness: 120, damping: 26, mass: 0.4 });

    const ringCount = Math.max(1, Math.min(10, Math.round(tuning.ringCount)));
    const rings = Array.from({ length: ringCount }, (_, index) => index);
    const duration = 6 / Math.max(0.2, tuning.speed);
    const reach = 1.45 * tuning.strength;
    const ringWidth = Math.max(0.5, tuning.ringWidthPx);
    // 亮底上圆环要更实一点才看得见。
    const ringAlpha = tint.isLightBase ? 0.75 : 0.55;
    const startOpacity = 0.55 * tuning.strength;

    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden"
            style={{ background: tintedBackdrop(tint) }}
        >
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ scale: boost }}
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
                        initial={{ scale: 0.18, opacity: startOpacity }}
                        animate={frozen ? { scale: 0.18, opacity: startOpacity * 0.5 } : { scale: reach, opacity: 0 }}
                        transition={frozen
                            ? { duration: 0.3 }
                            : { duration, repeat: Infinity, delay: (index * duration) / ringCount, ease: 'easeOut' }}
                    />
                ))}
            </motion.div>
            {/* 中心一团柔光，颜色取强调色，静止时也有主题感。 */}
            <div
                className="absolute left-1/2 top-1/2 rounded-full"
                style={{
                    width: '22vmax',
                    height: '22vmax',
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${colorWithAlpha(tint.accent, tint.isLightBase ? 0.16 : 0.3)}, transparent 70%)`,
                    filter: 'blur(24px)',
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: tint.isLightBase
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0.04) 100%)'
                        : 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.26) 100%)',
                }}
            />
        </div>
    );
};

export default RippleBackground;
