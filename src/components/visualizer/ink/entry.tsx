import React from 'react';
import { Brush } from 'lucide-react';
import { defineVisualizer } from '../definition';
import PresetLyrics from '../../shared/PresetLyrics';
import InkSettingsPanel from './InkSettingsPanel';

// src/components/visualizer/ink/entry.tsx
// 墨韵：衬线字体 + 水墨渐变文字，柔和淡入。
export default defineVisualizer({
    mode: 'ink',
    order: 140,
    labelKey: 'ui.visualizerInk',
    labelFallback: 'Ink',
    previewSeed: 'ink',
    previewStartOffset: 0,
    // 墨韵：毛笔笔触
    glyph: (
        <>
            <path d="M5 19c3-1 4-7 8-9s5-1 6-4" />
            <path d="M5 19l3-2" opacity="0.5" />
        </>
    ),
    command: {
        title: 'Visualizer: Ink',
        description: 'Switch to the ink-wash serif lyric style',
        keywords: ['ink', 'ink wash', '墨韵', '水墨', '衬线歌词'],
    },
    usesWordSegmentation: true,
    render: props => <PresetLyrics {...props} preset="ink" tuning={props.inkTuning} />,
    renderSettingsPanel: props => <InkSettingsPanel {...props} />,
});
