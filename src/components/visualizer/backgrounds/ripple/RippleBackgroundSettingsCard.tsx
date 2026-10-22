import React from 'react';
import { DEFAULT_RIPPLE_BACKGROUND_TUNING, type RippleBackgroundTuning } from '../../../../types';
import { Group, type SettingsGroupDef } from '../../../modal/settings/kit';
import { pixels, SliderRow, times } from '../../panelRows';

// src/components/visualizer/backgrounds/ripple/RippleBackgroundSettingsCard.tsx
// 涟漪的参数面板：圆环数量、扩散速度、扩散强度、圆环粗细。

const RIPPLE_GROUP: SettingsGroupDef = { id: 'bg-ripple', titleKey: 'options.rippleSettings' };

const RippleBackgroundSettingsCard: React.FC<{
    t: (key: string) => string;
    tuning?: RippleBackgroundTuning;
    onTuningChange?: (patch: Partial<RippleBackgroundTuning>) => void;
    onSliderPointerDown?: () => void;
    onSliderCommit?: () => void;
}> = ({ t, tuning = DEFAULT_RIPPLE_BACKGROUND_TUNING, onTuningChange, onSliderPointerDown, onSliderCommit }) => {
    const drag = { onDragStart: onSliderPointerDown, onDragEnd: onSliderCommit };

    return (
        <Group def={RIPPLE_GROUP}>
            <SliderRow
                {...drag}
                label={t('options.rippleRingCount')}
                value={tuning.ringCount}
                min={1}
                max={10}
                step={1}
                format={(value) => `${Math.round(value)}`}
                onChange={(value) => onTuningChange?.({ ringCount: Math.round(value) })}
            />
            <SliderRow
                {...drag}
                label={t('options.rippleSpeed')}
                value={tuning.speed}
                min={0.2}
                max={3}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ speed: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.rippleStrength')}
                value={tuning.strength}
                min={0}
                max={2}
                step={0.05}
                format={times}
                onChange={(value) => onTuningChange?.({ strength: value })}
            />
            <SliderRow
                {...drag}
                label={t('options.rippleRingWidth')}
                value={tuning.ringWidthPx}
                min={0.5}
                max={8}
                step={0.1}
                format={pixels}
                onChange={(value) => onTuningChange?.({ ringWidthPx: value })}
            />
        </Group>
    );
};

export default RippleBackgroundSettingsCard;
