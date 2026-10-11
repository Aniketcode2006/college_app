import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { AttendanceStatus } from '../../types';
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
import { QrKioskModal } from './QrKioskModal';

export const AttendanceTrackerView: React.FC = () => {
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
    showToast 
  } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus | 'unmarked'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'live' | 'history'>('live');
  const [isKioskOpen, setIsKioskOpen] = useState(false);

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
      // Search match
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Status filter
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Session Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
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
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsKioskOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kiosk QR Screen</span>
          </button>

          <button
            onClick={simulateRandomCheckIn}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
            title="Simulate a student scanning in via QR code or NFC pass"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simulate Check-In</span>
          </button>

          <button
            onClick={markAllPresent}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => toggleSessionLive(!liveSession.isLive)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
              liveSession.isLive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{liveSession.isLive ? 'Conclude Session' : 'Reopen Live'}</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Enrolled
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totalEnrolled}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Enrolled roster</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Present
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {counts.present}
          </div>
          <div className="text-[11px] text-emerald-600/80 font-mono mt-0.5">
            {totalEnrolled > 0 ? Math.round((counts.present / totalEnrolled) * 100) : 0}% on-time
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Late
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {counts.late}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">&gt; 10 min grace</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Excused
          </div>
          <div className="text-2xl font-bold font-mono text-slate-700 mt-1">
            {counts.excused}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Athletics / medical</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
            Absent
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
            {counts.absent}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Unexcused miss</div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-900 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Session Rate
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {counts.rate}%
          </div>
          <div className="text-[11px] text-indigo-300 font-mono mt-0.5">
            {counts.unmarked} unmarked
          </div>
        </div>
      </div>

      {/* Sub Tabs: Live Roll-Call vs Historical Sessions */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('live')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'live'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Roll-Call Roster ({filteredStudents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Previous Lectures & History ({pastSessions.length})
        </button>
      </div>

      {activeSubTab === 'live' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search enrolled students..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Status Segmented Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto text-xs">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'Present', label: `Present (${counts.present})` },
                  { id: 'Late', label: `Late (${counts.late})` },
                  { id: 'Absent', label: `Absent (${counts.absent})` },
                  { id: 'Excused', label: `Excused (${counts.excused})` },
                  { id: 'unmarked', label: `Unmarked (${counts.unmarked})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
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
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Student Roll-Call Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Term Attendance</th>
                    <th className="py-3 px-4">Check-In Log</th>
                    <th className="py-3 px-4 text-center">Status Action</th>
                    <th className="py-3 px-4">Session Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No enrolled students matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const record = liveSession.records[student.id];
                      const status = record?.status;
                      const isAtRisk = student.attendanceRate < 75;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${student.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                              >
                                {student.firstName[0]}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {student.program}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Student ID */}
                          <td className="py-3 px-4 font-mono font-medium text-slate-700">
                            {student.studentId}
                          </td>

                          {/* Term Attendance Rate with At-Risk Flag */}
                          <td className="py-3 px-4">
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
                                  <span>&lt;75% Alert</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Check-In Log / Method */}
                          <td className="py-3 px-4">
                            {record?.timestamp ? (
                              <div className="text-slate-800">
                                <span className="font-mono font-medium">{record.timestamp}</span>
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
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'Present', 'Manual')}
                                title="Mark Present"
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
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
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
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
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
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
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
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
                          <td className="py-3 px-4">
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
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
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
                      <span className="text-lg font-bold font-mono text-slate-900">{rate}%</span>
                      <div className="text-[11px] text-slate-400">Attendance</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-slate-100 text-slate-600">
                    <span className="text-emerald-700 font-semibold">{presentCount} Present</span>
                    <span className="text-amber-700 font-semibold">{lateCount} Late</span>
                    <span className="text-rose-700 font-semibold">{absentCount} Absent</span>
                  </div>

                  {session.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
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
