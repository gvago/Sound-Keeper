import { useState, useRef, useCallback } from 'react';
import type { AudioConfig } from '../types';
import { StreamType } from '../types';
import { getWorkletCode } from '../services/audioWorklet';

type AudioNodes = {
    context: AudioContext;
    source: AudioWorkletNode;
    gain: GainNode;
};

export const useAudioEngine = () => {
  const [isActive, setIsActive] = useState(false);
  const audioNodesRef = useRef<AudioNodes | null>(null);
  const configRef = useRef<AudioConfig | null>(null);

  const createNodes = async (deviceId: string): Promise<AudioNodes> => {
    if (audioNodesRef.current) {
        await audioNodesRef.current.context.close();
    }
    
    // FIX: Property 'sinkId' does not exist on type 'AudioContextOptions'.
    // Widen the type to include `sinkId` and remove the incorrect feature detection.
    const contextOptions: AudioContextOptions & { sinkId?: string } = {};
    if (deviceId && deviceId !== 'default') {
        // The previous feature detection for 'sinkId' was incorrect and has been removed.
        // We now rely on the robust error handling in the start() function, which will
        // alert the user if the selected audio device is not supported.
        contextOptions.sinkId = deviceId;
    }
    
    const context = new AudioContext(contextOptions);
    const gain = context.createGain();
    gain.connect(context.destination);

    const workletURL = URL.createObjectURL(new Blob([getWorkletCode()], { type: 'application/javascript' }));
    await context.audioWorklet.addModule(workletURL);
    const source = new AudioWorkletNode(context, 'sound-processor');
    
    source.connect(gain);
    return { context, source, gain };
  };
  
  const applyConfig = (nodes: AudioNodes, config: AudioConfig) => {
    const { context, source, gain } = nodes;
    const { streamType, frequency, amplitude, isPeriodic, playDuration, waitDuration } = config;
    const now = context.currentTime;

    gain.gain.setValueAtTime(amplitude / 100, now);

    const typeParam = source.parameters.get('type');
    const freqParam = source.parameters.get('frequency');
    const periodicParam = source.parameters.get('isPeriodic');
    const playDurParam = source.parameters.get('playDuration');
    const waitDurParam = source.parameters.get('waitDuration');
    
    let typeValue = 0; // default to Zero
    if (streamType === StreamType.Fluctuate) typeValue = 1;
    if (streamType === StreamType.Sine) typeValue = 2;
    if (streamType === StreamType.WhiteNoise) typeValue = 3;
    if (streamType === StreamType.PinkNoise) typeValue = 4;
    if (streamType === StreamType.BrownNoise) typeValue = 5;
    
    if(typeParam) typeParam.setValueAtTime(typeValue, now);
    if(freqParam) freqParam.setValueAtTime(frequency, now);
    if(periodicParam) periodicParam.setValueAtTime(isPeriodic ? 1 : 0, now);
    if(playDurParam) playDurParam.setValueAtTime(playDuration, now);
    if(waitDurParam) waitDurParam.setValueAtTime(waitDuration, now);
  };

  const start = useCallback(async (config: AudioConfig) => {
    if (isActive) return;

    try {
      const newNodes = await createNodes(config.deviceId);
      audioNodesRef.current = newNodes;
      configRef.current = config;

      applyConfig(newNodes, config);
      
      if (newNodes.context.state === 'suspended') {
        await newNodes.context.resume();
      }

      setIsActive(true);
    } catch (error) {
      console.error("Failed to start audio engine:", error);
      if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'NotSupportedError')) {
          alert('The selected audio output device is not available or not supported. Please select another device.');
      }
      setIsActive(false);
    }
  }, [isActive]);

  const stop = useCallback(async () => {
    if (!isActive || !audioNodesRef.current) return;
    
    const { context, source } = audioNodesRef.current;
    
    source.disconnect();
    
    await context.close();
    
    audioNodesRef.current = null;
    configRef.current = null;
    setIsActive(false);
  }, [isActive]);
  
  const update = useCallback((newConfig: AudioConfig) => {
    if (!isActive || !audioNodesRef.current || !configRef.current) return;
    
    if (newConfig.streamType !== configRef.current.streamType || newConfig.deviceId !== configRef.current.deviceId) {
        stop().then(() => start(newConfig));
    } else {
        applyConfig(audioNodesRef.current, newConfig);
        configRef.current = newConfig;
    }
  }, [isActive, start, stop]);

  return { isActive, start, stop, update };
};
