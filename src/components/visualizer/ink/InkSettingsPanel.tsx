import React from 'react';
import { DEFAULT_INK_TUNING, type InkTuning } from '../../../types';
import { Group, type SettingsGroupDef } from '../../modal/settings/kit';
import type { VisualizerSettingsPanelProps } from '../definition';
import { percent, pixels, seconds, SliderRow, ToggleRow, times } from '../panelRows';

// src/components/visualizer/ink/InkSettingsPanel.tsx
// 墨韵的参数面板：晕染浓度、洇开的模糊、升起的距离、淡入的时长。

const INK_GROUP: SettingsGroupDef = { id: 'vis-ink', titleKey: 'options.inkSettings' };

const InkSettingsPanel: React.FC<VisualizerSettingsPanelProps<InkTuning>> = ({
    t,
    onSliderPointerDown,
    onSliderCommit,
    tuning = DEFAULT_INK_TUNING,
    onTuningChange,
}) => {
    const drag = { onDragStart: onSliderPointerDown, onDragEnd: onSliderCommit };

    return (
        <Group def={INK_GROUP}>
            <SliderRow
                {...drag}
                label={t('options.inkWashStrength')}
                value={tuning.washStrength}
                min={0}
                max={1}
                step={0.01}
                format={percent}
                onChange={(value) => onTuningChange?.({ washStrength: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.inkBleedBlur')}
                value={tuning.bleedBlurPx}
                min={0}
                max={6}
                step={0.1}
                format={pixels}
                onChange={(value) => onTuningChange?.({ bleedBlurPx: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.inkRiseDistance')}
                value={tuning.riseDistance}
                min={0}
                max={60}
                step={1}
                format={pixels}
                onChange={(value) => onTuningChange?.({ riseDistance: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.inkTransitionDuration')}
                value={tuning.transitionDuration}
                min={0.1}
                max={2}
                step={0.05}
                format={seconds}
                onChange={(value) => onTuningChange?.({ transitionDuration: value })}
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

export default InkSettingsPanel;
