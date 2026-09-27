import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {lerpc, pop, punch, rand} from '../beat';
import {BRAND, COLORS, MESH, TEXTS, sceneFrames} from '../config';
import {BODY, DISPLAY, withEmoji} from '../fonts';
import {MeshBackground} from '../components/MeshBackground';
import {KineticText} from '../components/KineticText';
import {Marquee} from '../components/Marquee';
import {Arrow, Badge, Burst, EmojiSticker, Float, SparkleField} from '../components/Stickers';

const T = TEXTS.cta;

/** Иконка Telegram (бумажный самолётик). */
const PlaneIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill={COLORS.white} />
    <path d="M22 49 L74 28 Q78 27 77 31 L69 72 Q68 76 64 74 L50 64 L43 71 Q41 73 40 70 L38 58 L66 36 L34 55 L23 52 Q19 50 22 49Z" fill="#2AABEE" />
  </svg>
);

/** СЦЕНА 9 — ФИНАЛ / CTA: «ПРЕЗЕНТАЦИЯ ЗА МИНУТУ», @SlideNovaBot, кнопка, стрелки. */
export const Scene09Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = sceneFrames('cta');
  const endAt = dur - 45; // последние 1,5 с — чистый градиент
  const pulse = punch(frame, 5);

  const handleIn = pop(frame, 20);
  const btnIn = pop(frame, 30, {damping: 9});
  const outro = lerpc(frame, [endAt - 6, endAt], [0, 1]);

  if (frame >= endAt) {
    const f = frame - endAt;
    const nameIn = pop(f, 0, {damping: 12});
    const handleIn2 = pop(f, 6);
    return (
      <AbsoluteFill>
        <MeshBackground colors={[COLORS.violet, COLORS.pink, COLORS.cyan]} speed={0.8} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 100,
              color: COLORS.white,
              transform: `scale(${nameIn})`,
              textShadow: `0 10px 50px #0006`,
              letterSpacing: -3,
            }}
          >
            SlideNovaBot
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 64,
              color: COLORS.white,
              opacity: handleIn2,
              transform: `translateY(${(1 - handleIn2) * 40}px)`,
              background: '#0B062055',
              padding: '14px 40px',
              borderRadius: 40,
            }}
          >
            {BRAND.handle}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.cta} speed={1.8} rays />
      <Marquee top={70} rotate={-4} speed={10} bg={COLORS.lime} color={COLORS.ink} size={44} />
      <Marquee top={1700} rotate={3} speed={10} bg={COLORS.pink} color={COLORS.white} size={44} reverse />
      <SparkleField count={14} seed={9} />

      {/* эхо-надписи позади */}
      {[-1, 1].map((d) => (
        <div
          key={d}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 430 + d * 270,
            textAlign: 'center',
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 84,
            color: 'transparent',
            WebkitTextStroke: `3px ${COLORS.white}55`,
            transform: `translateX(${Math.sin(frame / 12 + d) * 40}px)`,
          }}
        >
          {T.line1}
        </div>
      ))}

      {/* ПРЕЗЕНТАЦИЯ ЗА МИНУТУ */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', transform: `scale(${1 + pulse * 0.04})`}}>
        <KineticText text={T.line1} size={84} at={0} stagger={1.5} mode="explode" color={COLORS.white} echo={COLORS.pink} stretch={2.3} letterSpacing={-3} seed={3} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', transform: `rotate(-3deg) scale(${1 + pulse * 0.05})`}}>
        <KineticText text={T.line2} size={116} at={10} stagger={2} mode="slam" color={COLORS.lime} echo={COLORS.violet} letterSpacing={-4} />
      </div>

      {/* @SlideNovaBot */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${handleIn}) rotate(2deg)`,
            background: COLORS.ink,
            color: COLORS.white,
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 80,
            padding: '22px 44px',
            borderRadius: 30,
            border: `6px solid ${COLORS.white}`,
            boxShadow: `12px 12px 0 ${COLORS.pink}`,
            letterSpacing: -2,
          }}
        >
          {BRAND.handle}
        </div>
      </div>

      {/* кнопка «Открыть в Telegram» */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', transform: `scale(${btnIn * (1 + pulse * 0.08)})`}}>
          {/* пульсирующие кольца */}
          {[0, 1].map((i) => {
            const k = ((frame + i * 7) % 15) / 15;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 80,
                  border: `6px solid ${COLORS.cyan}`,
                  transform: `scale(${1 + k * 0.35})`,
                  opacity: 1 - k,
                }}
              />
            );
          })}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              background: 'linear-gradient(180deg, #37BBFE, #1E96E0)',
              color: COLORS.white,
              fontFamily: withEmoji(BODY),
              fontWeight: 800,
              fontSize: 58,
              padding: '30px 50px',
              borderRadius: 80,
              border: `6px solid ${COLORS.white}`,
              boxShadow: `0 14px 0 #0B5E91, 0 30px 60px #0008`,
              whiteSpace: 'nowrap',
            }}
          >
            <PlaneIcon size={78} />
            {T.button}
          </div>
        </div>
      </div>

      {/* стрелки к кнопке */}
      <Float x={150} y={1060} rotate={25 + pulse * 10} at={40} seed={1} amp={8}>
        <Arrow size={210} color={COLORS.lime} />
      </Float>
      <Float x={930} y={1060} rotate={-25 - pulse * 10} at={44} seed={2} amp={8}>
        <Arrow size={210} color={COLORS.pink} flip />
      </Float>
      <Float x={540} y={1450} rotate={-10} at={50} seed={3} amp={10}>
        <div style={{fontSize: 120, fontFamily: withEmoji('sans-serif'), transform: `translateY(${-pulse * 25}px)`}}>👆</div>
      </Float>

      {/* стикеры */}
      <Float x={150} y={1520} rotate={-14} at={60} seed={4}>
        <Badge text="AI" bg={COLORS.violet} size={60} />
      </Float>
      <Float x={930} y={1520} rotate={12} at={64} seed={5}>
        <Badge text="NEW" bg={COLORS.orange} size={52} />
      </Float>
      <Float x={960} y={830} at={30} seed={6}>
        <Burst size={130} color={COLORS.cyan} />
      </Float>
      <Float x={110} y={820} at={34} seed={7}>
        <EmojiSticker emoji="🚀" size={120} />
      </Float>

      {/* конфетти */}
      {Array.from({length: 18}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: rand(i * 5) * 1080,
            top: ((rand(i * 9) * 1920 + frame * (7 + rand(i) * 8)) % 2000) - 40,
            width: 20,
            height: 32,
            borderRadius: 4,
            background: [COLORS.lime, COLORS.pink, COLORS.cyan, COLORS.orange, COLORS.white][i % 5],
            transform: `rotate(${frame * 9 + i * 30}deg)`,
          }}
        />
      ))}

      {/* вспышка перед финальной плашкой */}
      <AbsoluteFill style={{background: COLORS.white, opacity: outro}} />
    </AbsoluteFill>
  );
};
