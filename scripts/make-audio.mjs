// مولّد المؤثرات الصوتية لإعلان بسطها — ينتج ملفات WAV في public/audio
// تشغيل: node scripts/make-audio.mjs
import {mkdirSync, writeFileSync} from 'fs';

const SR = 44100;
const OUT = 'public/audio';
mkdirSync(OUT, {recursive: true});

// ---- كتابة WAV (16-bit PCM mono) ----
function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    let v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((v * 32767) | 0, 44 + i * 2);
  }
  writeFileSync(`${OUT}/${name}`, buf);
  console.log(`✓ ${name}  (${(n / SR).toFixed(2)}s)`);
}

const sec = (s) => Math.floor(s * SR);
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

// إضافة نغمة بظرف ADSR بسيط
function tone(out, start, dur, freq, amp, {type = 'sine', atk = 0.005, rel = 0.08, harm = 1} = {}) {
  const end = start + sec(dur);
  const a = sec(atk);
  const r = sec(rel);
  for (let i = start, k = 0; i < end && i < out.length; i++, k++) {
    const t = k / SR;
    let env;
    const tail = end - i;
    if (k < a) env = k / a;
    else if (tail < r) env = tail / r;
    else env = 1;
    let s = 0;
    if (type === 'sine') s = Math.sin(2 * Math.PI * freq * t);
    else if (type === 'tri') s = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * t));
    else if (type === 'saw') s = 2 * (freq * t - Math.floor(0.5 + freq * t));
    // توافقية أعلى خفيفة لإحساس الجرس
    if (harm > 1) s += 0.35 * Math.sin(2 * Math.PI * freq * 2 * t);
    out[i] += s * amp * env;
  }
}

// ضوضاء قصيرة (لِـ whoosh / hat)
function noise(out, start, dur, amp, {atk = 0.01, rel = 0.1, lp = 1} = {}) {
  const end = start + sec(dur);
  const a = sec(atk);
  const r = sec(rel);
  let prev = 0;
  for (let i = start, k = 0; i < end && i < out.length; i++, k++) {
    const tail = end - i;
    let env;
    if (k < a) env = k / a;
    else if (tail < r) env = tail / r;
    else env = 1;
    let s = Math.random() * 2 - 1;
    prev = prev + lp * (s - prev); // low-pass بسيط
    out[i] += prev * amp * env;
  }
}

function master(out, {fadeIn = 0, fadeOut = 0} = {}) {
  const fi = sec(fadeIn);
  const fo = sec(fadeOut);
  for (let i = 0; i < out.length; i++) {
    let g = 1;
    if (i < fi) g *= i / fi;
    if (i > out.length - fo) g *= (out.length - i) / fo;
    // limiter ناعم
    let v = out[i] * g;
    out[i] = Math.tanh(v * 1.1) * 0.92;
  }
}

