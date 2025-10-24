
import React from 'react';
import type { AudioConfig, StreamType } from '../types';
import { STREAM_TYPE_OPTIONS, PRESETS } from '../constants';
import Slider from './Slider';

interface ControlsProps {
  config: AudioConfig;
  onConfigChange: (newConfig: Partial<AudioConfig>) => void;
  onStreamTypeChange: (streamType: StreamType) => void;
  isActive: boolean;
  audioDevices: MediaDeviceInfo[];
  onPresetChange: (presetConfig: Partial<AudioConfig>) => void;
  onResetConfig: () => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onConfigChange, onStreamTypeChange, isActive, audioDevices, onPresetChange, onResetConfig }) => {
  const selectedOption = STREAM_TYPE_OPTIONS.find(opt => opt.value === config.streamType);

  const showFrequency = config.streamType === 'Sine' || config.streamType === 'Fluctuate';
  const showAmplitude = config.streamType !== 'Zero' && config.streamType !== 'Fluctuate';

  return (
    <fieldset disabled={isActive} className="space-y-6 disabled:opacity-60">
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-slate-300 mb-2">Stream Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {STREAM_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onStreamTypeChange(option.value)}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors text-center ${
                  config.streamType === option.value
                    ? 'bg-sky-600 text-white ring-2 ring-sky-400'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {selectedOption && (
              <p className="text-sm text-slate-400 mt-3 px-1">{selectedOption.description}</p>
          )}
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-300">Presets</h3>
                <button
                    type="button"
                    onClick={onResetConfig}
                    className="text-sm font-semibold text-slate-400 hover:text-sky-400 transition-colors px-2 py-1 rounded"
                    aria-label="Reset all settings to default"
                >
                    Reset All
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        type="button"
                        onClick={() => onPresetChange(preset.config)}
                        className="px-3 py-2 text-sm font-semibold rounded-md transition-colors bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label htmlFor="device-selector" className="block text-lg font-medium text-slate-300 mb-2">Audio Output Device</label>
            <select
              id="device-selector"
              value={config.deviceId}
              onChange={(e) => onConfigChange({ deviceId: e.target.value })}
              className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="default">Default Device</option>
              {audioDevices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Device ${index + 1}`}
                </option>
              ))}
            </select>
            {audioDevices.length === 0 && (
                <p className="text-sm text-slate-400 mt-2 px-1">No other audio devices found.</p>
            )}
        </div>
      </div>


      <div className="space-y-4 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
            <label htmlFor="periodic-toggle" className="text-lg font-medium text-slate-300">
                Periodic Playback
            </label>
            <button
                id="periodic-toggle"
                type="button"
                role="switch"
                aria-checked={config.isPeriodic}
                onClick={() => onConfigChange({ isPeriodic: !config.isPeriodic })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.isPeriodic ? 'bg-sky-600' : 'bg-slate-600'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.isPeriodic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
        {config.isPeriodic && (
            <div className="space-y-4 pt-4 pl-4 border-l-2 border-slate-700">
                 <Slider
                    label="Burst Duration"
                    unit="s"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={config.playDuration}
                    onChange={(val) => onConfigChange({ playDuration: val })}
                  />
                  <Slider
                    label="Wait Interval"
                    unit="min"
                    min={1}
                    max={9}
                    step={1}
                    value={config.waitDuration}
                    onChange={(val) => onConfigChange({ waitDuration: val })}
                  />
            </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-700/50">
        {showFrequency && (
          <Slider
            label="Frequency"
            unit="Hz"
            min={1}
            max={config.streamType === 'Sine' ? 30000 : 200}
            step={1}
            value={config.frequency}
            onChange={(val) => onConfigChange({ frequency: val })}
          />
        )}
        {showAmplitude && (
           <Slider
            label="Amplitude"
            unit="%"
            min={0.01}
            max={100}
            step={0.01}
            value={config.amplitude}
            onChange={(val) => onConfigChange({ amplitude: val })}
          />
        )}
      </div>
    </fieldset>
  );
};

export default Controls;