import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { Student, Course, StudentGradeRecord } from '../../types';
import { 
  FileSpreadsheet, 
  Download, 
  Send, 
  RotateCcw, 
  Search, 
  ExternalLink
} from 'lucide-react';
import { StudentTranscriptModal } from './StudentTranscriptModal';

export const GradingView: React.FC = () => {
  const { 
    courses, 
    students, 
    grades, 
    selectedCourseId, 
    setSelectedCourseId, 
    updateGradeScore, 
    publishGrades, 
    unpublishGrades,
    showToast 
  } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptStudent, setTranscriptStudent] = useState<Student | null>(null);
  const [transcriptGrade, setTranscriptGrade] = useState<StudentGradeRecord | null>(null);

  // Active course
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const enrolledStudentIds = currentCourse?.enrolledStudentIds || [];

  // Enrolled students
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => enrolledStudentIds.includes(s.id));
  }, [students, enrolledStudentIds]);

  // Course Grade Records
  const courseGrades = useMemo(() => {
    if (!currentCourse) return [];
    return enrolledStudents.map((student) => {
      let rec = grades.find((g) => g.courseId === currentCourse.id && g.studentId === student.id);
      if (!rec) {
        // Fallback placeholder record
        rec = {
          id: `temp-${student.id}`,
          studentId: student.id,
          courseId: currentCourse.id,
          scores: {},
          weightedPercentage: 0,
          letterGrade: 'N/A',
          gpaPoint: 0.0,
          status: 'Draft',
          lastUpdated: '',
        };
      }
      return { student, record: rec };
    });
  }, [currentCourse, enrolledStudents, grades]);

  // Filtered by search
  const filteredGrades = useMemo(() => {
    return courseGrades.filter(({ student }) => {
      const q = searchQuery.toLowerCase();
      return (
        student.firstName.toLowerCase().includes(q) ||
        student.lastName.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q)
      );
    });
  }, [courseGrades, searchQuery]);

  // Grade Statistics & Distribution
  const statistics = useMemo(() => {
    const scores = courseGrades
      .map(({ record }) => record.weightedPercentage)
      .filter((s) => s > 0);

    if (scores.length === 0) {
      return {
        avg: 0,
        median: 0,
        highest: 0,
        lowest: 0,
        distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        isAllPublished: false,
      };
    }

    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / scores.length) * 10) / 10;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const highest = sorted[sorted.length - 1];
    const lowest = sorted[0];

    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    courseGrades.forEach(({ record }) => {
      const letter = record.letterGrade[0];
      if (letter === 'A') distribution.A++;
      else if (letter === 'B') distribution.B++;
      else if (letter === 'C') distribution.C++;
      else if (letter === 'D') distribution.D++;
      else if (letter === 'F') distribution.F++;
    });

    const isAllPublished = courseGrades.every(({ record }) => record.status === 'Published');

    return { avg, median, highest, lowest, distribution, isAllPublished };
  }, [courseGrades]);

  // Export CSV
  const handleExportCSV = () => {
    if (!currentCourse) return;
    const assessmentHeaders = currentCourse.assessments.map((a) => `"${a.name} (${a.weight}%)"`);
    const headers = ['Student ID', 'Student Name', ...assessmentHeaders, 'Weighted Score', 'Letter Grade', 'GPA Point', 'Status'];

    const rows = courseGrades.map(({ student, record }) => {
      const asmScores = currentCourse.assessments.map((a) => record.scores[a.id] ?? 0);
      return [
        student.studentId,
        `"${student.firstName} ${student.lastName}"`,
        ...asmScores,
        record.weightedPercentage,
        record.letterGrade,
        record.gpaPoint.toFixed(1),
        record.status,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gradebook_${currentCourse.code}_${currentCourse.term}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Gradebook spreadsheet exported to CSV.', 'success');
  };

  const handleScoreChange = (recordId: string, asmId: string, val: string, maxScore: number) => {
    let num = Number(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > maxScore) num = maxScore;
    updateGradeScore(recordId, asmId, num);
  };

  const openTranscript = (student: Student, record: StudentGradeRecord) => {
    setTranscriptStudent(student);
    setTranscriptGrade(record);
  };

  if (!currentCourse) {
    return (
      <div className="p-8 text-center text-slate-500">
        No courses available to grade.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Controls Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span className="font-bold text-indigo-700">{currentCourse.code}</span>
            <span aria-hidden="true">·</span>
            <span>{currentCourse.term}</span>
            <span aria-hidden="true">·</span>
            <span>{currentCourse.credits} Credits</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Gradebook & Evaluation Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time weighted score computation, rubrics distribution, and official transcripts
          </p>
        </div>

        {/* Course Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Select course */}
          <select
            value={currentCourse.id}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-xs"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {statistics.isAllPublished ? (
            <button
              onClick={() => unpublishGrades(currentCourse.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Draft</span>
            </button>
          ) : (
            <button
              onClick={() => publishGrades(currentCourse.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Term Grades</span>
            </button>
          )}
        </div>
      </div>

      {/* Assessment Weights Summary Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Grading Rubric Component Weights</span>
          <span className="text-slate-400 font-mono">Total: 100%</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {currentCourse.assessments.map((asm) => (
            <div
              key={asm.id}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <span className="text-[11px] font-medium text-slate-600 truncate">{asm.name}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[10px] text-slate-400 font-mono">{asm.category}</span>
                <span className="text-xs font-bold font-mono text-indigo-700">{asm.weight}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Statistics & Histogram Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Class Average
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {statistics.avg}%
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mean raw score</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Median Score
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {statistics.median}%
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">50th percentile</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Highest Score
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              {statistics.highest}%
            </div>
            <div className="text-[11px] text-emerald-600/80 font-mono mt-0.5">Top cohort mark</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Lowest Score
            </span>
            <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
              {statistics.lowest}%
            </div>
            <div className="text-[11px] text-rose-600/80 font-mono mt-0.5">Requires support</div>
          </div>
        </div>

        {/* Distribution Histogram */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
            <span>Grade Distribution</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {courseGrades.length} Students
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-20 pt-2">
            {(['A', 'B', 'C', 'D', 'F'] as const).map((letter) => {
              const count = statistics.distribution[letter];
              const pct = courseGrades.length > 0 ? (count / courseGrades.length) * 100 : 0;
              const barHeight = Math.max(12, Math.round(pct));

              return (
                <div key={letter} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono font-medium text-slate-500">{count}</span>
                  <div className="w-full bg-slate-100 rounded-t overflow-hidden flex items-end h-14">
                    <div
                      className={`w-full transition-all ${
                        letter === 'A'
                          ? 'bg-indigo-600'
                          : letter === 'B'
                          ? 'bg-blue-500'
                          : letter === 'C'
                          ? 'bg-amber-500'
                          : letter === 'D'
                          ? 'bg-orange-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-700">{letter}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spreadsheet Filter & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student roster..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="italic">
            Tip: Edit any cell score directly to recalculate weighted totals in real-time.
          </span>
        </div>
      </div>

      {/* Interactive Gradebook Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student ID</th>
                {currentCourse.assessments.map((asm) => (
                  <th key={asm.id} className="py-3 px-3 text-center">
                    <div>{asm.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {asm.weight}% (max {asm.maxScore})
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center font-bold text-slate-900">Total %</th>
                <th className="py-3 px-4 text-center font-bold text-slate-900">Grade</th>
                <th className="py-3 px-4 text-center font-bold text-slate-900">GPA</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentCourse.assessments.length + 6}
                    className="py-8 text-center text-slate-400 italic"
                  >
                    No students match the search filter.
                  </td>
                </tr>
              ) : (
                filteredGrades.map(({ student, record }) => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">{student.program}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {student.studentId}
                      </td>

                      {/* Interactive assessment input cells */}
                      {currentCourse.assessments.map((asm) => {
                        const rawScore = record.scores[asm.id] !== undefined ? record.scores[asm.id] : '';

                        return (
                          <td key={asm.id} className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={asm.maxScore}
                              value={rawScore}
                              onChange={(e) =>
                                handleScoreChange(record.id, asm.id, e.target.value, asm.maxScore)
                              }
                              className="w-16 text-center py-1 px-1.5 font-mono text-xs font-semibold rounded-md border border-slate-200 bg-white focus:bg-indigo-50/30 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                          </td>
                        );
                      })}

                      {/* Weighted Total Percentage */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {record.weightedPercentage}%
                      </td>

                      {/* Letter Grade */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            record.letterGrade.startsWith('A')
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : record.letterGrade.startsWith('B')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : record.letterGrade.startsWith('C')
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : record.letterGrade.startsWith('D')
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {record.letterGrade}
                        </span>
                      </td>

                      {/* GPA Points */}
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                        {record.gpaPoint.toFixed(1)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[11px] font-mono font-medium ${
                            record.status === 'Published'
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      {/* View Transcript Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openTranscript(student, record)}
                          className="flex items-center gap-1 ml-auto text-indigo-600 hover:text-indigo-800 font-medium text-[11px]"
                        >
                          <span>Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Modal */}
      <StudentTranscriptModal
        isOpen={Boolean(transcriptStudent && transcriptGrade)}
        onClose={() => {
          setTranscriptStudent(null);
          setTranscriptGrade(null);
        }}
        student={transcriptStudent}
        course={currentCourse}
        gradeRecord={transcriptGrade}
      />
    </div>
  );
};
