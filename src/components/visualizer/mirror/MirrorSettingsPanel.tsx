import React from 'react';
import { DEFAULT_MIRROR_TUNING, type MirrorTuning } from '../../../types';
import { Group, type SettingsGroupDef } from '../../modal/settings/kit';
import type { VisualizerSettingsPanelProps } from '../definition';
import { percent, pixels, SliderRow, ToggleRow, times } from '../panelRows';

// src/components/visualizer/mirror/MirrorSettingsPanel.tsx
// 镜面的参数面板：倒影开关、倒影亮度、与正文的间距、倒影的虚化。

const MIRROR_GROUP: SettingsGroupDef = { id: 'vis-mirror', titleKey: 'options.mirrorSettings' };

const MirrorSettingsPanel: React.FC<VisualizerSettingsPanelProps<MirrorTuning>> = ({
    t,
    onSliderPointerDown,
    onSliderCommit,
    tuning = DEFAULT_MIRROR_TUNING,
    onTuningChange,
}) => {
    const drag = { onDragStart: onSliderPointerDown, onDragEnd: onSliderCommit };

    return (
        <Group def={MIRROR_GROUP}>
            <ToggleRow
                label={t('options.mirrorShowReflection')}
                checked={tuning.showReflection}
                onChange={(checked) => onTuningChange?.({ showReflection: checked })}
            />
            <SliderRow
                {...drag}
                label={t('options.mirrorReflectionOpacity')}
                value={tuning.reflectionOpacity}
                min={0}
                max={1}
                step={0.01}
                format={percent}
                onChange={(value) => onTuningChange?.({ reflectionOpacity: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.mirrorReflectionGap')}
                value={tuning.reflectionGapPx}
                min={0}
                max={48}
                step={1}
                format={pixels}
                onChange={(value) => onTuningChange?.({ reflectionGapPx: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.mirrorReflectionBlur')}
                value={tuning.reflectionBlurPx}
                min={0}
                max={6}
                step={0.1}
                format={pixels}
                onChange={(value) => onTuningChange?.({ reflectionBlurPx: value })}
            />
            <ToggleRow
                label={t('options.presetShowContext')}
                checked={tuning.showContext}
                onChange={(checked) => onTuningChange?.({ showContext: checked })}
            />
            <SliderRow
                {...drag}
                label={t('options.presetIdleMotion')}
                value={tuning.idleMotion}
                min={0}
                max={2}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ idleMotion: value })}
            />
        </Group>
    );
};

export default MirrorSettingsPanel;
