import {Easing, interpolate, spring} from 'remotion';
import {BEAT, FPS} from './config';

/** Номер текущего бита и позиция внутри него (0…1). */
export const beatInfo = (frame: number) => ({
  beat: Math.floor(frame / BEAT),
  phase: (frame % BEAT) / BEAT,
});

/** «Удар» на каждом бите: 1 в момент бита, быстро затухает к 0. */
export const punch = (frame: number, decay = 4) => Math.exp(-(frame % BEAT) / decay);

/** Кадр n-го бита (можно дробный: b(1.5) = середина второго бита). */
export const b = (n: number) => Math.round(n * BEAT);

/** Пружина, стартующая на кадре `at`. */
export const pop = (
  frame: number,
  at: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
) =>
  spring({
    frame: frame - at,
    fps: FPS,
    config: {damping: 11, stiffness: 170, mass: 0.7, ...config},
  });

/** Линейная интерполяция с зажимом по краям. */
export const lerpc = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = Easing.bezier(0.2, 0.8, 0.2, 1),
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Детерминированный псевдослучайный генератор (одинаково во всех кадрах). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 9301.17 + 49297.3) * 233280.5;
  return x - Math.floor(x);
};
