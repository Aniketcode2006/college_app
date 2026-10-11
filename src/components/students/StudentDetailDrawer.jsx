import React from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Radio, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

export const StudentDetailDrawer = ({
  student,
  isOpen,
  onClose,
}) => {
  const { courses, deleteStudent, role } = useCollege();

  if (!isOpen || !student) return null;

  const enrolledCourses = courses.filter((c) => student.enrolledCourseIds.includes(c.id));
  const isAtRiskAttendance = student.attendanceRate < 75;
  const isAtRiskGpa = student.gpa < 2.2;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove student ${student.firstName} ${student.lastName}?`)) {
      deleteStudent(student.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.firstName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                />
              ) : (
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${student.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-sm`}
                >
                  {student.firstName[0]}
                </div>
              )}
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {student.firstName} {student.lastName}
                </h2>
                <div className="text-xs font-mono text-slate-500">
                  {student.studentId} · {student.year}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Standing Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1 font-semibold uppercase">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cumulative GPA</span>
                </span>
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 ${
                  isAtRiskGpa ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {student.gpa.toFixed(2)}
              </div>
              {isAtRiskGpa && (
                <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Academic Probation</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1 font-semibold uppercase">
                  <Radio className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Term Attendance</span>
                </span>
              </div>
              <div
                className={`text-2xl font-bold font-mono mt-1 ${
                  isAtRiskAttendance ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {student.attendanceRate}%
              </div>
              {isAtRiskAttendance && (
                <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Below 75% Policy</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Details */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
              Academic Program
            </h3>
            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-slate-900 text-right">{student.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Degree:</span>
                <span className="font-medium text-slate-900">{student.program}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cohort:</span>
                <span className="font-mono text-slate-900">{student.cohort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Advisor:</span>
                <span className="font-medium text-slate-900">{student.advisor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Matriculated:</span>
                <span className="font-mono text-slate-900">{student.enrollmentDate}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
              Contact & Residence
            </h3>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-indigo-700">{student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.address}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
              Emergency Contact
            </h3>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5 text-slate-700">
              <div className="font-semibold text-slate-900">
                {student.emergencyContact.name} ({student.emergencyContact.relationship})
              </div>
              <div className="font-mono text-slate-500 text-[11px]">
                {student.emergencyContact.phone}
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Active Enrolled Courses ({enrolledCourses.length})
              </h3>
            </div>
            <div className="space-y-1.5">
              {enrolledCourses.length === 0 ? (
                <p className="text-slate-400 italic">No courses currently enrolled.</p>
              ) : (
                enrolledCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-indigo-700">{c.code}</div>
                      <div className="font-medium text-slate-800 truncate max-w-[200px]">
                        {c.title}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{c.credits} Cr</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {role === 'admin' && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Withdraw Student</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
