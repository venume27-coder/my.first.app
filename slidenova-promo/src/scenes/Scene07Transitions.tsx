import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, lerpc, pop, punch} from '../beat';
import {COLORS, MESH, TEXTS} from '../config';
import {BODY, DISPLAY, withEmoji} from '../fonts';
import {MeshBackground} from '../components/MeshBackground';
import {KineticText, SceneHeadline} from '../components/KineticText';
import {MiniSlide} from '../components/MiniSlide';
import {Marquee} from '../components/Marquee';
import {Burst, EmojiSticker, Float, SparkleField} from '../components/Stickers';

const T = TEXTS.transitions;
const W = 940;
const H = (W * 9) / 16;

// Моменты переходов
const FADE = [b(1.5), b(2.5)] as [number, number];
const PUSH = [b(4.5), b(5.5)] as [number, number];
const ZOOM = [b(7.5), b(8.5)] as [number, number];
const SWITCH = [0, b(3.8), b(6.8)];

const SLIDES = [
  <MiniSlide key="a" width={W} styleKey="startup" kind="cover" title={'Маркетинг\nкофейни'} shadow={false} />,
  <MiniSlide key="b" width={W} styleKey="business" kind="chart" title={'Рост\nпродаж'} shadow={false} />,
  <MiniSlide key="c" width={W} styleKey="social" kind="grid" title={'Каналы'} shadow={false} />,
  <MiniSlide key="d" width={W} styleKey="neon" kind="bullets" title={'План на\nквартал'} shadow={false} />,
];

/** СЦЕНА 7 — ПЕРЕХОДЫ: fade, push, zoom. */
export const Scene07Transitions: React.FC = () => {
  const frame = useCurrentFrame();
  const mode = frame < SWITCH[1] ? 0 : frame < SWITCH[2] ? 1 : 2;

  const fade = lerpc(frame, FADE, [0, 1]);
  const push = lerpc(frame, PUSH, [0, 1]);
  const zoom = lerpc(frame, ZOOM, [0, 1]);

  const layer = (i: number): React.CSSProperties => {
    const base: React.CSSProperties = {position: 'absolute', inset: 0};
    switch (i) {
      case 0:
        return {...base, opacity: 1 - fade};
      case 1:
        return {...base, opacity: fade, transform: `translateX(${-push * W}px)`};
      case 2:
        return {
          ...base,
          opacity: push > 0 ? 1 - zoom : 0,
          transform: `translateX(${(1 - push) * W}px) scale(${1 + zoom * 1.6})`,
        };
      case 3:
        return {...base, opacity: zoom, transform: `scale(${0.3 + zoom * 0.7})`};
      default:
        return base;
    }
  };

  const frameIn = pop(frame, 0, {damping: 12});

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.transitions} speed={1.4} />
      <Marquee top={1640} rotate={-3} speed={8} bg={COLORS.violet} color={COLORS.white} size={46} />
      <SparkleField count={10} seed={7} />

      <SceneHeadline text={T.headline} top={170} size={116} echo={COLORS.pink} />

      {/* «экран» с демонстрацией переходов */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 420,
          width: W,
          height: H,
          borderRadius: 30,
          overflow: 'hidden',
          boxShadow: `0 0 0 8px ${COLORS.ink}, 18px 20px 0 8px ${COLORS.ink}, 0 40px 90px #000a`,
          transform: `scale(${frameIn * (1 + punch(frame) * 0.02)}) rotate(${Math.sin(frame / 20) * 1.2}deg)`,
          background: '#000',
        }}
      >
        {SLIDES.map((s, i) => (
          <div key={i} style={layer(i)}>
            {s}
          </div>
        ))}
      </div>

      {/* название перехода — огромно */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1030, display: 'flex', justifyContent: 'center'}}>
        <KineticText key={mode} text={T.names[mode]} size={190} at={SWITCH[mode]} stagger={2} mode="slam" color={COLORS.lime} echo={COLORS.pink} letterSpacing={-4} />
      </div>

      {/* подпись */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', transform: `scale(${pop(frame, b(1))})`}}>
        <div
          style={{
            background: COLORS.white,
            color: COLORS.ink,
            fontFamily: withEmoji(BODY),
            fontWeight: 800,
            fontSize: 54,
            lineHeight: 1.15,
            padding: '20px 40px',
            borderRadius: 30,
            textAlign: 'center',
            whiteSpace: 'pre-line',
            boxShadow: `10px 10px 0 ${COLORS.ink}`,
            transform: 'rotate(-2deg)',
          }}
        >
          {T.caption}
        </div>
      </div>

      {/* таймлайн-чипы */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1500, display: 'flex', justifyContent: 'center', gap: 22}}>
        {T.names.map((n, i) => (
          <div
            key={n}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 36,
              padding: '10px 26px',
              borderRadius: 30,
              background: i === mode ? COLORS.lime : '#ffffff30',
              color: i === mode ? COLORS.ink : COLORS.white,
              border: `4px solid ${i === mode ? COLORS.ink : '#ffffff60'}`,
              transform: `scale(${i === mode ? 1.1 + punch(frame) * 0.08 : 1})`,
            }}
          >
            {n}
          </div>
        ))}
      </div>

      <Float x={110} y={400} rotate={-10} at={b(1)} seed={1}>
        <EmojiSticker emoji="🎬" size={120} />
      </Float>
      <Float x={980} y={1000} at={b(2)} seed={2}>
        <Burst size={140} color={COLORS.orange} />
      </Float>
    </AbsoluteFill>
  );
};
