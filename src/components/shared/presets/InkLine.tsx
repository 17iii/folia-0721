import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { intensityFactor, useWordProgress, useDiagonalLitMask, useWordMotion, glowTextShadow, withAlpha, seeded, isInterlude, type PresetLineProps } from './shared';

// src/components/shared/presets/InkLine.tsx
// 水墨：一行字是被**写**出来的，不是被点亮。
//
// 和别样式的根本区别：亮起的前沿是斜的（笔锋斜着走），前沿那一小段颜色更深更湿（洇开的墨），
// 每个字都有一点点歪斜和高低（手写的），整行还压在一张微微倾斜的纸上，纸有纹理。
// 墨是慢慢渗开的，所以未写的部分是虚的、写过的部分是实的。

/** 一张宣纸的纹理：一次生成，之后一直用。 */
let paperTexture: string | null = null;
const getPaperTexture = (): string => {
    if (paperTexture) {
        return paperTexture;
    }
    if (typeof document === 'undefined') {
        return '';
    }
    const size = 180;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) {
        return '';
    }
    const image = context.createImageData(size, size);
    for (let i = 0; i < image.data.length; i += 4) {
        const value = 226 + Math.random() * 29;
        image.data[i] = value;
        image.data[i + 1] = value - 4;
        image.data[i + 2] = value - 12;
        image.data[i + 3] = 26 + Math.random() * 30;
    }
    context.putImageData(image, 0, 0);
    paperTexture = canvas.toDataURL();
    return paperTexture;
};

