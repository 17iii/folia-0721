import React from 'react';
import { Sparkles } from 'lucide-react';
import { defineVisualizer } from '../definition';
import PresetLyrics from '../../shared/PresetLyrics';
import SparkleSettingsPanel from './SparkleSettingsPanel';

// src/components/visualizer/sparkle/entry.tsx
// 星屑：逐字点亮的歌词，活动词带闪烁星点。
export default defineVisualizer({
    mode: 'sparkle',
    order: 150,
    labelKey: 'ui.visualizerSparkle',
    labelFallback: 'Sparkle',
    previewSeed: 'sparkle',
    previewStartOffset: 0,
    // 星屑：四角星
    glyph: (
        <>
            <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
            <path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" opacity="0.5" />
        </>
    ),
    command: {
        title: 'Visualizer: Sparkle',
        description: 'Switch to the shimmering sparkle lyric style',
        keywords: ['sparkle', 'shimmer', 'star', '星屑', '闪烁', '星光歌词'],
    },
    usesWordSegmentation: true,
    render: props => <PresetLyrics {...props} preset="sparkle" tuning={props.sparkleTuning} />,
    renderSettingsPanel: props => <SparkleSettingsPanel {...props} />,
});
