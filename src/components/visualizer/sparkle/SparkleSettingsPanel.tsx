import React from 'react';
import { DEFAULT_SPARKLE_TUNING, type SparkleTuning } from '../../../types';
import { Group, type SettingsGroupDef } from '../../modal/settings/kit';
import type { VisualizerSettingsPanelProps } from '../definition';
import { percent, SliderRow, ToggleRow, times } from '../panelRows';

// src/components/visualizer/sparkle/SparkleSettingsPanel.tsx
// 星屑的参数面板：星点大小、抛出的数量、闪烁速度、辉光强度。

const SPARKLE_GROUP: SettingsGroupDef = { id: 'vis-sparkle', titleKey: 'options.sparkleSettings' };

const SparkleSettingsPanel: React.FC<VisualizerSettingsPanelProps<SparkleTuning>> = ({
    t,
    onSliderPointerDown,
    onSliderCommit,
    tuning = DEFAULT_SPARKLE_TUNING,
    onTuningChange,
}) => {
    const drag = { onDragStart: onSliderPointerDown, onDragEnd: onSliderCommit };

    return (
        <Group def={SPARKLE_GROUP}>
            <SliderRow
                {...drag}
                label={t('options.sparkleSize')}
                value={tuning.sparkleSize}
                min={0}
                max={3}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ sparkleSize: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.sparkleDensity')}
                value={tuning.sparkleDensity}
                min={0}
                max={1}
                step={0.01}
                format={percent}
                onChange={(value) => onTuningChange?.({ sparkleDensity: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.sparkleTwinkleSpeed')}
                value={tuning.twinkleSpeed}
                min={0.2}
                max={3}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ twinkleSpeed: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.sparkleGlowIntensity')}
                value={tuning.glowIntensity}
                min={0}
                max={2}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ glowIntensity: value })}
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

export default SparkleSettingsPanel;
