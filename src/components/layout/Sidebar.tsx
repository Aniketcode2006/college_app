import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Radio, 
  FileSpreadsheet, 
  Users, 
  BarChart3, 
  RotateCcw,
  Sparkles,
  School,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { ActiveNavTab } from '../../types';

interface SidebarProps {
  onOpenRegisterStudent: () => void;
  onOpenAddCourse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { activeTab, setActiveTab, role, liveSession, courses, students, resetToDefaults } = useCollege();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('veritas_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('veritas_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { 
      id: 'dashboard', 
      label: 'Campus Overview', 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'courses', 
      label: 'Course Catalog', 
      icon: <BookOpen className="w-4 h-4" />, 
      badge: `${courses.length}` 
    },
    { 
      id: 'attendance', 
      label: 'Live Attendance', 
      icon: <Radio className="w-4 h-4" />,
      badge: liveSession.isLive ? 'LIVE' : undefined
    },
    { 
      id: 'grading', 
      label: 'Gradebook & Rubrics', 
      icon: <FileSpreadsheet className="w-4 h-4" /> 
    },
    { 
      id: 'students', 
      label: 'Student Directory', 
      icon: <Users className="w-4 h-4" />, 
      badge: `${students.length}` 
    },
    { 
      id: 'analytics', 
      label: 'Academic Analytics', 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-57px)] transition-all duration-200 select-none`}
    >
      {/* College Identity Card & Collapse Button (Selected Element 1) */}
      <div className={`border-b border-slate-100 ${isCollapsed ? 'p-3' : 'p-4'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={toggleCollapse}
              title="Expand sidebar"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4 text-slate-700" />
            </button>
            <div
              className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold shrink-0 shadow-2xs"
              title="Veritas University"
            >
              <School className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold shrink-0">
                  <School className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">Veritas University</div>
                  <div className="text-xs text-slate-500 truncate">Academic Registry & ERP</div>
                </div>
              </div>

              {/* Sidebar Collapse Toggle Button */}
              <button
                onClick={toggleCollapse}
                title="Collapse sidebar to icon bar"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active User Profile Banner */}
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {role === 'admin' 
                    ? 'Dean\'s Registry' 
                    : role === 'professor' 
                    ? 'Prof. Dr. Evelyn Vance' 
                    : 'Maya Lin (Student)'}
                </div>
                <div className="text-[11px] text-slate-500 truncate capitalize font-mono">
                  {role === 'admin' 
                    ? 'Administrative Control' 
                    : role === 'professor' 
                    ? 'Chair of Computer Science' 
                    : 'Junior · STU-2024-001'}
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                {role}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Navigation Links (Selected Element 2) */}
      <nav className={`${isCollapsed ? 'p-2' : 'p-3'} flex-1 flex flex-col gap-1`}>
        {!isCollapsed && (
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Management Modules
          </div>
        )}

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
              } rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'gap-2.5 truncate'}`}>
                <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    item.badge === 'LIVE'
                      ? 'bg-emerald-500 text-white font-bold animate-pulse'
                      : isActive
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isCollapsed && item.badge === 'LIVE' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Lecture Shortcut */}
      {!isCollapsed ? (
        <div className="p-3 m-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Lecture</span>
          </div>
          <p className="text-[11px] text-indigo-900 leading-relaxed font-mono">
            CS-301 · Hall B (Turing)
          </p>
          <p className="text-[11px] text-indigo-700 mt-0.5">
            10:00 AM – 11:30 AM
          </p>
          <button
            onClick={() => setActiveTab('attendance')}
            className="mt-2.5 w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors text-center"
          >
            Open Live Roll-Call
          </button>
        </div>
      ) : (
        <div className="p-2 flex justify-center">
          <button
            onClick={() => setActiveTab('attendance')}
            title="Open Live Roll-Call (CS-301)"
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Utility */}
      <div
        className={`${
          isCollapsed ? 'p-2 justify-center' : 'p-3 justify-between'
        } border-t border-slate-100 flex items-center text-xs text-slate-500`}
      >
        <button
          onClick={resetToDefaults}
          title="Reset sample college database"
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors p-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {!isCollapsed && <span className="text-[11px]">Reset Data</span>}
        </button>
        {!isCollapsed && (
          <span className="text-[10px] font-mono text-slate-400">Veritas v2.4</span>
        )}
      </div>
    </aside>
  );
};
