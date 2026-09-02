let ctx: AudioContext | null = null;

function audio() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tick(ac: AudioContext, time: number, volume: number, freq: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, time);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freq * 1.4, time);
  filter.Q.value = 4;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  osc.start(time);
  osc.stop(time + 0.05);
}

function rumble(ac: AudioContext, start: number, duration: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(70, start);
  osc.frequency.exponentialRampToValueAtTime(38, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.06, start + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function ding(ac: AudioContext, time: number) {
  for (const [freq, vol, len] of [
    [880, 0.12, 0.35],
    [1320, 0.08, 0.28],
    [1760, 0.05, 0.22],
  ] as const) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + len);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(time);
    osc.stop(time + len + 0.02);
  }
}

export function playSpinSound(durationMs = 4200) {
  try {
    const ac = audio();
    const start = ac.currentTime + 0.02;
    const duration = durationMs / 1000;
    rumble(ac, start, duration * 0.92);
    let t = 0;
    while (t < duration - 0.08) {
      const p = t / duration;
      const interval = 0.032 + p * p * 0.18;
      const freq = 2100 - p * 700 + (Math.random() * 120 - 60);
      tick(ac, start + t, 0.07 * (1 - p * 0.45), freq);
      t += interval;
    }
    ding(ac, start + duration);
  } catch {
    /* autoplay / unsupported — spin still works */
  }
}
