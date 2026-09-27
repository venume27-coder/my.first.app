import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, lerpc, pop, punch} from '../beat';
import {COLORS, DEMO_SLIDES, MESH, TEXTS} from '../config';
import {userScreens} from '../assets';
import {MeshBackground} from '../components/MeshBackground';
import {SceneHeadline} from '../components/KineticText';
import {Phone3D} from '../components/Phone3D';
import {ChatItem, TelegramChat} from '../components/TelegramChat';
import {MiniSlide, SlideStyle} from '../components/MiniSlide';
import {Marquee} from '../components/Marquee';
import {Badge, EmojiSticker, Float, SparkleField} from '../components/Stickers';

const T = TEXTS.how;
const FAN_STYLES: SlideStyle[] = ['startup', 'business', 'neon', 'social', 'edu'];

/** СЦЕНА 3 — КАК РАБОТАЕТ: пишем тему в чат → прогресс → веер готовых слайдов. */
export const Scene03HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const screens = userScreens();

  const SEND = b(4);
  const items: ChatItem[] = [
    {
      kind: 'text',
      from: 'bot',
      at: 0,
      text: '👋 Привет! Напиши тему — и я сделаю готовую презентацию.',
      buttons: [['🎨 Стиль', '🖼 Картинки'], ['⭐ Premium']],
    },
    {kind: 'text', from: 'user', at: SEND, text: T.userMsg},
    {kind: 'typing', at: SEND + 6, until: b(5)},
    {kind: 'text', from: 'bot', at: b(5), text: T.botReply},
    {kind: 'progress', at: b(5.5), from: b(6), to: b(8.5), label: T.progressLabel},
    {kind: 'text', from: 'bot', at: b(9), text: T.done},
    {kind: 'file', at: b(9.3), name: T.file, meta: T.fileMeta},
  ];

  // Телефон влетает, покачивается, потом чуть отъезжает назад, когда вылетают слайды
  const inP = pop(frame, 0, {damping: 14, stiffness: 120});
  const fanStart = b(9.5);
  const back = lerpc(frame, [fanStart, fanStart + 20], [0, 1]);
  const rotY = (1 - inP) * 55 + Math.sin(frame / 22) * 8 - back * 10;
  const rotX = 4 + Math.sin(frame / 30) * 3;
  const scale = (0.6 + inP * 0.4) * (1 - back * 0.1) * (1 + punch(frame) * 0.015);

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.how} speed={1.2} />
      <Marquee top={880} rotate={-10} speed={8} bg={COLORS.pink} color={COLORS.white} size={50} />
      <SparkleField count={10} seed={3} />

      <SceneHeadline text={T.headline} top={140} size={96} echo={COLORS.cyan} />

      <Phone3D x={540} y={1060} rotateY={rotY} rotateX={rotX} scale={scale * 0.92} screenshot={screens[0] ?? null}>
        <TelegramChat items={items} input={{text: T.userMsg, start: b(1), end: b(3.6), sendAt: SEND}} />
      </Phone3D>

      {/* веер слайдов, вылетающий из телефона */}
      {DEMO_SLIDES.slice(0, 5).map((s, i) => {
        const p = pop(frame, fanStart + i * 3, {damping: 12, stiffness: 140});
        const angle = (i - 2) * 13;
        const x = 540 + (i - 2) * 130 * p;
        const y = 1120 - p * (240 + Math.abs(i - 2) * -30);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${angle * p}deg) scale(${0.2 + p * 0.8}) translateY(${Math.sin(frame / 10 + i) * 8}px)`,
              transformOrigin: '50% 120%',
              opacity: Math.min(1, p * 3),
            }}
          >
            <MiniSlide width={430} styleKey={FAN_STYLES[i]} kind={s.kind} title={s.title} />
          </div>
        );
      })}

      {/* стикеры */}
      <Float x={150} y={620} rotate={-12} at={b(1)} seed={1}>
        <EmojiSticker emoji="✍️" size={120} />
      </Float>
      <Float x={935} y={640} rotate={10} at={b(5)} seed={2}>
        <Badge text="AI" bg={COLORS.violet} size={60} />
      </Float>
      <Float x={880} y={1540} rotate={-8} at={fanStart + 8} seed={3}>
        <Badge text="10 слайдов ✓" bg={COLORS.lime} color={COLORS.ink} size={52} />
      </Float>
      <Float x={230} y={1500} rotate={8} at={fanStart + 12} seed={4}>
        <Badge text={T.caption} bg={COLORS.pink} size={60} />
      </Float>
    </AbsoluteFill>
  );
};
