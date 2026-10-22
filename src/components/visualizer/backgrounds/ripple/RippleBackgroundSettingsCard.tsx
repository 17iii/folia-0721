import React from 'react';
import type { RippleBackgroundTuning, Theme } from '../../../../types';
import { colorWithAlpha } from '../../colorMix';

// src/components/visualizer/backgrounds/ripple/RippleBackgroundSettingsCard.tsx
// 涟漪背景的参数面板：沿用本版本各背景统一的卡片与滑块写法。

interface RippleBackgroundSettingsCardProps {
    t: (key: string) => string;
    isDaylight: boolean;
    theme: Theme;
    controlCardBg: string;
    rangeInputClass: string;
    tuning: RippleBackgroundTuning;
    onTuningChange?: (patch: Partial<RippleBackgroundTuning>) => void;
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

const RippleBackgroundSettingsCard: React.FC<RippleBackgroundSettingsCardProps> = ({
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
                    {t('options.rippleSettings')}
                </div>
            </div>
            <SliderRow
                label={t('options.rippleRingCount')}
                value={tuning.ringCount}
                min={1}
                max={10}
                step={1}
                format={next => `${Math.round(next)}`}
                onChange={value => onTuningChange?.({ ringCount: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.rippleSpeed')}
                value={tuning.speed}
                min={0.2}
                max={3}
                step={0.05}
                format={next => `${next.toFixed(2)}x`}
                onChange={value => onTuningChange?.({ speed: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.rippleStrength')}
                value={tuning.strength}
                min={0}
                max={2}
                step={0.05}
                format={next => `${next.toFixed(2)}x`}
                onChange={value => onTuningChange?.({ strength: value })}
                {...shared}
            />
            <SliderRow
                label={t('options.rippleRingWidth')}
                value={tuning.ringWidthPx}
                min={0.5}
                max={8}
                step={0.1}
                format={next => `${Math.round(next)}px`}
                onChange={value => onTuningChange?.({ ringWidthPx: value })}
                {...shared}
            />
        </div>
    );
};

export default RippleBackgroundSettingsCard;
