import type { Theme } from '../../../types';
import { colorWithAlpha, parseColorChannels } from '../colorMix';

// src/components/visualizer/backgrounds/themeTint.ts
//
// 背景层怎么"贴"主题：底色用主题背景色，发光元素只用强调色/辅色。
//
// 这里刻意不用 theme.primaryColor —— 那是**文字**色，暗色主题下接近白、亮色主题下接近黑，
// 拿它当光源只会得到一片白雾（噪点背景之前就是这个毛病，看起来完全不理主题）。

const channelLuminance = (value: number) => {
    const normalized = Math.max(0, Math.min(255, value)) / 255;
    return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
};

/** 相对亮度，只用来决定「底色是亮是暗」，0..1。 */
export const relativeLuminance = (color: string): number => {
    const channels = parseColorChannels(color);
    if (!channels) return 0.35;
    return 0.2126 * channelLuminance(channels.r)
        + 0.7152 * channelLuminance(channels.g)
        + 0.0722 * channelLuminance(channels.b);
};

export interface BackgroundTint {
    /** 主题背景色，作为整块背景的底。 */
    base: string;
    /** 主题强调色，发光元素的主色。 */
    accent: string;
    /** 主题辅色，用来做第二层，避免单色发闷。 */
    secondary: string;
    /** 铺在底色上的一层极淡主题色雾，让整页读起来"是这个主题"。 */
    haze: string;
    /** 发光元素依次取用的颜色。 */
    glowColors: string[];
    /** 底色是亮色主题时为 true。 */
    isLightBase: boolean;
}

export const resolveBackgroundTint = (theme: Theme): BackgroundTint => {
    const base = theme.backgroundColor || (relativeLuminance(theme.primaryColor) > 0.5 ? '#0b0c11' : '#f2f4f8');
    const accent = theme.accentColor || theme.primaryColor;
    const secondary = theme.secondaryColor || accent;
    const isLightBase = relativeLuminance(base) > 0.5;

    // 亮底上彩色雾要更淡，否则会显脏；暗底可以稍微给多一点。
    const hazeAlpha = isLightBase ? 0.07 : 0.15;
    const haze = `radial-gradient(150% 120% at 50% 6%, ${colorWithAlpha(accent, hazeAlpha)} 0%, ${colorWithAlpha(secondary, hazeAlpha * 0.45)} 42%, transparent 78%)`;

    return {
        base,
        accent,
        secondary,
        haze,
        glowColors: [accent, secondary],
        isLightBase,
    };
};

/** 背景整体的 `background` 简写：主题色雾压在上面，主题背景色兜底。 */
export const tintedBackdrop = (tint: BackgroundTint): string => `${tint.haze}, ${tint.base}`;
