import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './config';
import {Promo} from './Promo';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SlideNovaPromo"
    component={Promo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{showSafeZone: false}}
  />
);
