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
// خط بسطها + خطوط عربية احتياطية تدعم تشكيل الحروف (shaping)
const FONT = 'OYMandisa, "Segoe UI", Tahoma, "Arial", sans-serif';

// نمط مشترك يضمن اتجاه ووصل العربي الصحيح
const RTL: React.CSSProperties = {direction: 'rtl', unicodeBidi: 'plaintext', textAlign: 'center'};

const FontFace = () => (
  <style>{`@font-face{font-family:'OYMandisa';src:url('${staticFile('OYMandisa.ttf')}') format('truetype');font-weight:normal;font-style:normal;}`}</style>
);

// ===== خلفية الدفتر (ورق مسطّر + هامش وردي) =====
const NotebookBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: CREAM, fontFamily: FONT, direction: 'rtl'}}>
    <FontFace />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(${CREAM}, ${CREAM} 78px, ${LINE} 80px)`}} />
    {/* هامش وردي على اليمين */}
    <div style={{position: 'absolute', top: 0, bottom: 0, right: 90, width: 4, backgroundColor: PINK, opacity: 0.5}} />
    {children}
  </AbsoluteFill>
);

// ===== الشعار الثابت فوق يمين — على مساحة كريمية نظيفة بدون أي تداخل =====
const LogoFixed: React.FC = () => (
  <>
    <div style={{position: 'absolute', top: 52, right: 104, width: 336, height: 180, backgroundColor: CREAM, borderRadius: 22, zIndex: 49}} />
    <Img src={staticFile('logo.png')} style={{position: 'absolute', top: 70, right: 130, width: 280, zIndex: 50}} />
  </>
);

// حركة ظهور ناعمة
const ease = (frame: number, from: number, dur: number) =>
  interpolate(frame, [from, from + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });

const pop = (frame: number, fps: number, delay: number) => {
  const s = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 150, mass: 0.8}});
  const opacity = ease(frame, delay, 8);
  return {opacity, s};
};

// صورة "ملصوقة في الكراسة" (مائلة + شريط لاصق)
const TapedPhoto: React.FC<{src: string; w: number; rot: number; tape?: boolean}> = ({src, w, rot, tape = true}) => (
  <div style={{position: 'relative', transform: `rotate(${rot}deg)`}}>
    {tape && <div style={{position: 'absolute', width: 130, height: 46, backgroundColor: 'rgba(253,166,201,0.55)', top: -23, left: '50%', transform: 'translateX(-50%) rotate(-4deg)', zIndex: 2}} />}
    <Img src={staticFile(src)} style={{width: w, display: 'block', borderRadius: 8, border: '10px solid #fff', boxShadow: '0 14px 40px rgba(0,0,0,0.22)'}} />
  </div>
);

// نص علوي (تحت الشعار) — جملة كاملة في عنصر واحد باتجاه RTL
const Caption: React.FC<{children: React.ReactNode; frame: number; size?: number}> = ({children, frame, size = 76}) => (
  <div style={{position: 'absolute', top: 360, width: '100%', padding: '0 90px', boxSizing: 'border-box', opacity: ease(frame, 0, 8), zIndex: 20, ...RTL}}>
    <span style={{fontSize: size, fontWeight: 800, color: INK, lineHeight: 1.35}}>{children}</span>
  </div>
);

const HLp: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundColor: PINK, color: INK, padding: '2px 18px', borderRadius: '6px 16px 8px 18px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{children}</span>
);
const HLy: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundColor: YELLOW, color: INK, padding: '4px 22px', borderRadius: '8px 18px 6px 16px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{children}</span>
);

// حاوية الصورة الرئيسية — متوسّطة عمودياً ومُكبّرة
const PhotoStage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
    <div style={{marginTop: 270}}>{children}</div>
  </AbsoluteFill>
);

// ===== م1: العادي يظهر + "عندك كانفا" =====
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = pop(frame, fps, 8);
  return (
    <NotebookBg>
      <LogoFixed />
      <Caption frame={frame}>عندك كانفا، بس تصميمك <HLp>«عادي».</HLp></Caption>
      <PhotoStage>
        <div style={{opacity: p.opacity, transform: `scale(${interpolate(p.s, [0, 1], [0.9, 1])})`}}>
          <TapedPhoto src="bad.png" w={720} rot={-3} />
        </div>
      </PhotoStage>
    </NotebookBg>
  );
};

// ===== م2: العادي + أشّارتان حمراوان على الأخطاء (إحداثيات نسبية) =====
const marks = [
  {x: '17%', y: '55%', w: 180, h: 92, label: 'غلط إملائي'},
  {x: '20%', y: '71%', w: 190, h: 96, label: 'توزيع غير متوازن'},
];
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <NotebookBg>
      <LogoFixed />
      <Caption frame={frame}>المشكلة مو <HLp>فيك.</HLp></Caption>
      <PhotoStage>
        <div style={{position: 'relative'}}>
          <TapedPhoto src="bad.png" w={720} rot={-3} />
          {marks.map((m, i) => {
            const o = ease(frame, 12 + i * 16, 12);
            const dash = interpolate(ease(frame, 12 + i * 16, 18), [0, 1], [m.w * 3, 0]);
            return (
              <div key={i} style={{position: 'absolute', left: m.x, top: m.y, opacity: o}}>
                <svg width={m.w} height={m.h} style={{position: 'absolute', left: -m.w / 2, top: -m.h / 2, overflow: 'visible'}}>
                  <ellipse cx={m.w / 2} cy={m.h / 2} rx={m.w / 2 - 5} ry={m.h / 2 - 5} fill="none" stroke={RED} strokeWidth={6} strokeDasharray={m.w * 3} strokeDashoffset={dash} strokeLinecap="round" />
                </svg>
                <div style={{position: 'absolute', left: '50%', top: -m.h / 2 - 56, transform: 'translateX(-50%)', backgroundColor: RED, color: '#fff', fontSize: 30, fontWeight: 800, padding: '5px 18px', borderRadius: 12, whiteSpace: 'nowrap', ...RTL}}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </PhotoStage>
    </NotebookBg>
  );
};

// ===== م3: "ولا في كانفا" — نص فقط في وسط الشاشة (بدون صورة) =====
const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const o = ease(frame, 4, 10);
  return (
    <NotebookBg>
      <LogoFixed />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 90px'}}>
        <div style={{opacity: o, transform: `scale(${interpolate(o, [0, 1], [0.9, 1])})`, ...RTL}}>
          <span style={{fontSize: 110, fontWeight: 800, color: INK, lineHeight: 1.3}}>ولا في كانفا.</span>
        </div>
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== م4: "ما تعلّمت الأساس" ثم يظهر التصميم مكبّراً ثم يرجع لحجمه =====
const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const APPEAR = 24;
  const appear = ease(frame, APPEAR, 8);
  // يظهر مكبّراً، يثبت ~نص ثانية، ثم يرجع لحجمه الطبيعي
  const scale = interpolate(
    frame,
    [APPEAR, APPEAR + 16, APPEAR + 31, APPEAR + 48],
    [0.75, 1.2, 1.2, 1.0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)},
  );
  return (
    <NotebookBg>
      <LogoFixed />
      <Caption frame={frame} size={70}>المشكلة إنك ما تعلّمت <HLy>الأساس.</HLy></Caption>
      <PhotoStage>
        <div style={{opacity: appear, transform: `scale(${scale})`}}>
          <TapedPhoto src="good.png" w={720} rot={2} />
        </div>
      </PhotoStage>
    </NotebookBg>
  );
};

// ===== م5: النص يظهر كلمة كلمة ثم يطلع البكج =====
const S5_WORDS: {t: string; hl?: boolean}[] = [
  {t: 'معسكر'}, {t: 'كانفا'}, {t: 'يبدأ'}, {t: 'معاك'}, {t: 'من'}, {t: 'الصفر', hl: true},
];
const WORD_STAGGER = 8;
const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pkg = pop(frame, fps, S5_WORDS.length * WORD_STAGGER + 4);
  return (
    <NotebookBg>
      <LogoFixed />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 54, paddingTop: 150}}>
        <div style={{direction: 'rtl', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 20, rowGap: 12, padding: '0 70px', boxSizing: 'border-box'}}>
          {S5_WORDS.map((w, i) => {
            const o = ease(frame, i * WORD_STAGGER, 9);
            const ty = interpolate(o, [0, 1], [28, 0]);
            return (
              <span key={i} style={{display: 'inline-block', opacity: o, transform: `translateY(${ty}px)`, fontSize: 74, fontWeight: 800, color: INK}}>
                {w.hl ? <HLy>{w.t}</HLy> : w.t}
              </span>
            );
          })}
        </div>
        <Img src={staticFile('package.png')} style={{width: 1040, opacity: pkg.opacity, transform: `translateY(${interpolate(pkg.s, [0, 1], [120, 0])}px)`}} />
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== م6: السعر + زر "سجّل الحين" =====
const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const price = pop(frame, fps, 6);
  const btn = pop(frame, fps, 22);
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  return (
    <NotebookBg>
      <LogoFixed />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50, paddingTop: 60}}>
        <div style={{fontSize: 78, fontWeight: 800, color: INK, opacity: ease(frame, 0, 8), ...RTL}}>كل هذا</div>
        <div style={{opacity: price.opacity, transform: `scale(${interpolate(price.s, [0, 1], [0.6, 1])})`, ...RTL}}>
          <span style={{fontSize: 150, fontWeight: 800}}><HLy>بـ ٨٩ ريال</HLy></span>
        </div>
        <div style={{fontSize: 60, fontWeight: 800, color: INK, opacity: ease(frame, 14, 8), ...RTL}}>بس، لا تطوّل</div>
        <div style={{border: `7px solid ${BLUE}`, color: BLUE, padding: '24px 70px', borderRadius: '30px 40px 28px 38px', fontSize: 84, fontWeight: 800, opacity: btn.opacity, transform: `scale(${btn.opacity < 1 ? interpolate(btn.s, [0, 1], [0.7, 1]) : pulse})`, ...RTL}}>
          سجّل الحين
        </div>
      </AbsoluteFill>
    </NotebookBg>
  );
};

// ===== تجميع الإعلان =====
export const FAHM_NB_DURATION = 535;

export const FahmNotebook: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: CREAM}}>
    <Sequence durationInFrames={60}><S1 /></Sequence>
    <Sequence from={60} durationInFrames={90}><S2 /></Sequence>
    <Sequence from={150} durationInFrames={75}><S3 /></Sequence>
    <Sequence from={225} durationInFrames={110}><S4 /></Sequence>
    <Sequence from={335} durationInFrames={110}><S5 /></Sequence>
    <Sequence from={445} durationInFrames={90}><S6 /></Sequence>
  </AbsoluteFill>
);
