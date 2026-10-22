import React, { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { intensityFactor, useWordProgress, useVerticalLitMask, useWordMotion, glowTextShadow, withAlpha, seeded, isInterlude, type PresetLineProps } from './shared';

// src/components/shared/presets/NeonLine.tsx
// 霓虹：一根根灯管。还没点亮的管子也看得见（只是暗的轮廓），点亮的那一段通体发亮，
// 电极接通时会「打嗝」一下，播放头前面拖着���团光。
//
// 和别样式的根本区别：这里没有「颜色渐变填充」这回事——管子是**描边**出来的，
// 亮不亮是整根管子的通电与否，所以未唱的部分也一直有形状。

const NeonWord: React.FC<{
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
    const litMask = useVerticalLitMask(progress, 2);

    const [lit, setLit] = useState(false);
    // 「正在唱」——只有这时候播放头才在这个字里，灯丝带也只在这时候画。
    const [singing, setSinging] = useState(false);
    const [ignition, setIgnition] = useState(0);
    const wasLit = useRef(false);
    const wasSinging = useRef(false);

    useMotionValueEvent(currentTime, 'change', (latest) => {
        const isLit = latest >= word.startTime;
        if (isLit !== wasLit.current) {
            wasLit.current = isLit;
            setLit(isLit);
            if (isLit) {
                // 电极接通：抖一下。
                setIgnition((n) => n + 1);
            }
        }
        const isSinging = latest >= word.startTime && latest <= word.endTime;
        if (isSinging !== wasSinging.current) {
            wasSinging.current = isSinging;
            setSinging(isSinging);
        }
    });

    const accent = theme.accentColor;
    const seed = lineSeed * 31 + index * 7.13;
    // 每根管子歪一点、高一点、大小差一点——手动挂上去的招牌不会整齐。
    // 「平静」把这份不齐收干净，「混乱」就放它乱。
    const f = intensityFactor(theme.animationIntensity);
    const tilt = (seeded(seed + 3.3) - 0.5) * 4.4 * f;
    const rise = (seeded(seed + 1.7) - 0.5) * 9 * f;
    const drift = (seeded(seed + 9.4) - 0.5) * 7 * f;
    const wordScale = 1 + (seeded(seed + 5.9) - 0.5) * 0.1 * f;
    const gap = 0.3 + (seeded(seed + 7.1) - 0.5) * 0.16 * f;

    // 唱到这个词的时候，整根管子会弹一下、往上顶一下——之前这里只有固定的偏移，
    // 所以字是「被涂色」而不是「被点亮」。
    const motion_ = useWordMotion({
        currentTime,
        progress,
        seed,
        base: { x: drift, y: rise, rotate: tilt, scale: wordScale },
        strength: 0.4 + 0.85 * f,
        idle: tuning.idleMotion * f,
    });

    const tubeWidth = 1 + tuning.strokeWidth * 0.7;


    // 灯管中心是白热的：纯主题色看着像「涂上去的字」，掺一点白才像在发光。
    const hotColor = `color-mix(in srgb, ${accent} 76%, #ffffff)`;
    const bloomGlow = glowTextShadow(accent, tuning.glowIntensity, tuning.glowSpread);
    // 接通那一下的白热：白芯 + 一圈主题色的光。
    const flashGlow = glowTextShadow('#ffffff', 1.6, 0.8);
    // 辉光跟着这个词被唱到多少淡入：刚开始唱就有一点，唱完铺满。
    const glowOpacity = useTransform(progress, [0, 0.72], [0.1, 1], { clamp: true });

    return (
        <motion.span
            className="relative inline-block whitespace-nowrap"
            style={{
                fontSize,
                fontFamily: fontStack,
                fontWeight,
                lineHeight: 1.26,
                marginRight: `${gap.toFixed(3)}em`,
                rotate: motion_.rotate,
                y: motion_.y,
                x: motion_.x,
                scale: motion_.scale,
            }}
            // 整行是「一个字接一个字」浮上来的，不是整块一起淡入。
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.02 + index * 0.035, duration: 0.3, ease: 'easeOut' }}
        >
            {/* 暗着的管子：只有轮廓，颜色是副色——亮起来时除了变亮，还换色 */}
            <span
                className="relative block"
                style={{
                    color: 'transparent',
                    WebkitTextStroke: `${(tubeWidth * 0.8).toFixed(2)}px ${withAlpha(theme.secondaryColor, 0.26)}`,
                }}
            >
                {word.text}
            </span>

            {!contextual && (
                <>
                    {/* 点亮的那一段：只有颜色，没有辉光。
                        辉光放在下一层——遮罩会把阴影切在字框的四条边上，看上去就是一个方块。 */}
                    <motion.span
                        key={ignition}
                        className="pointer-events-none absolute inset-0"
                        style={{ maskImage: litMask, WebkitMaskImage: litMask }}
                        initial={false}
                        animate={ignition > 0 && f > 0.5 ? { opacity: [0.25, 1, 0.4, 0.85, 1] } : { opacity: 1 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        <span style={{ color: hotColor }}>{word.text}</span>
                    </motion.span>

                    {/* 辉光：不套遮罩，跟着这个词的进度淡入。字本身是透明的，只留阴影。 */}
                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{ color: 'transparent', textShadow: bloomGlow, opacity: glowOpacity }}
                    >
                        {word.text}
                    </motion.span>

                    {/* 接通那一下，整根管子白一下。只在这个词刚开始唱的一瞬间画。 */}
                    {singing && ignition > 0 && (
                        <motion.span
                            key={`flash-${ignition}`}
                            className="pointer-events-none absolute inset-0"
                            style={{ color: '#fff', textShadow: flashGlow }}
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {word.text}
                        </motion.span>
                    )}

                </>
            )}
        </motion.span>
    );
};

const NeonLine: React.FC<PresetLineProps> = ({
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
            <span className="inline-flex gap-3" style={{ fontSize }}>
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: theme.accentColor, boxShadow: `0 0 8px ${theme.accentColor}` }}
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
                <NeonWord
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

export default NeonLine;
