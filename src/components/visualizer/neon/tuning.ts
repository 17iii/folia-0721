import { DEFAULT_NEON_TUNING, type NeonTuning } from '../../../types';
import { defineVisualizerTuning, numberWithin, type StoredTuningFields } from '../tuningDefinition';

// src/components/visualizer/neon/tuning.ts
// 霓虹's tuning: its defaults, the settings store fields it lives in, where it is stored and how
// a stored value and a change are read, and the renderer prop it is put on.

declare module '../tuningDefinition' {
    interface VisualizerTuningSettings extends StoredTuningFields<'neonTuning', 'handleSetNeonTuning', 'handleResetNeonTuning', NeonTuning> {}
}

/** A stored value, or a part of one, as a whole valid tuning. */
export const resolveNeonTuning = (stored: Partial<NeonTuning>): NeonTuning => ({
    showContext: stored.showContext ?? DEFAULT_NEON_TUNING.showContext,
    idleMotion: numberWithin(stored.idleMotion, DEFAULT_NEON_TUNING.idleMotion, 0, 2),
    glowIntensity: numberWithin(stored.glowIntensity, DEFAULT_NEON_TUNING.glowIntensity, 0, 2),
    glowSpread: numberWithin(stored.glowSpread, DEFAULT_NEON_TUNING.glowSpread, 0, 2),
    strokeWidth: numberWithin(stored.strokeWidth, DEFAULT_NEON_TUNING.strokeWidth, 0, 3),
    dimOpacity: numberWithin(stored.dimOpacity, DEFAULT_NEON_TUNING.dimOpacity, 0.05, 1),
    flickerEnabled: stored.flickerEnabled ?? DEFAULT_NEON_TUNING.flickerEnabled,
});

export default defineVisualizerTuning<NeonTuning>({
    mode: 'neon',
    defaults: DEFAULT_NEON_TUNING,
    settingsKey: 'neonTuning',
    settingsSetterKey: 'handleSetNeonTuning',
    settingsResetterKey: 'handleResetNeonTuning',
    storage: {
        key: 'neon_tuning',
        read: resolveNeonTuning,
        merge: (held, patch) => resolveNeonTuning({ ...held, ...patch }),
        resetNotice: 'notifications.neonReset',
    },
    apply: (props, tuning) => ({ ...props, neonTuning: tuning }),
});
