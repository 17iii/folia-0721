import React from 'react';
import { DEFAULT_GRAIN_BACKGROUND_TUNING, type GrainBackgroundTuning } from '../../../../types';
import { Group, type SettingsGroupDef } from '../../../modal/settings/kit';
import { percent, pixels, SliderRow, times } from '../../panelRows';

// src/components/visualizer/backgrounds/grain/GrainBackgroundSettingsCard.tsx
// 噪点的参数面板：颗粒浓度、颗粒大小、爬行速度、色彩晕染强度。

const GRAIN_GROUP: SettingsGroupDef = { id: 'bg-grain', titleKey: 'options.grainSettings' };

const GrainBackgroundSettingsCard: React.FC<{
    t: (key: string) => string;
    tuning?: GrainBackgroundTuning;
    onTuningChange?: (patch: Partial<GrainBackgroundTuning>) => void;
    onSliderPointerDown?: () => void;
    onSliderCommit?: () => void;
}> = ({ t, tuning = DEFAULT_GRAIN_BACKGROUND_TUNING, onTuningChange, onSliderPointerDown, onSliderCommit }) => {
    const drag = { onDragStart: onSliderPointerDown, onDragEnd: onSliderCommit };

    return (
        <Group def={GRAIN_GROUP}>
            <SliderRow
                {...drag}
                label={t('options.grainAmount')}
                value={tuning.grainAmount}
                min={0}
                max={1}
                step={0.01}
                format={percent}
                onChange={(value) => onTuningChange?.({ grainAmount: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.grainSize')}
                value={tuning.grainSize}
                min={40}
                max={300}
                step={10}
                format={pixels}
                onChange={(value) => onTuningChange?.({ grainSize: Math.round(value) })}
            />
            <SliderRow
                {...drag}
                label={t('options.grainDriftSpeed')}
                value={tuning.driftSpeed}
                min={0}
                max={3}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ driftSpeed: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.grainWashStrength')}
                value={tuning.washStrength}
                min={0}
                max={1}
                step={0.01}
                format={percent}
                onChange={(value) => onTuningChange?.({ washStrength: value })}
            />
        </Group>
    );
};

export default GrainBackgroundSettingsCard;
