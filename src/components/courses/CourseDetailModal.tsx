import React from 'react';
import { Course } from '../../types';
import { useCollege } from '../../context/CollegeContext';
import { X, BookOpen, Clock, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (course: Course) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { role, toggleEnrollment, students } = useCollege();

  if (!isOpen || !course) return null;

  // Assume student view uses student "s-1" (Maya Lin)
  const currentStudentId = 's-1';
  const isEnrolled = course.enrolledStudentIds.includes(currentStudentId);
  const enrolledCount = course.enrolledStudentIds.length;
  const isFull = enrolledCount >= course.capacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 font-semibold mb-1">
                <span>{course.code}</span>
                <span aria-hidden="true">·</span>
                <span>{course.credits} Credits</span>
                <span aria-hidden="true">·</span>
                <span>{course.term}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {course.title}
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                {course.department}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Course Overview & Objectives
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Schedule & Faculty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Class Schedule</span>
              </div>
              <p className="text-xs text-slate-600">
                {course.schedule.days.join(', ')} · {course.schedule.time}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{course.schedule.room}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Faculty Instructor</span>
              </div>
              <p className="text-xs font-medium text-slate-800">{course.instructor.name}</p>
              <p className="text-[11px] text-slate-500">{course.instructor.title}</p>
              <p className="text-[11px] text-indigo-600 mt-0.5 font-mono">{course.instructor.email}</p>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Prerequisites
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((p, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Assessment Weighting */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Grading Assessment Structure
            </h3>
            <div className="space-y-2">
              {course.assessments.map((asm) => (
                <div
                  key={asm.id}
                  className="flex items-center justify-between text-xs p-2 rounded-md bg-white border border-slate-100"
                >
                  <span className="font-medium text-slate-800">{asm.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-[11px]">{asm.category}</span>
                    <span className="font-mono font-semibold text-slate-900">{asm.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students Roster (Admin / Professor) */}
          {(role === 'admin' || role === 'professor') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Enrolled Students Roster ({enrolledCount}/{course.capacity})
                </h3>
              </div>
              {enrolledCount === 0 ? (
                <p className="text-xs text-slate-400 italic">No students enrolled yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {course.enrolledStudentIds.map((sid) => {
                    const student = students.find((s) => s.id === sid);
                    if (!student) return null;
                    return (
                      <div
                        key={sid}
                        className="flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${student.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                        >
                          {student.firstName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {student.studentId}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-600">
            <span className="font-mono font-semibold text-slate-900">{enrolledCount}</span> /{' '}
            <span className="font-mono">{course.capacity}</span> seats filled
          </div>

          <div className="flex items-center gap-2">
            {role === 'admin' && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(course);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Edit Course
              </button>
            )}

            {role === 'student' && (
              <button
                onClick={() => toggleEnrollment(course.id, currentStudentId)}
                disabled={!isEnrolled && isFull}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isEnrolled
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : isFull
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isEnrolled ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Drop Course</span>
                  </>
                ) : isFull ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Course Full</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enroll Now</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
