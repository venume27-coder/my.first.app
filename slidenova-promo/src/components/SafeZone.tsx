import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SAFE} from '../config';

/** Отладочная разметка safe-зоны (включается пропсом showSafeZone). */
export const SafeZoneGuides: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: '#ff000040'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: SAFE.bottom, background: '#ff000040'}} />
    <div
      style={{
        position: 'absolute',
        left: SAFE.side,
        right: SAFE.side,
        top: SAFE.top,
        bottom: SAFE.bottom,
        border: '4px dashed #ff2020',
      }}
    />
  </AbsoluteFill>
);
