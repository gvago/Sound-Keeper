import React from 'react';

interface SliderProps {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, unit, min, max, step, value, onChange }) => {
  const isLogarithmic = max > 1000;
  
  const toLog = (val: number) => {
    const minp = 0;
    const maxp = 100;
    const minv = Math.log(min);
    const maxv = Math.log(max);
    const scale = (maxv - minv) / (maxp - minp);
    return Math.exp(minv + scale * (val - minp));
  };
  
  const fromLog = (val: number) => {
    const minp = 0;
    const maxp = 100;
    const minv = Math.log(min);
    const maxv = Math.log(max);
    const scale = (maxv - minv) / (maxp - minp);
    return (Math.log(val) - minv) / scale + minp;
  };

  const sliderValue = isLogarithmic ? fromLog(value) : value;
  const sliderMax = isLogarithmic ? 100 : max;
  const sliderMin = isLogarithmic ? 0 : min;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(isLogarithmic ? toLog(newValue) : newValue);
  };

  const getPrecision = () => {
    if (label === 'Amplitude') return 2;
    if (label === 'Burst Duration') return 1;
    return 0;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="font-medium text-slate-300">{label}</label>
        <span className="text-sm font-mono bg-slate-700 text-slate-200 px-2 py-1 rounded">
          {value.toFixed(getPrecision())} {unit}
        </span>
      </div>
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={step}
        value={sliderValue}
        onChange={handleChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-sky-500"
      />
    </div>
  );
};

export default Slider;