const InkWord: React.FC<{
    word: PresetLineProps['line']['words'][number];
    currentTime: PresetLineProps['currentTime'];
    theme: PresetLineProps['theme'];
    tuning: PresetLineProps['tuning'];
    fontSize: string;
    fontStack: string;
    fontWeight: number;
    index: number;
    lineSeed: number;
    contextual?: boolean;
}> = ({ word, currentTime, theme, tuning, fontSize, fontStack, fontWeight, index, lineSeed, contextual }) => {
    const progress = useWordProgress(currentTime, word);
    // 斜的：笔锋从左上往右下走。
    const litMask = useDiagonalLitMask(progress, '108deg', 1);

    // 每一笔落下时洇开的那一团墨，用计数器让它重新画一次。
    const [blots, setBlots] = useState(0);
    const wasWritten = useRef(false);
    useMotionValueEvent(currentTime, 'change', (latest) => {
        const isWritten = latest >= word.startTime;
        if (isWritten !== wasWritten.current) {
            wasWritten.current = isWritten;
            if (isWritten) {
                setBlots((n) => n + 1);
            }
        }
    });

    const accent = theme.accentColor;
    // 墨的浓淡：写下去的一端是主题色，收笔的一端是字色——一笔里有层次。
    const keyword = theme.primaryColor;
    const seed = lineSeed * 17 + index * 5.9;

    // 手写：每个字歪一点、高一点、大小差一点，绝不齐。
    // 幅度跟着主题的动效强度走。
    const f = intensityFactor(theme.animationIntensity);
    const tilt = (seeded(seed) - 0.5) * 9 * f;
    const bob = (seeded(seed + 2.1) - 0.5) * 9 * f;
    const drift = (seeded(seed + 8.6) - 0.5) * 8 * f;
    const squeeze = 1 + (seeded(seed + 4.7) - 0.5) * 0.14 * f;
    const gap = 0.26 + (seeded(seed + 6.2) - 0.5) * 0.14 * f;

    // 笔尖落在这个字上时，这个字也跟着沉一下、抬一下——墨是有重量的。
    const inkGlowOpacity = useTransform(progress, [0, 0.6], [0.08, 1], { clamp: true });

    const inkMotion = useWordMotion({
        currentTime,
        progress,
        seed,
        base: { x: drift, y: bob, rotate: tilt, scale: squeeze },
        strength: 0.28 + 0.6 * f,
        idle: tuning.idleMotion * f * 0.8,
    });

    return (
        <motion.span
            className="relative inline-block whitespace-nowrap"
            style={{
                fontSize,
                fontFamily: fontStack,
                fontWeight,
                lineHeight: 1.3,
                marginRight: `${gap.toFixed(3)}em`,
                rotate: inkMotion.rotate,
                y: inkMotion.y,
                x: inkMotion.x,
                scaleX: inkMotion.scale,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.02 + index * 0.04, duration: 0.34, ease: 'easeOut' }}
        >
            {/* 笔落下去洇开的那团墨：先胀开，再化掉 */}
            {blots > 0 && !contextual && (
                <motion.span
                    key={`blot-${blots}`}
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 rounded-[45%]"
                    style={{
                        width: '1.5em',
                        height: '1.1em',
                        marginLeft: '-0.75em',
                        marginTop: '-0.55em',
                        background: `radial-gradient(closest-side, ${withAlpha(accent, 0.3 * tuning.washStrength)}, ${withAlpha(accent, 0)})`,
                        filter: 'blur(3px)',
                    }}
                    initial={{ scale: 0.2, opacity: 0.9 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                />
            )}

            {/* 没写到的地方：虚的，墨还没渗过去 */}
            <span
                className="relative block"
                style={{
                    color: theme.primaryColor,
                    opacity: tuning.dimOpacity * 0.75,
                    filter: `blur(${(tuning.bleedBlurPx * 1.5).toFixed(2)}px)`,
                }}
            >
                {word.text}
            </span>

            {!contextual && (
                <>
                    {/* 写到的地方：实墨，从浓到淡。遮罩里只放颜色，辉光另起一层，
                        否则阴影会被遮罩切在字框边缘，变成一块方形的墨。 */}
                    <motion.span
                        className="pointer-events-none absolute inset-0"
                        style={{ maskImage: litMask, WebkitMaskImage: litMask }}
                    >
                        <span
                            style={{
                                backgroundImage: `linear-gradient(108deg, ${accent} 0%, ${keyword} 100%)`,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            {word.text}
                        </span>
                    </motion.span>

                    {/* 墨的光：不套遮罩，跟着写的进度渗出来 */}
                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                            color: 'transparent',
                            textShadow: glowTextShadow(accent, 0.5 * tuning.washStrength, 1),
                            opacity: inkGlowOpacity,
                        }}
                    >
                        {word.text}
                    </motion.span>
                </>
            )}
        </motion.span>
    );
};

const InkLine: React.FC<PresetLineProps> = ({
    line,
    currentTime,
    theme,
    tuning,
    fontSize,
    fontStack,
    fontWeight,
    contextual,
}) => {
    const [paper, setPaper] = useState('');

    useEffect(() => {
        setPaper(getPaperTexture());
    }, []);

    if (isInterlude(line)) {
        return (
            <span className="inline-flex gap-4" style={{ fontSize }}>
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: theme.accentColor, opacity: 0.6 }}
                        animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.7, 1, 0.7] }}
                        transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
                    />
                ))}
            </span>
        );
    }

    return (
        <span className="relative inline-block">
            {/* 纸：整块行字压在一张微微斜着的纸上 */}
            {!contextual && paper && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-6 -inset-y-3 rounded-sm"
                    style={{
                        backgroundImage: `url("${paper}")`,
                        backgroundSize: '180px 180px',
                        opacity: 0.5,
                        mixBlendMode: 'overlay',
                        // 纸的四边要化开，不然就是一块方方正正的噪点贴片
                        maskImage: 'radial-gradient(closest-side, #000 45%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(closest-side, #000 45%, transparent 100%)',
                    }}
                />
            )}
            <motion.span
                className="relative flex flex-wrap w-full max-w-6xl content-center justify-center items-center"
                style={{ rowGap: '0.46em', fontSize }}
                animate={{ rotate: contextual ? 0 : -0.45 }}
            >
                {line.words.map((word, index) => (
                    <InkWord
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
                    />
                ))}
            </motion.span>
        </span>
    );
};

export default InkLine;
