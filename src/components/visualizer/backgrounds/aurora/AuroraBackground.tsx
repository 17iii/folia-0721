import React from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_AURORA_BACKGROUND_TUNING, type AuroraBackgroundTuning, type Theme } from '../../../../types';
import { colorWithAlpha } from '../../colorMix';
import { resolveBackgroundTint, tintedBackdrop } from '../themeTint';

// src/components/visualizer/backgrounds/aurora/AuroraBackground.tsx
// 极光：以主题色驱动的柔光幕布，缓慢流动。幕帘数量、亮度、柔和度与流速由参数面板决定。
//
// 底色跟随主题背景色，幕帘只用强调色/辅色（不用文字色，那在暗色主题下等于一片白）。
const AuroraBackground: React.FC<{
    theme: Theme;
    isDaylight: boolean;
    frozen?: boolean;
    tuning?: AuroraBackgroundTuning;
}> = ({
    theme,
    isDaylight,
    frozen = false,
    tuning = DEFAULT_AURORA_BACKGROUND_TUNING,
}) => {
    const tint = resolveBackgroundTint(theme);
    const animate = !frozen;
    const bandColors = tint.glowColors;
    const bandCount = Math.max(1, Math.min(6, Math.round(tuning.bandCount)));
    // 柔和度 0 是硬边，1 是化开的雾。
    const blur = 10 + tuning.softness * 62;
    // 亮底上同样的 alpha 会显得脏，压到七成。
    const alpha = Math.max(0, Math.min(1, 0.38 * tuning.intensity)) * (tint.isLightBase ? 0.7 : 1);
    const durationScale = 1 / Math.max(0.2, tuning.flowSpeed);
    // 每一帘的落点与走向是固定的，不随参数跳动。
    const placements = [
        { x: ['-6%', '9%', '-6%'], y: ['0%', '7%', '0%'], at: '30% 30%', size: '60% 50%' },
        { x: ['6%', '-7%', '6%'], y: ['5%', '-5%', '5%'], at: '70% 65%', size: '50% 60%' },
        { x: ['-4%', '6%', '-4%'], y: ['-6%', '4%', '-6%'], at: '45% 82%', size: '70% 45%' },
        { x: ['8%', '-5%', '8%'], y: ['3%', '-8%', '3%'], at: '18% 70%', size: '45% 55%' },
        { x: ['-9%', '4%', '-9%'], y: ['-3%', '8%', '-3%'], at: '80% 28%', size: '55% 50%' },
        { x: ['3%', '-8%', '3%'], y: ['7%', '-2%', '7%'], at: '55% 50%', size: '65% 65%' },
    ];

    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden"
            style={{ background: tintedBackdrop(tint) }}
        >
            {Array.from({ length: bandCount }, (_, index) => {
                const placement = placements[index % placements.length];
                const color = bandColors[index % bandColors.length];
                return (
                    <motion.div
                        key={index}
                        className="absolute -inset-1/4"
                        style={{
                            background: `radial-gradient(${placement.size} at ${placement.at}, ${colorWithAlpha(color, alpha)}, transparent 70%)`,
                            filter: `blur(${blur.toFixed(0)}px)`,
                        }}
                        animate={animate ? { x: placement.x, y: placement.y } : undefined}
                        transition={animate
                            ? { duration: (18 + index * 4) * durationScale, repeat: Infinity, ease: 'easeInOut', delay: index * 0.6 }
                            : undefined}
                    />
                );
            })}
            {/* 一条斜向的亮带，给幕布一点方向感；颜色取辅色。 */}
            <motion.div
                className="absolute -inset-1/4"
                style={{
                    background: `linear-gradient(115deg, transparent 38%, ${colorWithAlpha(tint.secondary, 0.14)} 55%, transparent 72%)`,
                    filter: `blur(${(6 + tuning.softness * 26).toFixed(0)}px)`,
                }}
                animate={animate ? { backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] } : undefined}
                transition={animate ? { duration: 27 * durationScale, repeat: Infinity, ease: 'easeInOut' } : undefined}
            />
            {/* 底部稍压一点，歌词区更清楚；用背景色的深/浅版本，不引入第三个色相。 */}
            <div
                className="absolute inset-0"
                style={{
                    background: isDaylight
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.05) 100%)'
                        : 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.28) 100%)',
                }}
            />
        </div>
    );
};

export default AuroraBackground;
