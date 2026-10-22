import React from 'react';
import { Grid3x3 } from 'lucide-react';
import { defineVisualizerBackground } from '../definition';
import GrainBackground from './GrainBackground';
import GrainBackgroundSettingsCard from './GrainBackgroundSettingsCard';

// src/components/visualizer/backgrounds/grain/entry.tsx
// 注册噪点背景：胶片颗粒 + 主题色晕染。
export default defineVisualizerBackground({
    mode: 'grain',
    order: 60,
    labelKey: 'options.visualizerBackgroundModeGrain',
    labelFallback: 'Grain',
    // 噪点：点阵
    glyph: (
        <>
            <path d="M4 4h.01M9 4h.01M14 4h.01M19 4h.01" strokeWidth="2.2" />
            <path d="M4 12h.01M9 12h.01M14 12h.01M19 12h.01" strokeWidth="2.2" />
            <path d="M4 20h.01M9 20h.01M14 20h.01M19 20h.01" strokeWidth="2.2" />
        </>
    ),
    command: {
        title: 'Background: Grain',
        description: 'Switch background to the film-grain noise',
        keywords: ['grain', 'noise', '噪点', '胶片', '背景切换到噪点'],
    },
    render: ({ theme, isDaylight, staticMode, paused, config }) => (
        <GrainBackground
            theme={theme}
            isDaylight={isDaylight}
            frozen={staticMode || paused}
            tuning={config?.grain?.tuning}
        />
    ),
    renderSettingsPanel: ({ config, actions, t, onSliderPointerDown, onSliderCommit }) => (
        <GrainBackgroundSettingsCard
            t={t}
            tuning={config?.grain?.tuning}
            onTuningChange={actions?.grain?.onTuningChange}
            onSliderPointerDown={onSliderPointerDown}
            onSliderCommit={onSliderCommit}
        />
    ),
    resetSettings: actions => actions?.grain?.onResetTuning?.(),
});
