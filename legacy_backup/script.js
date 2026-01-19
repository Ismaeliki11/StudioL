
  // --- Utilities ------------------------------------------------------------
  const $ = sel => document.querySelector(sel);
  const stage = $("#stage");
  const panel = $("#panel");

  const shortcutsText = `Keyboard shortcuts
---------------------
F: Fullscreen    H: Hide/Show panel    SPACE: Lock controls
1: Solid         2: Gradient           3: Ring
W: Warm 3200K    D: Daylight 5600K     C: Cool 6500K
Arrows: Nudge ring (Shift = x5)
Double-click anywhere to toggle fullscreen.`;

  // Simple Kelvin-to-RGB approximation (1000-40000K) by Tanner Helland, adapted
  function kelvinToRGB(k){
    let temp = k / 100;
    let r, g, b;
    if (temp <= 66) {
      r = 255;
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      r = Math.min(255, Math.max(0, r));
    }
    if (temp <= 66){
      g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    } else {
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
    }
    g = Math.min(255, Math.max(0, g));
    if (temp >= 66){
      b = 255;
    } else if (temp <= 19){
      b = 0;
    } else {
      b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
      b = Math.min(255, Math.max(0, b));
    }
    return `rgb(${r|0},${g|0},${b|0})`;
  }

  function mix(a, b, t){ return a + (b - a) * t; }
  function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

  // --- State ---------------------------------------------------------------
  const state = {
    mode: 'solid', // 'solid' | 'gradient' | 'ring'
    // Solid
    solidColor: '#ffffff',
    solidBrightness: 100,
    useKelvin: false,
    solidKelvin: 5600,
    // Gradient
    gradA: '#ffffff',
    gradB: '#a0a0ff',
    gradAngle: 0,
    gradBlend: 50,
    // Ring
    ringColor: '#ffffff',
    ringBg: '#000000',
    ringBrightness: 100,
    ringSoft: 45,
    ringInner: 35,
    ringThickness: 18,
    ringX: 50,
    ringY: 50,
    locked: false
  };

  const els = {
    // buttons
    modeSolid: $("#modeSolid"),
    modeGradient: $("#modeGradient"),
    modeRing: $("#modeRing"),
    fullscreenBtn: $("#fullscreenBtn"),
    hideBtn: $("#hideBtn"),
    lockBtn: $("#lockBtn"),
    savePreset: $("#savePreset"),
    loadPreset: $("#loadPreset"),
    // sections
    solidSection: $("#solidSection"),
    gradientSection: $("#gradientSection"),
    ringSection: $("#ringSection"),
    // inputs
    solidColor: $("#solidColor"),
    solidBrightness: $("#solidBrightness"),
    solidKelvin: $("#solidKelvin"),
    useKelvin: $("#useKelvin"),
    gradA: $("#gradA"),
    gradB: $("#gradB"),
    gradAngle: $("#gradAngle"),
    gradBlend: $("#gradBlend"),
    ringColor: $("#ringColor"),
    ringBg: $("#ringBg"),
    ringBrightness: $("#ringBrightness"),
    ringSoft: $("#ringSoft"),
    ringInner: $("#ringInner"),
    ringThickness: $("#ringThickness"),
    ringX: $("#ringX"),
    ringY: $("#ringY"),
    // value displays
    solidBrightnessValue: $("#solidBrightnessValue"),
    solidKelvinValue: $("#solidKelvinValue"),
    gradAngleValue: $("#gradAngleValue"),
    gradBlendValue: $("#gradBlendValue"),
    ringBrightnessValue: $("#ringBrightnessValue"),
    ringSoftValue: $("#ringSoftValue"),
    ringInnerValue: $("#ringInnerValue"),
    ringThicknessValue: $("#ringThicknessValue"),
    ringXValue: $("#ringXValue"),
    ringYValue: $("#ringYValue"),
    savePresetLabel: $("#savePresetLabel"),
    wakelockdot: $("#wakelockdot"),
  };

  const rangeInputs = Array.from(document.querySelectorAll('input[type="range"]'));
  const setText = (el, value) => { if (el) el.textContent = value; };
  const updateRangeFill = (el) => {
    if (!el) return;
    const min = Number(el.min || 0);
    const max = Number(el.max || 100);
    const val = Number(el.value || 0);
    const percent = max === min ? 0 : ((val - min) / (max - min)) * 100;
    el.style.setProperty('--range-progress', `${percent}%`);
  };

  const LSKEY = 'studio-light-state-v1';
  try{
    const saved = JSON.parse(localStorage.getItem(LSKEY) || '{}');
    Object.assign(state, saved);
  }catch(e){}

  // --- Rendering -----------------------------------------------------------
  function render(){
    els.modeSolid.setAttribute('aria-pressed', state.mode==='solid');
    els.modeGradient.setAttribute('aria-pressed', state.mode==='gradient');
    els.modeRing.setAttribute('aria-pressed', state.mode==='ring');

    els.solidSection.classList.toggle('hidden', state.mode!=='solid');
    els.gradientSection.classList.toggle('hidden', state.mode!=='gradient');
    els.ringSection.classList.toggle('hidden', state.mode!=='ring');

    els.solidColor.value = state.solidColor;
    els.solidBrightness.value = state.solidBrightness;
    els.solidKelvin.value = state.solidKelvin;
    els.useKelvin.checked = state.useKelvin;
    els.solidColor.disabled = !!state.useKelvin;
    setText(els.solidBrightnessValue, `${Math.round(state.solidBrightness)}%`);
    setText(els.solidKelvinValue, `${Math.round(state.solidKelvin)}K`);

    els.gradA.value = state.gradA;
    els.gradB.value = state.gradB;
    els.gradAngle.value = state.gradAngle;
    els.gradBlend.value = state.gradBlend;
    setText(els.gradAngleValue, `${Math.round(state.gradAngle)}\u00B0`);
    setText(els.gradBlendValue, `${Math.round(state.gradBlend)}%`);

    els.ringColor.value = state.ringColor;
    els.ringBg.value = state.ringBg;
    els.ringBrightness.value = state.ringBrightness;
    els.ringSoft.value = state.ringSoft;
    els.ringInner.value = state.ringInner;
    els.ringThickness.value = state.ringThickness;
    els.ringX.value = state.ringX;
    els.ringY.value = state.ringY;
    setText(els.ringBrightnessValue, `${Math.round(state.ringBrightness)}%`);
    setText(els.ringSoftValue, `${Math.round(state.ringSoft)}%`);
    setText(els.ringInnerValue, `${Math.round(state.ringInner)}%`);
    setText(els.ringThicknessValue, `${Math.round(state.ringThickness)}%`);
    setText(els.ringXValue, `${Math.round(state.ringX)}%`);
    setText(els.ringYValue, `${Math.round(state.ringY)}%`);

    rangeInputs.forEach(updateRangeFill);

    els.lockBtn.textContent = state.locked ? 'Locked' : 'Lock';
    els.lockBtn.title = state.locked ? 'Unlock controls (SPACE)' : 'Lock controls (SPACE)';
    els.lockBtn.classList.toggle('active', state.locked);
    panel.classList.toggle('collapsed', state.locked);

    if (state.mode === 'solid'){
      const base = state.useKelvin ? kelvinToRGB(state.solidKelvin) : state.solidColor;
      const bright = clamp(state.solidBrightness, 0, 100) / 100;
      stage.style.background = base;
      stage.style.filter = `brightness(${bright})`;
      stage.style.backgroundImage = 'none';
    } else if (state.mode === 'gradient'){
      stage.style.filter = 'none';
      const t = clamp(state.gradBlend, 0, 100);
      const midA = clamp(50 - t / 2, 0, 50);
      const midB = clamp(50 + t / 2, 50, 100);
      stage.style.background = `linear-gradient(${state.gradAngle}deg, ${state.gradA} ${midA}%, ${state.gradB} ${midB}%)`;
    } else if (state.mode === 'ring'){
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
      const ringPeak = clamp(inner + thickness * 0.5, inner, outer);
      const ringEnd = outer;
      const feather = soft * 0.4;

      const gradient = `radial-gradient(circle at ${cx}% ${cy}%,
        ${bg} 0%,
        ${bg} ${Math.max(0, ringStart - feather)}%,
        ${color} ${ringStart}%,
        ${color} ${ringEnd}%,
        ${bg} ${Math.min(100, ringEnd + feather)}%,
        ${bg} 100%)`;

      stage.style.background = `${gradient}, ${bg}`;
      stage.style.filter = `brightness(${bright})`;
    }

    try{
      localStorage.setItem(LSKEY, JSON.stringify(state));
    }catch(e){}
  }

  function linkInput(el, key, transform = v => v){
    if (!el) return;
    el.addEventListener('input', () => {
      if (state.locked) return;
      state[key] = transform(el.type === 'range' ? +el.value : el.value);
      render();
    });
    el.addEventListener('change', () => {
      if (state.locked) return;
      state[key] = transform(el.type === 'range' ? +el.value : el.value);
      render();
    });
  }

  els.modeSolid.onclick = () => { if (state.locked) return; state.mode = 'solid'; render(); };
  els.modeGradient.onclick = () => { if (state.locked) return; state.mode = 'gradient'; render(); };
  els.modeRing.onclick = () => { if (state.locked) return; state.mode = 'ring'; render(); };

  linkInput(els.solidColor, 'solidColor');
  linkInput(els.solidBrightness, 'solidBrightness', Number);
  linkInput(els.solidKelvin, 'solidKelvin', Number);
  linkInput(els.useKelvin, 'useKelvin', () => els.useKelvin.checked);

  linkInput(els.gradA, 'gradA');
  linkInput(els.gradB, 'gradB');
  linkInput(els.gradAngle, 'gradAngle', Number);
  linkInput(els.gradBlend, 'gradBlend', Number);

  linkInput(els.ringColor, 'ringColor');
  linkInput(els.ringBg, 'ringBg');
  linkInput(els.ringBrightness, 'ringBrightness', Number);
  linkInput(els.ringSoft, 'ringSoft', Number);
  linkInput(els.ringInner, 'ringInner', Number);
  linkInput(els.ringThickness, 'ringThickness', Number);
  linkInput(els.ringX, 'ringX', Number);
  linkInput(els.ringY, 'ringY', Number);

  function toggleFullscreen(){
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  els.fullscreenBtn.onclick = toggleFullscreen;
  document.addEventListener('dblclick', (e) => {
    if (!panel.contains(e.target)) toggleFullscreen();
  });

  const hint = $("#hint");
  els.hideBtn.onclick = () => {
    const isHidden = panel.dataset.hidden === '1';
    if (isHidden){
      panel.dataset.hidden = '0';
      panel.style.display = 'block';
      if (hint) hint.style.display = '';
    } else {
      panel.dataset.hidden = '1';
      panel.style.display = 'none';
      if (hint) hint.style.display = 'none';
    }
  };

  els.lockBtn.onclick = () => { state.locked = !state.locked; render(); };

  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.locked) return;
      const preset = btn.dataset.preset;
      if (preset === 'warm'){ state.mode='solid'; state.useKelvin=true; state.solidKelvin=3200; state.solidBrightness=100; }
      if (preset === 'daylight'){ state.mode='solid'; state.useKelvin=true; state.solidKelvin=5600; state.solidBrightness=100; }
      if (preset === 'cool'){ state.mode='solid'; state.useKelvin=true; state.solidKelvin=6500; state.solidBrightness=100; }
      if (preset === 'magenta'){ state.mode='solid'; state.useKelvin=false; state.solidColor='#ff66ff'; }
      if (preset === 'green'){ state.mode='solid'; state.useKelvin=false; state.solidColor='#66ff99'; }
      if (preset === 'neutral'){ state.mode='solid'; state.useKelvin=false; state.solidColor='#ffffff'; state.solidBrightness=100; }
      render();
    });
  });

  els.savePreset.onclick = () => {
    localStorage.setItem('studio-light-user-preset', JSON.stringify(state));
    if (els.savePresetLabel) els.savePresetLabel.textContent = 'Saved!';
    els.savePreset.classList.add('saved');
    setTimeout(() => {
      if (els.savePresetLabel) els.savePresetLabel.textContent = 'Save';
      els.savePreset.classList.remove('saved');
    }, 1200);
  };

  els.loadPreset.onclick = () => {
    try{
      const saved = JSON.parse(localStorage.getItem('studio-light-user-preset') || '{}');
      Object.assign(state, saved);
      render();
    }catch(e){}
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F'){ e.preventDefault(); toggleFullscreen(); }
    if (e.key === 'h' || e.key === 'H'){ e.preventDefault(); els.hideBtn.click(); }
    if (e.key === ' '){ e.preventDefault(); state.locked = !state.locked; render(); }
    if (e.key === '1'){ state.mode = 'solid'; render(); }
    if (e.key === '2'){ state.mode = 'gradient'; render(); }
    if (e.key === '3'){ state.mode = 'ring'; render(); }
    if (e.key === 'w' || e.key === 'W'){ state.mode = 'solid'; state.useKelvin = true; state.solidKelvin = 3200; render(); }
    if (e.key === 'd' || e.key === 'D'){ state.mode = 'solid'; state.useKelvin = true; state.solidKelvin = 5600; render(); }
    if (e.key === 'c' || e.key === 'C'){ state.mode = 'solid'; state.useKelvin = true; state.solidKelvin = 6500; render(); }

    if (state.mode === 'ring'){
      let step = e.shiftKey ? 2 : 0.5;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        e.preventDefault();
        if (e.key === 'ArrowLeft') state.ringX = clamp(state.ringX - step, 0, 100);
        if (e.key === 'ArrowRight') state.ringX = clamp(state.ringX + step, 0, 100);
        if (e.key === 'ArrowUp') state.ringY = clamp(state.ringY - step, 0, 100);
        if (e.key === 'ArrowDown') state.ringY = clamp(state.ringY + step, 0, 100);
        render();
      }
    }
  });

  let wakeLock = null;
  async function requestWakeLock(){
    try{
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        els.wakelockdot.style.background = '#22c55e';
        wakeLock.addEventListener('release', () => {
          els.wakelockdot.style.background = '#ef4444';
        });
      } else {
        els.wakelockdot.style.background = '#f59e0b';
      }
    }catch(e){
      els.wakelockdot.style.background = '#ef4444';
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeLock && wakeLock.released) requestWakeLock();
  });

  render();
  requestWakeLock();

