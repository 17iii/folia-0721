import React, { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform, useMotionTemplate } from 'framer-motion';
import { intensityFactor, useWordProgress, useVerticalLitMask, useHeadPercent, useWordMotion, glowTextShadow, withAlpha, seeded, isInterlude, type PresetLineProps } from './shared';

// src/components/shared/presets/MirrorLine.tsx
// 水面：字悬在水上，下面是它的倒影，倒影是**会动的**——每一行字按自己的相位上下起伏，
// 像是被水面推着。播放头经过的地方荡开一圈涟漪。
//
// 和别样式的根本区别：这里的主戏是**倒影本身**。正片是清楚的，倒影是虚的、扭动的，
// 两者之间隔着一条地平线，所以画面被分成上下两半。

interface MirrorWordProps extends Omit<PresetLineProps, 'line'> {
    word: PresetLineProps['line']['words'][number];
    index: number;
    lineSeed: number;
    /** 倒影里的那一份：更虚、更扭。 */
    reflected?: boolean;
}

const MirrorWord: React.FC<MirrorWordProps> = ({
    word,
    currentTime,
    theme,
    tuning,
    fontSize,
    fontStack,
    fontWeight,
    index,
    lineSeed,
    contextual,
    reflected,
}) => {
    const progress = useWordProgress(currentTime, word);
    const litMask = useVerticalLitMask(progress);
    const headPercent = useHeadPercent(progress);
    const headLeft = useMotionTemplate`${headPercent}%`;

    const [ripple, setRipple] = useState(0);
    const wasLit = useRef(false);

    useMotionValueEvent(currentTime, 'change', (latest) => {
        const isLit = latest >= word.startTime;
        if (isLit !== wasLit.current) {
            wasLit.current = isLit;
            if (isLit) {
                setRipple((n) => n + 1);
            }
        }
    });

    // 倒影里的字按自己的相位上下起伏：水面在推它。
    const wave = useTransform(
        currentTime,
        (t) => (reflected ? Math.sin(t * 2.05 + index * 0.9) * (1.6 + index * 0.7) * intensityFactor(theme.animationIntensity) : 0) + (seeded(lineSeed * 23 + index * 4.1 + 3.1) - 0.5) * 6 * intensityFactor(theme.animationIntensity),
    );
    const sway = useTransform(
        currentTime,
        (t) => (reflected ? Math.cos(t * 1.35 + index * 0.6) * 1.4 : 0),
    );

    const accent = theme.accentColor;
    const seed = lineSeed * 23 + index * 4.1;
    // 水面上的字会晃，但还要读得清，所以只给它一点点不齐。
    // 水面的起伏跟着动效强度走：平静时几乎是平的，混乱时才荡得开。
    const f = intensityFactor(theme.animationIntensity);
    const drift = (seeded(seed) - 0.5) * 2.6 * f;
    const bob = (seeded(seed + 3.1) - 0.5) * 6 * f;
    const wordScale = 1 + (seeded(seed + 6.8) - 0.5) * 0.06 * f;
    const gap = 0.3 + (seeded(seed + 8.2) - 0.5) * 0.1 * f;

    // 唱到这个词：水面上的字往上浮一下，倒影跟上得慢一点、幅度也小一点。
    const waterMotion = useWordMotion({
        currentTime,
        progress,
        seed,
        base: { x: 0, y: bob, rotate: drift, scale: wordScale },
        strength: (reflected ? 0.24 : 0.52) * (0.45 + f),
        idle: tuning.idleMotion * (reflected ? 0.6 : 1),
    });
    const y = useTransform([waterMotion.y, wave], ([base, extra]: number[]) => base + extra);
    const x = useTransform([waterMotion.x, sway], ([base, extra]: number[]) => base + extra);

    const waterGlowOpacity = useTransform(progress, [0, 0.7], [0.1, 1], { clamp: true });

    const baseOpacity = reflected
        ? tuning.dimOpacity * 0.5
        : tuning.dimOpacity * 0.8;

    return (
        <motion.span
            className="relative inline-block whitespace-nowrap"
            style={{
                fontSize,
                fontFamily: fontStack,
                fontWeight,
                lineHeight: 1.26,
                marginRight: `${gap.toFixed(3)}em`,
                x,
                y,
                rotate: waterMotion.rotate,
                scale: waterMotion.scale,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.02 + index * 0.035, duration: 0.32, ease: 'easeOut' }}
        >
            <span className="relative block" style={{ color: theme.primaryColor, opacity: baseOpacity }}>
                {word.text}
            </span>

            {!contextual && !reflected && (
                <>
                    <motion.span
                        className="pointer-events-none absolute inset-0"
                        style={{ maskImage: litMask, WebkitMaskImage: litMask }}
                    >
                        <span style={{ color: accent }}>{word.text}</span>
                    </motion.span>

                    {/* 水光：不套遮罩，跟着进度亮起来 */}
                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                            color: 'transparent',
                            textShadow: glowTextShadow(accent, tuning.glowIntensity, 1.1),
                            opacity: waterGlowOpacity,
                        }}
                    >
                        {word.text}
                    </motion.span>

                    {/* 唱到的那一下，字面上掠过一道水光 */}
                    {ripple > 0 && (
                        <motion.span
                            key={`glint-${ripple}`}
                            className="pointer-events-none absolute inset-0"
                            style={{ color: '#fff', textShadow: glowTextShadow(accent, 0.9, 0.7) }}
                            initial={{ opacity: 0.42 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {word.text}
                        </motion.span>
                    )}

                    {/* 播放头在水面上荡开的一圈涟漪 */}
                    {ripple > 0 && (
                        <motion.span
                            key={ripple}
                            aria-hidden
                            className="pointer-events-none absolute -bottom-4 h-12 w-24 rounded-[50%] border-t"
                            style={{ left: headLeft, borderColor: withAlpha(accent, 0.7) }}
                            initial={{ scale: 0.15, opacity: 0.8 }}
                            animate={{ scale: 1.7, opacity: 0 }}
                            transition={{ duration: 2.2, ease: 'easeOut' }}
                        />
                    )}
                </>
            )}
        </motion.span>
    );
};