// ============ 1) موسيقى الخلفية (18s, مرحة وخفيفة) ============
function buildMusic() {
  const DUR = 23.7;
  const out = new Float32Array(sec(DUR));
  const beat = 0.5; // 120 BPM
  const bar = beat * 4;
  // تتابع وتري: C - G - Am - F (I-V-vi-IV)
  const prog = [
    {triad: [60, 64, 67], bass: 36}, // C
    {triad: [55, 59, 62], bass: 31}, // G
    {triad: [57, 60, 64], bass: 33}, // Am
    {triad: [53, 57, 60], bass: 29}, // F
  ];
  const bars = Math.ceil(DUR / bar);
  for (let b = 0; b < bars; b++) {
    const ch = prog[b % prog.length];
    const t0 = b * bar;
    if (t0 >= DUR) break;
    // باد (يحمل التآلف)
    ch.triad.forEach((m) =>
      tone(out, sec(t0), bar, NOTE(m), 0.05, {type: 'tri', atk: 0.08, rel: 0.25}),
    );
    // باس
    tone(out, sec(t0), bar * 0.95, NOTE(ch.bass), 0.16, {type: 'sine', atk: 0.01, rel: 0.12});
    // آربيجيو (8 نغمات بالبار)
    const arpNotes = [ch.triad[0], ch.triad[1], ch.triad[2], ch.triad[1] + 12, ch.triad[2], ch.triad[1], ch.triad[0] + 12, ch.triad[1]];
    for (let e = 0; e < 8; e++) {
      const t = t0 + e * (beat / 2);
      if (t >= DUR) break;
      tone(out, sec(t), 0.22, NOTE(arpNotes[e]) * 1, 0.07, {type: 'sine', atk: 0.004, rel: 0.16, harm: 2});
    }
    // إيقاع: كِك على كل ضربة + هاي-هات على نص الضربة
    for (let bt = 0; bt < 4; bt++) {
      const t = t0 + bt * beat;
      if (t < DUR) {
        // كِك = جيب ينزل تردده
        const ks = sec(t);
        for (let i = ks, k = 0; i < ks + sec(0.12) && i < out.length; i++, k++) {
          const tt = k / SR;
          const f = 110 * Math.exp(-tt * 28) + 45;
          const env = Math.exp(-tt * 18);
          out[i] += Math.sin(2 * Math.PI * f * tt) * 0.5 * env;
        }
        // هاي-هات
        if (t + beat / 2 < DUR) noise(out, sec(t + beat / 2), 0.05, 0.05, {atk: 0.001, rel: 0.04, lp: 0.9});
      }
    }
  }
  master(out, {fadeIn: 0.4, fadeOut: 1.2});
  writeWav('music.wav', out);
}

// ============ 2) مؤثرات قصيرة (SFX) ============
function buildPop() {
  const out = new Float32Array(sec(0.18));
  // pop = نغمة صاعدة سريعة
  const s = 0;
  for (let i = s, k = 0; i < out.length; i++, k++) {
    const t = k / SR;
    const f = 320 + 900 * Math.min(1, t / 0.05);
    const env = Math.exp(-t * 22);
    out[i] += Math.sin(2 * Math.PI * f * t) * 0.6 * env;
  }
  master(out, {fadeOut: 0.02});
  writeWav('pop.wav', out);
}

function buildWhoosh() {
  const out = new Float32Array(sec(0.35));
  noise(out, 0, 0.35, 0.5, {atk: 0.12, rel: 0.18, lp: 0.06});
  master(out, {fadeIn: 0.02, fadeOut: 0.05});
  writeWav('whoosh.wav', out);
}

function buildTick() {
  const out = new Float32Array(sec(0.06));
  tone(out, 0, 0.05, NOTE(84), 0.5, {type: 'sine', atk: 0.001, rel: 0.04});
  master(out);
  writeWav('tick.wav', out);
}

function buildDing() {
  const out = new Float32Array(sec(0.8));
  // جرس نجاح (تآلف صاعد)
  tone(out, 0, 0.8, NOTE(76), 0.4, {type: 'sine', atk: 0.002, rel: 0.5, harm: 2});
  tone(out, sec(0.04), 0.7, NOTE(83), 0.32, {type: 'sine', atk: 0.002, rel: 0.5, harm: 2});
  master(out, {fadeOut: 0.1});
  writeWav('ding.wav', out);
}

function buildSuccess() {
  const out = new Float32Array(sec(1.2));
  // فانفير ختامي: C - E - G - C صاعدة
  const seq = [72, 76, 79, 84];
  seq.forEach((m, idx) => {
    tone(out, sec(idx * 0.1), 1.0 - idx * 0.1, NOTE(m), 0.32, {type: 'sine', atk: 0.003, rel: 0.6, harm: 2});
  });
  // رشّة بريق
  noise(out, sec(0.0), 0.5, 0.06, {atk: 0.05, rel: 0.4, lp: 0.4});
  master(out, {fadeOut: 0.15});
  writeWav('success.wav', out);
}

buildMusic();
buildPop();
buildWhoosh();
buildTick();
buildDing();
buildSuccess();
console.log('تم توليد كل ملفات الصوت ✅');
