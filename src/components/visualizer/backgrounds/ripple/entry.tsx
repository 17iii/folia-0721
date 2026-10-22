import React from 'react';
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
    glyph: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M7.5 7.5a6.4 6.4 0 000 9" opacity="0.6" />
            <path d="M16.5 7.5a6.4 6.4 0 010 9" opacity="0.6" />
        </>
    ),
    command: {
        title: 'Background: Ripple',
        description: 'Switch background to the audio-reactive ripples',
        keywords: ['ripple', 'wave', '涟漪', '波纹', '背景切换到涟漪'],
    },
    render: ({ theme, isDaylight, audioPower, staticMode, paused, config }) => (
        <RippleBackground
            theme={theme}
            isDaylight={isDaylight}
            audioPower={audioPower}
            frozen={staticMode || paused}
            tuning={config?.ripple?.tuning}
        />
    ),
    renderSettingsPanel: ({ config, actions, t, onSliderPointerDown, onSliderCommit }) => (
        <RippleBackgroundSettingsCard
            t={t}
            tuning={config?.ripple?.tuning}
            onTuningChange={actions?.ripple?.onTuningChange}
            onSliderPointerDown={onSliderPointerDown}
            onSliderCommit={onSliderCommit}
        />
    ),
    resetSettings: actions => actions?.ripple?.onResetTuning?.(),
});
