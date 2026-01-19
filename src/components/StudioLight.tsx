"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Stage from './Stage';
import ControlPanel from './ControlPanel';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export interface LightState {
    mode: 'solid' | 'gradient' | 'ring';
    // Solid
    solidColor: string;
    solidBrightness: number;
    useKelvin: boolean;
    solidKelvin: number;
    // Gradient
    gradA: string;
    gradB: string;
    gradAngle: number;
    gradBlend: number;
    // Ring
    ringColor: string;
    ringBg: string;
    ringBrightness: number;
    ringSoft: number;
    ringInner: number;
    ringThickness: number;
    ringX: number;
    ringY: number;
}

const DEFAULT_STATE: LightState = {
    mode: 'solid',
    solidColor: '#ffffff',
    solidBrightness: 100,
    useKelvin: false,
    solidKelvin: 5600,
    gradA: '#ffffff',
    gradB: '#a0a0ff',
    gradAngle: 0,
    gradBlend: 50,
    ringColor: '#ffffff',
    ringBg: '#000000',
    ringBrightness: 100,
    ringSoft: 45,
    ringInner: 35,
    ringThickness: 18,
    ringX: 50,
    ringY: 50,
};

const LS_KEY = 'studio-light-state-v1';
const LS_PRESET_KEY = 'studio-light-user-preset';

export default function StudioLight() {
    const [state, setState] = useState<LightState>(DEFAULT_STATE);
    const [isHidden, setIsHidden] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const { isLocked: isWakeLocked } = useWakeLock();

    // Load state from local storage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LS_KEY);
            if (saved) {
                setState((prev) => ({ ...prev, ...JSON.parse(saved) }));
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }, []);

    // Save state to local storage on change
    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(state));
        } catch (e) {
            // ignore
        }
    }, [state]);

    const updateState = useCallback((updates: Partial<LightState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    const toggleHidden = () => setIsHidden((prev) => !prev);
    const toggleLock = () => setIsLocked((prev) => !prev);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch((e) => console.error(e));
        } else {
            document.exitFullscreen?.().catch((e) => console.error(e));
        }
    }, []);

    const savePreset = () => {
        if (isLocked) return;
        localStorage.setItem(LS_PRESET_KEY, JSON.stringify(state));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 1200);
    };

    const loadPreset = () => {
        if (isLocked) return;
        try {
            const saved = localStorage.getItem(LS_PRESET_KEY);
            if (saved) {
                setState((prev) => ({ ...prev, ...JSON.parse(saved) }));
            }
        } catch (e) {
            console.error("Failed to load preset", e);
        }
    };

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'f': (e) => { e.preventDefault(); toggleFullscreen(); },
        'h': (e) => { e.preventDefault(); toggleHidden(); },
        ' ': (e) => { e.preventDefault(); toggleLock(); },
        '1': () => !isLocked && updateState({ mode: 'solid' }),
        '2': () => !isLocked && updateState({ mode: 'gradient' }),
        '3': () => !isLocked && updateState({ mode: 'ring' }),
        'w': () => !isLocked && updateState({ mode: 'solid', useKelvin: true, solidKelvin: 3200 }),
        'd': () => !isLocked && updateState({ mode: 'solid', useKelvin: true, solidKelvin: 5600 }),
        'c': () => !isLocked && updateState({ mode: 'solid', useKelvin: true, solidKelvin: 6500 }),
        'arrowleft': (e) => {
            if (state.mode === 'ring' && !isLocked) {
                const step = e.shiftKey ? 2 : 0.5;
                setState(prev => ({ ...prev, ringX: Math.max(0, Math.min(100, prev.ringX - step)) }));
            }
        },
        'arrowright': (e) => {
            if (state.mode === 'ring' && !isLocked) {
                const step = e.shiftKey ? 2 : 0.5;
                setState(prev => ({ ...prev, ringX: Math.max(0, Math.min(100, prev.ringX + step)) }));
            }
        },
        'arrowup': (e) => {
            if (state.mode === 'ring' && !isLocked) {
                const step = e.shiftKey ? 2 : 0.5;
                setState(prev => ({ ...prev, ringY: Math.max(0, Math.min(100, prev.ringY - step)) }));
            }
        },
        'arrowdown': (e) => {
            if (state.mode === 'ring' && !isLocked) {
                const step = e.shiftKey ? 2 : 0.5;
                setState(prev => ({ ...prev, ringY: Math.max(0, Math.min(100, prev.ringY + step)) }));
            }
        },
    }, isLocked && false); // Pass disabled if needed, or handle in handler

    return (
        <div className="app" onDoubleClick={() => toggleFullscreen()}>
            <Stage state={state} />

            <ControlPanel
                state={state}
                updateState={updateState}
                isHidden={isHidden}
                toggleHidden={toggleHidden}
                toggleFullscreen={toggleFullscreen}
                isLocked={isLocked}
                toggleLock={toggleLock}
                savePreset={savePreset}
                loadPreset={loadPreset}
                isSaved={isSaved}
                isWakeLocked={isWakeLocked}
            />

            {/* Hint overlay */}
            {!isHidden && (
                <div className="hint" id="hint">
                    <div className="hint-block">
                        <span>Press</span>
                        <kbd>F</kbd>
                        <span>for fullscreen</span>
                    </div>
                    <div className="hint-block">
                        <span>Press</span>
                        <kbd>H</kbd>
                        <span>to hide panel</span>
                    </div>
                </div>
            )}
        </div>
    );
}
