import React from 'react';
import { DEFAULT_RIPPLE_BACKGROUND_TUNING } from '../../../../types';
import { Radio } from 'lucide-react';
import { defineVisualizerBackground } from '../definition';
import RippleBackground from './RippleBackground';
import RippleBackgroundSettingsCard from './RippleBackgroundSettingsCard';

// src/components/visualizer/backgrounds/ripple/entry.tsx
// 注册涟漪背景：音频能量驱动的同心圆波纹。
export default defineVisualizerBackground({
    mode: 'ripple',
    order: 65,
    labelKey: 'options.visualizerBackgroundModeRipple',
    labelFallback: 'Ripple',
    // 涟漪：扩散的圆
    render: ({ theme, isDaylight, audioPower, staticMode, paused, config }) => (
        <RippleBackground
            theme={theme}
            isDaylight={isDaylight}
            audioPower={audioPower}
            frozen={staticMode || paused}
            tuning={config?.ripple?.tuning ?? DEFAULT_RIPPLE_BACKGROUND_TUNING}
        />
    ),
    renderSettingsPanel: ({ config, actions, t, isDaylight, theme, controlCardBg, rangeInputClass, onSliderPointerDown, onSliderCommit }) => (
        <RippleBackgroundSettingsCard
            t={t}
            isDaylight={isDaylight}
            theme={theme}
            controlCardBg={controlCardBg}
            rangeInputClass={rangeInputClass}
            tuning={config?.ripple?.tuning ?? DEFAULT_RIPPLE_BACKGROUND_TUNING}
            onTuningChange={actions?.ripple?.onTuningChange}
            onSliderPointerDown={onSliderPointerDown}
            onSliderCommit={onSliderCommit}
        />
    ),
    resetSettings: actions => actions?.ripple?.onResetTuning?.(),
});
