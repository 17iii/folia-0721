import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import type { Theme } from '../../types';
import { audioPower } from '../../stores/motionSignals';

// src/components/app/MusicPulseOverlay.tsx
//
// 「音乐主题」的律动一半：一层极淡的主题色光，跟着低频能量呼吸。
//
// 它就是一层 radial-gradient，不画任何内容，所以放在可视化层之上也不会挡住歌词——
// 只在唱到低音时把整个播放页往主题色里推一点点。为了不让它变成"滤镜"，
// 上限压得很低（≤0.16），并且混合模式按日/夜切换。

interface MusicPulseOverlayProps {
    theme: Theme;
    enabled: boolean;
    isDaylight: boolean;
    /** 由动画强度折算的倍率：安静 0.6 / 标准 1 / 混乱 1.35 */
    strength: number;
}

const withAlpha = (color: string, alpha: number): string => {
    const hex = color.trim();
    const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
    if (short) {
        const [, r, g, b] = short;
        return `rgba(${parseInt(r + r, 16)}, ${parseInt(g + g, 16)}, ${parseInt(b + b, 16)}, ${alpha})`;
    }
    const full = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (full) {
        const [, r, g, b] = full;
        return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
    }
    const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(hex);
    if (rgb) {
        return `rgba(${Number(rgb[1])}, ${Number(rgb[2])}, ${Number(rgb[3])}, ${alpha})`;
    }
    return color;
};

const MusicPulseOverlay: React.FC<MusicPulseOverlayProps> = ({
    theme,
    enabled,
    isDaylight,
    strength,
}) => {
    // audioPower 的实时刻度是 0..255（见 usePlaybackVisualizerBridge），预览时是 0..1。
    const smooth = useSpring(audioPower, { stiffness: 120, damping: 30, mass: 0.45 });
    // 上限压到 0.10：这一层只是"呼吸"，不该把播放页洗成一块颜色。
    const opacity = useTransform(smooth, [0, 40, 160, 255], [
        0.02 * strength,
        0.035 * strength,
        0.06 * strength,
        0.095 * strength,
    ]);
    const scale = useTransform(smooth, [0, 255], [1, 1 + 0.035 * strength]);

    if (!enabled) {
        return null;
    }

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
                background: `radial-gradient(105% 62% at 50% 86%, ${withAlpha(theme.secondaryColor, 0.55)} 0%, ${withAlpha(theme.accentColor, 0.28)} 38%, rgba(0,0,0,0) 70%)`,
                opacity,
                scale,
                // 亮底上 screen 会直接洗白，改用 soft-light 只推移明暗。
                mixBlendMode: isDaylight ? 'soft-light' : 'screen',
                willChange: 'opacity, transform',
            }}
        />
    );
};

export default MusicPulseOverlay;
