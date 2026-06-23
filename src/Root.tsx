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
import {FahmAd, FAHM_DURATION} from './FahmAd';
import {FahmNotebook, FAHM_NB_DURATION} from './FahmNotebook';

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
const ClipboardIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z" />
    <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    <polyline points="9,14 11,16 15,12" />
  </Svg>
);
const InfinityIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <path d="M6.5 8.5a3.5 3.5 0 1 0 0 7c1.7 0 3-1.5 5.5-3.5s3.8-3.5 5.5-3.5a3.5 3.5 0 1 1 0 7c-1.7 0-3-1.5-5.5-3.5S8.2 8.5 6.5 8.5z" />
  </Svg>
);
const CheckIcon: React.FC<{size: number; color: string}> = ({size}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: BLUE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <span style={{color: WHITE, fontSize: size * 0.6, fontWeight: 800, lineHeight: 1}}>
      &#10003;
    </span>
  </div>
);
const CartIcon: React.FC<{size: number; color: string}> = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="21" r="1.4" fill={p.color} stroke="none" />
    <circle cx="19" cy="21" r="1.4" fill={p.color} stroke="none" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
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
// البلوكات الرئيسية (عمود اليمين) — ألوان الهوية فقط
const mainFeatures: Feat[] = [
  {t: '7 دورات متكاملة', sub: '', bg: YELLOW, fg: INK, div: 'rgba(0,0,0,0.18)', ic: INK, Icon: PlayIcon, badge: false},
  {t: '6 كتيبات رقمية', sub: 'منها الأكواد السرية', bg: BLUE, fg: WHITE, div: 'rgba(255,255,255,0.45)', ic: WHITE, Icon: BookIcon, badge: false},
  {t: 'شهادة إتمام', sub: '', bg: PINK, fg: INK, div: 'rgba(0,0,0,0.18)', ic: INK, Icon: CheckIcon, badge: false},
];
// البلوكات السفلية (٣ خدمات) — ألوان الهوية فقط
type Bottom = {
  t: string;
  bg: string;
  fg: string;
  ic: string;
  badgeBg: string;
  Icon: React.FC<{size: number; color: string}>;
};
const bottomFeatures: Bottom[] = [
  {t: 'دعم ع الواتساب', bg: BLUE, fg: WHITE, ic: WHITE, badgeBg: 'rgba(255,255,255,0.2)', Icon: ChatIcon},
  {t: 'واجب يتقيّم', bg: PINK, fg: INK, ic: INK, badgeBg: 'rgba(0,0,0,0.08)', Icon: ClipboardIcon},
  {t: 'دخول مدى الحياة', bg: YELLOW, fg: INK, ic: INK, badgeBg: 'rgba(0,0,0,0.08)', Icon: InfinityIcon},
];
const STAGGER = 18; // مسافة ظهور كل بلوك (frames)

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = animIn(frame, fps, 0);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 52px'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 20, width: '100%'}}>
        {/* الصف الرئيسي: مميزات (يمين) + كرت "بتحصل على" (يسار) */}
        <div style={{display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'stretch'}}>
          {/* عمود المميزات (يمين في RTL) */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
            {mainFeatures.map((r, i) => {
              const a = animIn(frame, fps, 10 + i * STAGGER);
              const Icon = r.Icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    background: r.bg,
                    borderRadius: 26,
                    padding: '20px 26px',
                    boxShadow: SHADOW_SOFT,
                    opacity: a.o,
                    transform: `translateX(${a.tx(180)}px) scale(${a.sc(0.92)})`,
                  }}
                >
                  <div style={{flexShrink: 0, width: 66, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon size={r.Icon === CheckIcon ? 64 : 52} color={r.ic} />
                  </div>
                  <div style={{width: 3, height: 56, background: r.div, borderRadius: 3, flexShrink: 0}} />
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'right'}}>
                    <span style={{fontSize: 46, fontWeight: 800, color: r.fg, lineHeight: 1.12}}>{r.t}</span>
                    {r.sub ? (
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: INK,
                          background: WHITE,
                          borderRadius: 10,
                          padding: '3px 14px',
                          alignSelf: 'flex-start',
                          marginTop: 8,
                        }}
                      >
                        {r.sub}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* كرت "بتحصل على" (يسار) */}
          <div
            style={{
              width: 230,
              flexShrink: 0,
              background: INK,
              borderRadius: 30,
              padding: '30px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              boxShadow: SHADOW_SOFT,
              opacity: card.o,
              transform: `translateX(${card.tx(-140)}px) scale(${card.sc(0.9)})`,
            }}
          >
            <CartIcon size={88} color={YELLOW} />
            <div style={{width: 70, height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 3}} />
            <span
              style={{
                fontSize: 60,
                fontWeight: 800,
                color: WHITE,
                textAlign: 'center',
                lineHeight: 1.25,
                whiteSpace: 'pre-line',
              }}
            >
              {'بتحصل\nعلى'}
            </span>
          </div>
        </div>

        {/* الصف السفلي: ٣ بلوكات خدمات */}
        <div style={{display: 'flex', flexDirection: 'row', gap: 16}}>
          {bottomFeatures.map((b, i) => {
            const a = animIn(frame, fps, 64 + i * 14);
            const Icon = b.Icon;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  background: b.bg,
                  borderRadius: 24,
                  padding: '22px 14px',
                  boxShadow: SHADOW_SOFT,
                  opacity: a.o,
                  transform: `translateY(${a.ty(40)}px) scale(${a.sc(0.82)})`,
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 20,
                    background: b.badgeBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={42} color={b.ic} />
                </div>
                <span style={{fontSize: 36, fontWeight: 800, color: b.fg, textAlign: 'center', lineHeight: 1.25}}>
                  {b.t}
                </span>
              </div>
            );
          })}
        </div>
      </div>
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

