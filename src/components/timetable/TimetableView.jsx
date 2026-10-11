import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Download, 
  Printer, 
  Sparkles
} from 'lucide-react';
import { CourseDetailModal } from '../courses/CourseDetailModal.jsx';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_LABELS = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

export const TimetableView = () => {
  const { 
    courses, 
    currentStudent, 
    role, 
    showToast,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isCompactMode
  } = useCollege();
  const [scheduleScope, setScheduleScope] = useState(
    role === 'student' ? 'my' : 'master'
  );
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [detailCourse, setDetailCourse] = useState(null);

  // Filter courses based on scope
  const visibleCourses = useMemo(() => {
    if (scheduleScope === 'my' && role === 'student' && currentStudent) {
      return courses.filter((c) => currentStudent.enrolledCourseIds.includes(c.id));
    }
    return courses;
  }, [courses, scheduleScope, role, currentStudent]);

  // Export iCal (.ics)
  const handleExportCalendar = () => {
    let icsData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Unity College//Academic Timetable//EN\n";
    visibleCourses.forEach((c) => {
      c.schedule.days.forEach((day) => {
        icsData += "BEGIN:VEVENT\n";
        icsData += `SUMMARY:${c.code} - ${c.title}\n`;
        icsData += `DESCRIPTION:Instructor: ${c.instructor.name} | Credits: ${c.credits}\n`;
        icsData += `LOCATION:${c.schedule.room}\n`;
        icsData += `DTSTART;TZID=America/New_York:20261012T${c.schedule.time.includes('10:00') ? '100000' : '133000'}\n`;
        icsData += "END:VEVENT\n";
      });
    });
    icsData += "END:VCALENDAR";

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Unity_College_Timetable_${currentStudent ? currentStudent.firstName + '_' + currentStudent.studentId : role}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Weekly timetable exported to Calendar (.ics).', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onMouseEnter={() => {
        if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
      }}
      onMouseMove={() => {
        if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
      }}
      className="p-5 max-w-7xl mx-auto space-y-5"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span className="font-bold text-indigo-700">Unity College</span>
            <span aria-hidden="true">·</span>
            <span>Fall Term 2026</span>
            <span aria-hidden="true">·</span>
            <span>{role === 'student' ? 'Individual Student Timetable' : 'Weekly Class Roster'}</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <span>{role === 'student' && scheduleScope === 'my' ? 'My Academic Timetable' : 'Academic Class Timetable'}</span>
            </h1>
            {role === 'student' && currentStudent && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentStudent.avatarUrl ? (
                  <img src={currentStudent.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {currentStudent.firstName[0]}
                  </span>
                )}
                <span>Schedule for {currentStudent.firstName} {currentStudent.lastName} ({currentStudent.studentId})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'student' && currentStudent
              ? `${visibleCourses.length} active classes scheduled (${visibleCourses.reduce((sum, c) => sum + c.credits, 0)} credits) · Room locations and faculty assignments`
              : 'Synchronized weekly schedule with room allocations, lecture hours, and faculty assignments'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <TableDensityToggle />

          {/* Scope toggle */}
          {role === 'student' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setScheduleScope('my')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  scheduleScope === 'my'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Schedule ({visibleCourses.length})
              </button>
              <button
                onClick={() => setScheduleScope('master')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  scheduleScope === 'master'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Master Catalog ({courses.length})
              </button>
            </div>
          )}

          {/* Export buttons */}
          <button
            onClick={handleExportCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            title="Download iCal file for Apple Calendar, Google Calendar, or Outlook"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export .ICS</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Up Next / Active Lecture Highlight Strip */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-indigo-900">UPCOMING CLASS TODAY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-semibold">10:00 AM – 11:30 AM</span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              CS-301: Advanced Algorithms & Complexity
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Hall B · Turing Amphitheater · Prof. Dr. Evelyn Vance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const c = courses.find((x) => x.code === 'CS-301');
              if (c) setDetailCourse(c);
            }}
            className="px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Syllabus & Details
          </button>
        </div>
      </div>

      {/* Day Filter Segmented Buttons */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Whole Week (Mon – Fri)
          </button>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedDayFilter === day
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono hidden md:block">
          {visibleCourses.length} Total Registered Classes
        </div>
      </div>

      {/* TIMETABLE GRID (5-Day Matrix) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {DAYS.map((day) => {
          const isDaySelected = selectedDayFilter === 'all' || selectedDayFilter === day;
          if (!isDaySelected) return null;

          const dayCourses = visibleCourses.filter((c) => c.schedule.days.includes(day));

          return (
            <div
              key={day}
              className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col ${
                selectedDayFilter !== 'all' ? 'md:col-span-5' : ''
              }`}
            >
              {/* Day Header */}
              <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{DAY_LABELS[day]}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dayCourses.length} {dayCourses.length === 1 ? 'Class' : 'Classes'}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              </div>

              {/* Day Classes - Compact, clean layout */}
              <div className={`p-2.5 space-y-2.5 flex-1 ${isCompactMode ? 'min-h-[220px]' : 'min-h-[280px]'}`}>
                {dayCourses.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 italic text-xs">
                    <span>No scheduled lectures</span>
                    <span className="text-[10px] text-slate-300 font-mono mt-1">Study / Lab time</span>
                  </div>
                ) : (
                  dayCourses.map((c) => {
                    return (
                      <div
                        key={`${day}-${c.id}`}
                        onClick={() => setDetailCourse(c)}
                        className={`p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 bg-slate-50/60 transition-all cursor-pointer group ${
                          isCompactMode ? 'space-y-1' : 'space-y-1.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-indigo-700">
                            {c.code}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-1 py-0.2 rounded border border-slate-200">
                            {c.credits} Cr
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 line-clamp-2">
                          {c.title}
                        </h4>

                        <div className="space-y-0.5 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.schedule.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.schedule.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.instructor.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={detailCourse}
        isOpen={Boolean(detailCourse)}
        onClose={() => setDetailCourse(null)}
      />
    </div>
  );
};
