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

// ===== سيف زون الريلز (هوامش واجهة إنستقرام) =====
const SAFE = {top: 250, bottom: 385, left: 70, right: 193};
const SAFE_W = 1080 - SAFE.left - SAFE.right;
const SAFE_H = 1920 - SAFE.top - SAFE.bottom;
const SAFE_FIT = Math.min(SAFE_W / 1080, SAFE_H / 1920);
const SAFE_X = SAFE.left + (SAFE_W - 1080 * SAFE_FIT) / 2;
const SAFE_Y = SAFE.top + (SAFE_H - 1920 * SAFE_FIT) / 2;

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
  // تتلاشى النص والدوائر فقط قبل السحب — الصورة تبقى ثابتة (بدون وميض)
  const fadeOut = interpolate(frame, [134, 148], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Bg>
        {/* النص: "عندك كانفا" ثم "بس تصميمك عادي" بنفس الموضع */}
        <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', zIndex: 5, opacity: t1}}>
          <span style={{fontSize: 110, fontWeight: 800, color: INK}}>عندك </span>
          <span style={{fontSize: 110, fontWeight: 800, opacity: k.opacity, transform: `scale(${interpolate(k.s, [0, 1], [0.6, 1])})`, display: 'inline-block'}}><HL>كانفا</HL></span>
        </div>
        <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', zIndex: 5, opacity: t2 * fadeOut, transform: `translateY(${t2y}px)`}}>
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
                <div key={i} style={{position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, transform: `translate(-50%, -50%) scale(${sc})`, opacity: p.opacity * fadeOut}}>
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
// ===== المشهد 3+4: شوف الفرق ← الفهم (الحلو يثبت، يتبدّل النص ثم اللمعة) =====
const S34: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sw = spring({frame: frame - 6, fps, config: {damping: 18, stiffness: 90}});
  const badX = interpolate(sw, [0, 1], [0, -1300]);
  const goodX = interpolate(sw, [0, 1], [1300, 0]);
  const SWAP = 58;
  // النص: "شوف الفرق" ثم "الفرق في الفهم" بنفس الموضع
  const t1 = interpolate(frame, [2, 12, SWAP - 9, SWAP], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const l1 = interpolate(frame, [SWAP, SWAP + 11], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const l2 = pop(frame, fps, SWAP + 14);
  // اللمعة بعد تبديل النص — الصورة ثابتة
  const shineX = interpolate(frame, [SWAP + 30, SWAP + 70], [-400, 1200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // التصميم السيئ يبدأ ثابتاً (نفس نهاية S12) ثم ينسحب — تلاشي الخروج فقط
  const vis = interpolate(frame, [123, 135], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: vis}}>
      <Bg>
        {/* النص */}
        <div style={{position: 'absolute', top: TOP, width: '100%', textAlign: 'center', zIndex: 5, opacity: t1}}>
          <span style={{fontSize: 104, fontWeight: 800, color: INK}}>شوف الفرق</span>
        </div>
        <div style={{position: 'absolute', top: TOP, width: '100%', textAlign: 'center', zIndex: 5, opacity: l1}}>
          <div style={{fontSize: 82, fontWeight: 800, color: INK}}>الفرق مو في كانفا…</div>
          <div style={{marginTop: 20, opacity: l2.opacity, transform: `scale(${interpolate(l2.s, [0, 1], [0.6, 1])})`}}>
            <span style={{fontSize: 96, fontWeight: 800}}>في <HL bg={YELLOW}>الفهم.</HL></span>
          </div>
        </div>
        {/* الصور: العادي يطلع، الحلو يدخل ويثبت مع اللمعة */}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <Img src={staticFile('bad.png')} style={{...designImgStyle, position: 'absolute', transform: `translateX(${badX}px) rotate(${interpolate(sw, [0, 1], [0, -8])}deg)`}} />
          <div style={{position: 'absolute', overflow: 'hidden', width: 940, borderRadius: 30, boxShadow: '0 24px 70px rgba(0,0,0,0.20)', transform: `translateX(${goodX}px)`}}>
            <Img src={staticFile('good.png')} style={{width: '100%', display: 'block'}} />
            <div style={{position: 'absolute', top: 0, left: shineX, width: 170, height: '100%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.55), transparent)', transform: 'skewX(-18deg)'}} />
          </div>
        </AbsoluteFill>
      </Bg>
    </AbsoluteFill>
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
          <span style={{fontSize: 78, fontWeight: 800, color: INK}}>معسكر كانفا يعلّمك </span>
          <span style={{fontSize: 90, fontWeight: 800, display: 'inline-block'}}><HL bg={YELLOW}>الأساس.</HL></span>
        </div>
        <Img src={staticFile('package.png')} style={{width: 1060, opacity: pkg.opacity, transform: `translateY(${interpolate(pkg.s, [0, 1], [180, 0])}px) scale(${interpolate(pkg.s, [0, 1], [0.92, 1])})`}} />
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشهد 6: من الصفر لتصميم يفرق =====
const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = pop(frame, fps, 4);
  return (
    <Bg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{fontSize: 104, fontWeight: 800, color: INK, textAlign: 'center', opacity: t.opacity, transform: `scale(${interpolate(t.s, [0, 1], [0.8, 1])})`, lineHeight: 1.45}}>من الصفر…<br/>لتصميم <span style={{color: BLUE}}>يفرق.</span></div>
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
export const FAHM_DURATION = 540;

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
      {[150, 285, 360, 450].map((f) => (
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
      {/* مشهد 3+4: تبديل النص لـ "الفهم" ثم اللمعة */}
      <Sfx from={208} file="ding.wav" volume={0.7} />
      <Sfx from={238} file="whoosh.wav" volume={0.3} />
      {/* مشهد 5: نزول البكج */}
      <Sfx from={293} file="pop.wav" volume={0.75} />
      {/* مشهد 7: السعر + زر التسجيل */}
      <Sfx from={454} file="pop.wav" volume={0.7} />
      <Sfx from={472} file="success.wav" volume={0.9} />

      {/* كل المحتوى محصور داخل السيف زون */}
      <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE_FIT})`}}>
        <Sequence durationInFrames={150}><S12 /></Sequence>
        <Sequence from={150} durationInFrames={135}><S34 /></Sequence>
        <Sequence from={285} durationInFrames={75}><SceneWrap dur={75}><S5 /></SceneWrap></Sequence>
        <Sequence from={360} durationInFrames={90}><SceneWrap dur={90}><S6 /></SceneWrap></Sequence>
        <Sequence from={450} durationInFrames={90}><SceneWrap dur={90}><S7 /></SceneWrap></Sequence>
      </div>
    </AbsoluteFill>
  );
};
