import React from 'react';
import { cn } from '@/lib/utils';
import { LightState } from '@/components/StudioLight';

// Helper to convert Kelvin to RGB
function kelvinToRGB(k: number) {
    let temp = k / 100;
    let r, g, b;
    if (temp <= 66) {
        r = 255;
    } else {
        r = temp - 60;
        r = 329.698727446 * Math.pow(r, -0.1332047592);
        r = Math.min(255, Math.max(0, r));
    }
    if (temp <= 66) {
        g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    } else {
        g = temp - 60;
        g = 288.1221695283 * Math.pow(g, -0.0755148492);
    }
    g = Math.min(255, Math.max(0, g));
    if (temp >= 66) {
        b = 255;
    } else if (temp <= 19) {
        b = 0;
    } else {
        b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
        b = Math.min(255, Math.max(0, b));
    }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

interface StageProps {
    state: LightState;
}

export default function Stage({ state }: StageProps) {
    const getStyle = () => {
        const style: React.CSSProperties = {
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            transition: 'background 0.4s ease, filter 0.4s ease',
        };

        if (state.mode === 'solid') {
            const base = state.useKelvin ? kelvinToRGB(state.solidKelvin) : state.solidColor;
            const bright = clamp(state.solidBrightness, 0, 100) / 100;
            style.background = base;
            style.filter = `brightness(${bright})`;
        } else if (state.mode === 'gradient') {
            const t = clamp(state.gradBlend, 0, 100);
            const midA = clamp(50 - t / 2, 0, 50);
            const midB = clamp(50 + t / 2, 50, 100);
            style.background = `linear-gradient(${state.gradAngle}deg, ${state.gradA} ${midA}%, ${state.gradB} ${midB}%)`;
        } else if (state.mode === 'ring') {
            const cx = clamp(state.ringX, 0, 100);
            const cy = clamp(state.ringY, 0, 100);
            const inner = clamp(state.ringInner, 5, 90);
            const thickness = clamp(state.ringThickness, 2, 40);
            const soft = clamp(state.ringSoft, 0, 100);
            const outer = clamp(inner + thickness, 6, 100);

            const bg = state.ringBg;
            const color = state.ringColor;
            const bright = clamp(state.ringBrightness, 0, 100) / 100;

            const ringStart = inner;
            // const ringPeak = clamp(inner + thickness * 0.5, inner, outer); // Unused in CSS gradient logic directly but good for reference
            const ringEnd = outer;
            const feather = soft * 0.4;

            const gradient = `radial-gradient(circle at ${cx}% ${cy}%,
        ${bg} 0%,
        ${bg} ${Math.max(0, ringStart - feather)}%,
        ${color} ${ringStart}%,
        ${color} ${ringEnd}%,
        ${bg} ${Math.min(100, ringEnd + feather)}%,
        ${bg} 100%)`;

            style.background = `${gradient}, ${bg}`;
            style.filter = `brightness(${bright})`;
        }

        return style;
    };

    return <div id="stage" style={getStyle()} aria-hidden="true" />;
}
