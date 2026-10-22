import { useMemo } from 'react';
import { useTransform, useMotionTemplate, type MotionValue } from 'framer-motion';
import type { Line, Theme, Word } from '../../../types';

// src/components/shared/presets/shared.ts
// 四个新歌词样式共用的零件：参数与默认值、几个数学小工具、以及「词被唱到多少」的进度。
//
// 每个样式有自己的一套画法（霓虹是灯管、水墨是笔触、镜面是水面、星屑是星轨），
// 这里只放它们真正共用的那几件。

export type LyricPresetKind = 'neon' | 'ink' | 'mirror' | 'sparkle';

/**
 * 四个新样式的全部参数。字段只属于一种样式，所以一份 PresetLyricsTuning
 * 可以同时装下任意一种样式的参数。
 */
export interface PresetLyricsTuning {
    // neon
    glowIntensity?: number;
    glowSpread?: number;
    strokeWidth?: number;
    dimOpacity?: number;
    flickerEnabled?: boolean;
    // ink
    washStrength?: number;
    bleedBlurPx?: number;
    riseDistance?: number;
    transitionDuration?: number;
    // mirror
    showReflection?: boolean;
    reflectionOpacity?: number;
    reflectionGapPx?: number;
    reflectionBlurPx?: number;
    // sparkle
    sparkleSize?: number;
    sparkleDensity?: number;
    twinkleSpeed?: number;
    // 共用
    /** 头顶与底下是否显示上下文歌词。 */
    showContext?: boolean;
    /** 呼吸幅度：0 是完全静止。 */
    idleMotion?: number;
}

export const PRESET_DEFAULTS: Record<LyricPresetKind, Required<PresetLyricsTuning>> = {
    // 暗处要真的暗、亮处要真的亮，效果才「明显」：未唱的字压到 0.22，
    // 点亮的那一份再给到 1.15 的辉光。
    neon: {
        glowIntensity: 1.15, glowSpread: 1.1, strokeWidth: 0.6, dimOpacity: 0.24, flickerEnabled: true,
        washStrength: 1, bleedBlurPx: 0.4, riseDistance: 14, transitionDuration: 0.5,
        showReflection: true, reflectionOpacity: 0.62, reflectionGapPx: 10, reflectionBlurPx: 0.45,
        sparkleSize: 1.1, sparkleDensity: 0.6, twinkleSpeed: 1, showContext: true, idleMotion: 1,
    },
    ink: {
        glowIntensity: 1, glowSpread: 1, strokeWidth: 0.6, dimOpacity: 0.22, flickerEnabled: false,
        washStrength: 1.15, bleedBlurPx: 0.5, riseDistance: 14, transitionDuration: 0.5,
        showReflection: true, reflectionOpacity: 0.62, reflectionGapPx: 10, reflectionBlurPx: 0.45,
        sparkleSize: 1, sparkleDensity: 0.5, twinkleSpeed: 1, showContext: true, idleMotion: 1,
    },
    mirror: {
        glowIntensity: 1.1, glowSpread: 1, strokeWidth: 0.6, dimOpacity: 0.26, flickerEnabled: false,
        washStrength: 1, bleedBlurPx: 0.4, riseDistance: 14, transitionDuration: 0.5,
        showReflection: true, reflectionOpacity: 0.66, reflectionGapPx: 10, reflectionBlurPx: 0.45,
        sparkleSize: 1.1, sparkleDensity: 0.6, twinkleSpeed: 1, showContext: true, idleMotion: 1,
    },
    sparkle: {
        glowIntensity: 1.15, glowSpread: 1, strokeWidth: 0.6, dimOpacity: 0.22, flickerEnabled: false,
        washStrength: 1, bleedBlurPx: 0.4, riseDistance: 14, transitionDuration: 0.5,
        showReflection: true, reflectionOpacity: 0.62, reflectionGapPx: 10, reflectionBlurPx: 0.45,
        sparkleSize: 1.15, sparkleDensity: 0.7, twinkleSpeed: 1.1, showContext: true, idleMotion: 1,
    },
};

/** 一个样式画一行字时拿到的全部东西。 */
export interface PresetLineProps {
    line: Line;
    currentTime: MotionValue<number>;
    theme: Theme;
    tuning: Required<PresetLyricsTuning>;
    fontSize: string;
    fontStack: string;
    fontWeight: number;
    /** 上下文行：只画未唱的样子，不参与点亮。 */
    contextual?: boolean;
}

