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
  Easing,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ===== هوية بسطها الرسمية =====
const CREAM = '#F6EBDB';
const INK = '#191818';
const YELLOW = '#FED003';
const PINK = '#FDA6C9';
const BLUE = '#0AA0FD';
const WHITE = '#FFFFFF';
const FONT = 'OYMandisa, "Segoe UI", Tahoma, sans-serif';

const SHADOW_SOFT = '0 18px 45px rgba(25,24,24,0.14)';
const SHADOW_DEEP = '0 26px 60px rgba(25,24,24,0.22)';

// تحميل خط بسطها (الملف في مجلد public)
const FontFace = () => (
  <style>{`@font-face{font-family:'OYMandisa';src:url('${staticFile(
    'OYMandisa.ttf',
  )}') format('truetype');font-weight:normal;font-style:normal;}`}</style>
);

// ===== مساعد الحركة (ظهور بارتداد طبيعي) =====
const animIn = (frame: number, fps: number, delay = 0) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: {damping: 13, stiffness: 170, mass: 0.8},
  });
  const o = interpolate(frame - delay, [0, 7], [0, 1], {
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

// ===== خلفية حيّة: أشكال عائمة متحركة باستمرار =====
const FloatingShapes: React.FC = () => {
  const frame = useCurrentFrame();
  const shapes = [
    {x: '8%', y: '12%', d: 120, c: YELLOW, sp: 0.6, amp: 24, op: 0.16},
    {x: '82%', y: '16%', d: 70, c: BLUE, sp: 0.9, amp: 30, op: 0.14},
    {x: '14%', y: '80%', d: 96, c: PINK, sp: 0.7, amp: 28, op: 0.16},
    {x: '86%', y: '78%', d: 52, c: BLUE, sp: 1.1, amp: 22, op: 0.12},
    {x: '50%', y: '6%', d: 40, c: PINK, sp: 0.8, amp: 20, op: 0.1},
    {x: '92%', y: '48%', d: 30, c: YELLOW, sp: 1.0, amp: 26, op: 0.14},
    {x: '6%', y: '50%', d: 36, c: BLUE, sp: 0.85, amp: 24, op: 0.12},
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

// ===== مؤثر صوتي مؤقّت عند لقطة معيّنة =====
const Sfx: React.FC<{from: number; file: string; volume?: number}> = ({
  from,
  file,
  volume = 1,
}) => (
  <Sequence from={from} durationInFrames={90} layout="none">
    <Audio src={staticFile(`audio/${file}`)} volume={volume} />
  </Sequence>
);

// ===== غلاف المشهد: دخول/خروج ناعم بدل القطع الحاد =====
const SceneWrap: React.FC<{dur: number; children: React.ReactNode}> = ({
  dur,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 9, dur - 9, dur],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const blur = interpolate(
    frame,
    [0, 9, dur - 9, dur],
    [10, 0, 0, 10],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return (
    <AbsoluteFill style={{opacity, filter: `blur(${blur}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

// إطار التوسيط المشترك
const Center: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

// ===== المشهد 1: عدّاد السعر =====
const ScenePrice: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pre = animIn(frame, fps, 0);
  const box = animIn(frame, fps, 6);
  const q = animIn(frame, fps, 30);
  // العدّاد يصعد من 0 إلى 89
  const price = Math.round(
    interpolate(frame, [8, 36], [0, 89], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }),
  );
  const pulse = 1 + Math.sin(frame / 7) * 0.02;
  return (
    <Center style={{gap: 30}}>
      <span
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: INK,
          opacity: pre.o,
          transform: `scale(${pre.sc(0.7)})`,
        }}
      >
        بـ
      </span>
      <div
        style={{
          position: 'relative',
          backgroundColor: YELLOW,
          borderRadius: 48,
          padding: '24px 96px',
          opacity: box.o,
          transform: `scale(${frame < 38 ? box.sc(0.55) : pulse})`,
          boxShadow: SHADOW_DEEP,
        }}
      >
        <span
          style={{
            fontSize: 300,
            fontWeight: 800,
            color: INK,
            lineHeight: 1,
            direction: 'ltr',
            display: 'block',
          }}
        >
          {price}
        </span>
      </div>
      <span
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: INK,
          opacity: q.o,
          transform: `scale(${q.sc(0.7)})`,
        }}
      >
        ريال؟
      </span>
    </Center>
  );
};

// ===== المشهد 2: عنوان "تحصل على:" =====
const SceneHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = animIn(frame, fps, 0);
  return (
    <Center style={{justifyContent: 'flex-start', paddingTop: 360}}>
      <div
        style={{
          backgroundColor: PINK,
          borderRadius: 30,
          padding: '22px 64px',
          opacity: p.o,
          transform: `scale(${p.sc(0.7)}) rotate(${interpolate(p.s, [0, 1], [-4, 0])}deg)`,
          boxShadow: SHADOW_SOFT,
        }}
      >
        <span style={{fontSize: 150, fontWeight: 800, color: INK}}>تحصل على:</span>
      </div>
    </Center>
  );
};

// ===== أيقونات SVG للمميزات =====
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
const PlayIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polygon points="10.5,8 15,10.5 10.5,13" fill={p.color} stroke="none" />
  </Svg>
);
const BookIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Svg>
);
const ChatIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
  </Svg>
);
const AwardIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
  </Svg>
);

// ===== المشاهد 3-6: المميزات كبلوكات ملوّنة (أيقونة | فاصل | نص) =====
type Feat = {
  t: string;
  sub: string;
  bg: string;
  fg: string;
  div: string;
  ic: string;
  Icon: React.FC<{size: number; color: string}>;
  badge: boolean;
};
const features: Feat[] = [
  {t: '7 دورات متكاملة', sub: '', bg: BLUE, fg: WHITE, div: 'rgba(255,255,255,0.45)', ic: WHITE, Icon: PlayIcon, badge: false},
  {t: '6 كتيبات', sub: 'منها الأكواد السرية', bg: YELLOW, fg: INK, div: 'rgba(0,0,0,0.18)', ic: INK, Icon: BookIcon, badge: false},
  {t: 'واجب يتقيّم + دعم واتساب', sub: '', bg: '#F4869B', fg: WHITE, div: 'rgba(255,255,255,0.5)', ic: WHITE, Icon: ChatIcon, badge: false},
  {t: 'شهادة + دخول مدى الحياة', sub: 'الأكثر قيمة', bg: '#6D28D9', fg: WHITE, div: 'rgba(255,255,255,0.5)', ic: WHITE, Icon: AwardIcon, badge: true},
];
const STAGGER = 50; // مسافة ظهور كل بلوك (frames)

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'stretch',
        flexDirection: 'column',
        gap: 26,
        padding: '0 70px',
      }}
    >
      {features.map((r, i) => {
        const a = animIn(frame, fps, i * STAGGER);
        const Icon = r.Icon;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              background: r.bg,
              borderRadius: 34,
              padding: '24px 36px',
              boxShadow: SHADOW_SOFT,
              opacity: a.o,
              // تطلع من يمين الشاشة وتستقر في مكانها
              transform: `translateX(${a.tx(220)}px) scale(${a.sc(0.92)})`,
            }}
          >
            {/* الأيقونة (يمين في RTL) */}
            <div
              style={{
                flexShrink: 0,
                width: 92,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={66} color={r.ic} />
            </div>
            {/* الفاصل */}
            <div style={{width: 3, height: 78, background: r.div, borderRadius: 3, flexShrink: 0}} />
            {/* النص */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'right',
              }}
            >
              <span style={{fontSize: 60, fontWeight: 800, color: r.fg, lineHeight: 1.18}}>
                {r.t}
              </span>
              {r.sub ? (
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: INK,
                    backgroundColor: r.badge ? YELLOW : WHITE,
                    borderRadius: 12,
                    padding: '4px 20px',
                    alignSelf: 'flex-start',
                    marginTop: 10,
                  }}
                >
                  {r.sub}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ===== المشهد 7: "بسعر وجبة" =====
const SceneMeal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = animIn(frame, fps, 0);
  const b = animIn(frame, fps, 22);
  return (
    <Center style={{gap: 28}}>
      <span
        style={{
          fontSize: 110,
          fontWeight: 800,
          color: INK,
          opacity: a.o,
          transform: `translateY(${a.ty(40)}px)`,
        }}
      >
        كل هذا…
      </span>
      <div
        style={{
          backgroundColor: PINK,
          borderRadius: 28,
          padding: '16px 52px',
          opacity: b.o,
          transform: `scale(${b.sc(0.55)}) rotate(${interpolate(b.s, [0, 1], [5, -2])}deg)`,
          boxShadow: SHADOW_DEEP,
        }}
      >
        <span style={{fontSize: 120, fontWeight: 800, color: INK}}>بسعر وجبة.</span>
      </div>
    </Center>
  );
};

// ===== المشهد 8: عدّاد المتدربين =====
const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.round(
    interpolate(frame, [0, 50], [0, 10000], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }),
  );
  const lbl = animIn(frame, fps, 50);
  const star = animIn(frame, fps, 58);
  return (
    <Center style={{gap: 8}}>
      <div
        style={{
          fontSize: 180,
          fontWeight: 800,
          color: BLUE,
          direction: 'ltr',
          textShadow: '0 12px 30px rgba(10,160,253,0.3)',
        }}
      >
        +{n.toLocaleString('en-US')}
      </div>
      <span
        style={{
          fontSize: 92,
          fontWeight: 800,
          color: INK,
          opacity: lbl.o,
          transform: `translateY(${lbl.ty(30)}px)`,
        }}
      >
        متدرب سابق
      </span>
      <div
        style={{
          fontSize: 70,
          marginTop: 6,
          opacity: star.o,
          transform: `scale(${star.sc(0.6)})`,
          letterSpacing: 8,
        }}
      >
        ⭐️⭐️⭐️⭐️⭐️
      </div>
    </Center>
  );
};

// ===== المشهد 9: الختام + الشعار =====
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = animIn(frame, fps, 0);
  const btn = animIn(frame, fps, 18);
  const link = animIn(frame, fps, 32);
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  // لمعة متحركة تمر على الزر
  const shineX = interpolate(frame % 70, [0, 70], [-260, 520]);
  return (
    <Center style={{gap: 52}}>
      <Img
        src={staticFile('logo.png')}
        style={{
          width: 520,
          opacity: logo.o,
          transform: `scale(${logo.sc(0.7)})`,
          filter: 'drop-shadow(0 16px 32px rgba(25,24,24,0.18))',
        }}
      />
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: BLUE,
          color: WHITE,
          padding: '30px 76px',
          borderRadius: 70,
          fontSize: 84,
          fontWeight: 800,
          opacity: btn.o,
          transform: `scale(${btn.o < 1 ? btn.sc(0.7) : pulse})`,
          boxShadow: '0 20px 45px rgba(10,160,253,0.4)',
        }}
      >
        سجّل الحين
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: shineX,
            width: 80,
            height: '100%',
            background:
              'linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)',
            transform: 'skewX(-18deg)',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: INK,
          opacity: link.o,
          transform: `translateY(${link.ty(20)}px)`,
        }}
      >
        الرابط بالبايو 👆
      </span>
    </Center>
  );
};

// ===== شريط تقدّم الفيديو =====
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const w = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 12,
        width: `${w}%`,
        background: `linear-gradient(90deg, ${BLUE}, ${PINK}, ${YELLOW})`,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
    />
  );
};

// ===== تجميع الإعلان (9 مشاهد) =====
const DawraAd: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: CREAM, fontFamily: FONT, direction: 'rtl'}}>
      <FontFace />
      {/* ===== المؤثرات الصوتية ===== */}
      <Audio src={staticFile('audio/music.wav')} volume={0.42} />
      {/* انتقالات */}
      <Sfx from={0} file="whoosh.wav" volume={0.5} />
      <Sfx from={60} file="whoosh.wav" volume={0.5} />
      <Sfx from={340} file="whoosh.wav" volume={0.5} />
      <Sfx from={410} file="whoosh.wav" volume={0.5} />
      <Sfx from={470} file="whoosh.wav" volume={0.5} />
      {/* عدّاد السعر: تكّات ثم رنّة عند 89 */}
      {[8, 13, 18, 23, 28, 33].map((f) => (
        <Sfx key={`p${f}`} from={f} file="tick.wav" volume={0.32} />
      ))}
      <Sfx from={37} file="ding.wav" volume={0.75} />
      {/* ظهور كل بلوك في القائمة (آخر بلوك يأخذ رنّة مميّزة) */}
      <Sfx from={100} file="pop.wav" volume={0.7} />
      <Sfx from={150} file="pop.wav" volume={0.7} />
      <Sfx from={200} file="pop.wav" volume={0.7} />
      <Sfx from={250} file="ding.wav" volume={0.7} />
      {/* "بسعر وجبة" */}
      <Sfx from={362} file="pop.wav" volume={0.8} />
      {/* عدّاد المتدربين: تكّات ثم رنّة + نجوم */}
      {[412, 420, 428, 436, 444, 452].map((f) => (
        <Sfx key={`c${f}`} from={f} file="tick.wav" volume={0.3} />
      ))}
      <Sfx from={461} file="ding.wav" volume={0.7} />
      <Sfx from={468} file="pop.wav" volume={0.6} />
      {/* الختام */}
      <Sfx from={488} file="success.wav" volume={0.9} />
      {/* وهج ناعم في المنتصف يعطي عمق */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.65), rgba(255,255,255,0) 62%)',
        }}
      />
      <FloatingShapes />

      <Sequence durationInFrames={60}>
        <SceneWrap dur={60}>
          <ScenePrice />
        </SceneWrap>
      </Sequence>
      <Sequence from={60} durationInFrames={40}>
        <SceneWrap dur={40}>
          <SceneHeader />
        </SceneWrap>
      </Sequence>
      <Sequence from={100} durationInFrames={240}>
        <SceneWrap dur={240}>
          <SceneFeatures />
        </SceneWrap>
      </Sequence>
      <Sequence from={340} durationInFrames={70}>
        <SceneWrap dur={70}>
          <SceneMeal />
        </SceneWrap>
      </Sequence>
      <Sequence from={410} durationInFrames={60}>
        <SceneWrap dur={60}>
          <SceneProof />
        </SceneWrap>
      </Sequence>
      <Sequence from={470} durationInFrames={70}>
        <SceneWrap dur={70}>
          <SceneCTA />
        </SceneWrap>
      </Sequence>

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
