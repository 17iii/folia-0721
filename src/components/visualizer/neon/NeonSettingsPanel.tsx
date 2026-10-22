import React from 'react';
import { DEFAULT_NEON_TUNING, type NeonTuning } from '../../../types';
import { Group, type SettingsGroupDef } from '../../modal/settings/kit';
import type { VisualizerSettingsPanelProps } from '../definition';
import { percent, pixels, SliderRow, ToggleRow, times } from '../panelRows';

// src/components/visualizer/neon/NeonSettingsPanel.tsx
// 霓虹的参数面板：辉光的强度与扩散、描边宽度、未唱词亮度、灯管呼吸。

const NEON_GROUP: SettingsGroupDef = { id: 'vis-neon', titleKey: 'options.neonSettings' };

const NeonSettingsPanel: React.FC<VisualizerSettingsPanelProps<NeonTuning>> = ({
    t,
    onSliderPointerDown,
    onSliderCommit,
    tuning = DEFAULT_NEON_TUNING,
    onTuningChange,
}) => {
    const drag = { onDragStart: onSliderPointerDown, onDragEnd: onSliderCommit };

    return (
        <Group def={NEON_GROUP}>
            <SliderRow
                {...drag}
                label={t('options.neonGlowIntensity')}
                value={tuning.glowIntensity}
                min={0}
                max={2}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ glowIntensity: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.neonGlowSpread')}
                value={tuning.glowSpread}
                min={0}
                max={2}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ glowSpread: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.neonStrokeWidth')}
                value={tuning.strokeWidth}
                min={0}
                max={3}
                step={0.1}
                format={pixels}
                onChange={(value) => onTuningChange?.({ strokeWidth: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.neonDimOpacity')}
                value={tuning.dimOpacity}
                min={0.05}
                max={1}
                step={0.01}
                format={percent}
                onChange={(value) => onTuningChange?.({ dimOpacity: value })}
            />
            <ToggleRow
                label={t('options.neonFlicker')}
                checked={tuning.flickerEnabled}
                onChange={(checked) => onTuningChange?.({ flickerEnabled: checked })}
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

export default NeonSettingsPanel;
