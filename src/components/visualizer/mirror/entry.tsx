import React from 'react';
import { defineVisualizer } from '../definition';
import PresetLyrics from '../../shared/PresetLyrics';
import MirrorSettingsPanel from './MirrorSettingsPanel';

// src/components/visualizer/mirror/entry.tsx
// 镜面：主歌词正下方带渐隐倒影，玻璃质感。
export default defineVisualizer({
    mode: 'mirror',
    order: 145,
    labelKey: 'ui.visualizerMirror',
    labelFallback: 'Mirror',
    previewSeed: 'mirror',
    previewStartOffset: 0,
    // 镜面：上下镜像的两道横线
    glyph: (
        <>
            <path d="M4 9h16" />
            <path d="M4 15h16" opacity="0.45" />
            <path d="M12 9v6" opacity="0.3" />
        </>
    ),
    command: {
        title: 'Visualizer: Mirror',
        description: 'Switch to the mirrored-reflection lyric style',
        keywords: ['mirror', 'reflection', '镜面', '倒影', '镜像歌词'],
    },
    usesWordSegmentation: true,
    render: props => <PresetLyrics {...props} preset="mirror" tuning={props.mirrorTuning} />,
    renderSettingsPanel: props => <MirrorSettingsPanel {...props} />,
});
