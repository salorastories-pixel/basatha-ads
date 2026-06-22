import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ===== هوية بسطها =====
const CREAM = '#F6EBDB';
const INK = '#191818';
const YELLOW = '#FED003';
const PINK = '#FDA6C9';
const BLUE = '#0AA0FD';
const RED = '#FF3B30';
const FONT = 'OYMandisa, "Segoe UI", Tahoma, sans-serif';

const FontFace = () => (
  <style>{`@font-face{font-family:'OYMandisa';src:url('${staticFile('OYMandisa.ttf')}') format('truetype');font-weight:normal;font-style:normal;}`}</style>
);

// خلفية موحّدة + دعم RTL
const Bg: React.FC<{children: React.ReactNode; color?: string}> = ({children, color}) => (
  <AbsoluteFill style={{backgroundColor: color || CREAM, fontFamily: FONT, direction: 'rtl'}}>
    <FontFace />
    {children}
  </AbsoluteFill>
);

const pop = (frame: number, fps: number, delay: number) => {
  const s = spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 200, mass: 0.7}});
  const opacity = interpolate(frame - delay, [0, 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {opacity, s};
};

// هايلايتر وردي خلف كلمة
const HL: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg}) => (
  <span style={{backgroundColor: bg || PINK, color: INK, padding: '4px 22px', borderRadius: 14, display: 'inline-block'}}>{children}</span>
);

// إطار صورة بحواف دائرية وظل
const designImgStyle: React.CSSProperties = {
  width: 940, borderRadius: 30, boxShadow: '0 24px 70px rgba(0,0,0,0.20)', display: 'block',
};

// نص علوي يبدأ ~8% من الأعلى
const TOP = 150;

// ===== مؤثر صوتي عند لقطة =====
const Sfx: React.FC<{from: number; file: string; volume?: number}> = ({from, file, volume = 1}) => (
  <Sequence from={from} durationInFrames={90} layout="none">
    <Audio src={staticFile(`audio/${file}`)} volume={volume} />
  </Sequence>
);

