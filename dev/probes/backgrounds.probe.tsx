import React from 'react';
import type { ProbeDefinition } from './definition';
import type { Theme } from '../../src/types';
import GrainBackground from '../../src/components/visualizer/backgrounds/grain/GrainBackground';
import AuroraBackground from '../../src/components/visualizer/backgrounds/aurora/AuroraBackground';
import RippleBackground from '../../src/components/visualizer/backgrounds/ripple/RippleBackground';

// dev/probes/backgrounds.probe.tsx
// 三个背景 x 三套主题的对照表。用来肉眼确认：底色是否跟主题、噪点是否还像极光、
// 涟漪到最大时会不会闪。改完配色先看这页，再去开应用。

const THEMES: Array<{ label: string; theme: Theme }> = [
    {
        label: '默认（黑白）',
        theme: {
            name: 'Midnight',
            backgroundColor: '#09090b',
            primaryColor: '#f4f4f5',
            accentColor: '#f4f4f5',
            secondaryColor: '#71717a',
            fontStyle: 'sans',
            animationIntensity: 'normal',
        },
    },
    {
        label: '暖色暗主题',
        theme: {
            name: 'Ember',
            backgroundColor: '#14100e',
            primaryColor: '#f7ece4',
            accentColor: '#ff7a45',
            secondaryColor: '#9a6a4a',
            fontStyle: 'sans',
            animationIntensity: 'normal',
        },
    },
    {
        label: '青色暗主题',
        theme: {
            name: 'Teal',
            backgroundColor: '#0a1416',
            primaryColor: '#e6f5f4',
            accentColor: '#2dd4bf',
            secondaryColor: '#3f7d78',
            fontStyle: 'sans',
            animationIntensity: 'normal',
        },
    },
    {
        label: '亮色主题',
        theme: {
            name: 'Daylight',
            backgroundColor: '#f5f5f4',
            primaryColor: '#1c1917',
            accentColor: '#ea580c',
            secondaryColor: '#44403c',
            fontStyle: 'sans',
            animationIntensity: 'normal',
        },
    },
];

const BACKDROPS: Array<{ label: string; render: (theme: Theme, isDaylight: boolean) => React.ReactNode }> = [
    {
        label: '噪点 grain',
        render: (theme, isDaylight) => <GrainBackground theme={theme} isDaylight={isDaylight} />,
    },
    {
        label: '极光 aurora',
        render: (theme, isDaylight) => <AuroraBackground theme={theme} isDaylight={isDaylight} />,
    },
    {
        label: '涟漪 ripple',
        render: (theme, isDaylight) => <RippleBackground theme={theme} isDaylight={isDaylight} />,
    },
];

const BackdropsProbe: React.FC = () => (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-200">
        <h1 className="mb-1 text-lg font-semibold">背景 × 主题</h1>
        <p className="mb-5 text-xs text-zinc-500">
            每格 480×270。重点看：噪点是不是干净的颗粒（不像极光的色块）、涟漪边缘到最大时有没有跳变。
        </p>
        <div className="space-y-6">
            {BACKDROPS.map((backdrop) => (
                <section key={backdrop.label}>
                    <h2 className="mb-2 text-sm font-medium text-zinc-400">{backdrop.label}</h2>
                    <div className="grid grid-cols-4 gap-3">
                        {THEMES.map(({ label, theme }) => (
                            <div key={label} className="overflow-hidden rounded-lg border border-white/10">
                                <div className="relative h-[180px] w-full overflow-hidden">
                                    {backdrop.render(theme, theme.name === 'Daylight')}
                                </div>
                                <div className="bg-black/40 px-2 py-1 text-[11px] text-zinc-400">{label}</div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    </div>
);

const probe: ProbeDefinition = {
    id: 'backgrounds',
    title: '背景 × 主题对照',
    description: '噪点/极光/涟漪在三套暗色与一套亮色主题下的实际效果',
    Component: BackdropsProbe,
};

export default probe;
