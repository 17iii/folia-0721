import { DEFAULT_GRAIN_BACKGROUND_TUNING, type GrainBackgroundTuning } from '../../../../types';
import { defineBackgroundTuning, numberWithin, type StoredTuningFields } from '../../tuningDefinition';
import { type BackgroundTuningActionSlot, type BackgroundTuningSlot } from '../definition';

// src/components/visualizer/backgrounds/grain/tuning.ts
// 噪点's tuning: its defaults, the settings store fields it lives in, where it is stored and how
// a stored value and a change are read.

declare module '../definition' {
    interface VisualizerBackgroundConfig {
        grain?: BackgroundTuningSlot<GrainBackgroundTuning>;
    }
    interface VisualizerBackgroundActions {
        grain?: BackgroundTuningActionSlot<GrainBackgroundTuning>;
    }
}

declare module '../../tuningDefinition' {
    interface VisualizerTuningSettings extends
        StoredTuningFields<'grainBackgroundTuning', 'handleSetGrainBackgroundTuning', 'handleResetGrainBackgroundTuning', GrainBackgroundTuning> {}
}

/** A stored value, or a part of one, as a whole valid tuning. */
export const resolveGrainBackgroundTuning = (stored: Partial<GrainBackgroundTuning>): GrainBackgroundTuning => ({
    grainAmount: numberWithin(stored.grainAmount, DEFAULT_GRAIN_BACKGROUND_TUNING.grainAmount, 0, 1),
    grainSize: Math.round(numberWithin(stored.grainSize, DEFAULT_GRAIN_BACKGROUND_TUNING.grainSize, 40, 300)),
    driftSpeed: numberWithin(stored.driftSpeed, DEFAULT_GRAIN_BACKGROUND_TUNING.driftSpeed, 0, 3),
    washStrength: numberWithin(stored.washStrength, DEFAULT_GRAIN_BACKGROUND_TUNING.washStrength, 0, 1),
});

export default defineBackgroundTuning<GrainBackgroundTuning>({
    mode: 'grain',
    defaults: DEFAULT_GRAIN_BACKGROUND_TUNING,
    settingsKey: 'grainBackgroundTuning',
    settingsSetterKey: 'handleSetGrainBackgroundTuning',
    settingsResetterKey: 'handleResetGrainBackgroundTuning',
    storage: {
        key: 'grain_background_tuning',
        read: resolveGrainBackgroundTuning,
        merge: (held, patch) => resolveGrainBackgroundTuning({ ...held, ...patch }),
        resetNotice: 'notifications.grainBgReset',
    },
});
