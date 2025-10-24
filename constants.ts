import type { AudioConfig, Preset } from './types';
import { StreamType } from './types';

export const DEFAULT_CONFIG: AudioConfig = {
  streamType: StreamType.Sine,
  frequency: 24500, // Hz
  amplitude: 50, // Percentage
  isPeriodic: true,
  playDuration: 0.5, // seconds
  waitDuration: 9, // minutes
  deviceId: 'default',
};

export const PRESETS: Preset[] = [
  {
    label: '15 Hz Sine Wave (Subsonic)',
    config: {
      streamType: StreamType.Sine,
      frequency: 15,
      amplitude: 0.5,
      isPeriodic: false,
    },
  },
  {
    label: 'Periodic Pulse (24.5kHz, 50%)',
    config: {
      streamType: StreamType.Sine,
      isPeriodic: true,
      playDuration: 0.5,
      waitDuration: 9,
      frequency: 24500,
      amplitude: 50,
    },
  },
];

export const STREAM_TYPE_OPTIONS = [
  { value: StreamType.Fluctuate, label: 'Fluctuate', description: 'Plays zeroes with tiny non-zero samples. Usually inaudible.' },
  { value: StreamType.Sine, label: 'Sine Wave', description: 'A pure tone. Can be audible depending on frequency and amplitude.' },
  { value: StreamType.WhiteNoise, label: 'White Noise', description: 'Static-like sound with equal energy across all frequencies.' },
  { value: StreamType.PinkNoise, label: 'Pink Noise', description: 'Deeper than white noise, often found in nature (wind, rain).' },
  { value: StreamType.BrownNoise, label: 'Brown Noise', description: 'Even deeper, like a heavy waterfall or thunder.' },
  { value: StreamType.Zero, label: 'Zero (Silence)', description: 'Plays a stream of absolute silence. May not work on all systems.' },
];