import { DEFAULT_RIPPLE_BACKGROUND_TUNING, type RippleBackgroundTuning } from '../../../../types';
import { defineBackgroundTuning, numberWithin, type StoredTuningFields } from '../../tuningDefinition';
import { type BackgroundTuningActionSlot, type BackgroundTuningSlot } from '../definition';

// src/components/visualizer/backgrounds/ripple/tuning.ts
// 涟漪's tuning: its defaults, the settings store fields it lives in, where it is stored and how
// a stored value and a change are read.

declare module '../definition' {
    interface VisualizerBackgroundConfig {
        ripple?: BackgroundTuningSlot<RippleBackgroundTuning>;
    }
    interface VisualizerBackgroundActions {
        ripple?: BackgroundTuningActionSlot<RippleBackgroundTuning>;
    }
}

declare module '../../tuningDefinition' {
    interface VisualizerTuningSettings extends
        StoredTuningFields<'rippleBackgroundTuning', 'handleSetRippleBackgroundTuning', 'handleResetRippleBackgroundTuning', RippleBackgroundTuning> {}
}

/** A stored value, or a part of one, as a whole valid tuning. */
export const resolveRippleBackgroundTuning = (stored: Partial<RippleBackgroundTuning>): RippleBackgroundTuning => ({
    ringCount: Math.round(numberWithin(stored.ringCount, DEFAULT_RIPPLE_BACKGROUND_TUNING.ringCount, 1, 10)),
    speed: numberWithin(stored.speed, DEFAULT_RIPPLE_BACKGROUND_TUNING.speed, 0.2, 3),
    strength: numberWithin(stored.strength, DEFAULT_RIPPLE_BACKGROUND_TUNING.strength, 0, 2),
    ringWidthPx: numberWithin(stored.ringWidthPx, DEFAULT_RIPPLE_BACKGROUND_TUNING.ringWidthPx, 0.5, 8),
});

export default defineBackgroundTuning<RippleBackgroundTuning>({
    mode: 'ripple',
    defaults: DEFAULT_RIPPLE_BACKGROUND_TUNING,
    settingsKey: 'rippleBackgroundTuning',
    settingsSetterKey: 'handleSetRippleBackgroundTuning',
    settingsResetterKey: 'handleResetRippleBackgroundTuning',
    storage: {
        key: 'ripple_background_tuning',
        read: resolveRippleBackgroundTuning,
        merge: (held, patch) => resolveRippleBackgroundTuning({ ...held, ...patch }),
        resetNotice: 'notifications.rippleBgReset',
    },
});