// ===== المشهد 9: آراء المشتركين (شبكة بطاقات + عدّاد) =====
const StarIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.9 6.26 6.9.6-5.2 4.56 1.55 6.74L12 17.27 5.85 20.76 7.4 14.02 2.2 9.46l6.9-.6z" />
  </svg>
);
const reviews = [
  {name: 'أماني نجيدة', text: 'المعسكر منظّم ومفيد وسهل التطبيق، شكرًا على تعبكم معنا', c: BLUE},
  {name: 'حنان', text: 'مجهود رائع وجبّار ومتعوب عليه صدق.. يعطيكم العافية', c: PINK},
  {name: 'د. سارة', text: 'مجهود جبّار متعوب عليه، ومستمرين بالتحديثات', c: INK},
  {name: 'أنجيلينا', text: 'معسكر رائع، استفدت منه كثير… شكرًا لمجهودكم', c: PINK},
  {name: 'روز الحربي', text: 'جهد قوي تشكرون عليه، جزاكم الله خير الجزاء', c: BLUE},
  {name: 'سعاد', text: 'مفيد وشامل ودايمًا عندكم تحديثات جديدة', c: INK},
];

const ReviewsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const title = animIn(frame, fps, 0);
  const COUNT_FROM = 72;
  const n = Math.round(
    interpolate(frame, [COUNT_FROM, COUNT_FROM + 46], [0, 10000], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }),
  );
  const cnt = animIn(frame, fps, COUNT_FROM - 8);
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 28,
        padding: '0 46px',
      }}
    >
      {/* العنوان */}
      <div
        style={{
          background: INK,
          borderRadius: 24,
          padding: '16px 50px',
          opacity: title.o,
          transform: `scale(${title.sc(0.8)})`,
          boxShadow: SHADOW_SOFT,
        }}
      >
        <span style={{fontSize: 62, fontWeight: 800, color: WHITE}}>وش قالوا عن المعسكر؟</span>
      </div>

      {/* شبكة البطاقات */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', width: '100%'}}>
        {reviews.map((r, i) => {
          const a = animIn(frame, fps, 8 + i * 7);
          return (
            <div
              key={i}
              style={{
                width: '47%',
                background: WHITE,
                borderRadius: 26,
                padding: '24px 26px',
                boxShadow: SHADOW_SOFT,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                textAlign: 'right',
                opacity: a.o,
                transform: `scale(${a.sc(0.85)})`,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    background: r.c,
                    color: r.c === YELLOW ? INK : WHITE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {r.name.slice(0, 1)}
                </div>
                <span style={{fontSize: 36, fontWeight: 800, color: INK}}>{r.name}</span>
              </div>
              <span style={{fontSize: 31, fontWeight: 800, color: '#3A3A3A', lineHeight: 1.5}}>
                {r.text}
              </span>
              <div style={{display: 'flex', flexDirection: 'row-reverse', gap: 4, alignSelf: 'flex-start'}}>
                {[0, 1, 2, 3, 4].map((s) => (
                  <StarIcon key={s} size={28} color={YELLOW} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* العدّاد */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          marginTop: 40,
          opacity: cnt.o,
          transform: `translateY(${cnt.ty(30)}px)`,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            color: BLUE,
            direction: 'ltr',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            textShadow: '0 12px 30px rgba(10,160,253,0.3)',
          }}
        >
          <span style={{fontFamily: 'Arial, Helvetica, sans-serif', marginInlineEnd: 6}}>+</span>
          <span>{n.toLocaleString('en-US')}</span>
        </div>
        <span style={{fontSize: 56, fontWeight: 800, color: INK}}>مشترك في معسكر كانفا</span>
      </div>
    </AbsoluteFill>
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
      <Sfx from={580} file="whoosh.wav" volume={0.5} />
      {/* عدّاد السعر: تكّات ثم رنّة عند 89 */}
      {[8, 13, 18, 23, 28, 33].map((f) => (
        <Sfx key={`p${f}`} from={f} file="tick.wav" volume={0.32} />
      ))}
      <Sfx from={37} file="ding.wav" volume={0.75} />
      {/* ظهور البلوكات: كرت "بتحصل على" + ٣ يمين + ٣ تحت */}
      <Sfx from={62} file="ding.wav" volume={0.6} />
      <Sfx from={72} file="pop.wav" volume={0.7} />
      <Sfx from={90} file="pop.wav" volume={0.7} />
      <Sfx from={108} file="pop.wav" volume={0.7} />
      <Sfx from={126} file="pop.wav" volume={0.55} />
      <Sfx from={140} file="pop.wav" volume={0.55} />
      <Sfx from={154} file="pop.wav" volume={0.55} />
      {/* "بسعر وجبة" */}
      <Sfx from={362} file="pop.wav" volume={0.8} />
      {/* مشهد الآراء: ظهور البطاقات ثم رنّة العدّاد */}
      {[418, 427, 436, 445, 454, 463].map((f) => (
        <Sfx key={`r${f}`} from={f} file="pop.wav" volume={0.45} />
      ))}
      <Sfx from={482} file="ding.wav" volume={0.7} />
      {/* الختام */}
      <Sfx from={598} file="success.wav" volume={0.9} />
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
      <Sequence from={60} durationInFrames={280}>
        <SceneWrap dur={280}>
          <SceneFeatures />
        </SceneWrap>
      </Sequence>
      <Sequence from={340} durationInFrames={70}>
        <SceneWrap dur={70}>
          <SceneMeal />
        </SceneWrap>
      </Sequence>
      <Sequence from={410} durationInFrames={170}>
        <SceneWrap dur={170}>
          <ReviewsScene />
        </SceneWrap>
      </Sequence>
      <Sequence from={580} durationInFrames={70}>
        <SceneWrap dur={70}>
          <SceneCTA />
        </SceneWrap>
      </Sequence>

      <ProgressBar />
    </AbsoluteFill>
  );
};

// ===== تسجيل المشاهد (لا تغيّر اسم RemotionRoot) =====
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={DawraAd}
        durationInFrames={650}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FahmAd"
        component={FahmAd}
        durationInFrames={FAHM_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FahmNotebook"
        component={FahmNotebook}
        durationInFrames={FAHM_NB_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
