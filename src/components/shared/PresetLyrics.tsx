import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Line, Theme } from '../../types';
import { getLineRenderEndTime } from '../../utils/lyrics/renderHints';
import { useVisualizerRuntime } from '../visualizer/runtime';
import VisualizerShell from '../visualizer/VisualizerShell';
import VisualizerSubtitleOverlay from '../visualizer/VisualizerSubtitleOverlay';
import { resolveSubtitleFontSizes } from '../visualizer/subtitleFontSizes';
import { resolveThemeFontStack, resolveThemeFontWeight } from '../../utils/fontStacks';
import type { VisualizerSharedProps } from '../visualizer/definition';
import NeonLine from './presets/NeonLine';
import InkLine from './presets/InkLine';
import MirrorLine from './presets/MirrorLine';
import SparkleLine from './presets/SparkleLine';
import {
    PRESET_DEFAULTS,
    seeded,
    withAlpha,
    type LyricPresetKind,
    type PresetLineProps,
    type PresetLyricsTuning,
} from './presets/shared';

// src/components/shared/PresetLyrics.tsx
// 四个新歌词样式的外壳：它们各有自己的一套画法（见 presets/），这里负责把画面摆好——
// 上一行落定、当前行在中间、下一行在底下等着。
//
// 四个样式不只是「配了不同的颜色」，而是四套不同的语言：
//   霓虹 = 灯管（管子是描边出来的，电极接通会打嗝，播放头拖着光团）
//   水墨 = 笔触（斜着推进的笔锋，墨是湿的，纸有纹理，字是歪的）
//   镜面 = 水面（正片在上，倒影在下而且一直在起伏，播放头荡开涟漪）
//   星屑 = 星轨（没有遮罩，唱过的字变成会甩出星尘的亮星）
// 外加四套各自的舞台：霓虹的湿地反光、水墨的纸、镜面的水、星屑的星野。

export type { LyricPresetKind, PresetLyricsTuning } from './presets/shared';

export interface PresetLyricsProps extends VisualizerSharedProps {
    preset: LyricPresetKind;
    /** 该样式自己保存的参数；没有时用该样式的默认值。 */
    tuning?: PresetLyricsTuning;
}

const VARIANTS: Record<LyricPresetKind, React.FC<PresetLineProps>> = {
    neon: NeonLine,
    ink: InkLine,
    mirror: MirrorLine,
    sparkle: SparkleLine,
};

/** 页面是否在降级动效里（应用把状态写在 <html data-reduce-motion> 上）。 */
const useReducedMotion = (): boolean => {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const read = () => setReduced(Boolean(document.documentElement.getAttribute('data-reduce-motion')));
        read();
        const observer = new MutationObserver(read);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
        return () => observer.disconnect();
    }, []);
    return reduced;
};

