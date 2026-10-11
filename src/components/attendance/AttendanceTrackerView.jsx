import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  Radio, 
  QrCode, 
  Sparkles, 
  Download, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { QrKioskModal } from './QrKioskModal.jsx';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

export const AttendanceTrackerView = () => {
  const { 
    liveSession, 
    courses, 
    students, 
    pastSessions, 
    updateAttendanceStatus, 
    markAllPresent, 
    clearAllAttendance, 
    simulateRandomCheckIn, 
    toggleSessionLive,
    showToast,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    role,
    currentStudent,
    studentSelfCheckIn,
    isCompactMode
  } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('live');
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [studentPasscode, setStudentPasscode] = useState('UNITY-CS301-8924');

  // Active course
  const currentCourse = courses.find((c) => c.id === liveSession.courseId);
  const enrolledStudentIds = currentCourse?.enrolledStudentIds || [];

  // Enrolled student objects
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => enrolledStudentIds.includes(s.id));
  }, [students, enrolledStudentIds]);

  // Attendance metrics
  const totalEnrolled = enrolledStudents.length;
  const counts = useMemo(() => {
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;
    let unmarked = 0;

    enrolledStudentIds.forEach((sid) => {
      const rec = liveSession.records[sid];
      if (!rec) {
        unmarked++;
      } else if (rec.status === 'Present') {
        present++;
      } else if (rec.status === 'Late') {
        late++;
      } else if (rec.status === 'Excused') {
        excused++;
      } else if (rec.status === 'Absent') {
        absent++;
      }
    });

    const attended = present + late;
    const rate = totalEnrolled > 0 ? Math.round((attended / totalEnrolled) * 100) : 0;

    return { present, late, excused, absent, unmarked, rate };
  }, [enrolledStudentIds, liveSession.records, totalEnrolled]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter((student) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const record = liveSession.records[student.id];
      if (statusFilter === 'all') return true;
      if (statusFilter === 'unmarked') return !record;
      return record?.status === statusFilter;
    });
  }, [enrolledStudents, searchQuery, statusFilter, liveSession.records]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Department', 'Status', 'Timestamp', 'Method', 'Notes'];
    const rows = enrolledStudents.map((s) => {
      const rec = liveSession.records[s.id];
      return [
        s.studentId,
        `"${s.firstName} ${s.lastName}"`,
        `"${s.department}"`,
        rec?.status || 'Unmarked',
        rec?.timestamp || '',
        rec?.method || '',
        `"${rec?.notes || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${liveSession.courseCode}_${liveSession.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported to CSV.', 'success');
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
      {/* Top Session Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-0.5">
            <span className="font-bold text-indigo-700">{liveSession.courseCode}</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-600 font-semibold">{currentCourse?.title}</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-500">{liveSession.date}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{liveSession.title}</span>
            {liveSession.isLive && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SESSION LIVE
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{liveSession.startTime} – {liveSession.endTime}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{liveSession.room}</span>
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>{liveSession.instructorName}</span>
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <TableDensityToggle />

          {role === 'student' && currentStudent ? (
            <>
              {liveSession.isLive && currentStudent.enrolledCourseIds.includes(liveSession.courseId) && (
                liveSession.records[currentStudent.id]?.status === 'Present' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Checked In ({liveSession.records[currentStudent.id]?.timestamp || '10:00 AM'})</span>
                  </div>
                ) : (
                  <button
                    onClick={() => studentSelfCheckIn(studentPasscode)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Check-In Now</span>
                  </button>
                )
              )}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Log</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsKioskOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kiosk QR</span>
              </button>

              <button
                onClick={simulateRandomCheckIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs cursor-pointer"
                title="Simulate a student scanning in via QR code or NFC pass"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulate</span>
              </button>

              <button
                onClick={markAllPresent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>

              <button
                onClick={() => toggleSessionLive(!liveSession.isLive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs cursor-pointer ${
                  liveSession.isLive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{liveSession.isLive ? 'End Session' : 'Reopen Live'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Student Personal Attendance Profile Banner */}
      {role === 'student' && currentStudent && (
        <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-gradient-to-r from-indigo-50/40 via-white to-white">
          <div className="flex items-center gap-3">
            {currentStudent.avatarUrl ? (
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.firstName}
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shadow-2xs shrink-0"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentStudent.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0`}
              >
                {currentStudent.firstName[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs font-bold text-slate-900">
                  {currentStudent.firstName} {currentStudent.lastName}
                </h2>
                <span className="font-mono text-[11px] text-indigo-700 font-bold px-1.5 py-0.2 bg-indigo-100 rounded">
                  {currentStudent.studentId}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentStudent.year} · {currentStudent.cohort}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentStudent.program} · Overall Term Attendance:{' '}
                <strong className={currentStudent.attendanceRate < 75 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {currentStudent.attendanceRate}%
                </strong>
                {currentStudent.attendanceRate < 75 && ' (Academic Policy Warning)'}
              </p>
            </div>
          </div>

          {/* Quick Check-in or Status */}
          {liveSession.isLive && currentStudent.enrolledCourseIds.includes(liveSession.courseId) ? (
            liveSession.records[currentStudent.id] ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Recorded as <strong>{liveSession.records[currentStudent.id].status}</strong> at{' '}
                  {liveSession.records[currentStudent.id].timestamp || '10:00 AM'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentPasscode}
                  onChange={(e) => setStudentPasscode(e.target.value)}
                  placeholder="Lecture token..."
                  className="px-2.5 py-1 text-xs font-mono border border-slate-200 rounded-md bg-white w-40"
                />
                <button
                  onClick={() => studentSelfCheckIn(studentPasscode)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs cursor-pointer"
                >
                  Verify
                </button>
              </div>
            )
          ) : null}
        </div>
      )}

      {/* Real-Time Session Status KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Enrolled
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {totalEnrolled}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Cohort total</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
            Present
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
            {counts.present}
          </div>
          <div className="text-[10px] text-emerald-600 font-mono">
            {totalEnrolled > 0 ? Math.round((counts.present / totalEnrolled) * 100) : 0}% on-time
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-xs">
          <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
            Late
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
            {counts.late}
          </div>
          <div className="text-[10px] text-amber-600 font-mono">Delayed entry</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Excused
          </div>
          <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">
            {counts.excused}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Authorized</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-rose-200/80 shadow-xs">
          <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">
            Absent
          </div>
          <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
            {counts.absent}
          </div>
          <div className="text-[10px] text-rose-600 font-mono">Unexcused</div>
        </div>

        <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-900 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
            Rate
          </div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">
            {counts.rate}%
          </div>
          <div className="text-[10px] text-indigo-300 font-mono">
            {counts.unmarked} unmarked
          </div>
        </div>
      </div>

      {/* Sub Tabs: Live Roll-Call vs Historical Sessions */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('live')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'live'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Roll-Call Roster ({filteredStudents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Previous Lectures & History ({pastSessions.length})
        </button>
      </div>

      {activeSubTab === 'live' ? (
        <div className="space-y-3.5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search enrolled students..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Status Segmented Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'Present', label: `Present (${counts.present})` },
                { id: 'Late', label: `Late (${counts.late})` },
                { id: 'Absent', label: `Absent (${counts.absent})` },
                { id: 'Excused', label: `Excused (${counts.excused})` },
                { id: 'unmarked', label: `Unmarked (${counts.unmarked})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Clear button */}
            <button
              onClick={clearAllAttendance}
              title="Reset today's roll-call"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Student Roll-Call Table - Smaller, compact, cleaner layout */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className={`w-full text-left ${isCompactMode ? 'table-compact' : ''}`}>
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Term Attendance</th>
                    <th className="py-2.5 px-3">Check-In Log</th>
                    <th className="py-2.5 px-3 text-center">Status Action</th>
                    <th className="py-2.5 px-3">Session Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        No enrolled students matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const record = liveSession.records[student.id];
                      const status = record?.status;
                      const isAtRisk = student.attendanceRate < 75;

                      const isMe = role === 'student' && currentStudent?.id === student.id;

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors ${
                            isMe
                              ? 'bg-indigo-50/70 border-l-4 border-indigo-600 font-medium'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Student Info */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2.5">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={student.firstName}
                                  className="w-7 h-7 rounded-full object-cover border border-indigo-300 shrink-0 shadow-2xs"
                                />
                              ) : (
                                <div
                                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${student.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs`}
                                >
                                  {student.firstName[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5 leading-tight">
                                  <span>{student.firstName} {student.lastName}</span>
                                  {isMe && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-indigo-600 text-white rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {student.program}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Student ID */}
                          <td className="py-2 px-3 font-mono font-medium text-slate-700">
                            {student.studentId}
                          </td>

                          {/* Term Attendance Rate with At-Risk Flag */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-semibold ${
                                  isAtRisk ? 'text-rose-600 font-bold' : 'text-slate-800'
                                }`}
                              >
                                {student.attendanceRate}%
                              </span>
                              {isAtRisk && (
                                <span
                                  className="flex items-center gap-1 text-[10px] text-rose-700 font-medium"
                                  title="Attendance below 75% institutional policy"
                                >
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>&lt;75%</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Check-In Log / Method */}
                          <td className="py-2 px-3">
                            {record?.timestamp ? (
                              <div className="text-slate-800">
                                <span className="font-mono font-medium text-[11px]">{record.timestamp}</span>
                                {record.method && (
                                  <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                                    via {record.method}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Pending roll-call</span>
                            )}
                          </td>

                          {/* 1-Click Roll-Call Actions */}
                          <td className="py-2 px-3">
                            <div className="flex items-center justify-center gap-1 bg-slate-50 p-0.5 rounded-md border border-slate-100 max-w-fit mx-auto">
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'Present', 'Manual')}
                                title="Mark Present"
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                  status === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'Late', 'Manual')}
                                title="Mark Late"
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                  status === 'Late'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                              >
                                L
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'Absent', 'Manual')}
                                title="Mark Absent"
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                  status === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'Excused', 'Manual')}
                                title="Mark Excused"
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                  status === 'Excused'
                                    ? 'bg-slate-700 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                }`}
                              >
                                E
                              </button>
                            </div>
                          </td>

                          {/* Inline Session Notes */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              defaultValue={record?.notes || ''}
                              onBlur={(e) => {
                                if (record) {
                                  updateAttendanceStatus(student.id, record.status, record.method, e.target.value);
                                }
                              }}
                              placeholder="Add roll note..."
                              className="w-full text-[11px] bg-transparent border-b border-transparent focus:border-indigo-400 focus:outline-none text-slate-700 placeholder:text-slate-300 py-0.5"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* HISTORICAL SESSIONS TAB */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSessions.map((session) => {
              const presentCount = Object.values(session.records).filter((r) => r.status === 'Present').length;
              const lateCount = Object.values(session.records).filter((r) => r.status === 'Late').length;
              const absentCount = Object.values(session.records).filter((r) => r.status === 'Absent').length;
              const total = Object.keys(session.records).length;
              const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

              return (
                <div
                  key={session.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{session.startTime}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{session.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{session.room}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-slate-900">{rate}%</span>
                      <div className="text-[10px] text-slate-400">Attendance</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-slate-100 text-slate-600">
                    <span className="text-emerald-700 font-semibold">{presentCount} Present</span>
                    <span className="text-amber-700 font-semibold">{lateCount} Late</span>
                    <span className="text-rose-700 font-semibold">{absentCount} Absent</span>
                  </div>

                  {session.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed text-[11px]">
                      &quot;{session.notes}&quot;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Kiosk Screen Modal */}
      <QrKioskModal isOpen={isKioskOpen} onClose={() => setIsKioskOpen(false)} />
    </div>
  );
};
