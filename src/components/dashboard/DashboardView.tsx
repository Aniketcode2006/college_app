import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { 
  Users, 
  BookOpen, 
  Radio, 
  Award, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  onOpenRegisterStudent: () => void;
  onOpenAddCourse: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRegisterStudent,
  onOpenAddCourse,
}) => {
  const { 
    students, 
    courses, 
    grades, 
    liveSession, 
    setActiveTab, 
    role,
    setSelectedCourseId 
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
  const liveTotalEnrolled = currentCourse?.enrolledStudentIds.length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span>Veritas Institute of Higher Learning</span>
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
          {role === 'admin' ? (
            <>
              <button
                onClick={onOpenRegisterStudent}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                + Register Student
              </button>
              <button
                onClick={onOpenAddCourse}
                className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                + Add Course
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Launch Live Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Metric Cards (60-30-10 discipline, tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div 
          onClick={() => setActiveTab('students')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-2">
            {totalStudents}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>5 Active Departments</span>
            <span className="text-indigo-600 font-semibold group-hover:underline">Directory &rarr;</span>
          </div>
        </div>

        {/* Active Courses */}
        <div 
          onClick={() => setActiveTab('courses')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Curriculum Courses
            </span>
            <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-2">
            {activeCoursesCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Fall 2026 Term</span>
            <span className="text-indigo-600 font-semibold group-hover:underline">Catalog &rarr;</span>
          </div>
        </div>

        {/* Campus Attendance Rate */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Campus Attendance
            </span>
            <Radio className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-2">
            {avgCampusAttendance}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Policy Target &ge; 75%</span>
            <span className="text-emerald-700 font-semibold group-hover:underline">Live Roll &rarr;</span>
          </div>
        </div>

        {/* Average Term GPA */}
        <div 
          onClick={() => setActiveTab('grading')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Mean Academic GPA
            </span>
            <Award className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-2">
            {avgCampusGpa}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Scale: 4.0 Standard</span>
            <span className="text-indigo-600 font-semibold group-hover:underline">Gradebook &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Focus: Live Lecture Amphitheater Launchpad */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-md overflow-hidden relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PROFESSOR LIVE ATTENDANCE CONSOLE
              </span>
              <span className="text-xs text-slate-300 font-mono">Lecture Session in Progress</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Radio className="w-4 h-4 text-slate-950" />
              <span>Open Live Roll-Call & Kiosk</span>
            </button>
            <button
              onClick={() => {
                setSelectedCourseId(liveSession.courseId);
                setActiveTab('grading');
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors border border-white/10 text-center"
            >
              View Course Gradebook
            </button>
          </div>
        </div>
      </div>

      {/* Split Section: Course Enrollment Roster + At-Risk Student Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Courses Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Active Department Courses</span>
            </h3>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Full Catalog &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {courses.slice(0, 4).map((c) => {
              const enrolled = c.enrolledStudentIds.length;
              const pct = Math.round((enrolled / c.capacity) * 100);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCourseId(c.id);
                    setActiveTab('courses');
                  }}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-indigo-700 text-xs mr-2">
                        {c.code}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">
                        {c.title}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                      {enrolled}/{c.capacity} ({pct}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{c.instructor.name}</span>
                    <span>{c.schedule.days.join(', ')} · {c.schedule.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Compliance & At-Risk Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Early Intervention & Attendance Alerts</span>
            </h3>
            <button
              onClick={() => setActiveTab('students')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Review Directory &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {atRiskStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                All students currently meet institutional academic and attendance policies.
              </div>
            ) : (
              atRiskStudents.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveTab('students')}
                  className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${s.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                    >
                      {s.firstName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {s.studentId} · {s.department}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-700">
                      <span>{s.attendanceRate}% Attd</span>
                      <span>·</span>
                      <span>{s.gpa.toFixed(2)} GPA</span>
                    </div>
                    <div className="text-[10px] text-rose-600 font-medium">
                      Advisor: {s.advisor.split(' ').slice(-1)[0]}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
