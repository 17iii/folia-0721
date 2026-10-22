import React from 'react';
import { DEFAULT_AURORA_BACKGROUND_TUNING, type AuroraBackgroundTuning } from '../../../../types';
import { Group, type SettingsGroupDef } from '../../../modal/settings/kit';
import { percent, SliderRow, times } from '../../panelRows';

// src/components/visualizer/backgrounds/aurora/AuroraBackgroundSettingsCard.tsx
// 极光的参数面板：流动速度、亮度、幕帘数量、柔和度。

const AURORA_GROUP: SettingsGroupDef = { id: 'bg-aurora', titleKey: 'options.auroraSettings' };

const AuroraBackgroundSettingsCard: React.FC<{
    t: (key: string) => string;
    tuning?: AuroraBackgroundTuning;
    onTuningChange?: (patch: Partial<AuroraBackgroundTuning>) => void;
    onSliderPointerDown?: () => void;
    onSliderCommit?: () => void;
}> = ({ t, tuning = DEFAULT_AURORA_BACKGROUND_TUNING, onTuningChange, onSliderPointerDown, onSliderCommit }) => {
    const drag = { onDragStart: onSliderPointerDown, onDragEnd: onSliderCommit };

    return (
        <Group def={AURORA_GROUP}>
            <SliderRow
                {...drag}
                label={t('options.auroraFlowSpeed')}
                value={tuning.flowSpeed}
                min={0.2}
                max={3}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ flowSpeed: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.auroraIntensity')}
                value={tuning.intensity}
                min={0}
                max={2}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ intensity: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.auroraBandCount')}
                value={tuning.bandCount}
                min={1}
                max={6}
                step={1}
                format={(value) => `${Math.round(value)}`}
                onChange={(value) => onTuningChange?.({ bandCount: Math.round(value) })}
            />
            <SliderRow
                {...drag}
                label={t('options.auroraSoftness')}
                value={tuning.softness}
                min={0}
                max={1}
                step={0.01}
                format={percent}
                onChange={(value) => onTuningChange?.({ softness: value })}
            />
        </Group>
    );
};

export default AuroraBackgroundSettingsCard;
