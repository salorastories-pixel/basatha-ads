import React from 'react';
import {
  AbsoluteFill,
  Composition,
  Sequence,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ===== هوية بسطها الرسمية =====
const CREAM = '#F6EBDB';
const INK = '#191818';
const YELLOW = '#FED003';
const PINK = '#FDA6C9';
const BLUE = '#0AA0FD';
const FONT = 'OYMandisa, "Segoe UI", Tahoma, sans-serif';

// تحميل خط بسطها (الملف في مجلد public)
const FontFace = () => (
  <style>{`@font-face{font-family:'OYMandisa';src:url('${staticFile(
    'OYMandisa.ttf',
  )}') format('truetype');font-weight:normal;font-style:normal;}`}</style>
);

// خلفية كريمية موحّدة
const Bg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: CREAM, fontFamily: FONT}}>
    <FontFace />
    {children}
  </AbsoluteFill>
);

// دالة ظهور (نطّة + تلاشي)
const pop = (frame: number, fps: number, delay: number) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 200, mass: 0.7},
  });
  const opacity = interpolate(frame - delay, [0, 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {opacity, s};
};

// نقطة زرقاء (موتيف الشعار)
const Dot: React.FC<{style: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', width: 26, height: 26, borderRadius: '50%', backgroundColor: BLUE, ...style}} />
);

// ===== المشهد 1: عدّاد السعر =====
const ScenePrice: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pre = pop(frame, fps, 0);
  const box = pop(frame, fps, 6);
  const q = pop(frame, fps, 22);
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 36}}>
        <span style={{fontSize: 96, fontWeight: 800, color: INK, opacity: pre.opacity, transform: `scale(${interpolate(pre.s, [0, 1], [0.7, 1])})`}}>بـ</span>
        <div style={{backgroundColor: YELLOW, borderRadius: 44, padding: '20px 90px', opacity: box.opacity, transform: `scale(${interpolate(box.s, [0, 1], [0.6, 1])})`}}>
          <span style={{fontSize: 300, fontWeight: 800, color: INK, lineHeight: 1}}>89</span>
        </div>
        <span style={{fontSize: 96, fontWeight: 800, color: INK, opacity: q.opacity, transform: `scale(${interpolate(q.s, [0, 1], [0.7, 1])})`}}>ريال؟</span>
      </AbsoluteFill>
      <Dot style={{bottom: 230, left: 180}} />
    </Bg>
  );
};

// ===== المشهد 2: عنوان "تحصل على:" =====
const SceneHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, fps, 0);
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 340}}>
        <div style={{backgroundColor: PINK, borderRadius: 26, padding: '18px 56px', opacity: p.opacity, transform: `scale(${interpolate(p.s, [0, 1], [0.7, 1])})`}}>
          <span style={{fontSize: 150, fontWeight: 800, color: INK}}>تحصل على:</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشاهد 3-6: قائمة المميزات (تراكمية) =====
const rows = [
  {t: '7 دورات متكاملة', c: BLUE, sub: ''},
  {t: '6 كتيبات', c: PINK, sub: 'منها الأكواد السرية'},
  {t: 'واجب يتقيّم + دعم واتساب', c: BLUE, sub: ''},
  {t: 'شهادة + دخول مدى الحياة', c: PINK, sub: ''},
];
const SceneList: React.FC<{count: number}> = ({count}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', gap: 80, padding: '0 90px'}}>
        {rows.slice(0, count).map((r, i) => {
          const isNew = i === count - 1;
          const p = isNew ? pop(frame, fps, 0) : {opacity: 0.45, s: 1};
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 34, opacity: p.opacity, transform: `translateX(${interpolate(p.s, [0, 1], [-50, 0])}px)`}}>
              <div style={{width: 92, height: 92, borderRadius: '50%', backgroundColor: r.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <span style={{color: '#fff', fontSize: 58, fontWeight: 800}}>&#10003;</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontSize: 86, fontWeight: 800, color: INK, lineHeight: 1.15}}>{r.t}</span>
                {r.sub ? <span style={{fontSize: 50, fontWeight: 800, color: INK, backgroundColor: PINK, borderRadius: 12, padding: '4px 20px', alignSelf: 'flex-start', marginTop: 12}}>{r.sub}</span> : null}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشهد 7: "بسعر وجبة" =====
const SceneMeal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, fps, 0);
  const b = pop(frame, fps, 22);
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24}}>
        <span style={{fontSize: 110, fontWeight: 800, color: INK, opacity: a.opacity, transform: `scale(${interpolate(a.s, [0, 1], [0.7, 1])})`}}>كل هذا…</span>
        <div style={{backgroundColor: PINK, borderRadius: 24, padding: '12px 44px', opacity: b.opacity, transform: `scale(${interpolate(b.s, [0, 1], [0.6, 1.05])})`}}>
          <span style={{fontSize: 120, fontWeight: 800, color: INK}}>بسعر وجبة.</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشهد 8: عدّاد المتدربين =====
const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.round(interpolate(frame, [0, 45], [0, 10000], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const lbl = pop(frame, fps, 48);
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 4}}>
        <div style={{fontSize: 170, fontWeight: 800, color: BLUE, direction: 'ltr'}}>+{n.toLocaleString('en-US')}</div>
        <span style={{fontSize: 90, fontWeight: 800, color: INK, opacity: lbl.opacity, transform: `translateY(${interpolate(lbl.s, [0, 1], [30, 0])}px)`}}>متدرب سابق</span>
      </AbsoluteFill>
      <Dot style={{top: 240, right: 180}} />
    </Bg>
  );
};

// ===== المشهد 9: الختام + الشعار =====
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = pop(frame, fps, 0);
  const btn = pop(frame, fps, 18);
  const link = pop(frame, fps, 30);
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50}}>
        <Img src={staticFile('logo.png')} style={{width: 520, opacity: logo.opacity, transform: `scale(${interpolate(logo.s, [0, 1], [0.7, 1])})`}} />
        <div style={{backgroundColor: BLUE, color: '#fff', padding: '28px 70px', borderRadius: 70, fontSize: 84, fontWeight: 800, opacity: btn.opacity, transform: `scale(${btn.opacity < 1 ? interpolate(btn.s, [0, 1], [0.7, 1]) : pulse})`}}>
          سجّل الحين
        </div>
        <span style={{fontSize: 54, fontWeight: 800, color: INK, opacity: link.opacity}}>الرابط بالبايو</span>
      </AbsoluteFill>
    </Bg>
  );
};

// ===== تجميع الإعلان (9 مشاهد) =====
const DawraAd: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <Sequence durationInFrames={60}><ScenePrice /></Sequence>
      <Sequence from={60} durationInFrames={40}><SceneHeader /></Sequence>
      <Sequence from={100} durationInFrames={60}><SceneList count={1} /></Sequence>
      <Sequence from={160} durationInFrames={60}><SceneList count={2} /></Sequence>
      <Sequence from={220} durationInFrames={60}><SceneList count={3} /></Sequence>
      <Sequence from={280} durationInFrames={60}><SceneList count={4} /></Sequence>
      <Sequence from={340} durationInFrames={70}><SceneMeal /></Sequence>
      <Sequence from={410} durationInFrames={60}><SceneProof /></Sequence>
      <Sequence from={470} durationInFrames={70}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};

// ===== تسجيل المشهد (لا تغيّر اسم RemotionRoot) =====
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyComp"
      component={DawraAd}
      durationInFrames={540}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