// ===== غلاف انتقال ناعم بين المشاهد (fade + blur) =====
const SceneWrap: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, dur - 12, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blur = interpolate(frame, [0, 12, dur - 12, dur], [9, 0, 0, 9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>;
};

// ===== المشهد 1: عندك كانفا =====
// ===== المشهد 1+2: عندك كانفا ← تصميمك عادي (صورة ثابتة، يتبدّل النص ثم تظهر الدوائر) =====
const marks = [
  {type: 'arrow', x: 22, y: 29, label: 'فراغ كبير فاضي', labelPos: 'top'},
  {type: 'circle', x: 16, y: 54, w: 232, h: 94, label: 'غلط إملائي', labelPos: 'top'},
  {type: 'circle', x: 18, y: 67, w: 248, h: 140, label: 'توزيع غير متوازن', labelPos: 'bottom'},
];
const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const img = pop(frame, fps, 6);
  const k = pop(frame, fps, 24);
  const SWAP = 62;
  // تبديل النص فقط (cross-fade) — الصورة ما تتغيّر
  const t1 = interpolate(frame, [SWAP - 9, SWAP], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const t2 = interpolate(frame, [SWAP, SWAP + 11], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const t2y = interpolate(frame, [SWAP, SWAP + 11], [22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // تلاشي الخروج فقط للانتقال للمشهد التالي
  const exit = interpolate(frame, [138, 150], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: exit}}>
      <Bg>
        {/* النص: "عندك كانفا" ثم "بس تصميمك عادي" بنفس الموضع */}
        <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', zIndex: 5, opacity: t1}}>
          <span style={{fontSize: 110, fontWeight: 800, color: INK}}>عندك </span>
          <span style={{fontSize: 110, fontWeight: 800, opacity: k.opacity, transform: `scale(${interpolate(k.s, [0, 1], [0.6, 1])})`, display: 'inline-block'}}><HL>كانفا</HL></span>
        </div>
        <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', zIndex: 5, opacity: t2, transform: `translateY(${t2y}px)`}}>
          <span style={{fontSize: 100, fontWeight: 800, color: INK}}>بس تصميمك </span>
          <span style={{fontSize: 112, fontWeight: 800, display: 'inline-block'}}><HL>عادي.</HL></span>
        </div>
        {/* الصورة ثابتة طوال المشهد */}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{position: 'relative', width: 940}}>
            <Img src={staticFile('bad.png')} style={{...designImgStyle, width: '100%', opacity: img.opacity, transform: `scale(${interpolate(img.s, [0, 1], [0.88, 1])})`}} />
            {/* الدوائر تظهر بعد تبديل النص */}
            {marks.map((m, i) => {
              const p = pop(frame, fps, SWAP + 16 + i * 14);
              const sc = interpolate(p.s, [0, 1], [0.5, 1]);
              return (
                <div key={i} style={{position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, transform: `translate(-50%, -50%) scale(${sc})`, opacity: p.opacity}}>
                  {m.type === 'circle' ? (
                    <div style={{width: m.w, height: m.h, border: `8px solid ${RED}`, borderRadius: '50%'}} />
                  ) : (
                    <svg width="130" height="130" viewBox="0 0 100 100">
                      <path d="M84 84 L34 32" stroke={RED} strokeWidth="9" strokeLinecap="round" fill="none" />
                      <path d="M34 32 L58 40 M34 32 L42 56" stroke={RED} strokeWidth="9" strokeLinecap="round" fill="none" />
                    </svg>
                  )}
                  <div style={{position: 'absolute', left: '50%', [m.labelPos === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 12px)', transform: 'translateX(-50%)', whiteSpace: 'nowrap', backgroundColor: RED, color: '#fff', fontSize: 38, fontWeight: 800, padding: '6px 20px', borderRadius: 12, boxShadow: '0 6px 16px rgba(0,0,0,0.2)'}}>{m.label}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Bg>
    </AbsoluteFill>
  );
};

// ===== المشهد 3: انتقال swipe (العادي يطلع، الحلو يدخل) =====
const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sw = spring({frame: frame - 6, fps, config: {damping: 18, stiffness: 90}});
  const badX = interpolate(sw, [0, 1], [0, -1300]);
  const goodX = interpolate(sw, [0, 1], [1300, 0]);
  const t = pop(frame, fps, 30);
  return (
    <Bg>
      <div style={{position: 'absolute', top: TOP, width: '100%', textAlign: 'center', zIndex: 5, opacity: t.opacity}}>
        <span style={{fontSize: 104, fontWeight: 800, color: INK}}>شوف الفرق</span>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img src={staticFile('bad.png')} style={{...designImgStyle, position: 'absolute', transform: `translateX(${badX}px) rotate(${interpolate(sw, [0, 1], [0, -8])}deg)`}} />
        <Img src={staticFile('good.png')} style={{...designImgStyle, position: 'absolute', transform: `translateX(${goodX}px)`}} />
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشهد 4: الفرق في الفهم + لمعة =====
const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const img = pop(frame, fps, 0);
  const l1 = pop(frame, fps, 14);
  const l2 = pop(frame, fps, 30);
  const shineX = interpolate(frame, [20, 60], [-400, 1200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'relative', overflow: 'hidden', borderRadius: 30, opacity: img.opacity, boxShadow: '0 24px 70px rgba(0,0,0,0.20)', marginTop: 120}}>
          <Img src={staticFile('good.png')} style={{width: 900, display: 'block'}} />
          <div style={{position: 'absolute', top: 0, left: shineX, width: 170, height: '100%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.55), transparent)', transform: 'skewX(-18deg)'}} />
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: TOP, width: '100%', textAlign: 'center', zIndex: 5}}>
        <div style={{fontSize: 82, fontWeight: 800, color: INK, opacity: l1.opacity}}>الفرق مو في كانفا…</div>
        <div style={{marginTop: 20, opacity: l2.opacity, transform: `scale(${interpolate(l2.s, [0, 1], [0.6, 1])})`}}>
          <span style={{fontSize: 96, fontWeight: 800}}>في <HL bg={YELLOW}>الفهم.</HL></span>
        </div>
      </div>
    </Bg>
  );
};

// ===== المشهد 5: البكج + الأساس =====
const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pkg = pop(frame, fps, 8);
  const t = pop(frame, fps, 0);
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40}}>
        <div style={{textAlign: 'center', opacity: t.opacity, transform: `translateY(${interpolate(t.s, [0, 1], [-30, 0])}px)`}}>
          <span style={{fontSize: 84, fontWeight: 800, color: INK}}>بسطها يعلّمك </span>
          <span style={{fontSize: 96, fontWeight: 800, display: 'inline-block'}}><HL bg={YELLOW}>الأساس.</HL></span>
        </div>
        <Img src={staticFile('package.png')} style={{width: 1060, opacity: pkg.opacity, transform: `translateY(${interpolate(pkg.s, [0, 1], [180, 0])}px) scale(${interpolate(pkg.s, [0, 1], [0.92, 1])})`}} />
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشهد 6: من الصفر لتصميم يفرق + شعار =====
const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = pop(frame, fps, 0);
  const t = pop(frame, fps, 14);
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 64}}>
        <Img src={staticFile('logo.png')} style={{width: 620, opacity: logo.opacity, transform: `scale(${interpolate(logo.s, [0, 1], [0.7, 1])})`}} />
        <div style={{fontSize: 84, fontWeight: 800, color: INK, textAlign: 'center', opacity: t.opacity, lineHeight: 1.4}}>من الصفر…<br/>لتصميم <span style={{color: BLUE}}>يفرق.</span></div>
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشهد 7: العرض + CTA =====
const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const price = pop(frame, fps, 4);
  const btn = pop(frame, fps, 20);
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  return (
    <Bg>
      {/* نقاط الهوية ككتل تصميمية كبيرة */}
      <div style={{position: 'absolute', top: 210, right: 150, width: 90, height: 90, borderRadius: '50%', backgroundColor: YELLOW}} />
      <div style={{position: 'absolute', bottom: 220, left: 150, width: 90, height: 90, borderRadius: '50%', backgroundColor: PINK}} />
      <div style={{position: 'absolute', top: 360, left: 120, width: 54, height: 54, borderRadius: '50%', backgroundColor: BLUE}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 70}}>
        <div style={{backgroundColor: YELLOW, borderRadius: 44, padding: '20px 84px', opacity: price.opacity, transform: `scale(${interpolate(price.s, [0, 1], [0.6, 1])})`, boxShadow: '0 18px 45px rgba(0,0,0,0.14)'}}>
          <span style={{fontSize: 176, fontWeight: 800, color: INK}}>89 ريال</span>
        </div>
        <div style={{backgroundColor: BLUE, color: '#fff', padding: '34px 92px', borderRadius: 80, fontSize: 100, fontWeight: 800, opacity: btn.opacity, transform: `scale(${btn.opacity < 1 ? interpolate(btn.s, [0, 1], [0.7, 1]) : pulse})`, boxShadow: '0 20px 50px rgba(10,160,253,0.4)'}}>
          سجّل الآن
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

