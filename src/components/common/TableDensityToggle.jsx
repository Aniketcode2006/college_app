import React from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { Table, Maximize2, Minimize2 } from 'lucide-react';

export const TableDensityToggle = ({ className = '' }) => {
  const { isCompactMode, setIsCompactMode } = useCollege();

  return (
    <button
      type="button"
      onClick={() => setIsCompactMode(!isCompactMode)}
      title={isCompactMode ? 'Switch to Standard Table Spacing' : 'Switch to Compact / Smaller Table Spacing'}
      aria-label="Toggle compact table density"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
        isCompactMode
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      } ${className}`}
    >
      {isCompactMode ? (
        <>
          <Minimize2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Compact Density</span>
        </>
      ) : (
        <>
          <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Standard Density</span>
        </>
      )}
    </button>
  );
};
