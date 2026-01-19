import React from 'react';
import { LightState } from '@/components/StudioLight';
import { cn } from '@/lib/utils';
import { Monitor, Lock, Unlock, EyeOff, Save, FolderOpen } from 'lucide-react';

interface ControlPanelProps {
    state: LightState;
    updateState: (updates: Partial<LightState>) => void;
    isHidden: boolean;
    toggleHidden: () => void;
    toggleFullscreen: () => void;
    isLocked: boolean;
    toggleLock: () => void;
    savePreset: () => void;
    loadPreset: () => void;
    isSaved: boolean;
    isWakeLocked: boolean;
    className?: string;
}

export default function ControlPanel({
    state,
    updateState,
    isHidden,
    toggleHidden,
    toggleFullscreen,
    isLocked,
    toggleLock,
    savePreset,
    loadPreset,
    isSaved,
    isWakeLocked,
    className
}: ControlPanelProps) {

    if (isHidden) return null;

    const handleInput = (key: keyof LightState, value: any) => {
        if (isLocked) return;
        updateState({ [key]: value });
    };

    const applyPreset = (preset: string) => {
        if (isLocked) return;
        if (preset === 'warm') updateState({ mode: 'solid', useKelvin: true, solidKelvin: 3200, solidBrightness: 100 });
        if (preset === 'daylight') updateState({ mode: 'solid', useKelvin: true, solidKelvin: 5600, solidBrightness: 100 });
        if (preset === 'cool') updateState({ mode: 'solid', useKelvin: true, solidKelvin: 6500, solidBrightness: 100 });
        if (preset === 'neutral') updateState({ mode: 'solid', useKelvin: false, solidColor: '#ffffff', solidBrightness: 100 });
        if (preset === 'magenta') updateState({ mode: 'solid', useKelvin: false, solidColor: '#ff66ff' });
        if (preset === 'green') updateState({ mode: 'solid', useKelvin: false, solidColor: '#66ff99' });
    };

    return (
        <aside className={cn("panel", isLocked && "collapsed", className)} id="panel">
            <header className="panel-header">
                <div className="panel-title">
                    <h1>Studio Light</h1>
                    <p>Virtual lighting for your desktop</p>
                </div>
                <div className="panel-actions">
                    <button className="icon-btn" onClick={toggleHidden} title="Hide panel (H)">
                        <EyeOff size={20} />
                        <span className="sr-only">Hide panel</span>
                    </button>
                    <button className="icon-btn primary" onClick={toggleFullscreen} title="Toggle fullscreen (F)">
                        <Monitor size={20} />
                        <span className="sr-only">Toggle fullscreen</span>
                    </button>
                </div>
            </header>

            <div className="mode-row">
                <div className="mode-tabs">
                    <button
                        className={cn("mode-btn", state.mode === 'solid' && "active")}
                        onClick={() => !isLocked && updateState({ mode: 'solid' })}
                    >
                        Solid
                    </button>
                    <button
                        className={cn("mode-btn", state.mode === 'gradient' && "active")}
                        onClick={() => !isLocked && updateState({ mode: 'gradient' })}
                    >
                        Gradient
                    </button>
                    <button
                        className={cn("mode-btn", state.mode === 'ring' && "active")}
                        onClick={() => !isLocked && updateState({ mode: 'ring' })}
                    >
                        Ring
                    </button>
                    <button
                        className={cn("mode-btn lock-btn", isLocked && "active")}
                        onClick={toggleLock}
                        title="Lock controls (SPACE)"
                    >
                        {isLocked ? <Lock size={14} className="mr-1" /> : <Unlock size={14} className="mr-1" />}
                        {isLocked ? 'Locked' : 'Lock'}
                    </button>
                </div>
            </div>

            {state.mode === 'solid' && (
                <section className="panel-section">
                    <div className="section-heading">
                        <h2 className="section-title">Solid Light</h2>
                        <span className="section-subtitle">Adjust a single color or temperature</span>
                    </div>
                    <div className="field-grid">
                        <div className="field">
                            <div className="field-label">
                                <label>Color</label>
                            </div>
                            <input
                                type="color"
                                value={state.solidColor}
                                onChange={(e) => handleInput('solidColor', e.target.value)}
                                disabled={state.useKelvin}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Brightness</label>
                                <span className="value">{Math.round(state.solidBrightness)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={state.solidBrightness}
                                onChange={(e) => handleInput('solidBrightness', Number(e.target.value))}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Kelvin</label>
                                <span className="value">{Math.round(state.solidKelvin)}K</span>
                            </div>
                            <input
                                type="number" min="1000" max="40000" step="100"
                                value={state.solidKelvin}
                                onChange={(e) => handleInput('solidKelvin', Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={state.useKelvin}
                            onChange={(e) => handleInput('useKelvin', e.target.checked)}
                        />
                        <span>Use Kelvin scale</span>
                    </label>
                </section>
            )}

            {state.mode === 'gradient' && (
                <section className="panel-section">
                    <div className="section-heading">
                        <h2 className="section-title">Gradient</h2>
                        <span className="section-subtitle">Blend two colors across the screen</span>
                    </div>
                    <div className="field-grid">
                        <div className="field">
                            <div className="field-label"><label>Color A</label></div>
                            <input
                                type="color"
                                value={state.gradA}
                                onChange={(e) => handleInput('gradA', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label"><label>Color B</label></div>
                            <input
                                type="color"
                                value={state.gradB}
                                onChange={(e) => handleInput('gradB', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Angle</label>
                                <span className="value">{state.gradAngle}&deg;</span>
                            </div>
                            <input
                                type="range" min="0" max="360"
                                value={state.gradAngle}
                                onChange={(e) => handleInput('gradAngle', Number(e.target.value))}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Blend</label>
                                <span className="value">{state.gradBlend}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={state.gradBlend}
                                onChange={(e) => handleInput('gradBlend', Number(e.target.value))}
                            />
                        </div>
                    </div>
                </section>
            )}

            {state.mode === 'ring' && (
                <section className="panel-section">
                    <div className="section-heading">
                        <h2 className="section-title">Ring Light</h2>
                        <span className="section-subtitle">Simulate a studio ring light</span>
                    </div>
                    <div className="field-grid">
                        <div className="field">
                            <div className="field-label"><label>Ring Color</label></div>
                            <input
                                type="color"
                                value={state.ringColor}
                                onChange={(e) => handleInput('ringColor', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label"><label>Background</label></div>
                            <input
                                type="color"
                                value={state.ringBg}
                                onChange={(e) => handleInput('ringBg', e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Brightness</label>
                                <span className="value">{state.ringBrightness}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={state.ringBrightness}
                                onChange={(e) => handleInput('ringBrightness', Number(e.target.value))}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Soft Edge</label>
                                <span className="value">{state.ringSoft}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={state.ringSoft}
                                onChange={(e) => handleInput('ringSoft', Number(e.target.value))}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Inner Size</label>
                                <span className="value">{state.ringInner}%</span>
                            </div>
                            <input
                                type="range" min="5" max="90"
                                value={state.ringInner}
                                onChange={(e) => handleInput('ringInner', Number(e.target.value))}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Thickness</label>
                                <span className="value">{state.ringThickness}%</span>
                            </div>
                            <input
                                type="range" min="2" max="40"
                                value={state.ringThickness}
                                onChange={(e) => handleInput('ringThickness', Number(e.target.value))}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Position X</label>
                                <span className="value">{state.ringX}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={state.ringX}
                                onChange={(e) => handleInput('ringX', Number(e.target.value))}
                            />
                        </div>
                        <div className="field">
                            <div className="field-label">
                                <label>Position Y</label>
                                <span className="value">{state.ringY}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={state.ringY}
                                onChange={(e) => handleInput('ringY', Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="section-subtitle">Tip: Use arrow keys for fine adjustments. Hold <span className="kbd">Shift</span> for faster movement.</div>
                </section>
            )}

            <section className="panel-section">
                <div className="section-heading">
                    <h2 className="section-title">Quick Presets</h2>
                </div>
                <div className="preset-buttons">
                    <button className="preset" onClick={() => applyPreset('warm')}>Warm 3200K</button>
                    <button className="preset" onClick={() => applyPreset('daylight')}>Daylight 5600K</button>
                    <button className="preset" onClick={() => applyPreset('cool')}>Cool 6500K</button>
                    <button className="preset primary" onClick={() => applyPreset('neutral')}>Neutral</button>
                    <button className="preset" onClick={() => applyPreset('magenta')}>Magenta Tint</button>
                    <button className="preset" onClick={() => applyPreset('green')}>Green Tint</button>
                </div>
                <div className="action-row">
                    <button className={cn("action-btn", isSaved && "saved")} onClick={savePreset}>
                        <Save size={18} />
                        <span>{isSaved ? 'Saved!' : 'Save'}</span>
                    </button>
                    <button className="action-btn" onClick={loadPreset}>
                        <FolderOpen size={18} />
                        <span>Load</span>
                    </button>
                </div>
            </section>

            <footer className="panel-footer">
                <div className="footer-row">
                    <div className="awake-indicator">
                        <span className="dot" style={{ background: isWakeLocked ? '#22c55e' : '#f59e0b' }} aria-hidden="true"></span>
                        <span>Screen awake</span>
                    </div>
                    <a id="helpLink" href="#" onClick={(e) => { e.preventDefault(); alert('Keyboard shortcuts:\nF: Fullscreen\nH: Hide/Show panel\nSPACE: Lock controls\n1-3: Switch Modes\nW/D/C: Presets\nArrows: Move Ring'); }}>Shortcuts</a>
                </div>
            </footer>
        </aside>
    );
}
