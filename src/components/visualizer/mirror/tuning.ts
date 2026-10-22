import { DEFAULT_MIRROR_TUNING, type MirrorTuning } from '../../../types';
import { defineVisualizerTuning, numberWithin, type StoredTuningFields } from '../tuningDefinition';

// src/components/visualizer/mirror/tuning.ts
// 镜面's tuning: its defaults, the settings store fields it lives in, where it is stored and how
// a stored value and a change are read, and the renderer prop it is put on.

declare module '../tuningDefinition' {
    interface VisualizerTuningSettings extends StoredTuningFields<'mirrorTuning', 'handleSetMirrorTuning', 'handleResetMirrorTuning', MirrorTuning> {}
}

/** A stored value, or a part of one, as a whole valid tuning. */
export const resolveMirrorTuning = (stored: Partial<MirrorTuning>): MirrorTuning => ({
    showContext: stored.showContext ?? DEFAULT_MIRROR_TUNING.showContext,
    idleMotion: numberWithin(stored.idleMotion, DEFAULT_MIRROR_TUNING.idleMotion, 0, 2),
    showReflection: stored.showReflection ?? DEFAULT_MIRROR_TUNING.showReflection,
    reflectionOpacity: numberWithin(stored.reflectionOpacity, DEFAULT_MIRROR_TUNING.reflectionOpacity, 0, 1),
    reflectionGapPx: numberWithin(stored.reflectionGapPx, DEFAULT_MIRROR_TUNING.reflectionGapPx, 0, 48),
    reflectionBlurPx: numberWithin(stored.reflectionBlurPx, DEFAULT_MIRROR_TUNING.reflectionBlurPx, 0, 6),
});

export default defineVisualizerTuning<MirrorTuning>({
    mode: 'mirror',
    defaults: DEFAULT_MIRROR_TUNING,
    settingsKey: 'mirrorTuning',
    settingsSetterKey: 'handleSetMirrorTuning',
    settingsResetterKey: 'handleResetMirrorTuning',
    storage: {
        key: 'mirror_tuning',
        read: resolveMirrorTuning,
        merge: (held, patch) => resolveMirrorTuning({ ...held, ...patch }),
        resetNotice: 'notifications.mirrorReset',
    },
    apply: (props, tuning) => ({ ...props, mirrorTuning: tuning }),
});