/** 每个样式自己的舞台：让整幅画面就不一样，而不只是字不一样。 */
const Stage: React.FC<{ preset: LyricPresetKind; theme: Theme; enabled: boolean; }> = ({ preset, theme, enabled }) => {
    if (preset === 'neon') {
        // 只是一圈贴着字的柔光。之前这里还铺了整片的大光晕和一条地面亮带，
        // 缩到样式选择器的小图里，那两片就成了歌词外面一个显眼的方框——去掉了。
        return (
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `radial-gradient(34% 26% at 50% 44%, ${withAlpha(theme.accentColor, 0.11)}, ${withAlpha(theme.accentColor, 0)} 72%)`,
                }}
            />
        );
    }

    if (preset === 'ink') {
        // 一张纸：暖白的一团光，底下压着卷轴的边
        return (
            <>
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: `radial-gradient(70% 52% at 50% 44%, ${withAlpha('#f4ecd8', 0.1)}, ${withAlpha('#f4ecd8', 0)} 72%)`,
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-[12%] bottom-[26%] h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${withAlpha('#e8dcc0', 0.22)}, transparent)` }}
                />
            </>
        );
    }

    if (preset === 'mirror') {
        // 水面：下半张画面是水
        return (
            <>
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
                    style={{
                        background: `linear-gradient(to top, ${withAlpha(theme.accentColor, 0.14)}, ${withAlpha(theme.secondaryColor, 0.05)} 45%, ${withAlpha(theme.secondaryColor, 0)})`,
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: `radial-gradient(58% 34% at 50% 52%, ${withAlpha(theme.accentColor, 0.1)}, ${withAlpha(theme.accentColor, 0)} 70%)`,
                    }}
                />
            </>
        );
    }

    // 星屑：一片星野
    if (!enabled) {
        return null;
    }
    const stars = Array.from({ length: 46 }, (_, index) => {
        const x = seeded(index * 3.1) * 100;
        const y = seeded(index * 7.7) * 100;
        const size = 0.8 + seeded(index * 5.3) * 1.8;
        const delay = seeded(index * 9.1) * 6;
        return (
            <motion.span
                key={index}
                aria-hidden
                className="pointer-events-none absolute rounded-full"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: size,
                    height: size,
                    background: '#fff',
                    opacity: 0.18 + seeded(index * 2.2) * 0.4,
                }}
                animate={{ opacity: [0.12, 0.75, 0.12] }}
                transition={{ duration: 3.5 + seeded(index * 4.4) * 4, repeat: Infinity, delay, ease: 'easeInOut' }}
            />
        );
    });
    return <div aria-hidden className="pointer-events-none absolute inset-0">{stars}</div>;
};

const PresetLyrics: React.FC<PresetLyricsProps> = (props) => {
    const {
        currentTime,
        currentLineIndex,
        lines,
        theme,
        showText = true,
        lyricsFontScale = 1,
        subtitleTheme,
        subtitleFontScale = 1,
        subtitleOverlayOpacity,
        subtitleOverlayBackground,
        subtitleUpcomingLyricsBlur,
        isPlayerChromeHidden = false,
        hideTranslationSubtitle = false,
        showSubtitleTranslation = true,
        subtitleContentMode,
        preset,
        tuning,
    } = props;
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();

    const { activeLine, recentCompletedLine, nextLines } = useVisualizerRuntime({
        currentTime,
        currentLineIndex,
        lines,
        getLineEndTime: getLineRenderEndTime,
    });

    // 参数面板存下来的值，缺的那几项用该样式的默认值补齐。
    const resolvedTuning = useMemo<Required<PresetLyricsTuning>>(
        () => ({ ...PRESET_DEFAULTS[preset], ...(tuning ?? {}) }),
        [preset, tuning],
    );

    const Variant = VARIANTS[preset];

    const useInkFont = preset === 'ink';
    const fontStack = useMemo(
        () => (useInkFont ? '"Songti SC", "STSong", "Noto Serif SC", Georgia, serif' : resolveThemeFontStack(theme)),
        [useInkFont, theme],
    );
    const fontWeight = resolveThemeFontWeight(theme, preset === 'neon' ? 800 : 700);
    const fontSize = `clamp(${(2.4 * lyricsFontScale).toFixed(2)}rem, ${(6.2 * lyricsFontScale).toFixed(2)}vw, ${(4.6 * lyricsFontScale).toFixed(2)}rem)`;
    const contextFontSize = `clamp(${(1.2 * lyricsFontScale).toFixed(2)}rem, ${(3.1 * lyricsFontScale).toFixed(2)}vw, ${(2.3 * lyricsFontScale).toFixed(2)}rem)`;
    const { translationFontSize, upcomingFontSize } = resolveSubtitleFontSizes(lyricsFontScale);

    // 上一行：正在唱的那行落定之后，它退到头顶去。
    const previousLine = currentLineIndex > 0 ? lines[currentLineIndex - 1] ?? null : null;
    const showContext = resolvedTuning.showContext && !reducedMotion;

    const renderLine = (line: Line, size: string, contextual: boolean) => (
        <Variant
            line={line}
            currentTime={currentTime}
            theme={theme}
            tuning={resolvedTuning}
            fontSize={size}
            fontStack={fontStack}
            fontWeight={fontWeight}
            contextual={contextual}
        />
    );

    // 每个样式的入场不一样：霓虹是打嗝着亮起来，水墨是慢慢洇开，
    // 镜面是从水里浮上来，星屑是一颗一颗点亮。
    const activeMotion = (() => {
        switch (preset) {
            case 'neon':
                return {
                    initial: { opacity: 0, y: resolvedTuning.riseDistance, filter: 'blur(6px)' },
                    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                    exit: { opacity: 0, y: -8, filter: 'blur(8px)' },
                    transition: { duration: 0.34, ease: 'easeOut' as const },
                };
            case 'ink':
                return {
                    initial: { opacity: 0, y: resolvedTuning.riseDistance, scaleX: 1.04, filter: 'blur(10px)' },
                    animate: { opacity: 1, y: 0, scaleX: 1, filter: 'blur(0px)' },
                    exit: { opacity: 0, y: -12, scaleX: 0.99, filter: 'blur(12px)' },
                    transition: { duration: resolvedTuning.transitionDuration * 1.6, ease: [0.22, 1, 0.36, 1] as const },
                };
            case 'mirror':
                return {
                    initial: { opacity: 0, y: 26, scale: 0.98, filter: 'blur(8px)' },
                    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
                    exit: { opacity: 0, y: -14, scale: 1.02, filter: 'blur(10px)' },
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
                };
            case 'sparkle':
            default:
                return {
                    initial: { opacity: 0, y: 10, scale: 0.97 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: -6, scale: 1.01 },
                    transition: { duration: 0.4, ease: 'easeOut' as const },
                };
        }
    })();

    const activeBlock = activeLine ? (
        <motion.div
            key={activeLine.startTime}
            className="flex flex-col items-center"
            initial={activeMotion.initial}
            animate={activeMotion.animate}
            exit={activeMotion.exit}
            transition={activeMotion.transition}
        >
            {renderLine(activeLine, fontSize, false)}
        </motion.div>
    ) : null;

    const contextAbove = showContext && previousLine ? (
        <motion.div
            key={`above-${previousLine.startTime}`}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 0.3, y: 0, filter: 'blur(0.6px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
        >
            {renderLine(previousLine, contextFontSize, true)}
        </motion.div>
    ) : null;

    const contextBelow = showContext && nextLines.length > 0 ? (
        <motion.div
            key={`below-${nextLines[0].startTime}`}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            animate={{ opacity: 0.17, y: 0, filter: 'blur(1.2px)' }}
            exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {renderLine(nextLines[0], contextFontSize, true)}
        </motion.div>
    ) : null;

    return (
        <VisualizerShell
            theme={theme}
            audioPower={props.audioPower}
            audioBands={props.audioBands}
            sharedProps={props}
        >
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 pointer-events-none will-change-transform">
                <Stage preset={preset} theme={theme} enabled={!reducedMotion} />

                <div className="relative flex flex-col items-center gap-6">
                    <AnimatePresence initial={false}>
                        {showText && contextAbove}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                        {showText && activeBlock}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                        {showText && contextBelow}
                    </AnimatePresence>

                    {/* 没有歌词时，一句安静的话。 */}
                    {!activeLine && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                                color: theme.secondaryColor,
                                fontSize: `clamp(${(1.6 * lyricsFontScale).toFixed(2)}rem, ${(3.4 * lyricsFontScale).toFixed(2)}vw, ${(2.2 * lyricsFontScale).toFixed(2)}rem)`,
                            }}
                        >
                            {t('ui.waitingForMusic')}
                        </motion.div>
                    )}
                </div>
            </div>

            <VisualizerSubtitleOverlay
                showText={showText}
                activeLine={activeLine}
                recentCompletedLine={recentCompletedLine}
                nextLines={nextLines}
                theme={theme}
                subtitleTheme={subtitleTheme}
                translationFontSize={translationFontSize}
                upcomingFontSize={upcomingFontSize}
                subtitleOverlayOpacity={subtitleOverlayOpacity}
                subtitleOverlayBackground={subtitleOverlayBackground}
                subtitleUpcomingLyricsBlur={subtitleUpcomingLyricsBlur}
                subtitleFontScale={subtitleFontScale}
                isPlayerChromeHidden={isPlayerChromeHidden}
                hideTranslationSubtitle={hideTranslationSubtitle}
                showSubtitleTranslation={showSubtitleTranslation}
                subtitleContentMode={subtitleContentMode}
            />
        </VisualizerShell>
    );
};

export default PresetLyrics;
