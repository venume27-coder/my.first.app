import React from 'react';
import {useCurrentFrame} from 'remotion';
import {lerpc, pop} from '../beat';
import {BRAND, COLORS} from '../config';
import {BODY, withEmoji} from '../fonts';

export type ChatItem =
  | {kind: 'text'; from: 'user' | 'bot'; at: number; text: string; buttons?: string[][]; time?: string}
  | {kind: 'typing'; at: number; until: number}
  | {kind: 'progress'; at: number; from: number; to: number; label: string}
  | {kind: 'file'; at: number; name: string; meta: string}
  | {kind: 'image'; at: number; from: 'user' | 'bot'; node: React.ReactNode; height?: number; caption?: string};

const FONT = 25;

const Bubble: React.FC<{from: 'user' | 'bot'; at: number; children: React.ReactNode; pad?: number; time?: string}> = ({
  from,
  at,
  children,
  pad = 16,
  time = '9:41',
}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, {damping: 13, stiffness: 220});
  const isUser = from === 'user';
  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '84%',
        transformOrigin: isUser ? '100% 100%' : '0% 100%',
        transform: `scale(${p}) translateY(${(1 - p) * 30}px)`,
        opacity: Math.min(1, p * 2),
      }}
    >
      <div
        style={{
          background: isUser ? COLORS.tgOut : COLORS.tgIn,
          color: COLORS.tgText,
          borderRadius: 24,
          borderBottomRightRadius: isUser ? 6 : 24,
          borderBottomLeftRadius: isUser ? 24 : 6,
          padding: pad,
          paddingBottom: pad - 4,
          fontFamily: withEmoji(BODY),
          fontWeight: 500,
          fontSize: FONT,
          lineHeight: 1.3,
          boxShadow: '0 2px 4px #0004',
        }}
      >
        {children}
        <div style={{textAlign: 'right', fontSize: 16, color: isUser ? '#9FC4E8' : COLORS.tgMuted, marginTop: 4}}>
          {time}
          {isUser ? ' ✓✓' : ''}
        </div>
      </div>
    </div>
  );
};

const TypingDots: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{alignSelf: 'flex-start', background: COLORS.tgIn, borderRadius: 24, padding: '20px 24px', display: 'flex', gap: 8}}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: COLORS.tgMuted,
            opacity: 0.4 + 0.6 * Math.max(0, Math.sin(frame / 3 - i)),
          }}
        />
      ))}
    </div>
  );
};

