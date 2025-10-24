
import React, { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIG } from './constants';
import type { AudioConfig, StreamType } from './types';
import { useAudioEngine } from './hooks/useAudioEngine';
import Header from './components/Header';
import Controls from './components/Controls';
import StatusIndicator from './components/StatusIndicator';

const App: React.FC = () => {
  const [config, setConfig] = useState<AudioConfig>(() => {
    const savedConfigJSON = localStorage.getItem('soundKeeperConfig');
    if (savedConfigJSON) {
      try {
        const savedConfig = JSON.parse(savedConfigJSON);
        return { ...DEFAULT_CONFIG, ...savedConfig };
      } catch (e) {
        console.error("Failed to parse saved config, using defaults.", e);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const { isActive, start, stop, update } = useAudioEngine();

  useEffect(() => {
    localStorage.setItem('soundKeeperConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const getAudioDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        console.warn("enumerateDevices() not supported.");
        return;
      }
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputDevices = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices(audioOutputDevices);
      } catch (err) {
        console.error("Error getting audio devices:", err);
        try {
          // Fallback for when permission is denied - labels will be empty.
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioOutputDevices = devices.filter(d => d.kind === 'audiooutput');
          setAudioDevices(audioOutputDevices);
        } catch (e) {
          console.error("Could not enumerate devices after permission denial:", e);
        }
      }
    };
    getAudioDevices();

    const handleDeviceChange = () => {
        getAudioDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<AudioConfig>) => {
    setConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  }, []);
  
  const handleStreamTypeChange = useCallback((streamType: StreamType) => {
    const newConfig = { ...DEFAULT_CONFIG, streamType, deviceId: config.deviceId };
    setConfig(newConfig);
  }, [config.deviceId]);

  const handlePresetChange = useCallback((presetConfig: Partial<AudioConfig>) => {
    setConfig(prevConfig => ({ ...prevConfig, ...presetConfig }));
  }, []);

  const handleResetConfig = useCallback(() => {
    localStorage.removeItem('soundKeeperConfig');
    setConfig(DEFAULT_CONFIG);
  }, []);


  useEffect(() => {
    if (isActive) {
      update(config);
    }
  }, [config, isActive, update]);
  
  const toggleAudio = () => {
    if (isActive) {
      stop();
    } else {
      start(config);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-slate-900">
      <div className="w-full max-w-xl mx-auto bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 ring-1 ring-white/10">
        <Header />
        <div className="p-6 md:p-8 space-y-6">
          <StatusIndicator isActive={isActive} />
          <Controls 
            config={config} 
            onConfigChange={handleConfigChange} 
            onStreamTypeChange={handleStreamTypeChange}
            isActive={isActive} 
            audioDevices={audioDevices}
            onPresetChange={handlePresetChange}
            onResetConfig={handleResetConfig}
          />
          <button
            onClick={toggleAudio}
            className={`w-full text-lg font-bold py-4 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              isActive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
            }`}
            aria-live="polite"
          >
            {isActive ? 'Stop Sound Keeper' : 'Start Sound Keeper'}
          </button>
        </div>
      </div>
      <footer className="mt-8 text-center text-slate-500 text-sm max-w-xl mx-auto w-full">
        <p>&copy; 2024 Web Sound Keeper. Helps prevent standby issues on speakers like the T20 and ADAM T10S.</p>
        <details className="mt-4 text-left bg-slate-800/50 p-4 rounded-lg cursor-pointer">
          <summary className="font-semibold text-slate-400 hover:text-white list-none">How to Run Offline</summary>
          <div className="mt-3 space-y-2 text-slate-400 text-xs">
            <p>To run this app locally without an internet connection, you need to serve the files using a local web server due to browser security policies.</p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li><strong>Save the App:</strong> Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-slate-700 border border-slate-600 rounded-lg">Ctrl+S</kbd> or <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-slate-700 border border-slate-600 rounded-lg">Cmd+S</kbd> to save this page as "Web Page, Complete". This will download the HTML file and a folder with its assets.</li>
              <li><strong>Serve the Files:</strong> Open a terminal in the folder where you saved the files and use one of the following commands:
                <ul className="list-disc list-inside pl-4 mt-1 font-mono bg-slate-900/75 p-2 rounded">
                  <li>If you have Python 3: <code>python -m http.server</code></li>
                  <li>If you have Node.js: <code>npx serve</code></li>
                  <li>Or use an extension like "Live Server" in VS Code.</li>
                </ul>
              </li>
              <li><strong>Access the App:</strong> Open your browser and navigate to the address shown in your terminal (e.g., <code>http://localhost:8000</code>).</li>
            </ol>
          </div>
        </details>
      </footer>
    </div>
  );
};

export default App;
