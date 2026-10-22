import { DEFAULT_SPARKLE_TUNING, type SparkleTuning } from '../../../types';
import { defineVisualizerTuning, numberWithin, type StoredTuningFields } from '../tuningDefinition';

// src/components/visualizer/sparkle/tuning.ts
// 星屑's tuning: its defaults, the settings store fields it lives in, where it is stored and how
// a stored value and a change are read, and the renderer prop it is put on.

declare module '../tuningDefinition' {
    interface VisualizerTuningSettings extends StoredTuningFields<'sparkleTuning', 'handleSetSparkleTuning', 'handleResetSparkleTuning', SparkleTuning> {}
}

/** A stored value, or a part of one, as a whole valid tuning. */
export const resolveSparkleTuning = (stored: Partial<SparkleTuning>): SparkleTuning => ({
    showContext: stored.showContext ?? DEFAULT_SPARKLE_TUNING.showContext,
    idleMotion: numberWithin(stored.idleMotion, DEFAULT_SPARKLE_TUNING.idleMotion, 0, 2),
    sparkleSize: numberWithin(stored.sparkleSize, DEFAULT_SPARKLE_TUNING.sparkleSize, 0, 3),
    sparkleDensity: numberWithin(stored.sparkleDensity, DEFAULT_SPARKLE_TUNING.sparkleDensity, 0, 1),
    twinkleSpeed: numberWithin(stored.twinkleSpeed, DEFAULT_SPARKLE_TUNING.twinkleSpeed, 0.2, 3),
    glowIntensity: numberWithin(stored.glowIntensity, DEFAULT_SPARKLE_TUNING.glowIntensity, 0, 2),
});

export default defineVisualizerTuning<SparkleTuning>({
    mode: 'sparkle',
    defaults: DEFAULT_SPARKLE_TUNING,
    settingsKey: 'sparkleTuning',
    settingsSetterKey: 'handleSetSparkleTuning',
    settingsResetterKey: 'handleResetSparkleTuning',
    storage: {
        key: 'sparkle_tuning',
        read: resolveSparkleTuning,
        merge: (held, patch) => resolveSparkleTuning({ ...held, ...patch }),
        resetNotice: 'notifications.sparkleReset',
    },
    apply: (props, tuning) => ({ ...props, sparkleTuning: tuning }),
});