/**
 * 主题的动效强度（平静 / 标准 / 混乱）换算成一个倍数。
 *
 * 这个开关在外观面板里切，**必须真的有反应**：平静 = 整整齐齐（霓虹招牌本来就是齐的），
 * 标准 = 有点手作感，混乱 = 歪得厉害。
 */
export const intensityFactor = (intensity: Theme['animationIntensity']): number => (
    intensity === 'calm' ? 0.22 : intensity === 'chaotic' ? 2 : 1
);

/** 把十六进制颜色带上透明度；不是十六进制时原样返回。 */
export const withAlpha = (color: string, alpha: number): string => {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.trim());
    if (!match) {
        return color;
    }
    const [r, g, b] = [match[1], match[2], match[3]].map(part => parseInt(part, 16));
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
};

/** 稳定的伪随机：同一个种子永远是同一个数，所以同一行歌词每次都长一个样。 */
export const seeded = (seed: number): number => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
};

export const isInterlude = (line: Line | null): boolean =>
    Boolean(line && (line.fullText === '......' || line.fullText.trim() === '···'));

/**
 * 一个词在「被唱到」那一刻的身体反应：弹一下、往上顶一下、稍微歪一下。
 *
 * 之前每个词只有歪一点、高一点这些**固定**的偏移，唱到它的时候除了遮罩推过去，字本身一动不动，
 * 所以整行看起来是「一张被逐渐涂色的图」，很僵。这里给每个词自己的进度一个冲量：
 * 0.14 拍冲到顶，0.42 拍落回来，唱完还剩一点点余数——手按上去又弹回来的感觉。
 */
export const useWordKick = (progress: MotionValue<number>, amplitude = 1): MotionValue<number> => {
    const kick = useTransform(progress, [0, 0.14, 0.42, 1], [0, 1, 0.4, 0.1], CLAMP);
    return useTransform(kick, (value) => value * amplitude);
};

/**
 * 呼吸：即使没在唱，字也在极缓慢地浮动。相位按词的种子分开，
 * 所以整行是此起彼伏的，而不是一起上下（一起动就又僵了）。
 */
export const useBreath = (currentTime: MotionValue<number>, phase: number, amplitude: number): MotionValue<number> =>
    useTransform(currentTime, (time) => Math.sin(time * 1.05 + phase) * amplitude);

export interface WordMotionBase {
    x?: number;
    y?: number;
    rotate?: number;
    scale?: number;
}

/**
 * 一个词的全部运动：静止时的不齐（base）+ 一直在的呼吸（breath）+ 唱到时的冲量（kick）。
 *
 * 三者合成成 MotionValue 交给 framer，不经过 React——二十来个词一起每帧更新也不会掉帧。
 * 返回值里的 `kick` 用来驱动「亮起来那一下」的光（见各样式里的 flash 层）。
 */
export const useWordMotion = ({
    currentTime,
    progress,
    seed,
    base,
    strength = 1,
    idle = 1,
}: {
    currentTime: MotionValue<number>;
    progress: MotionValue<number>;
    seed: number;
    base?: WordMotionBase;
    /** 冲量的倍数：动效强度、样式自己的幅度都乘在这里。 */
    strength?: number;
    /** 呼吸的倍数（参数的 idleMotion）。 */
    idle?: number;
}) => {
    const anchor = base ?? {};
    // 形状归一（0..1），幅度一律交给下面的 kickX / kickY 线性带 strength——
    // 两处都乘会变成平方，把三档的差距压平。
    const kick = useWordKick(progress, 1);
    const phase = seed * 1.7;
    const breath = useBreath(currentTime, phase, 2.2 * idle);
    const breathTilt = useBreath(currentTime, phase * 1.31 + 2.1, 0.42 * idle);
    // 冲量的方向按词的种子分：有的往上顶，有的往侧面甩。
    const kickX = (seeded(seed + 12.3) - 0.5) * 7 * strength;
    const kickY = (4 + seeded(seed + 6.1) * 3) * strength;
    const kickTilt = (seeded(seed + 2.2) - 0.5) * 3.6 * strength;

    const x = useTransform([kick, breath], ([k, b]: number[]) => (anchor.x ?? 0) + k * kickX + b * 0.25);
    const y = useTransform([kick, breath], ([k, b]: number[]) => (anchor.y ?? 0) - k * kickY + b);
    const rotate = useTransform([kick, breathTilt], ([k, b]: number[]) => (anchor.rotate ?? 0) + b + k * kickTilt);
    const scale = useTransform(kick, (k) => (anchor.scale ?? 1) * (1 + k * 0.14));

    return { x, y, rotate, scale, kick };
};