const Buttons: React.FC<{rows: string[][]; at: number}> = ({rows, at}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6}}>
      {rows.map((row, ri) => (
        <div key={ri} style={{display: 'flex', gap: 6}}>
          {row.map((label, bi) => {
            const p = pop(frame, at + 4 + ri * 3 + bi * 2);
            return (
              <div
                key={bi}
                style={{
                  flex: 1,
                  background: '#2B3B4DCC',
                  color: COLORS.tgText,
                  borderRadius: 14,
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontFamily: withEmoji(BODY),
                  fontWeight: 700,
                  fontSize: 21,
                  transform: `scale(${p})`,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Интерфейс Telegram-чата с ботом @SlideNovaBot (тёмная тема). */
export const TelegramChat: React.FC<{
  items: ChatItem[];
  input?: {text: string; start: number; end: number; sendAt?: number};
}> = ({items, input}) => {
  const frame = useCurrentFrame();

  let inputText = '';
  if (input && frame >= input.start && (input.sendAt === undefined || frame < input.sendAt)) {
    const n = Math.floor(lerpc(frame, [input.start, input.end], [0, Array.from(input.text).length], (t) => t));
    inputText = Array.from(input.text).slice(0, n).join('');
  }
  const caret = Math.floor(frame / 8) % 2 === 0;

  const visible = items.filter((it) => frame >= it.at && (it.kind !== 'typing' || frame < it.until));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: COLORS.tgBg,
        fontFamily: withEmoji(BODY),
      }}
    >
      {/* статус-бар + шапка */}
      <div style={{background: COLORS.tgHeader, paddingTop: 70, paddingBottom: 16, boxShadow: '0 2px 6px #0006', zIndex: 2}}>
        <div style={{position: 'absolute', top: 24, left: 50, color: '#fff', fontSize: 22, fontWeight: 700}}>9:41</div>
        <div style={{position: 'absolute', top: 26, right: 46, color: '#fff', fontSize: 18, fontWeight: 700}}>5G ▮▮▮</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px'}}>
          <div style={{color: COLORS.tgAccent, fontSize: 44, lineHeight: 1, marginTop: -6}}>‹</div>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.pink} 60%, ${COLORS.orange})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            ✦
          </div>
          <div style={{flex: 1}}>
            <div style={{color: COLORS.tgText, fontSize: 27, fontWeight: 800}}>{BRAND.name}</div>
            <div style={{color: COLORS.tgMuted, fontSize: 20, fontWeight: 500}}>бот · {BRAND.handle}</div>
          </div>
          <div style={{color: COLORS.tgMuted, fontSize: 34, fontWeight: 800}}>⋮</div>
        </div>
      </div>

      {/* лента сообщений */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 14,
          padding: '16px 18px',
          backgroundImage: `radial-gradient(circle at 20% 30%, #ffffff08 0 22px, transparent 23px),
            radial-gradient(circle at 70% 60%, #ffffff06 0 30px, transparent 31px),
            linear-gradient(160deg, #0E1621, #13202e 60%, #101a26)`,
          backgroundSize: '180px 180px, 240px 240px, 100% 100%',
        }}
      >
        {visible.map((it, i) => {
          switch (it.kind) {
            case 'text':
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignSelf: it.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '100%'}}>
                  <Bubble from={it.from} at={it.at} time={it.time}>
                    <span style={{whiteSpace: 'pre-line'}}>{it.text}</span>
                  </Bubble>
                  {it.buttons ? <Buttons rows={it.buttons} at={it.at} /> : null}
                </div>
              );
            case 'typing':
              return <TypingDots key={i} />;
            case 'progress': {
              const v = lerpc(frame, [it.from, it.to], [0, 100], (t) => 1 - Math.pow(1 - t, 2));
              return (
                <Bubble key={i} from="bot" at={it.at}>
                  <div style={{fontWeight: 700, marginBottom: 10}}>⏳ {it.label}</div>
                  <div style={{width: 330, height: 18, borderRadius: 9, background: '#0E1621', overflow: 'hidden'}}>
                    <div
                      style={{
                        width: `${v}%`,
                        height: '100%',
                        borderRadius: 9,
                        background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.violet}, ${COLORS.pink})`,
                      }}
                    />
                  </div>
                  <div style={{marginTop: 8, fontSize: 22, color: COLORS.tgAccent, fontWeight: 800}}>{Math.round(v)}%</div>
                </Bubble>
              );
            }
            case 'file':
              return (
                <Bubble key={i} from="bot" at={it.at}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 38,
                        background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.pink})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 800,
                        color: '#fff',
                      }}
                    >
                      PPTX
                    </div>
                    <div>
                      <div style={{fontWeight: 800, fontSize: 23}}>{it.name}</div>
                      <div style={{color: COLORS.tgMuted, fontSize: 20}}>{it.meta}</div>
                    </div>
                  </div>
                </Bubble>
              );
            case 'image':
              return (
                <Bubble key={i} from={it.from} at={it.at} pad={6}>
                  <div style={{width: 400, height: it.height ?? 300, borderRadius: 18, overflow: 'hidden'}}>{it.node}</div>
                  {it.caption ? <div style={{padding: '8px 10px 0'}}>{it.caption}</div> : null}
                </Bubble>
              );
            default:
              return null;
          }
        })}
      </div>

      {/* поле ввода */}
      <div style={{background: COLORS.tgHeader, padding: '14px 16px 40px', display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{background: COLORS.tgAccent, color: '#fff', borderRadius: 16, padding: '8px 14px', fontSize: 20, fontWeight: 800}}>☰ Меню</div>
        <div
          style={{
            flex: 1,
            background: COLORS.tgBg,
            borderRadius: 26,
            padding: '12px 18px',
            fontSize: 22,
            color: inputText ? COLORS.tgText : COLORS.tgMuted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            direction: 'rtl',
            textAlign: 'left',
          }}
        >
          <span style={{direction: 'ltr', unicodeBidi: 'plaintext'}}>
            {inputText || 'Сообщение'}
            {inputText && caret ? '|' : ''}
          </span>
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            background: inputText ? COLORS.tgAccent : 'transparent',
            color: inputText ? '#fff' : COLORS.tgMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
          }}
        >
          {inputText ? '➤' : '🎤'}
        </div>
      </div>
    </div>
  );
};
