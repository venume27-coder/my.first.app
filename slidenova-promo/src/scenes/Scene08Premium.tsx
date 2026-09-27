import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, lerpc, pop, punch, rand} from '../beat';
import {COLORS, MESH, TEXTS} from '../config';
import {ACCENT, BODY, DISPLAY, withEmoji} from '../fonts';
import {MeshBackground} from '../components/MeshBackground';
import {SceneHeadline} from '../components/KineticText';
import {BasicImage, PremiumImage} from '../components/Illustrations';
import {Marquee} from '../components/Marquee';
import {EmojiSticker, Float, Sparkle} from '../components/Stickers';

const T = TEXTS.premium;

const Column: React.FC<{
  x: number;
  pro?: boolean;
  title: string;
  items: readonly string[];
  at: number;
  image: React.ReactNode;
}> = ({x, pro = false, title, items, at, image}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, {damping: 11});
  const glow = pro ? 0.6 + 0.4 * Math.sin(frame / 6) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 400,
        width: 450,
        height: 660,
        borderRadius: 36,
        padding: 6,
        background: pro ? `linear-gradient(${frame * 3}deg, ${COLORS.lime}, ${COLORS.pink}, ${COLORS.cyan}, ${COLORS.orange})` : '#ffffff40',
        boxShadow: pro ? `0 0 ${60 * glow}px ${COLORS.pink}, 14px 16px 0 ${COLORS.ink}` : `10px 12px 0 ${COLORS.ink}`,
        transform: `translateY(${(1 - p) * 1200}px) rotate(${pro ? 3 : -3}deg) scale(${pro ? 1.03 + punch(frame) * 0.025 : 0.97})`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 30,
          background: pro ? 'linear-gradient(170deg, #2A0F52, #12052E)' : '#1d1633',
          padding: 22,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{fontFamily: withEmoji(DISPLAY), fontWeight: 900, fontSize: 46, color: pro ? COLORS.lime : '#ffffffcc', textAlign: 'center'}}>
          {pro ? '👑 ' : ''}
          {title}
        </div>
        <div style={{height: 200, borderRadius: 20, overflow: 'hidden', boxShadow: pro ? `0 0 0 3px ${COLORS.lime}` : 'none'}}>{image}</div>
        {items.map((it, i) => {
          const ip = pop(frame, at + b(1 + i * 0.7));
          return (
            <div
              key={it}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transform: `translateX(${(1 - ip) * 300}px)`,
                opacity: ip,
                fontFamily: withEmoji(BODY),
                fontWeight: 800,
                fontSize: 32,
                lineHeight: 1.15,
                color: COLORS.white,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: pro ? COLORS.lime : '#ffffff40',
                  color: COLORS.ink,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                ✓
              </div>
              {it}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** СЦЕНА 8 — PREMIUM: Бесплатно vs Premium, оплата через Click, автоматическое включение. */
export const Scene08Premium: React.FC = () => {
  const frame = useCurrentFrame();
  const payAt = b(6.5);
  const autoAt = b(8.5);
  const switchAt = b(10.5);
  const payP = pop(frame, payAt, {damping: 9});
  const autoP = pop(frame, autoAt, {damping: 12});
  const on = lerpc(frame, [switchAt, switchAt + 8], [0, 1]);

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.premium} speed={1.5} rays />
      <Marquee top={1660} rotate={4} speed={9} bg={COLORS.lime} color={COLORS.ink} size={44} />

      {/* конфетти-искры */}
      {Array.from({length: 10}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: rand(i * 11) * 1080,
            top: ((rand(i * 13) * 1920 + frame * (4 + rand(i) * 6)) % 1960) - 40,
          }}
        >
          <Sparkle size={40 + rand(i * 3) * 40} color={[COLORS.lime, COLORS.white, COLORS.pink][i % 3]} />
        </div>
      ))}

      <SceneHeadline text={T.headline} top={150} size={134} color={COLORS.lime} echo={COLORS.pink} mode="slam" />

      <Column x={60} title={T.free.title} items={T.free.items} at={b(1)} image={<BasicImage />} />
      <Column x={570} pro title={T.pro.title} items={T.pro.items} at={b(1.6)} image={<PremiumImage />} />

      {/* VS */}
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 700,
          transform: `translate(-50%, -50%) scale(${pop(frame, b(2.5)) * (1 + punch(frame) * 0.15)}) rotate(-10deg)`,
          width: 120,
          height: 120,
          borderRadius: 60,
          background: COLORS.orange,
          border: `6px solid ${COLORS.white}`,
          boxShadow: `6px 6px 0 ${COLORS.ink}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 46,
          color: COLORS.white,
          zIndex: 5,
        }}
      >
        VS
      </div>

      {/* Оплата через Click */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${payP}) rotate(${-3 + (1 - payP) * 30}deg)`,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: '#0A84FF',
            color: COLORS.white,
            fontFamily: withEmoji(ACCENT),
            fontSize: 58,
            padding: '18px 40px',
            borderRadius: 50,
            border: `6px solid ${COLORS.white}`,
            boxShadow: `10px 10px 0 ${COLORS.ink}, 0 0 50px #0A84FF`,
          }}
        >
          💳 {T.payBadge}
        </div>
      </div>

      {/* Premium включается автоматически */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1260, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `translateY(${(1 - autoP) * 600}px)`,
            opacity: Math.min(1, autoP * 2),
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            background: COLORS.white,
            borderRadius: 36,
            padding: '26px 36px',
            boxShadow: `12px 12px 0 ${COLORS.ink}`,
          }}
        >
          {/* тумблер */}
          <div
            style={{
              flexShrink: 0,
              width: 150,
              height: 84,
              borderRadius: 42,
              background: on > 0.5 ? COLORS.lime : '#C9C3DA',
              position: 'relative',
              border: `5px solid ${COLORS.ink}`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: 6 + on * 66,
                width: 62,
                height: 62,
                borderRadius: 31,
                background: COLORS.ink,
              }}
            />
          </div>
          <div style={{fontFamily: withEmoji(BODY), fontWeight: 800, fontSize: 42, lineHeight: 1.15, color: COLORS.ink, whiteSpace: 'pre-line'}}>
            {T.auto}
          </div>
        </div>
      </div>

      <Float x={130} y={1180} rotate={-12} at={switchAt} seed={1}>
        <EmojiSticker emoji="⚡" size={120} bg={COLORS.lime} />
      </Float>
      <Float x={960} y={330} rotate={12} at={b(2)} seed={2}>
        <EmojiSticker emoji="💎" size={110} />
      </Float>
    </AbsoluteFill>
  );
};
