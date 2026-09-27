import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, pop, punch, rand} from '../beat';
import {COLORS, DEMO_SLIDES, MESH, TEXTS} from '../config';
import {BODY, DISPLAY, withEmoji} from '../fonts';
import {MeshBackground} from '../components/MeshBackground';
import {KineticText} from '../components/KineticText';
import {MiniSlide, SlideStyle} from '../components/MiniSlide';
import {Badge, Burst, EmojiSticker, Float, SparkleField} from '../components/Stickers';

const T = TEXTS.solution;
const STYLES: SlideStyle[] = ['startup', 'business', 'social', 'neon', 'edu', 'startup'];

/** СЦЕНА 2 — «Есть решение» → огромное SLIDE / NOVA / BOT, вокруг летают слайды. */
export const Scene02Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const kick = pop(frame, 0);
  const botIn = pop(frame, b(3.5), {damping: 8});
  const subIn = pop(frame, b(5));
  const stretch = 1 + punch(frame, 5) * 0.12 * (frame > b(2) ? 1 : 0);

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.solution} speed={1.6} rays />

      {/* слайды, летающие по орбите (задний план) */}
      {DEMO_SLIDES.map((s, i) => {
        const a = (i / DEMO_SLIDES.length) * Math.PI * 2 + frame / 40;
        const x = 540 + Math.cos(a) * 470;
        const y = 960 + Math.sin(a) * 700;
        const depth = 0.55 + 0.35 * (Math.sin(a) + 1) / 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${Math.sin(a * 2) * 18}deg) scale(${depth * pop(frame, i * 2)})`,
              zIndex: Math.round(depth * 10),
              opacity: 0.9,
            }}
          >
            <MiniSlide width={380} styleKey={STYLES[i]} kind={s.kind} title={s.title} />
          </div>
        );
      })}

      <SparkleField count={12} seed={2} />

      {/* «Есть решение» */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 300,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 20,
          transform: `scale(${kick}) rotate(-4deg)`,
        }}
      >
        <div
          style={{
            background: COLORS.lime,
            color: COLORS.ink,
            fontFamily: withEmoji(DISPLAY),
            fontWeight: 900,
            fontSize: 76,
            padding: '16px 40px',
            borderRadius: 60,
            border: `6px solid ${COLORS.ink}`,
            boxShadow: `10px 10px 0 ${COLORS.ink}`,
          }}
        >
          {T.kicker} 💡
        </div>
      </div>

      {/* SLIDE / NOVA — огромные буквы */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, zIndex: 20, display: 'flex', justifyContent: 'center'}}>
        <KineticText
          text={'SLIDE\nNOVA'}
          size={236}
          at={b(1.5)}
          stagger={2}
          mode="explode"
          echo={COLORS.cyan}
          color={COLORS.white}
          stretch={stretch}
          lineHeight={0.98}
          letterSpacing={-6}
          seed={7}
        />
      </div>

      {/* BOT плашка */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, zIndex: 21, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${botIn * (1 + punch(frame) * 0.08)}) rotate(${5 - (1 - botIn) * 40}deg)`,
            background: COLORS.pink,
            color: COLORS.white,
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 190,
            lineHeight: 1,
            padding: '6px 50px 18px',
            borderRadius: 40,
            border: `8px solid ${COLORS.white}`,
            boxShadow: `14px 14px 0 ${COLORS.ink}`,
          }}
        >
          BOT
        </div>
      </div>

      {/* подзаголовок */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1390, zIndex: 21, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `translateY(${(1 - subIn) * 200}px)`,
            opacity: subIn,
            background: COLORS.ink,
            color: COLORS.white,
            fontFamily: withEmoji(BODY),
            fontWeight: 800,
            fontSize: 50,
            padding: '20px 36px',
            borderRadius: 24,
            textAlign: 'center',
          }}
        >
          {T.sub} ⚡
        </div>
      </div>

      {/* стикеры */}
      <Float x={170} y={1180} rotate={-14} at={b(4)} seed={3} style={{zIndex: 22}}>
        <Badge text="AI" bg={COLORS.violet} size={70} />
      </Float>
      <Float x={900} y={500} rotate={12} at={b(4.5)} seed={4} style={{zIndex: 22}}>
        <Badge text="NEW" bg={COLORS.orange} size={58} />
      </Float>
      <Float x={940} y={1250} at={b(5)} seed={5} style={{zIndex: 22}}>
        <Burst size={170} color={COLORS.lime} />
      </Float>
      <Float x={140} y={430} at={b(5.5)} seed={6} style={{zIndex: 22}}>
        <EmojiSticker emoji="🔥" size={120} />
      </Float>
      {/* лёгкая «пыль» конфетти */}
      {Array.from({length: 16}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: rand(i * 3) * 1080,
            top: ((rand(i * 7) * 1920 + frame * (6 + rand(i) * 10)) % 2000) - 40,
            width: 18,
            height: 30,
            background: [COLORS.lime, COLORS.pink, COLORS.cyan, COLORS.orange][i % 4],
            transform: `rotate(${frame * 8 + i * 40}deg)`,
            borderRadius: 4,
            zIndex: 23,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
