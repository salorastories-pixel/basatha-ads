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

const Dot: React.FC<{style: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', width: 26, height: 26, borderRadius: '50%', backgroundColor: BLUE, ...style}} />
);

// هايلايتر وردي خلف كلمة
const HL: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg}) => (
  <span style={{backgroundColor: bg || PINK, color: INK, padding: '4px 22px', borderRadius: 14, display: 'inline-block'}}>{children}</span>
);

// إطار صورة بحواف دائرية وظل
const designImgStyle: React.CSSProperties = {
  width: 820, borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
};

// ===== مؤثر صوتي عند لقطة =====
const Sfx: React.FC<{from: number; file: string; volume?: number}> = ({from, file, volume = 1}) => (
  <Sequence from={from} durationInFrames={90} layout="none">
    <Audio src={staticFile(`audio/${file}`)} volume={volume} />
  </Sequence>
);

// ===== المشهد 1: عندك كانفا =====
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const img = pop(frame, fps, 6);
  const k = pop(frame, fps, 24);
  return (
    <Bg>
      <div style={{position: 'absolute', top: 140, width: '100%', textAlign: 'center', zIndex: 5}}>
        <span style={{fontSize: 104, fontWeight: 800, color: INK}}>عندك </span>
        <span style={{fontSize: 104, fontWeight: 800, opacity: k.opacity, transform: `scale(${interpolate(k.s, [0, 1], [0.6, 1])})`, display: 'inline-block'}}><HL>كانفا</HL></span>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img src={staticFile('bad.png')} style={{...designImgStyle, opacity: img.opacity, transform: `scale(${interpolate(img.s, [0, 1], [0.85, 1])})`, marginTop: 120}} />
      </AbsoluteFill>
    </Bg>
  );
};

