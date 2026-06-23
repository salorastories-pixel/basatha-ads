import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// ===== هوية بسطها =====
const CREAM = '#F6EBDB';
const LINE = '#E3D4BD';
const INK = '#191818';
const YELLOW = '#FED003';
const PINK = '#FDA6C9';
const BLUE = '#0AA0FD';
const RED = '#FF3B30';
const FONT = 'OYMandisa, "Segoe UI", Tahoma, sans-serif';

const FontFace = () => (
  <style>{`@font-face{font-family:'OYMandisa';src:url('${staticFile('OYMandisa.ttf')}') format('truetype');font-weight:normal;font-style:normal;}`}</style>
);

// ===== خلفية الدفتر (ورق مسطّر + هامش وردي) — ثابتة طول الإعلان =====
const NotebookBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: CREAM, fontFamily: FONT}}>
    <FontFace />
    {/* سطور الدفتر */}
    <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(${CREAM}, ${CREAM} 78px, ${LINE} 80px)`}} />
    {/* هامش وردي على اليمين */}
    <div style={{position: 'absolute', top: 0, bottom: 0, right: 90, width: 4, backgroundColor: PINK, opacity: 0.5}} />
    {children}
  </AbsoluteFill>
);

// ===== الشعار الثابت فوق يمين (طول الإعلان) =====
const LogoFixed: React.FC = () => (
  <Img src={staticFile('logo.png')} style={{position: 'absolute', top: 70, right: 130, width: 280, zIndex: 50}} />
);

// حركة ظهور ناعمة (easing مرن، مو حاد)
const ease = (frame: number, from: number, dur: number) =>
  interpolate(frame, [from, from + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });

const pop = (frame: number, fps: number, delay: number) => {
  const s = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 150, mass: 0.8}});
  const opacity = ease(frame, delay, 8);
  return {opacity, s};
};

// إطار صورة "ملصوقة في الكراسة" (مائلة + شريط لاصق)
const TapedPhoto: React.FC<{src: string; w: number; rot: number; scale?: number; tape?: boolean}> = ({src, w, rot, scale = 1, tape = true}) => (
  <div style={{position: 'relative', transform: `rotate(${rot}deg) scale(${scale})`}}>
    {tape && <div style={{position: 'absolute', width: 120, height: 44, backgroundColor: 'rgba(253,166,201,0.55)', top: -22, left: '50%', transform: 'translateX(-50%) rotate(-4deg)', zIndex: 2}} />}
    <Img src={staticFile(src)} style={{width: w, display: 'block', borderRadius: 8, border: '10px solid #fff', boxShadow: '0 14px 40px rgba(0,0,0,0.22)'}} />
  </div>
);

// نص علوي (تحت الشعار) — مساحة آمنة، ما يتداخل
const Caption: React.FC<{children: React.ReactNode; frame: number; size?: number}> = ({children, frame, size = 78}) => (
  <div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', padding: '0 80px', boxSizing: 'border-box', opacity: ease(frame, 0, 8), zIndex: 20}}>
    <span style={{fontSize: size, fontWeight: 800, color: INK, lineHeight: 1.3}}>{children}</span>
  </div>
);

const HLp: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundColor: PINK, color: INK, padding: '2px 18px', borderRadius: '6px 16px 8px 18px', display: 'inline-block', transform: 'rotate(-1.5deg)'}}>{children}</span>
);
const HLy: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundColor: YELLOW, color: INK, padding: '4px 22px', borderRadius: '8px 18px 6px 16px', display: 'inline-block', transform: 'rotate(-1deg)'}}>{children}</span>
);

// ===== م1: العادي يظهر + "عندك كانفا" =====
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, fps, 8);
  return (
    <NotebookBg>
      <LogoFixed />
      <Caption frame={frame}>عندك كانفا. بس تصميمك <HLp>«عادي».</HLp></Caption>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
        <div style={{opacity: p.opacity, transform: `scale(${interpolate(p.s, [0, 1], [0.9, 1])})`}}>
          <TapedPhoto src="bad.png" w={680} rot={-3} />
        </div>
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== م2: العادي + أشّارات حمراء يدوية على الأخطاء =====
const marks = [
  {x: '20%', y: '30%', w: 150, h: 80, label: 'غلط إملائي', lx: -120, ly: -10},
  {x: '16%', y: '58%', w: 130, h: 70, label: 'توزيع غير متوازن', lx: -180, ly: 30},
  {x: '24%', y: '78%', w: 120, h: 60, label: 'ألوان باهتة', lx: -90, ly: 50},
];
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <NotebookBg>
      <LogoFixed />
      <Caption frame={frame}>المشكلة مو <HLp>فيك.</HLp></Caption>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
        <div style={{position: 'relative'}}>
          <TapedPhoto src="bad.png" w={680} rot={-3} />
          {marks.map((m, i) => {
            const o = ease(frame, 10 + i * 14, 10);
            const dash = interpolate(ease(frame, 10 + i * 14, 16), [0, 1], [400, 0]);
            return (
              <div key={i} style={{position: 'absolute', left: m.x, top: m.y, opacity: o}}>
                <svg width={m.w} height={m.h} style={{position: 'absolute', left: -m.w / 2, top: -m.h / 2, overflow: 'visible'}}>
                  <ellipse cx={m.w / 2} cy={m.h / 2} rx={m.w / 2 - 4} ry={m.h / 2 - 4} fill="none" stroke={RED} strokeWidth={6} strokeDasharray={400} strokeDashoffset={dash} strokeLinecap="round" />
                </svg>
                <div style={{position: 'absolute', left: m.lx, top: m.ly, backgroundColor: RED, color: '#fff', fontSize: 26, fontWeight: 800, padding: '4px 14px', borderRadius: 10, whiteSpace: 'nowrap'}}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== م3: العادي يطيح ← الاحترافي يطلع (نبضة) — انتقال مرن =====
const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // العادي يطيح ويدور للأسفل
  const fall = spring({frame, fps, config: {damping: 20, stiffness: 70}});
  const badY = interpolate(fall, [0, 1], [0, 1400]);
  const badRot = interpolate(fall, [0, 1], [-3, 30]);
  // الاحترافي يطلع بنبضة بعد ما يطيح العادي
  const g = pop(frame, fps, 22);
  const pulse = frame > 45 ? 1 + Math.sin((frame - 45) / 5) * 0.04 : 1;
  return (
    <NotebookBg>
      <LogoFixed />
      <Caption frame={frame}>ولا في كانفا.</Caption>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
        <Img src={staticFile('bad.png')} style={{width: 680, position: 'absolute', borderRadius: 8, border: '10px solid #fff', transform: `translateY(${badY}px) rotate(${badRot}deg)`}} />
        <div style={{opacity: g.opacity, transform: `scale(${interpolate(g.s, [0, 1], [0.85, 1]) * pulse})`}}>
          <TapedPhoto src="good.png" w={680} rot={2} />
        </div>
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== م4: الاحترافي نظيف ثابت + "الأساس" =====
const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, fps, 0);
  const hl = pop(frame, fps, 18);
  return (
    <NotebookBg>
      <LogoFixed />
      <div style={{position: 'absolute', top: 320, width: '100%', textAlign: 'center', padding: '0 80px', boxSizing: 'border-box', zIndex: 20}}>
        <span style={{fontSize: 70, fontWeight: 800, color: INK, opacity: ease(frame, 0, 8)}}>المشكلة إنك ما تعلّمت </span>
        <span style={{display: 'inline-block', opacity: hl.opacity, transform: `scale(${interpolate(hl.s, [0, 1], [0.6, 1])})`}}><HLy>الأساس.</HLy></span>
      </div>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
        <div style={{opacity: p.opacity}}>
          <TapedPhoto src="good.png" w={660} rot={2} />
        </div>
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== م5: البكج يظهر بحجمه العادي + "معسكر كانفا يبدا معاك من الصفر" =====
const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pkg = pop(frame, fps, 10);
  return (
    <NotebookBg>
      <LogoFixed />
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', padding: '0 70px', boxSizing: 'border-box', opacity: ease(frame, 0, 8), zIndex: 20}}>
        <span style={{fontSize: 76, fontWeight: 800, color: INK, lineHeight: 1.3}}>معسكر كانفا يبدا معاك من <HLy>الصفر</HLy></span>
      </div>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 180}}>
        <Img src={staticFile('package.png')} style={{width: 1000, opacity: pkg.opacity, transform: `translateY(${interpolate(pkg.s, [0, 1], [120, 0])}px)`}} />
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== م6: السعر + زر "سجّل الحين" مرسوم باليد =====
const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const price = pop(frame, fps, 6);
  const btn = pop(frame, fps, 22);
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  return (
    <NotebookBg>
      <LogoFixed />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 60}}>
        <div style={{fontSize: 90, fontWeight: 800, color: INK, opacity: ease(frame, 0, 8)}}>بـ</div>
        <div style={{opacity: price.opacity, transform: `scale(${interpolate(price.s, [0, 1], [0.6, 1])})`}}>
          <HLy><span style={{fontSize: 150, fontWeight: 800}}>٨٩ ريال</span></HLy>
        </div>
        <div style={{fontSize: 64, fontWeight: 800, color: INK, opacity: ease(frame, 14, 8)}}>بس،</div>
        <div style={{border: `7px solid ${BLUE}`, color: BLUE, padding: '24px 64px', borderRadius: '30px 40px 28px 38px', fontSize: 84, fontWeight: 800, opacity: btn.opacity, transform: `scale(${btn.opacity < 1 ? interpolate(btn.s, [0, 1], [0.7, 1]) : pulse})`}}>
          سجّل الحين
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 200, left: 160, width: 16, height: 16, borderRadius: '50%', backgroundColor: BLUE}} />
    </NotebookBg>
  );
};

// ===== تجميع الإعلان =====
export const FAHM_NB_DURATION = 495;

export const FahmNotebook: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: CREAM}}>
    <Sequence durationInFrames={60}><S1 /></Sequence>
    <Sequence from={60} durationInFrames={90}><S2 /></Sequence>
    <Sequence from={150} durationInFrames={75}><S3 /></Sequence>
    <Sequence from={225} durationInFrames={90}><S4 /></Sequence>
    <Sequence from={315} durationInFrames={90}><S5 /></Sequence>
    <Sequence from={405} durationInFrames={90}><S6 /></Sequence>
  </AbsoluteFill>
);
