import { useEffect, useRef } from 'react';
import type { Theme } from '../types';
import { extractColors } from '../utils/colorExtractor';
import { buildBuiltinDualTheme } from './themeControllerState';

// src/hooks/useMusicFollowTheme.ts
//
// 「音乐主题」的取色一半：换歌时按封面重新生成主色/辅色，写回当前主题。
//
// 刻意不碰字体、动画强度、歌词配色这些字段——这个开关只接管四个颜色，剩下的仍然是用户自己的主题。
// 关闭时还原开启前的快照，所以它不会悄悄改掉用户存下来的主题。

interface UseMusicFollowThemeParams {
    enabled: boolean;
    coverUrl: string | null;
    isDaylight: boolean;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useMusicFollowTheme = ({
    enabled,
    coverUrl,
    isDaylight,
    theme,
    setTheme,
}: UseMusicFollowThemeParams): void => {
    const themeRef = useRef(theme);
    themeRef.current = theme;
    const setThemeRef = useRef(setTheme);
    setThemeRef.current = setTheme;

    /** 打开开关那一刻的主题；关闭时按原样放回去。 */
    const snapshotRef = useRef<Theme | null>(null);
    /** 已经取过色的封面地址，避免同一首歌反复算。 */
    const appliedCoverRef = useRef<string | null>(null);
    /** 快速切歌时丢弃迟到的取色结果。 */
    const requestRef = useRef(0);

    useEffect(() => {
        if (enabled) return;
        const snapshot = snapshotRef.current;
        snapshotRef.current = null;
        appliedCoverRef.current = null;
        if (snapshot) {
            setThemeRef.current(snapshot);
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;
        if (!snapshotRef.current) {
            snapshotRef.current = { ...themeRef.current };
        }
        if (!coverUrl || appliedCoverRef.current === coverUrl) {
            return;
        }
        appliedCoverRef.current = coverUrl;
        const token = requestRef.current + 1;
        requestRef.current = token;

        void (async () => {
            try {
                const coverColors = await extractColors(coverUrl, 5);
                if (token !== requestRef.current || coverColors.length === 0) {
                    return;
                }
                const dual = buildBuiltinDualTheme({ coverColors });
                const picked = isDaylight ? dual.light : dual.dark;
                const current = themeRef.current;
                setThemeRef.current({
                    ...current,
                    name: picked.name || current.name,
                    backgroundColor: picked.backgroundColor,
                    primaryColor: picked.primaryColor,
                    secondaryColor: picked.secondaryColor,
                    accentColor: picked.accentColor,
                    provider: picked.provider ?? current.provider,
                    description: picked.description ?? current.description,
                });
            } catch {
                // 取色失败（封面加载不出来、跨域）就保持当前主题，不弹窗打断播放。
                appliedCoverRef.current = null;
            }
        })();
    }, [enabled, coverUrl, isDaylight]);
};