// 这几个数组与函数放在模块层：useTransform 认的是引用，换一次就重建一个 MotionValue，
// 遮罩会跟着从头再来一遍。
const UNIT_RANGE: [number, number] = [0, 1];
const CLAMP = { clamp: true } as const;
const toPercent = (value: number) => value * 100;

/** 词被唱到了多少：0 = 还没唱到，1 = 唱完了。 */
export const useWordProgress = (currentTime: MotionValue<number>, word: Word): MotionValue<number> => {
    const range = useMemo<[number, number]>(
        () => [word.startTime, Math.max(word.endTime, word.startTime + 0.02)],
        [word.startTime, word.endTime],
    );
    return useTransform(currentTime, range, UNIT_RANGE, CLAMP);
};

/**
 * 从左边推过来的亮起遮罩。
 *
 * `feather` 是前沿那一小段的过渡（百分比）：没有它，遮罩在播放头处是一个硬切边，
 * 被它切掉的辉光会留下一道竖直的亮边。
 */
export const useVerticalLitMask = (progress: MotionValue<number>, feather = 0): MotionValue<string> => {
    const percent = useTransform(progress, toPercent);
    const soft = useTransform(percent, (value) => Math.max(0, value - feather));
    return useMotionTemplate`linear-gradient(90deg, #000 0%, #000 ${soft}%, transparent ${percent}%, transparent 100%)`;
};

/** 斜着推过来的亮起遮罩：水墨的笔锋就是斜着走的。 */
export const useDiagonalLitMask = (progress: MotionValue<number>, angle = '108deg', feather = 0): MotionValue<string> => {
    const percent = useTransform(progress, toPercent);
    const soft = useTransform(percent, (value) => Math.max(0, value - feather));
    return useMotionTemplate`linear-gradient(${angle}, #000 0%, #000 ${soft}%, transparent ${percent}%, transparent 100%)`;
};

/**
 * 亮起部分里最烫的一条窄带：跟着播放头往前爬。
 *
 * 注意：这条带子是跟着播放头走的，播放头走过一个字之后它会停在那个字的**右边缘**，
 * 看起来像每个字右边都挂了一道白边。所以它只在该词**正在唱**的时候画。
 */
export const useCoreMask = (progress: MotionValue<number>, width: number): MotionValue<string> => {
    const percent = useTransform(progress, toPercent);
    const start = useTransform(percent, (value) => Math.max(0, value - width));
    return useMotionTemplate`linear-gradient(90deg, transparent ${start}%, #000 ${start}%, #000 ${percent}%, transparent ${percent}%, transparent 100%)`;
};

/** 播放头在这个词里的位置（百分比），用来把光晕、涟漪放在对的地方。 */
export const useHeadPercent = (progress: MotionValue<number>): MotionValue<number> => {
    const percent = useTransform(progress, toPercent);
    return useTransform(percent, (value) => Math.min(100, value));
};

/**
 * 一层一层叠起来的辉光，写成 text-shadow。
 *
 * **不要用 filter: drop-shadow**：这个字的外面套着 mask-image（逐字点亮的那道遮罩），
 * Chromium 在「遮罩 + 滤镜」同时存在时会先给元素铺一层不透明的绘制底，辉光于是变成
 * 一个字大小的实心方块——之前那些方块、白边都是这么来的。text-shadow 不建图层，没有这个问题；
 * 半径是固定的（只随参数变），也不会踩到动态文字阴影漏字形缓存 fd 的那个坑。
 */
export const glowTextShadow = (color: string, intensity: number, spread = 1): string => {
    const core = Math.max(0, intensity);
    return [
        `0 0 ${(2 * core).toFixed(1)}px ${withAlpha(color, 0.95)}`,
        `0 0 ${(7 * core * spread).toFixed(1)}px ${withAlpha(color, 0.5)}`,
        `0 0 ${(18 * core * spread).toFixed(1)}px ${withAlpha(color, 0.26)}`,
    ].join(', ');
};
