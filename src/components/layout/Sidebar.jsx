import React from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
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
  CalendarDays,
  Clock
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    role, 
    liveSession, 
    courses, 
    students, 
    resetToDefaults,
    currentStudent,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    logout
  } = useCollege();

  // Section 1: Academic / Management navigation items
  const coreNavItems = 
    role === 'student'
      ? [
          { 
            id: 'dashboard', 
            label: 'My Dashboard', 
            icon: <LayoutDashboard className="w-4 h-4" /> 
          },
          { 
            id: 'courses', 
            label: 'Course Catalog', 
            icon: <BookOpen className="w-4 h-4" />, 
            badge: `${courses.length}` 
          },
          { 
            id: 'grading', 
            label: 'My Transcripts & Grades', 
            icon: <FileSpreadsheet className="w-4 h-4" /> 
          },
        ]
      : [
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

  // Section 2: Dedicated "Time Table & Attendance" section
  const scheduleNavItems = [
    { 
      id: 'timetable', 
      label: 'Class Timetable', 
      icon: <CalendarDays className="w-4 h-4" />,
      badge: role === 'student' ? 'Fall 26' : '5 Days'
    },
    { 
      id: 'attendance', 
      label: role === 'student' ? 'Live Attendance' : 'Roll-Call & Attendance', 
      icon: <Radio className="w-4 h-4" />,
      badge: liveSession.isLive ? 'LIVE' : undefined
    },
  ];

  const renderNavButton = (item) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          setActiveTab(item.id);
          setIsSidebarCollapsed(true);
        }}
        title={isSidebarCollapsed ? item.label : undefined}
        className={`flex items-center ${
          isSidebarCollapsed ? 'justify-center p-2.5 relative' : 'justify-between px-3 py-2'
        } rounded-lg text-xs font-medium transition-all ${
          isActive
            ? 'bg-slate-900 text-white shadow-xs font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className={`flex items-center ${isSidebarCollapsed ? '' : 'gap-2.5 truncate'}`}>
          <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>
            {item.icon}
          </span>
          {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
        </div>

        {!isSidebarCollapsed && item.badge && (
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

        {isSidebarCollapsed && item.badge === 'LIVE' && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </button>
    );
  };

  return (
    <aside
      onMouseEnter={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
        }
      }}
      onMouseLeave={() => {
        if (!isSidebarCollapsed) {
          setIsSidebarCollapsed(true);
        }
      }}
      className={`${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-57px)] transition-all duration-200 select-none z-20`}
    >
      {/* College Identity Card */}
      <div className={`border-b border-slate-100 ${isSidebarCollapsed ? 'p-3' : 'p-4'}`}>
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center">
            {role === 'student' && currentStudent ? (
              currentStudent.avatarUrl ? (
                <img
                  src={currentStudent.avatarUrl}
                  alt={currentStudent.firstName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shadow-2xs"
                  title={`${currentStudent.firstName} ${currentStudent.lastName} (${currentStudent.studentId})`}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentStudent.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-2xs border-2 border-indigo-300`}
                  title={`${currentStudent.firstName} ${currentStudent.lastName} (${currentStudent.studentId})`}
                >
                  {currentStudent.firstName[0]}
                </div>
              )
            ) : (
              <div
                className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold shrink-0 shadow-2xs"
                title="Unity College"
              >
                <School className="w-5 h-5 text-indigo-400" />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold shrink-0">
                <School className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 truncate">Unity College</div>
                <div className="text-xs text-slate-500 truncate">
                  {role === 'student' ? 'Student Portal' : 'Academic Registry & ERP'}
                </div>
              </div>
            </div>

            {/* Current Active User Profile Banner */}
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {role === 'student' && currentStudent ? (
                  currentStudent.avatarUrl ? (
                    <img
                      src={currentStudent.avatarUrl}
                      alt={currentStudent.firstName}
                      className="w-8 h-8 rounded-full object-cover border border-indigo-300 shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentStudent.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                    >
                      {currentStudent.firstName[0]}
                    </div>
                  )
                ) : null}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {role === 'student' && currentStudent
                      ? `${currentStudent.firstName} ${currentStudent.lastName}`
                      : role === 'admin'
                      ? "Dean's Registry"
                      : 'Prof. Dr. Evelyn Vance'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">
                    {role === 'student' && currentStudent
                      ? `${currentStudent.studentId} · ${currentStudent.year}`
                      : role === 'admin'
                      ? 'Administrative Control'
                      : 'Chair of Computer Science'}
                  </div>
                  {role === 'student' && currentStudent && (
                    <div className="text-[10px] text-indigo-600 font-semibold truncate mt-0.5">
                      {currentStudent.gpa.toFixed(2)} GPA · {currentStudent.enrolledCourseIds.length} Courses
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                role === 'student'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}>
                {role}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className={`${isSidebarCollapsed ? 'p-2' : 'p-3'} flex-1 flex flex-col gap-1 overflow-y-auto`}>
        {/* SECTION 1: Core Management / Student Desk */}
        <div className="flex flex-col gap-1">
          {!isSidebarCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {role === 'student' ? 'Academic Workspace' : 'Core Management'}
            </div>
          )}
          {coreNavItems.map(renderNavButton)}
        </div>

        {/* SECTION 2: Dedicated "Time Table & Attendance" Section */}
        <div className={`mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1`}>
          {!isSidebarCollapsed ? (
            <div className="px-3 pb-1.5 flex items-center justify-between text-[11px] font-bold text-indigo-950 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                <span>Time Table & Attendance</span>
              </div>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded border border-indigo-100 font-mono">
                Daily
              </span>
            </div>
          ) : (
            <div className="my-1.5 border-t border-slate-200 mx-2 flex items-center justify-center pt-1" title="Time Table & Attendance Section">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>
          )}
          {scheduleNavItems.map(renderNavButton)}
        </div>

        {/* Quick Lecture & Timetable Preview Widget inside Time Table & Attendance */}
        {!isSidebarCollapsed && (
          <div className="mt-3 p-3 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border border-indigo-100/80 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Today's Lecture</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-600 bg-white/80 px-1.5 py-0.5 rounded border border-indigo-100">
                10:00 AM
              </span>
            </div>
            <p className="text-[11px] font-semibold text-indigo-900 leading-snug">
              CS-301 · Algorithms
            </p>
            <p className="text-[10px] text-indigo-700/80 font-mono mt-0.5">
              Hall B (Turing) · 10:00–11:30 AM
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <button
                onClick={() => {
                  setActiveTab('attendance');
                  setIsSidebarCollapsed(true);
                }}
                className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-md transition-colors text-center shadow-2xs"
              >
                {role === 'student' ? 'Check In' : 'Roll-Call'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('timetable');
                  setIsSidebarCollapsed(true);
                }}
                className="py-1 px-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium rounded-md transition-colors text-center"
                title="View full class timetable"
              >
                Timetable
              </button>
            </div>
          </div>
        )}

        {isSidebarCollapsed && (
          <div className="mt-2 p-1 flex justify-center">
            <button
              onClick={() => {
                setActiveTab('attendance');
                setIsSidebarCollapsed(true);
              }}
              title={role === 'student' ? 'Check In to CS-301' : 'Open Live Roll-Call (CS-301)'}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
            >
              <Sparkles className="w-4 h-4" />
              {liveSession.isLive && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Auto-collapse hint when expanded */}
      {!isSidebarCollapsed && (
        <div className="px-3 py-1.5 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
          Hover over dashboard to auto-collapse
        </div>
      )}

      {/* Footer Utility & Sign Out */}
      <div
        className={`${
          isSidebarCollapsed ? 'p-2 justify-center' : 'p-3 justify-between'
        } border-t border-slate-100 flex items-center text-xs text-slate-500`}
      >
        <button
          onClick={resetToDefaults}
          title="Reset sample college database"
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors p-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {!isSidebarCollapsed && <span className="text-[11px]">Reset Data</span>}
        </button>
        {!isSidebarCollapsed && (
          <button
            onClick={logout}
            className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors font-medium"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
};
