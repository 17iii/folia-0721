import React, { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { buildWordGraphemeTimings } from '../../../utils/lyrics/graphemeTiming';
import { intensityFactor, useWordKick, useWordMotion, withAlpha, seeded, isInterlude, type PresetLineProps } from './shared';

// src/components/shared/presets/SparkleLine.tsx
// 星轨：一行字是**一串星**。没唱到的字是暗星，唱到的字「啪」地亮起来、胀一下，
// 然后不断地往后（左边）甩出小星尘，像流星划过。
//
// 和别样式的根本区别：这里**没有遮罩**。别的样式是把颜色推进去，这个样式是往世界里
// 撒东西——唱过的字留在原地发光，尾巴一直流。
//
// 每个字都有自己的进度（不是每个词），所以亮的顺序就是歌里真正的顺序，
// 一个字接一个字，中间不会整词一起跳。

const SparkleChar: React.FC<{
    char: string;
    startTime: number;
    endTime: number;
    currentTime: PresetLineProps['currentTime'];
    theme: PresetLineProps['theme'];
    tuning: PresetLineProps['tuning'];
    charSeed: number;
    intensity: number;
    moteCount: number;
    contextual?: boolean;
}> = ({ char, startTime, endTime, currentTime, theme, tuning, charSeed, intensity, moteCount, contextual }) => {
    const [sung, setSung] = useState(false);
    const wasSung = useRef(false);
    useMotionValueEvent(currentTime, 'change', (latest) => {
        const now = latest >= endTime;
        if (now !== wasSung.current) {
            wasSung.current = now;
            setSung(now);
        }
    });

    const range = React.useMemo(
        () => [startTime, Math.max(endTime, startTime + 0.02)] as [number, number],
        [startTime, endTime],
    );
    const progress = useTransform(currentTime, range, [0, 1], { clamp: true });
    // 星点亮是一下子的事：冲量比词更猛、更短。
    // 幅度要收着——transform 的放大不占布局，放太狠会直接盖到旁边那个字上。
    const kick = useWordKick(progress, 1.15);
    const scale = useTransform(kick, (value) => 1 + value * 0.15);
    const y = useTransform(kick, (value) => -value * 5 * Math.max(0.3, intensity));
    const charDrift = (seeded(charSeed) - 0.5) * 4.5 * intensity;

    const accent = theme.accentColor;

    return (
        <motion.span
            className="relative inline-block whitespace-nowrap"
            style={{ rotate: charDrift, scale, y, padding: '0 0.015em' }}
        >
            {/* 字本身：暗星 / 亮星 */}
            <motion.span
                className="inline-block"
                style={{
                    color: sung ? theme.accentColor : theme.primaryColor,
                    opacity: sung ? 1 : tuning.dimOpacity * 0.72,
                    textShadow: sung
                        ? `0 0 ${(8 * tuning.glowIntensity).toFixed(1)}px ${withAlpha(accent, 0.85)}, 0 0 ${(20 * tuning.glowIntensity * tuning.sparkleSize).toFixed(1)}px ${withAlpha(accent, 0.45)}`
                        : 'none',
                    transition: 'color 180ms ease, opacity 180ms ease, text-shadow 180ms ease',
                }}
            >
                {char}
            </motion.span>

            {/* 点亮的那一下，一颗四角星炸开 */}
            {sung && !contextual && (
                <motion.span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 select-none leading-none"
                    style={{ color: '#fff', fontSize: '0.7em', marginLeft: '-0.35em', marginTop: '-0.35em', textShadow: `0 0 6px ${accent}` }}
                    initial={{ opacity: 0.95, scale: 0.35, rotate: -20 }}
                    animate={{ opacity: 0, scale: 2.1, rotate: 25 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                    ✦
                </motion.span>
            )}

            {/* 唱过的字，往后甩出的星尘 */}
            {sung && !contextual && Array.from({ length: moteCount }, (_, moteIndex) => {
                const moteSeed = charSeed + moteIndex * 4.3;
                const size = (2.6 + seeded(moteSeed) * 3.4) * tuning.sparkleSize;
                const driftY = (seeded(moteSeed + 1.3) - 0.5) * 26;
                const delay = moteIndex * 0.55 + seeded(moteSeed + 2.9) * 1.6;
                return (
                    <motion.span
                        key={moteIndex}
                        aria-hidden
                        className="pointer-events-none absolute rounded-full"
                        style={{
                            left: '50%',
                            top: '45%',
                            width: size,
                            height: size,
                            marginLeft: -size / 2,
                            background: accent,
                            boxShadow: `0 0 ${(5 * tuning.sparkleSize).toFixed(1)}px ${(1.5 * tuning.sparkleSize).toFixed(1)}px ${accent}`,
                        }}
                        initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                        animate={{ x: -70 - seeded(moteSeed + 4.1) * 70, y: driftY, opacity: 0, scale: 0.35 }}
                        transition={{ duration: Math.max(0.9, 2.6 / tuning.twinkleSpeed), delay, repeat: Infinity, ease: 'easeOut' }}
                    />
                );
            })}
        </motion.span>
    );
};

const SparkleWord: React.FC<{
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
    const timings = React.useMemo(() => buildWordGraphemeTimings(word), [word]);

    const seed = lineSeed * 11 + index * 3.7;
    // 星是散着的：高低、角度、大小都不一样。
    // 幅度跟着主题的动效强度走。
    const f = intensityFactor(theme.animationIntensity);
    const bob = (seeded(seed) - 0.5) * 14 * f;
    const drift = (seeded(seed + 5.3) - 0.5) * 9 * f;
    const wordScale = 1 + (seeded(seed + 8.9) - 0.5) * 0.18 * f;
    const gap = 0.22 + (seeded(seed + 2.4) - 0.5) * 0.16 * f;
    const baseMotes = tuning.sparkleDensity <= 0 ? 0 : tuning.sparkleDensity < 0.34 ? 1 : tuning.sparkleDensity < 0.67 ? 2 : 3;
    const moteCount = Math.round(baseMotes * (theme.animationIntensity === 'chaotic' ? 1.8 : theme.animationIntensity === 'calm' ? 0.6 : 1));

    // 词也会被整块弹一下，字各自再弹一次：大的节奏里还有小的节奏。
    const wordRange = React.useMemo(
        () => [word.startTime, Math.max(word.endTime, word.startTime + 0.02)] as [number, number],
        [word.startTime, word.endTime],
    );
    const progress = useTransform(currentTime, wordRange, [0, 1], { clamp: true });
    const starMotion = useWordMotion({
        currentTime,
        progress,
        seed,
        base: { x: drift, y: bob, rotate: 0, scale: wordScale },
        strength: 0.25 + 0.65 * f,
        idle: tuning.idleMotion * f,
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
                x: starMotion.x,
                y: starMotion.y,
                scale: starMotion.scale,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.02 + index * 0.04, duration: 0.3, ease: 'easeOut' }}
        >
            {timings.length === 0 && word.text}

            {timings.map((timing, charIndex) => (
                <SparkleChar
                    key={charIndex}
                    char={timing.char}
                    startTime={timing.startTime}
                    endTime={timing.endTime}
                    currentTime={currentTime}
                    theme={theme}
                    tuning={tuning}
                    charSeed={seed + charIndex * 2.7}
                    intensity={f}
                    moteCount={moteCount}
                    contextual={contextual}
                />
            ))}
        </motion.span>
    );
};

const SparkleLine: React.FC<PresetLineProps> = ({
    line,
    currentTime,
    theme,
    tuning,
    fontSize,
    fontStack,
    fontWeight,
    contextual,
}) => {
    if (isInterlude(line)) {
        return (
            <span className="inline-flex gap-4" style={{ fontSize }}>
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: theme.accentColor, boxShadow: `0 0 8px ${theme.accentColor}` }}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.1, 0.7] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                    />
                ))}
            </span>
        );
    }

    return (
        <div className="flex flex-wrap w-full max-w-6xl content-center justify-center items-center" style={{ rowGap: '0.46em', fontSize }}>
            {line.words.map((word, index) => (
                <SparkleWord
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
        </div>
    );
};

export default SparkleLine;
