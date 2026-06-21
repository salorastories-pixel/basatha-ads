import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ===== هوية بسطها =====
const INK = '#1B1B1B';
const YELLOW = '#FFC400';
const SALMON = '#F4869B';
const BLUE = '#2F6BE4';
const PURPLE = '#6D28D9';
const RED = '#E11D2A';
const GREEN = '#22C55E';
const WHITE = '#FFFFFF';
const FONT = 'OYMandisa, "Segoe UI", Tahoma, sans-serif';
const SHADOW = '0 16px 38px rgba(20,20,40,0.16)';

const FontFace = () => (
  <style>{`@font-face{font-family:'OYMandisa';src:url('${staticFile(
    'OYMandisa.ttf',
  )}') format('truetype');font-weight:normal;font-style:normal;}`}</style>
);

// ===== مساعد الحركة (ظهور بارتداد) =====
const animIn = (frame: number, fps: number, delay = 0) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 170, mass: 0.8},
  });
  const o = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {
    o,
    s,
    sc: (from: number) => interpolate(s, [0, 1], [from, 1]),
    ty: (from: number) => interpolate(s, [0, 1], [from, 0]),
    tx: (from: number) => interpolate(s, [0, 1], [from, 0]),
  };
};

// ===== أيقونات SVG =====
const Svg: React.FC<{size: number; color: string; children: React.ReactNode}> = ({
  size,
  color,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const CartIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="21" r="1.4" fill={p.color} stroke="none" />
    <circle cx="19" cy="21" r="1.4" fill={p.color} stroke="none" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </Svg>
);
const PlayIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polygon points="10.5,8 15,10.5 10.5,13" fill={p.color} stroke="none" />
  </Svg>
);
const ClockIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12,7 12,12 16,14" />
  </Svg>
);
const ChatIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
  </Svg>
);
const UsersIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.9" />
    <path d="M16 3.1a4 4 0 0 1 0 7.7" />
  </Svg>
);
const BookIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Svg>
);
const CheckBadge: React.FC<{size: number}> = ({size}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: WHITE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
    }}
  >
    <span style={{color: GREEN, fontSize: size * 0.62, fontWeight: 800, lineHeight: 1}}>
      &#10003;
    </span>
  </div>
);

// ===== خلفية حيّة: أشكال عائمة خفيفة =====
const FloatingShapes: React.FC = () => {
  const frame = useCurrentFrame();
  const shapes = [
    {x: '8%', y: '10%', d: 120, c: YELLOW, sp: 0.6, amp: 22, op: 0.1},
    {x: '85%', y: '14%', d: 70, c: BLUE, sp: 0.9, amp: 28, op: 0.09},
    {x: '12%', y: '84%', d: 96, c: SALMON, sp: 0.7, amp: 26, op: 0.1},
    {x: '88%', y: '80%', d: 52, c: PURPLE, sp: 1.1, amp: 20, op: 0.08},
    {x: '92%', y: '48%', d: 34, c: YELLOW, sp: 1.0, amp: 24, op: 0.09},
    {x: '5%', y: '50%', d: 40, c: BLUE, sp: 0.85, amp: 22, op: 0.08},
  ];
  return (
    <AbsoluteFill>
      {shapes.map((sh, i) => {
        const dy = Math.sin((frame * sh.sp) / 22 + i) * sh.amp;
        const dx = Math.cos((frame * sh.sp) / 26 + i) * sh.amp * 0.5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: sh.x,
              top: sh.y,
              width: sh.d,
              height: sh.d,
              borderRadius: '50%',
              backgroundColor: sh.c,
              opacity: sh.op,
              transform: `translate(${dx}px, ${dy}px)`,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ===== مؤثر صوتي عند لقطة =====
const Sfx: React.FC<{from: number; file: string; volume?: number}> = ({
  from,
  file,
  volume = 1,
}) => (
  <Sequence from={from} durationInFrames={90} layout="none">
    <Audio src={staticFile(`audio/${file}`)} volume={volume} />
  </Sequence>
);

// ===== توقيت ظهور العناصر (frames) =====
const D = {
  logo: 0,
  title: 8,
  price: 22,
  feat: [34, 52, 70],
  bottom: [86, 98, 110],
  swipe: 124,
};

// ===== الشعار =====
const LogoTop: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = animIn(frame, fps, D.logo);
  return (
    <div style={{display: 'flex', justifyContent: 'center', opacity: a.o}}>
      <Img
        src={staticFile('logo.png')}
        style={{
          height: 170,
          transform: `scale(${a.sc(0.7)}) translateY(${a.ty(-30)}px)`,
          filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.14))',
        }}
      />
    </div>
  );
};

// ===== بانر العنوان =====
const TitleBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = animIn(frame, fps, D.title);
  const shineX = interpolate(frame % 110, [0, 110], [-260, 1000]);
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(95deg, ${PURPLE}, #2563EB)`,
        borderRadius: 38,
        padding: '34px 40px',
        textAlign: 'center',
        boxShadow: '0 20px 45px rgba(76,29,180,0.35)',
        opacity: a.o,
        transform: `scale(${a.sc(0.85)})`,
      }}
    >
      <span style={{fontSize: 108, fontWeight: 800, color: WHITE, lineHeight: 1}}>
        معسكر كانفا
      </span>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: shineX,
          width: 120,
          height: '100%',
          background:
            'linear-gradient(100deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: 'skewX(-18deg)',
        }}
      />
    </div>
  );
};

