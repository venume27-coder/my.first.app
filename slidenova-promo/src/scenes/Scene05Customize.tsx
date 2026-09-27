import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, lerpc, pop, punch} from '../beat';
import {COLORS, MESH, TEXTS} from '../config';
import {BODY, SHOWCASE_FONTS, withEmoji} from '../fonts';
import {MeshBackground} from '../components/MeshBackground';
import {SceneHeadline} from '../components/KineticText';
import {MiniSlide} from '../components/MiniSlide';
import {DemoLogo} from '../components/Illustrations';
import {Badge, EmojiSticker, Float, SparkleField} from '../components/Stickers';

const T = TEXTS.custom;

const PALETTES = [
  {bg: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.pink})`, accent: COLORS.lime, dot: COLORS.violet},
  {bg: 'linear-gradient(135deg, #0F3D3E, #1B7F6B)', accent: '#FFD166', dot: '#1B7F6B'},
  {bg: `linear-gradient(135deg, ${COLORS.orange}, #FF3D3D)`, accent: COLORS.white, dot: COLORS.orange},
  {bg: 'linear-gradient(135deg, #0B1E4A, #0077FF)', accent: COLORS.cyan, dot: '#0077FF'},
  {bg: 'linear-gradient(135deg, #3B1D0E, #8A4B22)', accent: '#FFB36B', dot: '#8A4B22'},
];

// Этапы сцены (кадры)
const FONT_END = b(4);
const PALETTE_END = b(8);

const Panel: React.FC<{active: boolean; title: string; y: number; children: React.ReactNode; at: number}> = ({active, title, y, children, at}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at);
  const glow = active ? 1 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: y,
        height: 150,
        borderRadius: 34,
        background: active ? COLORS.white : '#ffffffcc',
        border: `6px solid ${active ? COLORS.lime : '#ffffff00'}`,
        boxShadow: active ? `0 0 0 6px ${COLORS.ink}, 0 0 60px ${COLORS.lime}` : '0 10px 30px #0005',
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
        gap: 30,
        transform: `translateX(${(1 - p) * 1100}px) scale(${1 + glow * 0.04 + (active ? punch(frame) * 0.03 : 0)})`,
      }}
    >
      <div style={{fontFamily: withEmoji(BODY), fontWeight: 800, fontSize: 44, color: COLORS.ink, width: 230}}>{title}</div>
      <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 18}}>{children}</div>
    </div>
  );
};

/** СЦЕНА 5 — СВОЁ ОФОРМЛЕНИЕ: шрифт, палитра, логотип компании. */
export const Scene05Customize: React.FC = () => {
  const frame = useCurrentFrame();

  // Шрифт меняется на каждом бите (первые 4 бита), затем фиксируется
  const fontIdx = frame < FONT_END ? Math.floor(frame / 15) % SHOWCASE_FONTS.length : 1;
  const font = SHOWCASE_FONTS[fontIdx];

  // Палитра меняется на каждом бите (биты 4–8)
  const palIdx = frame < FONT_END ? 0 : frame < PALETTE_END ? Math.floor((frame - FONT_END) / 15) % PALETTES.length + 1 : 4;
  const pal = PALETTES[Math.min(palIdx, PALETTES.length - 1)];

  // Логотип влетает в угол слайда
  const logoAt = b(9);
  const logoP = pop(frame, logoAt, {damping: 10, stiffness: 120});
  const logoFly = lerpc(frame, [logoAt, logoAt + 18], [0, 1]);

  const slideIn = pop(frame, 0, {damping: 12});
  const stage = frame < FONT_END ? 0 : frame < PALETTE_END ? 1 : 2;
  const flash = punch(frame, 3);

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.custom} speed={1.4} />
      <SparkleField count={9} seed={5} />

      <SceneHeadline text={T.headline} top={130} size={96} echo={COLORS.violet} />

      {/* большой слайд */}
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 740,
          transform: `translate(-50%, -50%) rotate(${-3 + Math.sin(frame / 18) * 1.5}deg) scale(${slideIn * (1 + flash * 0.02)}) perspective(1600px) rotateY(${Math.sin(frame / 25) * 6}deg)`,
        }}
      >
        <MiniSlide
          width={900}
          styleKey="startup"
          kind="chart"
          title={T.slideTitle}
          titleFont={font.family}
          bg={pal.bg}
          accent={pal.accent}
        />
        {logoFly > 0 ? (
          <div
            style={{
              position: 'absolute',
              right: 30,
              top: 30,
              transform: `translate(${(1 - logoFly) * -500}px, ${(1 - logoFly) * 800}px) rotate(${(1 - logoFly) * -360}deg) scale(${0.4 + logoP * 0.6})`,
            }}
          >
            <DemoLogo size={140} />
          </div>
        ) : null}
      </div>

      {/* подпись текущего шрифта */}
      <Float x={800} y={470} rotate={8} at={b(0.5)} seed={1}>
        <Badge text={`Aa · ${font.label}`} bg={COLORS.ink} color={COLORS.lime} size={40} font={font.family} />
      </Float>

      {/* панели инструментов */}
      <Panel active={stage === 0} title={`🔤 ${T.font}`} y={1070} at={b(0.5)}>
        {SHOWCASE_FONTS.slice(0, 4).map((f, i) => (
          <div
            key={f.label}
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: i === fontIdx % 4 && stage === 0 ? COLORS.lime : '#EEE8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: f.family,
              fontSize: 46,
              color: COLORS.ink,
              fontWeight: 900,
            }}
          >
            Аа
          </div>
        ))}
      </Panel>

      <Panel active={stage === 1} title={`🎨 ${T.palette}`} y={1250} at={b(1)}>
        {PALETTES.map((p, i) => (
          <div
            key={i}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: p.bg,
              border: `5px solid ${p.accent}`,
              boxShadow: i === palIdx && stage === 1 ? `0 0 0 6px ${COLORS.ink}` : 'none',
              transform: `scale(${i === palIdx && stage === 1 ? 1.2 + flash * 0.15 : 1})`,
            }}
          />
        ))}
      </Panel>

      <Panel active={stage === 2} title={`🏷 ${T.logo}`} y={1430} at={b(1.5)}>
        <div
          style={{
            height: 96,
            flex: 1,
            borderRadius: 22,
            border: `4px dashed ${COLORS.violet}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            fontFamily: withEmoji(BODY),
            fontWeight: 800,
            fontSize: 34,
            color: COLORS.violet,
          }}
        >
          {logoFly >= 1 ? '✅ logo.png загружен' : '⬆️ Загрузить logo.png'}
        </div>
      </Panel>

      {/* курсор-палец */}
      <div
        style={{
          position: 'absolute',
          left: stage === 0 ? 560 + (fontIdx % 4) * 114 : stage === 1 ? 530 + palIdx * 98 : 700,
          top: stage === 0 ? 1150 : stage === 1 ? 1320 : 1500,
          fontSize: 90,
          fontFamily: withEmoji('sans-serif'),
          transform: `translateY(${-punch(frame, 4) * 18}px) rotate(-15deg)`,
          filter: 'drop-shadow(4px 6px 0 #0008)',
        }}
      >
        👆
      </div>

      <Float x={130} y={480} rotate={-12} at={b(2)} seed={2}>
        <EmojiSticker emoji="✨" size={110} />
      </Float>
      <Float x={960} y={1020} rotate={10} at={b(9)} seed={3}>
        <Badge text="NEW" bg={COLORS.pink} size={46} />
      </Float>
    </AbsoluteFill>
  );
};
