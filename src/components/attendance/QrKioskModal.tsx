import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { X, QrCode, Sparkles, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

interface QrKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrKioskModal: React.FC<QrKioskModalProps> = ({ isOpen, onClose }) => {
  const { liveSession, simulateRandomCheckIn } = useCollege();
  const [tokenCode, setTokenCode] = useState('VERITAS-CS301-8924');

  if (!isOpen) return null;

  const refreshPasscode = () => {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    setTokenCode(`VERITAS-CS301-${randomHex}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8 space-y-6">
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
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close kiosk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
          <div className="relative p-4 bg-white rounded-xl shadow-xs border border-slate-200">
            {/* High visual fidelity SVG QR Code representation */}
            <svg
              className="w-48 h-48 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner position markers */}
              <rect x="5" y="5" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
              <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#4f46e5" />

              <rect x="69" y="5" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
              <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#4f46e5" />

              <rect x="5" y="69" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
              <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#4f46e5" />

              {/* Data dots pattern */}
              <rect x="36" y="8" width="5" height="5" />
              <rect x="44" y="8" width="5" height="5" />
              <rect x="52" y="8" width="5" height="5" />
              <rect x="36" y="16" width="5" height="5" />
              <rect x="48" y="20" width="5" height="5" />
              <rect x="58" y="14" width="5" height="5" />

              <rect x="8" y="36" width="5" height="5" />
              <rect x="18" y="42" width="5" height="5" />
              <rect x="24" y="36" width="5" height="5" />
              <rect x="8" y="48" width="5" height="5" />
              <rect x="20" y="54" width="5" height="5" />

              <rect x="36" y="36" width="8" height="8" rx="1.5" fill="#4f46e5" />
              <rect x="48" y="38" width="6" height="6" />
              <rect x="58" y="36" width="5" height="5" />
              <rect x="70" y="38" width="7" height="7" />
              <rect x="82" y="36" width="5" height="5" />

              <rect x="38" y="48" width="6" height="6" />
              <rect x="48" y="50" width="8" height="8" rx="1" fill="#4f46e5" />
              <rect x="62" y="48" width="5" height="5" />
              <rect x="72" y="52" width="6" height="6" />
              <rect x="84" y="48" width="5" height="5" />

              <rect x="36" y="64" width="6" height="6" />
              <rect x="46" y="66" width="6" height="6" />
              <rect x="58" y="64" width="8" height="8" />
              <rect x="70" y="66" width="6" height="6" />

              <rect x="38" y="76" width="6" height="6" />
              <rect x="48" y="82" width="6" height="6" />
              <rect x="60" y="78" width="5" height="5" />
              <rect x="72" y="84" width="8" height="8" />
              <rect x="84" y="76" width="6" height="6" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 p-1 rounded-md shadow-xs border border-slate-200">
                <QrCode className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-700">
              Scan with Campus Mobile App or NFC Student ID Pass
            </div>
            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-2">
              <span>Token: <strong className="text-slate-900">{tokenCode}</strong></span>
              <button 
                onClick={refreshPasscode}
                className="text-indigo-600 hover:text-indigo-800 p-0.5" 
                title="Rotate session token"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulator button */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-950 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Interactive Simulator</span>
            </span>
            <span className="text-[11px] font-mono text-indigo-700">Demo Testing</span>
          </div>
          <p className="text-xs text-indigo-900/80 leading-relaxed text-left">
            Simulate a student arriving at the lecture hall and scanning their phone or NFC badge in real-time.
          </p>
          <button
            onClick={simulateRandomCheckIn}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Simulate Student Scan (Tap Check-In)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically signed geolocation token</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
