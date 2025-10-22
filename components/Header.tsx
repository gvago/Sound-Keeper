
import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center p-6 border-b border-slate-700/50">
      <h1 className="text-3xl font-bold text-white">Web Sound Keeper</h1>
      <p className="text-slate-400 mt-2">
        Prevent your audio devices from sleeping, right in your browser.
      </p>
    </div>
  );
};

export default Header;
