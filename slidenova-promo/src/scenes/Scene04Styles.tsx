import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, lerpc, pop, punch} from '../beat';
import {COLORS, MESH, TEXTS} from '../config';
import {BODY, withEmoji} from '../fonts';
import {MeshBackground} from '../components/MeshBackground';
import {SceneHeadline} from '../components/KineticText';
import {MiniSlide, SlideKind, SlideStyle, THEMES} from '../components/MiniSlide';
import {Marquee} from '../components/Marquee';
import {Badge, Burst, Float, SparkleField} from '../components/Stickers';

const T = TEXTS.styles;

const CARD_SLIDES: Record<string, {title: string; kind: SlideKind}> = {
  business: {title: 'Отчёт\nQ3', kind: 'chart'},
  startup: {title: 'Pitch\nDeck', kind: 'cover'},
  edu: {title: 'Урок:\nфотосинтез', kind: 'bullets'},
  social: {title: 'Наш\nпроект', kind: 'grid'},
};

// Слоты сетки 2×2 (центры карточек)
const SLOTS = [
  {x: 300, y: 690},
  {x: 780, y: 690},
  {x: 300, y: 1140},
  {x: 780, y: 1140},
];
const SLOT_W = 440;
const BIG_W = 900;

/** СЦЕНА 4 — ВЫБОР СТИЛЯ: Бизнес, Стартап, Образовательный, Социальный. */
export const Scene04Styles: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.styles} speed={1.3} rays />
      <Marquee top={1480} rotate={-4} speed={9} bg={COLORS.ink} color={COLORS.lime} size={48} />
      <SparkleField count={8} seed={4} area={[0, 300, 1080, 1500]} />

      <SceneHeadline text={T.headline} top={130} size={110} echo={COLORS.violet} />

      {T.items.map((item, i) => {
        const enter = b(1 + i * 2.2);
        const settle = enter + b(1.4);
        const p = pop(frame, enter, {damping: 9, stiffness: 180});
        const m = lerpc(frame, [settle, settle + 12], [0, 1]);
        const slot = SLOTS[i];
        const x = 540 + (slot.x - 540) * m;
        const y = 960 + (slot.y - 960) * m;
        const w = BIG_W + (SLOT_W - BIG_W) * m;
        const rot = (1 - p) * (i % 2 ? 40 : -40) + (i % 2 ? 3 : -3) + Math.sin(frame / 14 + i) * 1.5;
        const jump = Math.abs(Math.sin(((frame - enter) / 15) * Math.PI)) * 10 * m;
        const theme = THEMES[item.key as SlideStyle];
        const cs = CARD_SLIDES[item.key];
        const beatScale = 1 + punch(frame) * 0.03 * m;
        return (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              left: x,
              top: y - jump,
              transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${p * beatScale})`,
              zIndex: m < 1 ? 10 : 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14 + 10 * (1 - m),
            }}
          >
            <MiniSlide width={w} styleKey={item.key as SlideStyle} kind={cs.kind} title={cs.title} />
            <div
              style={{
                background: COLORS.white,
                color: COLORS.ink,
                fontFamily: withEmoji(BODY),
                fontWeight: 800,
                fontSize: 36 + 28 * (1 - m),
                padding: '10px 26px',
                borderRadius: 40,
                border: `5px solid ${theme.accent}`,
                boxShadow: `6px 6px 0 ${COLORS.ink}`,
                whiteSpace: 'nowrap',
              }}
            >
              {item.emoji} {item.name}
            </div>
          </div>
        );
      })}

      <Float x={890} y={420} rotate={14} at={b(2)} seed={1}>
        <Badge text="4 стиля" bg={COLORS.lime} color={COLORS.ink} size={50} />
      </Float>
      <Float x={110} y={1400} at={b(4)} seed={2}>
        <Burst size={150} color={COLORS.cyan} />
      </Float>
      <Float x={960} y={1390} rotate={-10} at={b(9)} seed={3}>
        <Badge text="PRO" bg={COLORS.orange} size={54} />
      </Float>
    </AbsoluteFill>
  );
};
