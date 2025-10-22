
export enum StreamType {
  Zero = 'Zero',
  Fluctuate = 'Fluctuate',
  Sine = 'Sine',
  WhiteNoise = 'WhiteNoise',
  PinkNoise = 'PinkNoise',
  BrownNoise = 'BrownNoise',
}

export interface AudioConfig {
  streamType: StreamType;
  frequency: number;
  amplitude: number;
  isPeriodic: boolean;
  playDuration: number; // in seconds
  waitDuration: number; // in minutes
  deviceId: string;
}

export interface Preset {
  label: string;
  config: Partial<AudioConfig>;
}
