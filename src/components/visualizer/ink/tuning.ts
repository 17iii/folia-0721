import { DEFAULT_INK_TUNING, type InkTuning } from '../../../types';
import { defineVisualizerTuning, numberWithin, type StoredTuningFields } from '../tuningDefinition';

// src/components/visualizer/ink/tuning.ts
// 墨韵's tuning: its defaults, the settings store fields it lives in, where it is stored and how
// a stored value and a change are read, and the renderer prop it is put on.

declare module '../tuningDefinition' {
    interface VisualizerTuningSettings extends StoredTuningFields<'inkTuning', 'handleSetInkTuning', 'handleResetInkTuning', InkTuning> {}
}

/** A stored value, or a part of one, as a whole valid tuning. */
export const resolveInkTuning = (stored: Partial<InkTuning>): InkTuning => ({
    showContext: stored.showContext ?? DEFAULT_INK_TUNING.showContext,
    idleMotion: numberWithin(stored.idleMotion, DEFAULT_INK_TUNING.idleMotion, 0, 2),
    washStrength: numberWithin(stored.washStrength, DEFAULT_INK_TUNING.washStrength, 0, 1),
    bleedBlurPx: numberWithin(stored.bleedBlurPx, DEFAULT_INK_TUNING.bleedBlurPx, 0, 6),
    riseDistance: numberWithin(stored.riseDistance, DEFAULT_INK_TUNING.riseDistance, 0, 60),
    transitionDuration: numberWithin(stored.transitionDuration, DEFAULT_INK_TUNING.transitionDuration, 0.1, 2),
});

export default defineVisualizerTuning<InkTuning>({
    mode: 'ink',
    defaults: DEFAULT_INK_TUNING,
    settingsKey: 'inkTuning',
    settingsSetterKey: 'handleSetInkTuning',
    settingsResetterKey: 'handleResetInkTuning',
    storage: {
        key: 'ink_tuning',
        read: resolveInkTuning,
        merge: (held, patch) => resolveInkTuning({ ...held, ...patch }),
        resetNotice: 'notifications.inkReset',
    },
    apply: (props, tuning) => ({ ...props, inkTuning: tuning }),
});