// ===== كرت السعر (أحمر، طويل، يسار) =====
const PriceCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = animIn(frame, fps, D.price);
  const pulse = 1 + Math.sin(frame / 12) * 0.02;
  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        background: `linear-gradient(180deg, #EE2330, ${RED})`,
        borderRadius: 38,
        padding: '34px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 22px 50px rgba(225,29,42,0.4)',
        opacity: a.o,
        transform: `translateX(${a.tx(-180)}px) scale(${frame > 50 ? pulse : a.sc(0.85)})`,
      }}
    >
      <CartIcon size={78} color={WHITE} />
      <div style={{textAlign: 'center', color: WHITE}}>
        <div style={{fontSize: 48, fontWeight: 800}}>السعر</div>
        <div style={{fontSize: 176, fontWeight: 800, lineHeight: 0.95}}>89</div>
        <div style={{fontSize: 56, fontWeight: 800, marginTop: -4}}>ريال</div>
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.92)',
          textDecoration: 'line-through',
          textDecorationThickness: 3,
        }}
      >
        بدل 99 ريال
      </div>
    </div>
  );
};

// ===== بلوك ميزة (أيقونة | فاصل | نص) =====
const FeatureBlock: React.FC<{
  bg: string;
  textColor: string;
  divider: string;
  icon: React.ReactNode;
  text: string;
  delay: number;
}> = ({bg, textColor, divider, icon, text, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = animIn(frame, fps, delay);
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        background: bg,
        borderRadius: 32,
        padding: '20px 30px',
        boxShadow: SHADOW,
        opacity: a.o,
        transform: `translateX(${a.tx(200)}px) scale(${a.sc(0.92)})`,
      }}
    >
      <div style={{flexShrink: 0, display: 'flex', alignItems: 'center'}}>{icon}</div>
      <div style={{width: 3, height: 70, background: divider, borderRadius: 3, flexShrink: 0}} />
      <div style={{flex: 1, textAlign: 'center'}}>
        <span style={{fontSize: 58, fontWeight: 800, color: textColor, lineHeight: 1.18}}>
          {text}
        </span>
      </div>
    </div>
  );
};

// ===== الصف الرئيسي: مميزات (يمين) + سعر (يسار) =====
const MainRow: React.FC = () => (
  <div style={{display: 'flex', flexDirection: 'row', gap: 24, width: '100%', alignItems: 'stretch'}}>
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 20}}>
      <FeatureBlock
        delay={D.feat[0]}
        bg={YELLOW}
        textColor={INK}
        divider="rgba(0,0,0,0.18)"
        icon={<PlayIcon size={58} color={INK} />}
        text="دورة مسجلة"
      />
      <FeatureBlock
        delay={D.feat[1]}
        bg={PURPLE}
        textColor={WHITE}
        divider="rgba(255,255,255,0.45)"
        icon={<ClockIcon size={58} color={WHITE} />}
        text="أكثر من 14 ساعة تدريبية"
      />
      <FeatureBlock
        delay={D.feat[2]}
        bg={SALMON}
        textColor={WHITE}
        divider="rgba(255,255,255,0.55)"
        icon={<CheckBadge size={64} />}
        text="تبقى معاك مدى الحياة"
      />
    </div>
    <PriceCard />
  </div>
);

