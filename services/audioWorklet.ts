
export const getWorkletCode = (): string => `
  class SoundProcessor extends AudioWorkletProcessor {
    // For Pink Noise
    b0 = 0; b1 = 0; b2 = 0; b3 = 0; b4 = 0; b5 = 0; b6 = 0;
    
    // For Brown Noise
    lastOut = 0;
    
    // For Sine wave
    theta = 0;

    static get parameterDescriptors() {
      return [
        { name: 'type', defaultValue: 0, minValue: 0, maxValue: 5, automationRate: 'k-rate' }, // 0:Zero, 1:Fluctuate, 2:Sine, 3:White, 4:Pink, 5:Brown
        { name: 'frequency', defaultValue: 50, minValue: 1, maxValue: 30000, automationRate: 'k-rate' },
        { name: 'isPeriodic', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
        { name: 'playDuration', defaultValue: 0.5, minValue: 0.1, maxValue: 10, automationRate: 'k-rate' }, // seconds
        { name: 'waitDuration', defaultValue: 9, minValue: 0, maxValue: 60, automationRate: 'k-rate' }, // minutes
      ];
    }

    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const type = parameters.type[0];
      const frequency = parameters.frequency[0];
      const isPeriodic = parameters.isPeriodic[0] > 0.5;
      const playDuration = parameters.playDuration[0];
      const waitDuration = parameters.waitDuration[0] * 60; // minutes to seconds

      const attackDurationFrames = 0.002 * sampleRate; // 2ms attack
      const decayDurationFrames = 0.002 * sampleRate;  // 2ms decay

      const cycleDurationFrames = isPeriodic ? (playDuration + waitDuration) * sampleRate : 0;
      const playDurationFrames = isPeriodic ? playDuration * sampleRate : 0;

      for (let i = 0; i < output[0].length; i++) {
        let value = 0;
        let envelope = 1.0;
        const currentTotalFrame = currentFrame + i;
        let shouldPlay = !isPeriodic;

        if (isPeriodic && cycleDurationFrames > 0) {
            const frameInCycle = currentTotalFrame % cycleDurationFrames;
            if (frameInCycle < playDurationFrames) {
                shouldPlay = true;
                
                // Envelope shaping for attack and decay
                if (frameInCycle < attackDurationFrames) {
                    // Attack phase
                    envelope = frameInCycle / attackDurationFrames;
                } else if (frameInCycle > playDurationFrames - decayDurationFrames) {
                    // Decay phase
                    envelope = (playDurationFrames - frameInCycle) / decayDurationFrames;
                }
            }
        }
        
        if (shouldPlay) {
            switch (type) {
              case 1: { // Fluctuate
                const fluctuateInterval = Math.max(1, Math.floor(sampleRate / frequency));
                if (currentTotalFrame % fluctuateInterval === 0) {
                  // 1.192093E-7 is 1/8388607, minimal 24-bit deviation from 0.
                  value = 1.192093e-7 * ((Math.floor(currentTotalFrame / fluctuateInterval)) % 2 === 0 ? 1 : -1);
                }
                break;
              }
              case 2: { // Sine
                const theta_increment = (frequency * 2 * Math.PI) / sampleRate;
                value = Math.sin(this.theta);
                this.theta += theta_increment;
                if (this.theta > 2 * Math.PI) {
                    this.theta -= 2 * Math.PI;
                }
                break;
              }
              case 3: // White Noise
                value = Math.random() * 2 - 1;
                break;
              case 4: { // Pink Noise
                const white = Math.random() * 2 - 1;
                this.b0 = 0.99886 * this.b0 + white * 0.0555179;
                this.b1 = 0.99332 * this.b1 + white * 0.0750759;
                this.b2 = 0.96900 * this.b2 + white * 0.1538520;
                this.b3 = 0.86650 * this.b3 + white * 0.3104856;
                this.b4 = 0.55000 * this.b4 + white * 0.5329522;
                this.b5 = -0.7616 * this.b5 - white * 0.0168980;
                value = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
                this.b6 = white * 0.115926;
                value *= 0.11; // (roughly) compensate for gain
                break;
              }
              case 5: { // Brown Noise
                const white_brown = Math.random() * 2 - 1;
                this.lastOut = (this.lastOut + (0.02 * white_brown)) / 1.02;
                value = this.lastOut;
                // Clamp to prevent runaway values
                if (value > 1.0) value = 1.0;
                if (value < -1.0) value = -1.0;
                break;
              }
              case 0: // Zero (Silence)
              default:
                value = 0;
                break;
            }
        }

        // Apply envelope and clamp value
        value *= Math.max(0, envelope);

        for (let j = 0; j < output.length; j++) {
            output[j][i] = value;
        }
      }
      return true;
    }
  }

  registerProcessor('sound-processor', SoundProcessor);
`;