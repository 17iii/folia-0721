import { DEFAULT_AURORA_BACKGROUND_TUNING, type AuroraBackgroundTuning } from '../../../../types';
import { defineBackgroundTuning, numberWithin, type StoredTuningFields } from '../../tuningDefinition';
import { type BackgroundTuningActionSlot, type BackgroundTuningSlot } from '../definition';

// src/components/visualizer/backgrounds/aurora/tuning.ts
// 极光's tuning: its defaults, the settings store fields it lives in, where it is stored and how
// a stored value and a change are read.

declare module '../definition' {
    interface VisualizerBackgroundConfig {
        aurora?: BackgroundTuningSlot<AuroraBackgroundTuning>;
    }
    interface VisualizerBackgroundActions {
        aurora?: BackgroundTuningActionSlot<AuroraBackgroundTuning>;
    }
}

declare module '../../tuningDefinition' {
    interface VisualizerTuningSettings extends
        StoredTuningFields<'auroraBackgroundTuning', 'handleSetAuroraBackgroundTuning', 'handleResetAuroraBackgroundTuning', AuroraBackgroundTuning> {}
}

/** A stored value, or a part of one, as a whole valid tuning. */
export const resolveAuroraBackgroundTuning = (stored: Partial<AuroraBackgroundTuning>): AuroraBackgroundTuning => ({
    flowSpeed: numberWithin(stored.flowSpeed, DEFAULT_AURORA_BACKGROUND_TUNING.flowSpeed, 0.2, 3),
    intensity: numberWithin(stored.intensity, DEFAULT_AURORA_BACKGROUND_TUNING.intensity, 0, 2),
    bandCount: Math.round(numberWithin(stored.bandCount, DEFAULT_AURORA_BACKGROUND_TUNING.bandCount, 1, 6)),
    softness: numberWithin(stored.softness, DEFAULT_AURORA_BACKGROUND_TUNING.softness, 0, 1),
});

export default defineBackgroundTuning<AuroraBackgroundTuning>({
    mode: 'aurora',
    defaults: DEFAULT_AURORA_BACKGROUND_TUNING,
    settingsKey: 'auroraBackgroundTuning',
    settingsSetterKey: 'handleSetAuroraBackgroundTuning',
    settingsResetterKey: 'handleResetAuroraBackgroundTuning',
    storage: {
        key: 'aurora_background_tuning',
        read: resolveAuroraBackgroundTuning,
        merge: (held, patch) => resolveAuroraBackgroundTuning({ ...held, ...patch }),
        resetNotice: 'notifications.auroraBgReset',
    },
});
