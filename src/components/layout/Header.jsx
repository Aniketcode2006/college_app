import React from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { UserCheck, ShieldCheck, GraduationCap, PlusCircle, Radio, LogOut } from 'lucide-react';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

export const Header = ({ onOpenRegisterStudent, onOpenAddCourse }) => {
  const { 
    role, 
    setRole, 
    activeTab, 
    setActiveTab, 
    liveSession, 
    currentStudent,
    logout 
  } = useCollege();

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white font-mono text-xs font-semibold">
            U
          </div>
          <span>Unity College</span>
        </a>
        <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
          · Fall Term 2026
        </span>
      </div>

      {/* Zone 2: Navigation Links (Single-line, 4-5 concise labels) */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'dashboard' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          {role === 'student' ? 'My Dashboard' : 'Overview'}
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
          onClick={() => setActiveTab('timetable')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'timetable' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Timetable
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
          {role === 'student' ? 'My Attendance' : 'Attendance'}
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'grading' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          {role === 'student' ? 'My Grades' : 'Grading'}
        </button>
        {role !== 'student' && (
          <button
            onClick={() => setActiveTab('students')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'students' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Directory
          </button>
        )}
      </nav>

      {/* Zone 3: Role Switcher & Table Density & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Table Density Controller for clean, smaller tables */}
        <TableDensityToggle className="hidden md:inline-flex" />

        {/* Role Switcher or Student Session Badge */}
        {role === 'student' && currentStudent ? (
          <button
            onClick={() => setActiveTab('dashboard')}
            title={`Active Student: ${currentStudent.firstName} ${currentStudent.lastName} (${currentStudent.studentId})`}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors shadow-2xs group"
          >
            {currentStudent.avatarUrl ? (
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.firstName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-400 shrink-0"
              />
            ) : (
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentStudent.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
              >
                {currentStudent.firstName[0]}
              </div>
            )}
            <div className="flex flex-col text-left leading-tight">
              <span className="font-semibold text-slate-800 text-xs group-hover:text-indigo-600 transition-colors truncate max-w-[120px]">
                {currentStudent.firstName} {currentStudent.lastName}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentStudent.studentId}
              </span>
            </div>
          </button>
        ) : (
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
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
          </div>
        )}

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

        {/* Student Logout button */}
        <button
          onClick={logout}
          title="Sign Out / Switch User"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
