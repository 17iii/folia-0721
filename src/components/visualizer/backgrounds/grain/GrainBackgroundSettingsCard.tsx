import React from 'react';
import type { GrainBackgroundTuning, Theme } from '../../../../types';
import { colorWithAlpha } from '../../colorMix';

// src/components/visualizer/backgrounds/grain/GrainBackgroundSettingsCard.tsx
// 噪点背景的参数面板：沿用本版本各背景统一的卡片与滑块写法。

interface GrainBackgroundSettingsCardProps {
    t: (key: string) => string;
    isDaylight: boolean;
    theme: Theme;
    controlCardBg: string;
    rangeInputClass: string;
    tuning: GrainBackgroundTuning;
    onTuningChange?: (patch: Partial<GrainBackgroundTuning>) => void;
    onSliderPointerDown?: () => void;
    onSliderCommit?: () => void;
}

interface SliderRowProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format?: (value: number) => string;
    rangeInputClass: string;
    theme: Theme;
    onChange: (value: number) => void;
    onPointerDown?: () => void;
    onPointerUp?: () => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
    label,
    value,
    min,
    max,
    step,
    format = next => next.toFixed(1),
    rangeInputClass,
    theme,
    onChange,
    onPointerDown,
    onPointerUp,
}) => (
    <label className="block space-y-2">
        <span className="flex justify-between gap-3 text-sm" style={{ color: theme.primaryColor }}>
            <span>{label}</span>
            <span className="font-mono opacity-70">{format(value)}</span>
        </span>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={event => onChange(Number(event.target.value))}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className={rangeInputClass}
        />
    </label>
);

const GrainBackgroundSettingsCard: React.FC<GrainBackgroundSettingsCardProps> = ({
    t,
    isDaylight,
    theme,
    controlCardBg,
    rangeInputClass,
    tuning,
    onTuningChange,
    onSliderPointerDown,
    onSliderCommit,
}) => {
    const borderColor = colorWithAlpha(theme.secondaryColor, isDaylight ? 0.18 : 0.16);
    const shared = {
        rangeInputClass,
        theme,
        onPointerDown: onSliderPointerDown,
        onPointerUp: onSliderCommit,
    };

    return (
        <div className="rounded-[24px] border p-4 space-y-5" style={{ backgroundColor: controlCardBg, borderColor }}>
            <div className="space-y-1">
                <div className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                    {t('options.grainSettings')}
                </div>
            </div>
            <SliderRow
                label={t('options.grainAmount')}
                value={tuning.grainAmount}
                min={0}
                max={1}
                step={0.01}
                format={next => `${Math.round(next * 100)}%`}
                onChange={value => onTuningChange?.({ grainAmount: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.grainSize')}
                value={tuning.grainSize}
                min={40}
                max={300}
                step={10}
                format={next => `${Math.round(next)}px`}
                onChange={value => onTuningChange?.({ grainSize: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.grainDriftSpeed')}
                value={tuning.driftSpeed}
                min={0}
                max={3}
                step={0.05}
                format={next => `${next.toFixed(2)}x`}
                onChange={value => onTuningChange?.({ driftSpeed: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.grainWashStrength')}
                value={tuning.washStrength}
                min={0}
                max={1}
                step={0.01}
                format={next => `${Math.round(next * 100)}%`}
                onChange={value => onTuningChange?.({ washStrength: value })}
                {...shared}
            />
        </div>
    );
};

export default GrainBackgroundSettingsCard;
