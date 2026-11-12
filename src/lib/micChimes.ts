/** Короткие нейтральные сигналы старта/стопа записи (Web Audio, без файлов). */

type AudioCtx = AudioContext;

let sharedCtx: AudioCtx | null = null;

function getCtx(): AudioCtx | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new Ctor();
  }
  return sharedCtx;
}

/** Разблокировка AudioContext по жесту пользователя (Safari). */
export async function unlockMicChimes(): Promise<void> {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
}

function tone(
  ctx: AudioCtx,
  frequency: number,
  when: number,
  duration: number,
  peak = 0.07,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

/** Старт записи: мягкий восходящий «тик». */
export function playMicStartChime(): void {
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume().then(() => {
    const t = ctx.currentTime;
    tone(ctx, 640, t, 0.07, 0.055);
    tone(ctx, 860, t + 0.06, 0.09, 0.05);
  });
}

/** Конец записи: мягкий нисходящий «тик». */
export function playMicEndChime(): void {
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume().then(() => {
    const t = ctx.currentTime;
    tone(ctx, 760, t, 0.07, 0.05);
    tone(ctx, 520, t + 0.055, 0.1, 0.045);
  });
}
