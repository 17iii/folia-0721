import React from 'react';
import { DEFAULT_GRAIN_BACKGROUND_TUNING } from '../../../../types';
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
    render: ({ theme, isDaylight, staticMode, paused, config }) => (
        <GrainBackground
            theme={theme}
            isDaylight={isDaylight}
            frozen={staticMode || paused}
            tuning={config?.grain?.tuning ?? DEFAULT_GRAIN_BACKGROUND_TUNING}
        />
    ),
    renderSettingsPanel: ({ config, actions, t, isDaylight, theme, controlCardBg, rangeInputClass, onSliderPointerDown, onSliderCommit }) => (
        <GrainBackgroundSettingsCard
            t={t}
            isDaylight={isDaylight}
            theme={theme}
            controlCardBg={controlCardBg}
            rangeInputClass={rangeInputClass}
            tuning={config?.grain?.tuning ?? DEFAULT_GRAIN_BACKGROUND_TUNING}
            onTuningChange={actions?.grain?.onTuningChange}
            onSliderPointerDown={onSliderPointerDown}
            onSliderCommit={onSliderCommit}
        />
    ),
    resetSettings: actions => actions?.grain?.onResetTuning?.(),
});
