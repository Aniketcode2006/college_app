import React from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  Users, 
  BookOpen, 
  Radio, 
  Award, 
  AlertTriangle, 
  Clock, 
  MapPin
} from 'lucide-react';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

export const DashboardView = ({
  onOpenRegisterStudent,
  onOpenAddCourse,
}) => {
  const { 
    students, 
    courses, 
    liveSession, 
    setActiveTab, 
    role,
    setSelectedCourseId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isCompactMode
  } = useCollege();

  // Metrics computation
  const totalStudents = students.length;
  const activeCoursesCount = courses.length;

  const totalGpa = students.reduce((acc, s) => acc + s.gpa, 0);
  const avgCampusGpa = totalStudents > 0 ? (totalGpa / totalStudents).toFixed(2) : '3.60';

  const totalAttendance = students.reduce((acc, s) => acc + s.attendanceRate, 0);
  const avgCampusAttendance = totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 92;

  // At-risk students (< 75% attendance or GPA < 2.2)
  const atRiskStudents = students.filter((s) => s.attendanceRate < 75 || s.gpa < 2.2);

  // Active course
  const currentCourse = courses.find((c) => c.id === liveSession.courseId);

  // Live session statistics
  const liveRecords = Object.values(liveSession.records);
  const livePresent = liveRecords.filter((r) => r.status === 'Present').length;
  const liveLate = liveRecords.filter((r) => r.status === 'Late').length;
  const liveTotalEnrolled = currentCourse?.enrolledStudentIds?.length || 0;

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
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-0.5">
            <span>Unity College</span>
            <span aria-hidden="true">·</span>
            <span>Academic Registry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Operations & Campus Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time enrollment, active lecture attendance roll-call, and grade rubrics oversight
          </p>
        </div>

        {/* Quick Action Group */}
        <div className="flex items-center gap-2.5">
          <TableDensityToggle />
          {role === 'admin' ? (
            <>
              <button
                onClick={onOpenRegisterStudent}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                + Register Student
              </button>
              <button
                onClick={onOpenAddCourse}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                + Add Course
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Launch Live Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Students */}
        <div 
          onClick={() => setActiveTab('students')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
            {totalStudents}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>5 Active Departments</span>
            <span className="text-indigo-600 font-semibold group-hover:underline text-[11px]">Directory &rarr;</span>
          </div>
        </div>

        {/* Active Courses */}
        <div 
          onClick={() => setActiveTab('courses')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Curriculum Courses
            </span>
            <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
            {activeCoursesCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Fall 2026 Term</span>
            <span className="text-indigo-600 font-semibold group-hover:underline text-[11px]">Catalog &rarr;</span>
          </div>
        </div>

        {/* Campus Attendance Rate */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Campus Attendance
            </span>
            <Radio className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">
            {avgCampusAttendance}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Policy Target &ge; 75%</span>
            <span className="text-emerald-700 font-semibold group-hover:underline text-[11px]">Live Roll &rarr;</span>
          </div>
        </div>

        {/* Average Term GPA */}
        <div 
          onClick={() => setActiveTab('grading')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Mean Academic GPA
            </span>
            <Award className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
            {avgCampusGpa}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Scale: 4.0 Standard</span>
            <span className="text-indigo-600 font-semibold group-hover:underline text-[11px]">Gradebook &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Focus: Live Lecture Amphitheater Launchpad */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md overflow-hidden relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PROFESSOR LIVE ATTENDANCE CONSOLE
              </span>
              <span className="text-xs text-slate-300 font-mono">Lecture Session in Progress</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              {liveSession.courseCode}: {liveSession.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{liveSession.startTime} – {liveSession.endTime}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{liveSession.room}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{livePresent + liveLate} / {liveTotalEnrolled} Checked In</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Radio className="w-4 h-4 text-slate-950" />
              <span>Open Live Roll-Call & Kiosk</span>
            </button>
            <button
              onClick={() => {
                setSelectedCourseId(liveSession.courseId);
                setActiveTab('grading');
              }}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors border border-white/10 text-center cursor-pointer"
            >
              View Course Gradebook
            </button>
          </div>
        </div>
      </div>

      {/* Split Section: Course Enrollment Roster + At-Risk Student Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Courses Summary - Smaller, cleaner table/card view */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Active Department Courses</span>
            </h3>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View Full Catalog &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-left ${isCompactMode ? 'table-compact' : ''}`}>
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Course Code & Title</th>
                  <th className="py-2 px-3">Instructor</th>
                  <th className="py-2 px-3 text-right">Enrollment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {courses.slice(0, 4).map((c) => {
                  const enrolled = c.enrolledStudentIds.length;
                  const pct = Math.round((enrolled / c.capacity) * 100);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setActiveTab('courses');
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-indigo-700 text-xs mr-2">
                          {c.code}
                        </span>
                        <span className="font-medium text-slate-900 text-xs">
                          {c.title}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {c.schedule.days.join(', ')} · {c.schedule.time}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-xs">
                        {c.instructor.name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs">
                        <span className="font-bold text-slate-800">{enrolled}</span>
                        <span className="text-slate-400">/{c.capacity}</span>
                        <span className="text-[10px] text-indigo-600 ml-1">({pct}%)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Compliance & At-Risk Alerts - Smaller, cleaner table */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Early Intervention & Attendance Alerts</span>
            </h3>
            <button
              onClick={() => setActiveTab('students')}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Review Directory &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            {atRiskStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                All students currently meet institutional academic and attendance policies.
              </div>
            ) : (
              <table className={`w-full text-left ${isCompactMode ? 'table-compact' : ''}`}>
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">Student ID</th>
                    <th className="py-2 px-3 text-center">Attendance</th>
                    <th className="py-2 px-3 text-right">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {atRiskStudents.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setActiveTab('students')}
                      className="hover:bg-rose-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-br ${s.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                          >
                            {s.firstName[0]}
                          </div>
                          <span className="font-medium text-slate-900">
                            {s.firstName} {s.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {s.studentId}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600 text-xs">
                        {s.attendanceRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 text-xs">
                        {s.gpa.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
