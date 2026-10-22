import React from 'react';
import { Wind } from 'lucide-react';
import { defineVisualizerBackground } from '../definition';
import AuroraBackground from './AuroraBackground';
import AuroraBackgroundSettingsCard from './AuroraBackgroundSettingsCard';

// src/components/visualizer/backgrounds/aurora/entry.tsx
// 注册极光背景：主题色驱动的流动柔光幕布。
export default defineVisualizerBackground({
    mode: 'aurora',
    order: 55,
    labelKey: 'options.visualizerBackgroundModeAurora',
    labelFallback: 'Aurora',
    // 极光：起伏的幕布
    glyph: (
        <>
            <path d="M3 17c3-4 6-4 9 0s6 4 9 0" />
            <path d="M3 11c3-4 6-4 9 0s6 4 9 0" opacity="0.5" />
        </>
    ),
    command: {
        title: 'Background: Aurora',
        description: 'Switch background to the aurora glow',
        keywords: ['aurora', '极光', '柔光', '背景切换到极光'],
    },
    render: ({ theme, isDaylight, staticMode, paused, config }) => (
        <AuroraBackground
            theme={theme}
            isDaylight={isDaylight}
            frozen={staticMode || paused}
            tuning={config?.aurora?.tuning}
        />
    ),
    renderSettingsPanel: ({ config, actions, t, onSliderPointerDown, onSliderCommit }) => (
        <AuroraBackgroundSettingsCard
            t={t}
            tuning={config?.aurora?.tuning}
            onTuningChange={actions?.aurora?.onTuningChange}
            onSliderPointerDown={onSliderPointerDown}
            onSliderCommit={onSliderCommit}
        />
    ),
    resetSettings: actions => actions?.aurora?.onResetTuning?.(),
});
