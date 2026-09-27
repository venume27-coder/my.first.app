import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, lerpc, pop, punch} from '../beat';
import {BRAND, COLORS, MESH, TEXTS} from '../config';
import {BODY, DISPLAY, withEmoji} from '../fonts';
import {userScreens} from '../assets';
import {MeshBackground} from '../components/MeshBackground';
import {SceneHeadline} from '../components/KineticText';
import {CoffeeScene, DecoBackground, PhotoBeans, PhotoCafe, PhotoLatte} from '../components/Illustrations';
import {MiniSlide} from '../components/MiniSlide';
import {Badge, Burst, Float, Label} from '../components/Stickers';
import {Img, staticFile} from 'remotion';

const T = TEXTS.images;

const CMD_START = b(0.8);
const CMD_END = b(2.6);
const GEN_START = b(3);
const GEN_END = b(6);
const PHOTOS_AT = b(6);
const DECO_AT = b(8.5);

/** Окно чата с командой /image и генерацией картинки. */
const ImageChat: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = pop(frame, b(0.4), {damping: 13});
  const chars = Array.from(T.command);
  const n = Math.floor(lerpc(frame, [CMD_START, CMD_END], [0, chars.length], (t) => t));
  const typed = chars.slice(0, n).join('');
  const botP = pop(frame, GEN_START - 4);
  const g = lerpc(frame, [GEN_START, GEN_END], [0, 1], (t) => t);
  const done = frame >= GEN_END;

  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: 400,
        height: 650,
        borderRadius: 40,
        background: COLORS.tgBg,
        boxShadow: `0 0 0 6px ${COLORS.ink}, 16px 18px 0 6px ${COLORS.ink}, 0 40px 80px #000a`,
        overflow: 'hidden',
        transform: `translateY(${(1 - inP) * 1400}px) rotate(${-2 + Math.sin(frame / 20)}deg)`,
        fontFamily: withEmoji(BODY),
      }}
    >
      {/* шапка */}
      <div style={{background: COLORS.tgHeader, height: 92, display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px'}}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.pink} 60%, ${COLORS.orange})`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          ✦
        </div>
        <div>
          <div style={{color: COLORS.tgText, fontSize: 30, fontWeight: 800}}>{BRAND.name}</div>
          <div style={{color: COLORS.tgMuted, fontSize: 22}}>бот</div>
        </div>
      </div>

      <div style={{padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18}}>
        {/* команда пользователя */}
        <div
          style={{
            alignSelf: 'flex-end',
            background: COLORS.tgOut,
            color: COLORS.tgText,
            borderRadius: 26,
            borderBottomRightRadius: 6,
            padding: '16px 24px',
            fontSize: 36,
            fontWeight: 700,
            minHeight: 50,
            maxWidth: 820,
          }}
        >
          <span style={{color: COLORS.lime, fontWeight: 800}}>{typed.slice(0, 6)}</span>
          {typed.slice(6)}
          {frame < CMD_END && Math.floor(frame / 8) % 2 === 0 ? '|' : ''}
        </div>

        {/* ответ бота с генерацией */}
        {frame >= GEN_START - 4 ? (
          <div
            style={{
              alignSelf: 'flex-start',
              background: COLORS.tgIn,
              borderRadius: 26,
              borderBottomLeftRadius: 6,
              padding: 10,
              transform: `scale(${botP})`,
              transformOrigin: '0 100%',
            }}
          >
            <div style={{position: 'relative', width: 600, height: 340, borderRadius: 20, overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, filter: `blur(${(1 - g) * 26}px) saturate(${0.4 + g * 0.8})`, transform: `scale(${1.15 - g * 0.15})`}}>
                <CoffeeScene />
              </div>
              {/* скан-линия генерации */}
              {!done ? (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `${g * 100}%`,
                      height: 6,
                      background: COLORS.cyan,
                      boxShadow: `0 0 30px 10px ${COLORS.cyan}`,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'linear-gradient(#ffffff18 2px, transparent 2px), linear-gradient(90deg, #ffffff18 2px, transparent 2px)',
                      backgroundSize: '30px 30px',
                      opacity: 1 - g,
                    }}
                  />
                </>
              ) : null}
            </div>
            <div style={{padding: '10px 10px 2px', color: COLORS.tgText, fontSize: 30, fontWeight: 700}}>
              {done ? '✨ Готово! Картинка добавлена на слайд' : `🎨 ${T.generating} ${Math.round(g * 100)}%`}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** СЦЕНА 6 — КАРТИНКИ ОТ ИИ: /image, подбор фото, декоративные фоны. */
export const Scene06AiImages: React.FC = () => {
  const frame = useCurrentFrame();
  const screens = userScreens();

  const photos = [PhotoLatte, PhotoBeans, PhotoCafe];
  const photosOut = lerpc(frame, [DECO_AT - 6, DECO_AT + 6], [0, 1]);
  const decoIn = pop(frame, DECO_AT, {damping: 11});
  const decoVariant = (Math.max(0, Math.floor((frame - DECO_AT) / 15)) % 3) as 0 | 1 | 2;

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.images} speed={1.5} rays />

      <SceneHeadline text={T.headline} top={130} size={104} echo={COLORS.cyan} />

      {screens[1] ? (
        <div
          style={{
            position: 'absolute',
            left: 190,
            top: 390,
            width: 700,
            height: 680,
            borderRadius: 40,
            overflow: 'hidden',
            boxShadow: `0 0 0 6px ${COLORS.ink}, 0 30px 60px #000a`,
          }}
        >
          <Img src={staticFile(screens[1])} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      ) : (
        <ImageChat />
      )}

      {/* /image — стикер-команда */}
      <Float x={860} y={395} rotate={10} at={b(0.8)} seed={1} style={{zIndex: 5}}>
        <Badge text="/image" bg={COLORS.lime} color={COLORS.ink} size={62} font={DISPLAY} />
      </Float>

      {/* подбор фото — полароиды */}
      {frame >= PHOTOS_AT && photosOut < 1 ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1100, display: 'flex', justifyContent: 'center', transform: `scale(${pop(frame, PHOTOS_AT)}) translateX(${-photosOut * 1200}px)`}}>
            <Label text={`📷 ${T.photos}`} bg={COLORS.ink} color={COLORS.white} size={50} />
          </div>
          {photos.map((P, i) => {
            const p = pop(frame, PHOTOS_AT + 4 + i * 4, {damping: 10});
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 110 + i * 300,
                  top: 1230 + (i === 1 ? -20 : 20),
                  width: 260,
                  padding: '14px 14px 44px',
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 20px 40px #0008',
                  transform: `rotate(${(i - 1) * 8 + (1 - p) * 40}deg) scale(${p}) translateX(${-photosOut * 1400}px)`,
                }}
              >
                <div style={{width: 232, height: 232, overflow: 'hidden'}}>
                  <P />
                </div>
              </div>
            );
          })}
        </>
      ) : null}

      {/* декоративные фоны */}
      {frame >= DECO_AT ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1090, display: 'flex', justifyContent: 'center', transform: `scale(${decoIn})`}}>
            <Label text={`🎨 ${T.backgrounds}`} bg={COLORS.ink} color={COLORS.lime} size={48} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 540,
              top: 1395,
              transform: `translate(-50%, -50%) rotate(${2 + Math.sin(frame / 15) * 1.5}deg) scale(${decoIn * (1 + punch(frame) * 0.03)})`,
            }}
          >
            <MiniSlide
              width={600}
              styleKey="neon"
              kind="bullets"
              title={'Наше\nменю'}
              fg={decoVariant === 2 ? '#3B1D0E' : '#FFFFFF'}
              background={<DecoBackground variant={decoVariant} t={frame} />}
            />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1590, display: 'flex', justifyContent: 'center', opacity: decoIn}}>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 38, color: COLORS.white, textShadow: `0 3px 0 ${COLORS.ink}, 0 0 20px ${COLORS.ink}`}}>
              {T.backgroundsSub}
            </div>
          </div>
        </>
      ) : null}

      <Float x={120} y={1080} at={b(6)} seed={2}>
        <Burst size={140} color={COLORS.pink} />
      </Float>
      <Float x={970} y={1120} rotate={-12} at={b(7)} seed={3}>
        <Badge text="AI" bg={COLORS.violet} size={54} />
      </Float>
    </AbsoluteFill>
  );
};
