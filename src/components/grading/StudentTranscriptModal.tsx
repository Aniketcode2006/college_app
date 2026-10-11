import React from 'react';
import { Student, Course, StudentGradeRecord } from '../../types';
import { X, Award, CheckCircle2, FileText, Printer } from 'lucide-react';

interface StudentTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  course: Course | null;
  gradeRecord: StudentGradeRecord | null;
}

export const StudentTranscriptModal: React.FC<StudentTranscriptModalProps> = ({
  isOpen,
  onClose,
  student,
  course,
  gradeRecord,
}) => {
  if (!isOpen || !student || !course || !gradeRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Official Term Grade Report & Transcript
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {course.code} · {course.term} · Veritas University
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Profile Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Student Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{student.firstName} {student.lastName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Student ID</span>
              <p className="font-mono font-medium text-slate-900 mt-0.5">{student.studentId}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Department</span>
              <p className="text-slate-800 mt-0.5 truncate">{student.department}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Academic Standing</span>
              <p className="text-emerald-700 font-semibold mt-0.5">{student.status}</p>
            </div>
          </div>

          {/* Grade Summary Scorecard */}
          <div className="flex items-center justify-between p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div>
              <div className="text-xs font-semibold text-indigo-950 uppercase tracking-wider">
                Overall Course Evaluation
              </div>
              <div className="text-xs text-indigo-800/80 mt-0.5">
                Status: <strong className="font-mono text-indigo-900">{gradeRecord.status}</strong>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Weighted Score</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {gradeRecord.weightedPercentage}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Letter Grade</div>
                <div className="text-3xl font-extrabold font-mono text-indigo-700">
                  {gradeRecord.letterGrade}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Grade Point</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {gradeRecord.gpaPoint.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Itemized Assessment Scores
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Assessment Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Weight</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-right">Weighted Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {course.assessments.map((asm) => {
                    const rawScore = gradeRecord.scores[asm.id] !== undefined ? gradeRecord.scores[asm.id] : 0;
                    const contribution = ((rawScore / asm.maxScore) * asm.weight).toFixed(1);

                    return (
                      <tr key={asm.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{asm.name}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-500">{asm.category}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{asm.weight}%</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          {rawScore} / {asm.maxScore}
                        </td>
                        <td className="py-2.5 px-3 text-right text-indigo-700 font-bold">
                          +{contribution}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Professor Remarks */}
          {gradeRecord.remarks && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Instructor Remarks & Faculty Feedback</span>
              </h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed italic">
                &quot;{gradeRecord.remarks}&quot;
              </p>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Evaluated by {course.instructor.name} · Last revised {gradeRecord.lastUpdated}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified by Office of Academic Registrar</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Transcript</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