// ===== المشهد 2: تصميمك عادي + أشّارات حمراء =====
const marks = [
  {x: 250, y: 560, label: 'غلط إملائي', dir: 'down'},
  {x: 560, y: 720, label: 'خط ممل', dir: 'up'},
  {x: 260, y: 980, label: 'توزيع غير متوازن', dir: 'up'},
  {x: 600, y: 430, label: 'ألوان باهتة', dir: 'down'},
];
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shake = frame > 70 ? Math.sin(frame * 1.5) * 4 : 0;
  return (
    <Bg>
      <div style={{position: 'absolute', top: 60, width: '100%', textAlign: 'center', zIndex: 5}}>
        <span style={{fontSize: 96, fontWeight: 800, color: INK}}>بس تصميمك </span>
        <span style={{fontSize: 110, fontWeight: 800, display: 'inline-block'}}><HL>عادي.</HL></span>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'relative', transform: `translateX(${shake}px)`, marginTop: 120}}>
          <Img src={staticFile('bad.png')} style={{...designImgStyle, width: 760}} />
          {marks.map((m, i) => {
            const p = pop(frame, fps, 12 + i * 12);
            return (
              <div key={i} style={{position: 'absolute', left: m.x, top: m.y, opacity: p.opacity, transform: `scale(${interpolate(p.s, [0, 1], [0.4, 1])})`}}>
                <div style={{width: 130, height: 80, border: `7px solid ${RED}`, borderRadius: '50%'}} />
                <div style={{position: 'absolute', [m.dir === 'down' ? 'top' : 'bottom']: -54, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', backgroundColor: RED, color: '#fff', fontSize: 30, fontWeight: 800, padding: '4px 16px', borderRadius: 10}}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Bg>
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
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', zIndex: 5, opacity: t.opacity}}>
        <span style={{fontSize: 100, fontWeight: 800, color: INK}}>شوف الفرق</span>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img src={staticFile('bad.png')} style={{...designImgStyle, width: 760, position: 'absolute', transform: `translateX(${badX}px) rotate(${interpolate(sw, [0, 1], [0, -8])}deg)`, marginTop: 120}} />
        <Img src={staticFile('good.png')} style={{...designImgStyle, width: 760, position: 'absolute', transform: `translateX(${goodX}px)`, marginTop: 120}} />
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
        <div style={{position: 'relative', overflow: 'hidden', borderRadius: 28, marginTop: 200, opacity: img.opacity}}>
          <Img src={staticFile('good.png')} style={{...designImgStyle, width: 720, display: 'block'}} />
          <div style={{position: 'absolute', top: 0, left: shineX, width: 160, height: '100%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.55), transparent)', transform: 'skewX(-18deg)'}} />
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', zIndex: 5}}>
        <div style={{fontSize: 78, fontWeight: 800, color: INK, opacity: l1.opacity}}>الفرق مو في كانفا…</div>
        <div style={{marginTop: 18, opacity: l2.opacity, transform: `scale(${interpolate(l2.s, [0, 1], [0.6, 1])})`}}>
          <span style={{fontSize: 92, fontWeight: 800}}>في <HL bg={YELLOW}>الفهم.</HL></span>
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
      <div style={{position: 'absolute', top: 130, width: '100%', textAlign: 'center', zIndex: 5, opacity: t.opacity}}>
        <span style={{fontSize: 80, fontWeight: 800, color: INK}}>بسطها يعلّمك </span>
        <span style={{fontSize: 92, fontWeight: 800, display: 'inline-block'}}><HL bg={YELLOW}>الأساس.</HL></span>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img src={staticFile('package.png')} style={{width: 1040, opacity: pkg.opacity, transform: `translateY(${interpolate(pkg.s, [0, 1], [220, 0])}px) scale(${interpolate(pkg.s, [0, 1], [0.9, 1])})`, marginTop: 160}} />
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
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50}}>
        <Img src={staticFile('logo.png')} style={{width: 560, opacity: logo.opacity, transform: `scale(${interpolate(logo.s, [0, 1], [0.7, 1])})`}} />
        <div style={{fontSize: 76, fontWeight: 800, color: INK, textAlign: 'center', opacity: t.opacity, lineHeight: 1.4}}>من الصفر…<br/>لتصميم <span style={{color: BLUE}}>يفرق.</span></div>
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
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50}}>
        <div style={{backgroundColor: YELLOW, borderRadius: 40, padding: '16px 70px', opacity: price.opacity, transform: `scale(${interpolate(price.s, [0, 1], [0.6, 1])})`}}>
          <span style={{fontSize: 150, fontWeight: 800, color: INK}}>89 ريال</span>
        </div>
        <div style={{backgroundColor: BLUE, color: '#fff', padding: '30px 80px', borderRadius: 70, fontSize: 90, fontWeight: 800, opacity: btn.opacity, transform: `scale(${btn.opacity < 1 ? interpolate(btn.s, [0, 1], [0.7, 1]) : pulse})`}}>
          سجّل الآن
        </div>
      </AbsoluteFill>
      <Dot style={{top: 240, right: 180}} />
      <Dot style={{bottom: 240, left: 180}} />
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
      {[60, 150, 210, 285, 360, 405].map((f) => (
        <Sfx key={`w${f}`} from={f} file="whoosh.wav" volume={0.5} />
      ))}
      {/* مشهد 1: ظهور الصورة + هايلايت "كانفا" */}
      <Sfx from={8} file="pop.wav" volume={0.6} />
      <Sfx from={30} file="ding.wav" volume={0.6} />
      {/* مشهد 2: علامات حمراء على الأخطاء */}
      {[72, 84, 96, 108].map((f) => (
        <Sfx key={`m${f}`} from={f} file="pop.wav" volume={0.55} />
      ))}
      {/* مشهد 4: كشف "الفهم" */}
      <Sfx from={240} file="ding.wav" volume={0.7} />
      {/* مشهد 5: نزول البكج */}
      <Sfx from={293} file="pop.wav" volume={0.75} />
      {/* مشهد 7: السعر + زر التسجيل */}
      <Sfx from={409} file="pop.wav" volume={0.7} />
      <Sfx from={427} file="success.wav" volume={0.9} />

      <Sequence durationInFrames={60}><S1 /></Sequence>
      <Sequence from={60} durationInFrames={90}><S2 /></Sequence>
      <Sequence from={150} durationInFrames={60}><S3 /></Sequence>
      <Sequence from={210} durationInFrames={75}><S4 /></Sequence>
      <Sequence from={285} durationInFrames={75}><S5 /></Sequence>
      <Sequence from={360} durationInFrames={45}><S6 /></Sequence>
      <Sequence from={405} durationInFrames={90}><S7 /></Sequence>
    </AbsoluteFill>
  );
};
