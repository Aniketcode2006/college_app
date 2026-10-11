import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { UserCheck, ShieldCheck, GraduationCap, PlusCircle, Radio } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenRegisterStudent: () => void;
  onOpenAddCourse: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRegisterStudent, onOpenAddCourse }) => {
  const { role, setRole, activeTab, setActiveTab, liveSession } = useCollege();

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white font-mono text-xs font-semibold">
            V
          </div>
          <span>Veritas College</span>
        </a>
        <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
          · Fall Term 2026
        </span>
      </div>

      {/* Zone 2: Navigation Links (Single-line, 4-5 concise labels) */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'dashboard' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'courses' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Course Catalog
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
            activeTab === 'attendance' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          {liveSession.isLive && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'grading' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Grading
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'students' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Directory
        </button>
      </nav>

      {/* Zone 3: Role Switcher & 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Switcher with clean unboxed style */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setRole('admin')}
            title="Administrator View: Full access to add/edit courses, registrations, and settings"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              role === 'admin'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Admin</span>
          </button>
          <button
            onClick={() => setRole('professor')}
            title="Professor View: Focus on real-time attendance roll-call and grading"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              role === 'professor'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Professor</span>
          </button>
          <button
            onClick={() => setRole('student')}
            title="Student View: Course catalog search, grade transcripts, and attendance status"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              role === 'student'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Student</span>
          </button>
        </div>

        {/* Primary Action Button depending on Role */}
        {role === 'admin' ? (
          <button
            onClick={activeTab === 'courses' ? onOpenAddCourse : onOpenRegisterStudent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{activeTab === 'courses' ? 'New Course' : 'Register Student'}</span>
          </button>
        ) : role === 'professor' ? (
          <button
            onClick={() => setActiveTab('attendance')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Attendance</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('courses')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </button>
        )}
      </div>
    </header>
  );
};