const MirrorWords: React.FC<PresetLineProps & { reflected?: boolean }> = ({
    line,
    currentTime,
    theme,
    tuning,
    fontSize,
    fontStack,
    fontWeight,
    contextual,
    reflected,
}) => {
    if (isInterlude(line)) {
        return (
            <span className="inline-flex gap-3" style={{ fontSize }}>
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: theme.accentColor }}
                        animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                    />
                ))}
            </span>
        );
    }

    return (
        <div className="flex flex-wrap w-full max-w-6xl content-center justify-center items-center" style={{ rowGap: '0.46em', fontSize }}>
            {line.words.map((word, index) => (
                <MirrorWord
                    key={`${word.text}-${index}-${line.startTime}`}
                    word={word}
                    currentTime={currentTime}
                    theme={theme}
                    tuning={tuning}
                    fontSize={fontSize}
                    fontStack={fontStack}
                    fontWeight={fontWeight}
                    index={index}
                    lineSeed={line.startTime}
                    contextual={contextual}
                    reflected={reflected}
                />
            ))}
        </div>
    );
};

const MirrorLine: React.FC<PresetLineProps> = (props) => {
    const { theme, tuning, contextual } = props;

    if (contextual) {
        return <MirrorWords {...props} />;
    }

    return (
        <div className="flex flex-col items-center">
            {/* 正片 */}
            <div className="relative">
                <MirrorWords {...props} />
            </div>

            {/* 地平线：把画面分成上下两半 */}
            <div
                aria-hidden
                className="pointer-events-none mt-2 h-px w-[86%]"
                style={{
                    background: `linear-gradient(90deg, transparent, ${withAlpha(theme.accentColor, 0.5)}, transparent)`,
                }}
            />

            {/* 倒影：翻过来，而且一直在动 */}
            {tuning.showReflection && (
                <div
                    aria-hidden
                    className="pointer-events-none flex justify-center overflow-hidden"
                    style={{
                        marginTop: `${tuning.reflectionGapPx}px`,
                        width: '100%',
                        maxHeight: '9em',
                        transform: 'scaleY(-1)',
                        maskImage: `linear-gradient(to bottom, rgba(0,0,0,${Math.max(0.08, tuning.reflectionOpacity).toFixed(2)}), transparent 68%)`,
                        WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,${Math.max(0.08, tuning.reflectionOpacity).toFixed(2)}), transparent 68%)`,
                        opacity: tuning.reflectionOpacity,
                        filter: `blur(${tuning.reflectionBlurPx}px)`,
                    }}
                >
                    <div className="flex flex-wrap content-center justify-center items-center w-full max-w-6xl">
                        <MirrorWords {...props} reflected />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MirrorLine;