// ===== تجميع الإعلان =====
export const FAHM_DURATION = 495;

export const FahmAd: React.FC = () => {
  const frame = useCurrentFrame();
  const musicVol = interpolate(
    frame,
    [0, 10, FAHM_DURATION - 18, FAHM_DURATION],
    [0, 0.42, 0.42, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return (
    <AbsoluteFill style={{backgroundColor: CREAM, direction: 'rtl'}}>
      {/* ===== الصوت ===== */}
      <Audio src={staticFile('audio/music.wav')} volume={musicVol} />
      {/* انتقالات بين المشاهد */}
      {[150, 210, 285, 360, 405].map((f) => (
        <Sfx key={`w${f}`} from={f} file="whoosh.wav" volume={0.5} />
      ))}
      {/* مشهد 1+2: ظهور الصورة + هايلايت "كانفا" */}
      <Sfx from={8} file="pop.wav" volume={0.6} />
      <Sfx from={30} file="ding.wav" volume={0.6} />
      {/* تبديل النص لـ "تصميمك عادي" */}
      <Sfx from={62} file="whoosh.wav" volume={0.35} />
      {/* ظهور الدوائر الحمراء على الأخطاء */}
      {[78, 92, 106].map((f) => (
        <Sfx key={`m${f}`} from={f} file="pop.wav" volume={0.55} />
      ))}
      {/* مشهد 4: كشف "الفهم" */}
      <Sfx from={240} file="ding.wav" volume={0.7} />
      {/* مشهد 5: نزول البكج */}
      <Sfx from={293} file="pop.wav" volume={0.75} />
      {/* مشهد 7: السعر + زر التسجيل */}
      <Sfx from={409} file="pop.wav" volume={0.7} />
      <Sfx from={427} file="success.wav" volume={0.9} />

      <Sequence durationInFrames={150}><S12 /></Sequence>
      <Sequence from={150} durationInFrames={60}><SceneWrap dur={60}><S3 /></SceneWrap></Sequence>
      <Sequence from={210} durationInFrames={75}><SceneWrap dur={75}><S4 /></SceneWrap></Sequence>
      <Sequence from={285} durationInFrames={75}><SceneWrap dur={75}><S5 /></SceneWrap></Sequence>
      <Sequence from={360} durationInFrames={45}><SceneWrap dur={45}><S6 /></SceneWrap></Sequence>
      <Sequence from={405} durationInFrames={90}><SceneWrap dur={90}><S7 /></SceneWrap></Sequence>
    </AbsoluteFill>
  );
};
