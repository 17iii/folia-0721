import React, { useEffect, useMemo } from 'react';
import { useMotionValue } from 'framer-motion';
import type { ProbeDefinition } from './definition';
import type { Line, Theme } from '../../src/types';
import { PRESET_DEFAULTS, type LyricPresetKind } from '../../src/components/shared/presets/shared';
import NeonLine from '../../src/components/shared/presets/NeonLine';
import InkLine from '../../src/components/shared/presets/InkLine';
import MirrorLine from '../../src/components/shared/presets/MirrorLine';
import SparkleLine from '../../src/components/shared/presets/SparkleLine';

// dev/probes/presetLyrics.probe.tsx
// 四个歌词样式的一行字，按播放头停在某个时刻画出来（不接外壳、不接背景），
// 用来反复看「唱到一半」这一刻每个字的表情对不对。
//
// URL 参数：
//   ?probe=presetLyrics&t=2.4   停在这个时间（默认 2.4）
//   ?probe=presetLyrics&live=1  按实时播放（截图会有一点点随机）
//
// 一行 8 个词，每个词 0.42s，所以 t=2.4 落在第 6 个词中间。

const T0 = 0.6;
const WORD_SECONDS = 0.42;

const WORDS = ['夜色', '把城市', '揉成', '一团', '模糊的', '霓虹', '光晕', '落下'];

const buildLine = (): Line => {
    const words = WORDS.map((text, index) => ({
        text,
        startTime: T0 + index * WORD_SECONDS,
        endTime: T0 + (index + 1) * WORD_SECONDS,
    }));
    return {
        words,
        startTime: words[0].startTime,
        endTime: words[words.length - 1].endTime,
        fullText: WORDS.join(''),
    };
};

const buildTheme = (intensity: Theme['animationIntensity']): Theme => ({
    name: 'Probe',
    backgroundColor: '#0b0d16',
    primaryColor: '#f2f4ff',
    accentColor: '#7cf7d4',
    secondaryColor: '#6d7ea8',
    fontStyle: 'sans',
    animationIntensity: intensity,
});

const LINES: Record<LyricPresetKind, React.FC<any>> = {
    neon: NeonLine,
    ink: InkLine,
    mirror: MirrorLine,
    sparkle: SparkleLine,
};

const Cell: React.FC<{ preset: LyricPresetKind; time: number; fontSize: string; intensity: Theme['animationIntensity']; label?: string }> = ({ preset, time, fontSize, intensity, label }) => {
    const currentTime = useMotionValue(time);
    const line = useMemo(buildLine, []);
    const Variant = LINES[preset];
    const params = new URLSearchParams(window.location.search);
    const live = params.get('live') === '1';
    const theme = useMemo(() => buildTheme(intensity), [intensity]);

    useEffect(() => {
        if (!live) {
            // 先退一点点再跳到目标：lit / singing 这些状态是听 currentTime 的 change 事件来的，
            // 直接 set 一次不会触发，画面会停在全未唱的样子。
            currentTime.set(Math.max(0, time - 0.05));
            const id = requestAnimationFrame(() => currentTime.set(time));
            return () => cancelAnimationFrame(id);
        }
        const started = performance.now();
        let frame = 0;
        const tick = () => {
            currentTime.set(time + (performance.now() - started) / 1000);
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [currentTime, time, live]);

    return (
        <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-xl bg-[#0b0d16]">
            <span className="absolute left-3 top-2 text-[10px] uppercase tracking-widest text-white/30">{label ?? preset}</span>
            <div className="px-8">
                <Variant
                    line={line}
                    currentTime={currentTime}
                    theme={theme}
                    tuning={PRESET_DEFAULTS[preset]}
                    fontSize={fontSize}
                    fontStack='"Inter", "Noto Sans SC", system-ui, sans-serif'
                    fontWeight={preset === 'neon' ? 800 : 700}
                />
            </div>
        </div>
    );
};

const PresetLyricsProbe: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const time = Number(params.get('t') ?? 2.4);
    const big = params.get('big') === '1';
    const zoom = Number(params.get('zoom') ?? 1);
    const only = (params.get('only') as LyricPresetKind) ?? 'neon';
    const intensity = (params.get('intensity') as Theme['animationIntensity']) ?? 'normal';
    const tiers = params.get('tiers') === '1';
    const presets: LyricPresetKind[] = big ? [only] : ['neon', 'ink', 'mirror', 'sparkle'];
    const levels: Theme['animationIntensity'][] = tiers ? ['calm', 'normal', 'chaotic'] : [intensity];

    return (
        <div className={`grid gap-3 bg-[#05060a] p-3 ${big ? 'grid-cols-1' : 'grid-cols-2'}`} style={{ zoom }}>
            {levels.flatMap((level) => presets.map((preset) => (
                <Cell
                    key={`${level}-${preset}`}
                    preset={preset}
                    time={time}
                    intensity={level}
                    label={tiers ? `${preset} · ${level}` : preset}
                    fontSize={big ? 'clamp(1.6rem, 3.1vw, 2.4rem)' : 'clamp(1rem, 1.45vw, 1.25rem)'}
                />
            )))}
        </div>
    );
};

const probe: ProbeDefinition = {
    id: 'presetLyrics',
    title: '四个歌词样式（停在某一刻）',
    description: '用假的歌词与播放头，t=秒数 看唱到一半时每个字的表情',
    Component: PresetLyricsProbe,
};

export default probe;
