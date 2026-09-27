import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {punch} from './beat';
import {COLORS, MUSIC, SCENE_ORDER, SceneKey, TOTAL_FRAMES, VOICE, sceneFrames, sceneStart} from './config';
import {hasMusic, hasVoice} from './assets';
import {VOICE_SEGMENTS} from './voiceSegments';
import {Grain} from './components/Grain';
import {ChromaDefs, GlitchBars, glitchAmount, glitchTransform} from './components/Glitch';
import {SafeZoneGuides} from './components/SafeZone';
import {Scene01Hook} from './scenes/Scene01Hook';
import {Scene02Solution} from './scenes/Scene02Solution';
import {Scene03HowItWorks} from './scenes/Scene03HowItWorks';
import {Scene04Styles} from './scenes/Scene04Styles';
import {Scene05Customize} from './scenes/Scene05Customize';
import {Scene06AiImages} from './scenes/Scene06AiImages';
import {Scene07Transitions} from './scenes/Scene07Transitions';
import {Scene08Premium} from './scenes/Scene08Premium';
import {Scene09Cta} from './scenes/Scene09Cta';

const SCENES: Record<SceneKey, React.FC> = {
  hook: Scene01Hook,
  solution: Scene02Solution,
  how: Scene03HowItWorks,
  styles: Scene04Styles,
  custom: Scene05Customize,
  images: Scene06AiImages,
  transitions: Scene07Transitions,
  premium: Scene08Premium,
  cta: Scene09Cta,
};

const CUTS = SCENE_ORDER.slice(1).map((k) => sceneStart(k));

/** Множитель громкости музыки: плавно проседает, пока звучит голос. */
const musicDuck = (f: number, voiceOn: boolean) => {
  if (!voiceOn) return 1;
  let k = 1;
  for (const [s, e] of VOICE_SEGMENTS) {
    const r = VOICE.duckRamp;
    const v = interpolate(f, [s - r, s, e, e + r * 2], [1, VOICE.musicDuck, VOICE.musicDuck, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    k = Math.min(k, v);
  }
  return k;
};

export type PromoProps = {showSafeZone?: boolean};

export const Promo: React.FC<PromoProps> = ({showSafeZone = false}) => {
  const frame = useCurrentFrame();
  const g = glitchAmount(frame, CUTS);
  // zoom-punch на каждом бите (кроме финальной чистой плашки)
  const zoom = 1 + punch(frame, 4) * 0.022 * (frame < TOTAL_FRAMES - 45 ? 1 : 0);
  const voiceOn = hasVoice();

  return (
    <AbsoluteFill style={{background: COLORS.deep}}>
      {hasMusic() ? (
        <Audio
          src={staticFile(MUSIC.file)}
          volume={(f) =>
            interpolate(f, [0, 8, TOTAL_FRAMES - MUSIC.fadeOutFrames, TOTAL_FRAMES], [0, MUSIC.volume, MUSIC.volume, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }) * musicDuck(f, voiceOn)
          }
        />
      ) : null}
      {voiceOn ? <Audio src={staticFile(VOICE.file)} volume={VOICE.volume} /> : null}

      <ChromaDefs amount={g} />
      <AbsoluteFill
        style={{
          transform: `scale(${zoom}) ${glitchTransform(g, frame)}`,
          filter: g > 0.05 ? 'url(#chroma)' : undefined,
        }}
      >
        {SCENE_ORDER.map((key) => {
          const Scene = SCENES[key];
          return (
            <Sequence key={key} from={sceneStart(key)} durationInFrames={sceneFrames(key)} name={key}>
              <Scene />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      <GlitchBars amount={g} frame={frame} />
      <Grain opacity={0.22} />
      {showSafeZone ? <SafeZoneGuides /> : null}
    </AbsoluteFill>
  );
};
