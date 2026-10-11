import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { X, Sparkles, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export const QrKioskModal = ({ isOpen, onClose }) => {
  const { liveSession, simulateRandomCheckIn } = useCollege();
  const [tokenCode, setTokenCode] = useState('UNITY-CS301-8924');

  if (!isOpen) return null;

  const refreshPasscode = () => {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    setTokenCode(`UNITY-CS301-${randomHex}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-mono font-bold text-indigo-700">
              {liveSession.courseCode} · Live Kiosk
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Student Attendance Check-In Screen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            aria-label="Close kiosk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <div className="relative p-3.5 bg-white rounded-xl shadow-xs border border-slate-200">
            <svg
              className="w-44 h-44 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <rect x="5" y="5" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
              <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#4f46e5" />

              <rect x="69" y="5" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
              <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#4f46e5" />

              <rect x="5" y="69" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
              <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#4f46e5" />

              <rect x="36" y="8" width="8" height="8" fill="#0f172a" />
              <rect x="48" y="14" width="6" height="6" fill="#0f172a" />
              <rect x="58" y="8" width="6" height="6" fill="#0f172a" />

              <rect x="38" y="38" width="24" height="24" rx="4" fill="#4f46e5" />
              <rect x="44" y="44" width="12" height="12" fill="#ffffff" />
              <circle cx="50" cy="50" r="3" fill="#4f46e5" />

              <rect x="8" y="38" width="8" height="6" fill="#0f172a" />
              <rect x="20" y="48" width="8" height="6" fill="#0f172a" />
              <rect x="10" y="58" width="12" height="6" fill="#0f172a" />

              <rect x="68" y="38" width="10" height="6" fill="#0f172a" />
              <rect x="82" y="44" width="10" height="8" fill="#0f172a" />
              <rect x="70" y="56" width="12" height="6" fill="#0f172a" />

              <rect x="38" y="70" width="8" height="8" fill="#0f172a" />
              <rect x="50" y="78" width="10" height="8" fill="#0f172a" />
              <rect x="64" y="72" width="6" height="14" fill="#0f172a" />
              <rect x="78" y="78" width="14" height="12" fill="#0f172a" />
            </svg>

            <div className="absolute inset-x-0 -bottom-3 flex justify-center">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-600 text-white rounded-full shadow-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>ACTIVE KIOSK CODE</span>
              </span>
            </div>
          </div>

          <div className="text-center pt-2 space-y-1">
            <p className="text-xs text-slate-500">
              Students scan with camera or enter attendance passcode:
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono font-bold text-sm text-indigo-700 bg-white px-3 py-1 rounded-md border border-slate-200 tracking-wider">
                {tokenCode}
              </span>
              <button
                onClick={refreshPasscode}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/50 rounded-md transition-colors cursor-pointer"
                title="Generate new passcode"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Demo trigger */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Time-Bound Key</span>
          </div>
          <button
            onClick={simulateRandomCheckIn}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simulate Check-In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
