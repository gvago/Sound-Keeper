
import React from 'react';

interface StatusIndicatorProps {
  isActive: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-slate-700/50">
      <div className="relative flex items-center justify-center">
        <div
          className={`w-4 h-4 rounded-full transition-colors ${
            isActive ? 'bg-green-400' : 'bg-red-500'
          }`}
        />
        {isActive && (
          <div
            className="absolute w-4 h-4 rounded-full bg-green-400 animate-ping"
            style={{ animationDuration: '1.5s' }}
          />
        )}
      </div>
      <span
        className={`text-lg font-semibold transition-colors ${
          isActive ? 'text-green-400' : 'text-red-500'
        }`}
      >
        Status: {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

export default StatusIndicator;
