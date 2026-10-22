import React from 'react';
import { defineVisualizer } from '../definition';
import PresetLyrics from '../../shared/PresetLyrics';
import NeonSettingsPanel from './NeonSettingsPanel';

// src/components/visualizer/neon/entry.tsx
// 霓虹：暗场卡拉 OK 风格，逐字点亮并带霓虹辉光与描边。
export default defineVisualizer({
    mode: 'neon',
    order: 135,
    labelKey: 'ui.visualizerNeon',
    labelFallback: 'Neon',
    previewSeed: 'neon',
    previewStartOffset: 0,
    // 霓虹：发光描边文字
    glyph: (
        <>
            <path d="M12 3v3" opacity="0.5" />
            <path d="M12 18v3" />
            <path d="M5 12h3" opacity="0.5" />
            <path d="M16 12h3" />
            <circle cx="12" cy="12" r="3.4" />
        </>
    ),
    command: {
        title: 'Visualizer: Neon',
        description: 'Switch to the neon karaoke lyric style',
        keywords: ['neon', 'neon lyric', '霓虹', '霓虹歌词', '辉光'],
    },
    usesWordSegmentation: true,
    render: props => <PresetLyrics {...props} preset="neon" tuning={props.neonTuning} />,
    renderSettingsPanel: props => <NeonSettingsPanel {...props} />,
});
