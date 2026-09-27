import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {b, lerpc, pop, punch, rand} from '../beat';
import {COLORS, MESH, TEXTS, sceneFrames} from '../config';
import {BODY, DISPLAY, withEmoji} from '../fonts';
import {MeshBackground} from '../components/MeshBackground';
import {Float, Tape} from '../components/Stickers';
import {Marquee} from '../components/Marquee';

const T = TEXTS.hook;

/** Аналоговые часы: секундная стрелка прыгает на каждый бит. */
const Clock: React.FC<{size: number}> = ({size}) => {
  const frame = useCurrentFrame();
  const tick = Math.floor(frame / 15);
  const ease = punch(frame, 3);
  const sec = (tick + 1 - ease) * 30;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="92" fill={COLORS.white} stroke={COLORS.ink} strokeWidth="10" />
      {Array.from({length: 12}).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="18"
          x2="100"
          y2={i % 3 === 0 ? 38 : 30}
          stroke={COLORS.ink}
          strokeWidth={i % 3 === 0 ? 7 : 4}
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}
      <line x1="100" y1="100" x2="100" y2="50" stroke={COLORS.ink} strokeWidth="9" strokeLinecap="round" transform="rotate(330 100 100)" />
      <line x1="100" y1="100" x2="100" y2="34" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" transform={`rotate(${frame * 1.5} 100 100)`} />
      <line x1="100" y1="112" x2="100" y2="26" stroke={COLORS.red} strokeWidth="4" strokeLinecap="round" transform={`rotate(${sec} 100 100)`} />
      <circle cx="100" cy="100" r="9" fill={COLORS.red} />
    </svg>
  );
};

/** СЦЕНА 1 — ХУК: пустой слайд «Презентация к завтра?», часы, красный таймер, глитч → взрыв цвета. */
export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = sceneFrames('hook');
  const panic = lerpc(frame, [0, dur], [0.3, 1], (t) => t);
  const shake = (seed: number, amp: number) => (rand(frame * 7 + seed) - 0.5) * amp * panic;

  // Таймер тикает раз в секунду: 00:59 → 00:58 → 00:57
  const secondsLeft = 59 - Math.floor(frame / 30);
  const timer = `00:${String(secondsLeft).padStart(2, '0')}`;
  const blink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0.55;

  const slideIn = pop(frame, 0, {damping: 12});
  const clockIn = pop(frame, b(0.5));
  const timerIn = pop(frame, b(1));
  const panicIn = pop(frame, b(3));

  // Взрыв цвета в последние ~12 кадров
  const boom = lerpc(frame, [dur - 12, dur], [0, 1], (t) => t * t);

  return (
    <AbsoluteFill>
      <MeshBackground colors={MESH.hook} speed={2} base="#1a0610" />
      {/* тревожная лента */}
      <Marquee top={1560} rotate={7} speed={10} bg="#FFD400" color={COLORS.ink} size={44} text="ДЕДЛАЙН ⚠ ДЕДЛАЙН ⚠ " />
      <Marquee top={40} rotate={-5} speed={9} bg={COLORS.red} color={COLORS.white} size={40} reverse text="СРОЧНО ✦ К ЗАВТРА ✦ " />

      {/* разлетающиеся листки-бумажки */}
      {Array.from({length: 7}).map((_, i) => (
        <Float key={i} x={100 + rand(i + 3) * 880} y={300 + rand(i * 5) * 1300} seed={i} amp={30} rotate={rand(i) * 90 - 45} at={i * 2}>
          <div style={{width: 130, height: 170, background: '#ffffffd0', borderRadius: 8, boxShadow: '0 8px 20px #0006'}}>
            {[0, 1, 2, 3].map((l) => (
              <div key={l} style={{margin: '22px 16px 0', height: 8, borderRadius: 4, background: '#0002'}} />
            ))}
          </div>
        </Float>
      ))}

      {/* часы */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 170,
          transform: `scale(${clockIn * (1 + punch(frame) * 0.08)}) rotate(${-10 + shake(1, 12)}deg)`,
        }}
      >
        <Clock size={260} />
      </div>

      {/* красный таймер */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 215,
          transform: `scale(${timerIn * (1 + punch(frame) * 0.12)}) rotate(${6 + shake(2, 8)}deg)`,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 132,
          color: COLORS.red,
          opacity: blink,
          textShadow: `0 0 30px ${COLORS.red}, 6px 6px 0 ${COLORS.ink}`,
          WebkitTextStroke: `4px ${COLORS.white}`,
          letterSpacing: -4,
        }}
      >
        {timer}
      </div>

      {/* пустой белый слайд */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 560,
          width: 940,
          height: 700,
          transform: `translate(${shake(3, 30)}px, ${shake(4, 20) + (1 - slideIn) * 900}px) rotate(${-4 + shake(5, 5)}deg) scale(${1 + punch(frame) * 0.03})`,
          background: COLORS.white,
          borderRadius: 24,
          boxShadow: `18px 22px 0 ${COLORS.ink}, 0 40px 90px #000a`,
          border: `6px solid ${COLORS.ink}`,
          padding: 50,
          boxSizing: 'border-box',
        }}
      >
        <Tape width={200} rotate={-12} />
        <div
          style={{
            marginTop: 30,
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 86,
            lineHeight: 1.08,
            color: COLORS.ink,
            whiteSpace: 'pre-line',
          }}
        >
          {T.slideTitle}
        </div>
        <div
          style={{
            marginTop: 36,
            border: '4px dashed #0003',
            borderRadius: 16,
            padding: '22px 26px',
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 34,
            color: '#0006',
          }}
        >
          Нажмите, чтобы добавить текст
        </div>
      </div>

      {/* «А СЛАЙДОВ НЕТ» */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1330,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${panicIn}) rotate(${3 + shake(6, 6)}deg)`,
        }}
      >
        <div
          style={{
            background: COLORS.red,
            color: COLORS.white,
            fontFamily: withEmoji(DISPLAY),
            fontWeight: 900,
            fontSize: 74,
            padding: '14px 38px',
            borderRadius: 20,
            border: `6px solid ${COLORS.white}`,
            boxShadow: `10px 10px 0 ${COLORS.ink}`,
          }}
        >
          {T.panic} 😱
        </div>
      </div>

      {/* взрыв цвета */}
      {boom > 0 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          {[COLORS.lime, COLORS.cyan, COLORS.pink, COLORS.violet].map((c, i) => (
            <div
              key={c}
              style={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: c,
                transform: `scale(${Math.max(0, boom * 7 - i * 1.2)})`,
              }}
            />
          ))}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