// ===== بلوك سفلي (أيقونة فوق + نص) =====
const BottomBlock: React.FC<{icon: React.ReactNode; text: string; delay: number}> = ({
  icon,
  text,
  delay,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = animIn(frame, fps, delay);
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        background: BLUE,
        borderRadius: 30,
        padding: '26px 18px',
        boxShadow: '0 16px 36px rgba(47,107,228,0.32)',
        opacity: a.o,
        transform: `translateY(${a.ty(40)}px) scale(${a.sc(0.8)})`,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <span style={{fontSize: 42, fontWeight: 800, color: WHITE, textAlign: 'center', lineHeight: 1.25}}>
        {text}
      </span>
    </div>
  );
};

const BottomRow: React.FC = () => (
  <div style={{display: 'flex', flexDirection: 'row', gap: 20, width: '100%', alignItems: 'stretch'}}>
    <BottomBlock
      delay={D.bottom[0]}
      icon={<ChatIcon size={48} color={WHITE} />}
      text={'دعم خاص للمشتركين\nعبر واتساب'}
    />
    <BottomBlock
      delay={D.bottom[1]}
      icon={<UsersIcon size={48} color={WHITE} />}
      text={'قروب خاص\nبالمشتركين'}
    />
    <BottomBlock
      delay={D.bottom[2]}
      icon={<BookIcon size={48} color={WHITE} />}
      text={'6 كتيبات PDF\nمجاناً'}
    />
  </div>
);

// ===== زر إسحب =====
const SwipeBtn: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = animIn(frame, fps, D.swipe);
  const bob = Math.sin(frame / 9) * 8;
  return (
    <div style={{display: 'flex', justifyContent: 'center', opacity: a.o}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: WHITE,
          borderRadius: 50,
          padding: '16px 40px',
          boxShadow: SHADOW,
          transform: `scale(${a.sc(0.8)})`,
        }}
      >
        <span style={{fontSize: 46, fontWeight: 800, color: BLUE}}>إسحب</span>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: BLUE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateX(${bob}px)`,
          }}
        >
          <Svg size={30} color={WHITE}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </Svg>
        </div>
      </div>
    </div>
  );
};

// ===== شريط تقدّم =====
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const w = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 12,
        width: `${w}%`,
        background: `linear-gradient(90deg, ${PURPLE}, ${BLUE}, ${YELLOW})`,
        borderTopRightRadius: 8,
      }}
    />
  );
};

// ===== البوستر المتحرّك =====
const Poster: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame / 45) * 0.006;
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        transform: `scale(${breathe})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 30,
          width: '100%',
          whiteSpace: 'pre-line',
        }}
      >
        <LogoTop />
        <TitleBanner />
        <MainRow />
        <BottomRow />
        <SwipeBtn />
      </div>
    </AbsoluteFill>
  );
};

// ===== تجميع الإعلان =====
const DawraAd: React.FC = () => {
  return (
    <AbsoluteFill style={{fontFamily: FONT, direction: 'rtl'}}>
      <FontFace />
      {/* خلفية ناعمة */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 28%, #FFFFFF, #E7EAEF 72%)',
        }}
      />
      <FloatingShapes />

      {/* ===== الصوت ===== */}
      <Audio src={staticFile('audio/music.wav')} volume={0.42} />
      <Sfx from={D.logo} file="whoosh.wav" volume={0.5} />
      <Sfx from={D.title} file="pop.wav" volume={0.7} />
      <Sfx from={D.price} file="ding.wav" volume={0.75} />
      {D.feat.map((f) => (
        <Sfx key={`f${f}`} from={f} file="pop.wav" volume={0.7} />
      ))}
      {D.bottom.map((f) => (
        <Sfx key={`b${f}`} from={f} file="pop.wav" volume={0.6} />
      ))}
      <Sfx from={D.swipe} file="success.wav" volume={0.9} />

      <Poster />
      <ProgressBar />
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
