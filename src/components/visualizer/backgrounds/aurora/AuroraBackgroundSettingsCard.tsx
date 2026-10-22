import React from 'react';
import type { AuroraBackgroundTuning, Theme } from '../../../../types';
import { colorWithAlpha } from '../../colorMix';

// src/components/visualizer/backgrounds/aurora/AuroraBackgroundSettingsCard.tsx
// 极光背景的参数面板：沿用本版本各背景统一的卡片与滑块写法。

interface AuroraBackgroundSettingsCardProps {
    t: (key: string) => string;
    isDaylight: boolean;
    theme: Theme;
    controlCardBg: string;
    rangeInputClass: string;
    tuning: AuroraBackgroundTuning;
    onTuningChange?: (patch: Partial<AuroraBackgroundTuning>) => void;
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

const AuroraBackgroundSettingsCard: React.FC<AuroraBackgroundSettingsCardProps> = ({
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
                    {t('options.auroraSettings')}
                </div>
            </div>
            <SliderRow
                label={t('options.auroraFlowSpeed')}
                value={tuning.flowSpeed}
                min={0.2}
                max={3}
                step={0.05}
                format={next => `${next.toFixed(2)}x`}
                onChange={value => onTuningChange?.({ flowSpeed: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.auroraIntensity')}
                value={tuning.intensity}
                min={0}
                max={2}
                step={0.05}
                format={next => `${next.toFixed(2)}x`}
                onChange={value => onTuningChange?.({ intensity: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.auroraBandCount')}
                value={tuning.bandCount}
                min={1}
                max={6}
                step={1}
                format={next => `${Math.round(next)}`}
                onChange={value => onTuningChange?.({ bandCount: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.auroraSoftness')}
                value={tuning.softness}
                min={0}
                max={1}
                step={0.01}
                format={next => `${Math.round(next * 100)}%`}
                onChange={value => onTuningChange?.({ softness: value })}
                {...shared}
            />
        </div>
    );
};

export default AuroraBackgroundSettingsCard;
