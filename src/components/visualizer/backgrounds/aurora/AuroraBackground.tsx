import React from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_AURORA_BACKGROUND_TUNING, type AuroraBackgroundTuning, type Theme } from '../../../../types';

// src/components/visualizer/backgrounds/aurora/AuroraBackground.tsx
// 极光：以主题色驱动的柔光极光幕布，缓慢流动。幕帘的数量、亮度、柔和度与流速由参数面板决定。
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
    const base = isDaylight ? '#f3f5f9' : '#05060c';
    const animate = !frozen;
    const bandColors = [theme.primaryColor, theme.accentColor, theme.secondaryColor];
    const bandCount = Math.max(1, Math.min(6, Math.round(tuning.bandCount)));
    // 柔和度 0 是硬边，1 是化开的雾。
    const blur = 10 + tuning.softness * 62;
    const alpha = Math.max(0, Math.min(1, 0.38 * tuning.intensity));
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
        <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: base }}>
            {Array.from({ length: bandCount }, (_, index) => {
                const placement = placements[index % placements.length];
                const color = bandColors[index % bandColors.length];
                return (
                    <motion.div
                        key={index}
                        className="absolute -inset-1/4"
                        style={{
                            background: `radial-gradient(${placement.size} at ${placement.at}, ${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
                            filter: `blur(${blur.toFixed(0)}px)`,
                        }}
                        animate={animate ? { x: placement.x, y: placement.y } : undefined}
                        transition={animate
                            ? { duration: (18 + index * 4) * durationScale, repeat: Infinity, ease: 'easeInOut', delay: index * 0.6 }
                            : undefined}
                    />
                );
            })}
            <motion.div
                className="absolute -inset-1/4"
                style={{
                    background: `linear-gradient(115deg, transparent 38%, ${theme.secondaryColor}22 55%, transparent 72%)`,
                    filter: `blur(${(6 + tuning.softness * 26).toFixed(0)}px)`,
                }}
                animate={animate ? { backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] } : undefined}
                transition={animate ? { duration: 27 * durationScale, repeat: Infinity, ease: 'easeInOut' } : undefined}
            />
        </div>
    );
};

export default AuroraBackground;
