import React from 'react';
import { DEFAULT_AURORA_BACKGROUND_TUNING } from '../../../../types';
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
    render: ({ theme, isDaylight, staticMode, paused, config }) => (
        <AuroraBackground
            theme={theme}
            isDaylight={isDaylight}
            frozen={staticMode || paused}
            tuning={config?.aurora?.tuning ?? DEFAULT_AURORA_BACKGROUND_TUNING}
        />
    ),
    renderSettingsPanel: ({ config, actions, t, isDaylight, theme, controlCardBg, rangeInputClass, onSliderPointerDown, onSliderCommit }) => (
        <AuroraBackgroundSettingsCard
            t={t}
            isDaylight={isDaylight}
            theme={theme}
            controlCardBg={controlCardBg}
            rangeInputClass={rangeInputClass}
            tuning={config?.aurora?.tuning ?? DEFAULT_AURORA_BACKGROUND_TUNING}
            onTuningChange={actions?.aurora?.onTuningChange}
            onSliderPointerDown={onSliderPointerDown}
            onSliderCommit={onSliderCommit}
        />
    ),
    resetSettings: actions => actions?.aurora?.onResetTuning?.(),
});
