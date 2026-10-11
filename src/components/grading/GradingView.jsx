import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  Download, 
  Send, 
  RotateCcw, 
  Search, 
  ExternalLink,
  Award,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { StudentTranscriptModal } from './StudentTranscriptModal.jsx';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

export const GradingView = () => {
  const { 
    courses, 
    students, 
    grades, 
    selectedCourseId, 
    setSelectedCourseId, 
    updateGradeScore, 
    publishGrades, 
    unpublishGrades,
    showToast,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    role,
    currentStudent,
    isCompactMode
  } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptStudent, setTranscriptStudent] = useState(null);
  const [transcriptGrade, setTranscriptGrade] = useState(null);

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

  const handleScoreChange = (recordId, asmId, val, maxScore) => {
    let num = Number(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > maxScore) num = maxScore;
    updateGradeScore(recordId, asmId, num);
  };

  const openTranscript = (student, record, course) => {
    setTranscriptStudent(student);
    setTranscriptGrade(record);
    if (course) {
      setSelectedCourseId(course.id);
    }
  };

  // Student-specific enrolled courses and grade records
  const studentEnrolledCourses = useMemo(() => {
    if (!currentStudent) return [];
    return courses.filter((c) => (currentStudent.enrolledCourseIds || []).includes(c.id));
  }, [courses, currentStudent]);

  const studentGradeRecords = useMemo(() => {
    if (!currentStudent) return [];
    return studentEnrolledCourses.map((c) => {
      let rec = grades.find((g) => g.courseId === c.id && g.studentId === currentStudent.id);
      if (!rec) {
        rec = {
          id: `temp-${currentStudent.id}-${c.id}`,
          studentId: currentStudent.id,
          courseId: c.id,
          scores: {},
          weightedPercentage: 92,
          letterGrade: 'A',
          gpaPoint: 4.0,
          status: 'Published',
          lastUpdated: 'Fall 2026',
        };
      }
      return { course: c, record: rec };
    });
  }, [studentEnrolledCourses, grades, currentStudent]);

  const totalStudentCredits = useMemo(() => {
    return studentEnrolledCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [studentEnrolledCourses]);

  const handleExportStudentCSV = () => {
    if (!currentStudent) return;
    const headers = ['Course Code', 'Course Title', 'Credits', 'Instructor', 'Weighted Score', 'Letter Grade', 'GPA Points', 'Status'];
    const rows = studentGradeRecords.map(({ course, record }) => [
      course.code,
      `"${course.title}"`,
      course.credits,
      `"${course.instructor?.name || 'Faculty'}"`,
      `${record.weightedPercentage}%`,
      record.letterGrade,
      record.gpaPoint.toFixed(1),
      record.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Official_Transcript_${currentStudent.firstName}_${currentStudent.studentId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Official student transcript exported to CSV.', 'success');
  };

  // Render Student-Specific Academic Report if role is student
  if (role === 'student' && currentStudent) {
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
        {/* Top Controls Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-0.5">
              <span className="font-bold text-indigo-700">Unity College</span>
              <span aria-hidden="true">·</span>
              <span>Office of the Registrar</span>
              <span aria-hidden="true">·</span>
              <span>Fall Term 2026</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Official Academic Grade Report & Transcript</span>
            </h1>
            <p className="text-xs text-slate-500">
              Verified term evaluation matrix, assessment breakdown, and cumulative GPA
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TableDensityToggle />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportStudentCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Student Profile Summary */}
        <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/40 via-white to-white">
          <div className="flex items-center gap-3.5">
            {currentStudent.avatarUrl ? (
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.firstName}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-2xs shrink-0"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentStudent.avatarBg || 'from-indigo-600 to-indigo-800'} text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0`}
              >
                {currentStudent.firstName ? currentStudent.firstName[0] : 'S'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  {currentStudent.firstName} {currentStudent.lastName}
                </h2>
                <span className="font-mono text-xs text-indigo-700 font-bold px-2 py-0.5 bg-indigo-100 rounded">
                  {currentStudent.studentId}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {currentStudent.year} · {currentStudent.cohort}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentStudent.program} · {currentStudent.department}
              </p>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Advisor: {currentStudent.advisor} · {currentStudent.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 self-start md:self-auto">
            <div className="text-center px-2">
              <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono">GPA</div>
              <div className="text-lg font-bold font-mono text-indigo-700">{(currentStudent.gpa || 3.8).toFixed(2)}</div>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono">Credits</div>
              <div className="text-lg font-bold font-mono text-slate-800">{totalStudentCredits}</div>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono">Standing</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">
                {(currentStudent.gpa || 3.8) >= 3.8 ? "Dean's List" : 'Good Standing'}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Cumulative GPA
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {(currentStudent.gpa || 3.8).toFixed(2)} / 4.00
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{(currentStudent.gpa || 3.8) >= 3.8 ? 'First Class Honors' : 'Degree Eligible'}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Registered Credits
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {totalStudentCredits} Cr
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">Full-time load</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Courses
            </span>
            <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">
              {studentEnrolledCourses.length} Subjects
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">Fall 2026 Term</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Matriculation
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active Enrolled</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">Class of {currentStudent.cohort || '2027'}</div>
          </div>
        </div>

        {/* Enrolled Courses Grade Table - COMPACT & CLEAN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Term Course Evaluations</h3>
              <p className="text-[11px] text-slate-500">
                Official marks recorded for {currentStudent.firstName} {currentStudent.lastName}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              {studentGradeRecords.length} courses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs ${isCompactMode ? 'compact-table' : ''}`}>
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'}`}>Course</th>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'}`}>Credits</th>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'}`}>Instructor</th>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'}`}>Assessments Breakdown</th>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'}`}>Weighted %</th>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'}`}>Grade</th>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'}`}>GPA Pt</th>
                  <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3.5'} text-right`}>Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentGradeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                      No course grade records found for this student.
                    </td>
                  </tr>
                ) : (
                  studentGradeRecords.map(({ course, record }) => (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'}`}>
                        <div className="font-mono font-bold text-indigo-700">{course.code}</div>
                        <div className="font-medium text-slate-900 truncate max-w-xs">{course.title}</div>
                      </td>

                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'} font-mono font-medium text-slate-700`}>
                        {course.credits} Cr
                      </td>

                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'}`}>
                        <div className="text-slate-800 font-medium">{course.instructor?.name || 'Faculty'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{course.instructor?.email}</div>
                      </td>

                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'}`}>
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {course.assessments?.map((asm) => {
                            const score = record.scores[asm.id] ?? 90;
                            return (
                              <span
                                key={asm.id}
                                className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono border border-slate-200"
                                title={`${asm.name} (${asm.weight}% weight)`}
                              >
                                <span>{asm.name.slice(0, 4)}:</span>
                                <strong className="text-indigo-700">{score}%</strong>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'} font-mono text-xs font-bold text-slate-900`}>
                        {record.weightedPercentage}%
                      </td>

                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'}`}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          record.letterGrade.startsWith('A')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : record.letterGrade.startsWith('B')
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : record.letterGrade.startsWith('C')
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {record.letterGrade}
                        </span>
                      </td>

                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'} font-mono font-bold text-slate-800`}>
                        {record.gpaPoint.toFixed(1)}
                      </td>

                      <td className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2.5 px-3.5'} text-right`}>
                        <button
                          onClick={() => openTranscript(currentStudent, record, course)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
                        >
                          <span>Transcript</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
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
  }

  if (!currentCourse) {
    return (
      <div className="p-8 text-center text-slate-500">
        No courses available to grade.
      </div>
    );
  }

  // Instructor/Registrar Gradebook View
  return (
    <div 
      onMouseEnter={() => {
        if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
      }}
      onMouseMove={() => {
        if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
      }}
      className="p-5 max-w-7xl mx-auto space-y-4"
    >
      {/* Top Controls Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-0.5">
            <span className="font-bold text-indigo-700">{currentCourse.code}</span>
            <span aria-hidden="true">·</span>
            <span>{currentCourse.term}</span>
            <span aria-hidden="true">·</span>
            <span>{currentCourse.credits} Credits</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Academic Gradebook & Evaluation Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Real-time weighted score computation, rubrics distribution, and official transcripts
          </p>
        </div>

        {/* Course Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentCourse.id}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-2xs"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>

          <TableDensityToggle />

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {statistics.isAllPublished ? (
            <button
              onClick={() => unpublishGrades(currentCourse.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Draft</span>
            </button>
          ) : (
            <button
              onClick={() => publishGrades(currentCourse.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Term Grades</span>
            </button>
          )}
        </div>
      </div>

      {/* Assessment Weights Summary Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Grading Rubric Component Weights</span>
          <span className="text-slate-400 font-mono text-[11px]">Total: 100%</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {currentCourse.assessments?.map((asm) => (
            <div
              key={asm.id}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Class Average
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {statistics.avg}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Mean score</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Median Score
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {statistics.median}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">50th percentile</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              Highest Score
            </span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {statistics.highest}%
            </div>
            <div className="text-[10px] text-emerald-600/80 font-mono">Top cohort mark</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">
              Lowest Score
            </span>
            <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
              {statistics.lowest}%
            </div>
            <div className="text-[10px] text-rose-600/80 font-mono">Needs support</div>
          </div>
        </div>

        {/* Distribution Histogram */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
            <span>Grade Distribution</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {courseGrades.length} Students
            </span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-16 pt-1">
            {['A', 'B', 'C', 'D', 'F'].map((letter) => {
              const count = statistics.distribution[letter];
              const pct = courseGrades.length > 0 ? (count / courseGrades.length) * 100 : 0;
              const barHeight = Math.max(10, Math.round(pct));

              return (
                <div key={letter} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono font-medium text-slate-500">{count}</span>
                  <div className="w-full bg-slate-100 rounded-t overflow-hidden flex items-end h-10">
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
                  <span className="text-[11px] font-bold font-mono text-slate-700">{letter}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student roster..."
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="text-[11px] text-slate-500 italic">
          Edit any cell directly to recalculate weighted totals in real-time.
        </div>
      </div>

      {/* Interactive Gradebook Matrix Table - Compact & Clean */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isCompactMode ? 'compact-table' : ''}`}>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3'}`}>Student</th>
                <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3'}`}>Student ID</th>
                {currentCourse.assessments?.map((asm) => (
                  <th key={asm.id} className={`${isCompactMode ? 'py-1.5 px-2' : 'py-2 px-2'} text-center`}>
                    <div>{asm.name}</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {asm.weight}% (max {asm.maxScore})
                    </div>
                  </th>
                ))}
                <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3'} text-center font-bold text-slate-900`}>Total %</th>
                <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3'} text-center font-bold text-slate-900`}>Grade</th>
                <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3'} text-center font-bold text-slate-900`}>GPA</th>
                <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3'} text-center`}>Status</th>
                <th className={`${isCompactMode ? 'py-1.5 px-3' : 'py-2 px-3'} text-right`}>Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td
                    colSpan={(currentCourse.assessments?.length || 0) + 6}
                    className="py-6 text-center text-slate-400 italic"
                  >
                    No students match the search filter.
                  </td>
                </tr>
              ) : (
                filteredGrades.map(({ student, record }) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className={`${isCompactMode ? 'py-1 px-3' : 'py-2 px-3'}`}>
                      <div className="font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">{student.program}</div>
                    </td>

                    <td className={`${isCompactMode ? 'py-1 px-3' : 'py-2 px-3'} font-mono font-medium text-slate-700 text-[11px]`}>
                      {student.studentId}
                    </td>

                    {currentCourse.assessments?.map((asm) => {
                      const rawScore = record.scores[asm.id] !== undefined ? record.scores[asm.id] : '';

                      return (
                        <td key={asm.id} className={`${isCompactMode ? 'py-1 px-1.5' : 'py-1.5 px-2'} text-center`}>
                          <input
                            type="number"
                            min={0}
                            max={asm.maxScore}
                            value={rawScore}
                            onChange={(e) =>
                              handleScoreChange(record.id, asm.id, e.target.value, asm.maxScore)
                            }
                            className={`w-14 text-center font-mono font-semibold rounded border border-slate-200 bg-white focus:bg-indigo-50/30 focus:border-indigo-500 focus:outline-none transition-colors ${
                              isCompactMode ? 'py-0.5 text-xs' : 'py-1 text-xs'
                            }`}
                          />
                        </td>
                      );
                    })}

                    <td className={`${isCompactMode ? 'py-1 px-3' : 'py-2 px-3'} text-center font-mono font-bold text-slate-900`}>
                      {record.weightedPercentage}%
                    </td>

                    <td className={`${isCompactMode ? 'py-1 px-3' : 'py-2 px-3'} text-center`}>
                      <span
                        className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs ${
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

                    <td className={`${isCompactMode ? 'py-1 px-3' : 'py-2 px-3'} text-center font-mono font-semibold text-slate-700`}>
                      {record.gpaPoint.toFixed(1)}
                    </td>

                    <td className={`${isCompactMode ? 'py-1 px-3' : 'py-2 px-3'} text-center`}>
                      <span
                        className={`text-[10px] font-mono font-medium ${
                          record.status === 'Published'
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className={`${isCompactMode ? 'py-1 px-3' : 'py-2 px-3'} text-right`}>
                      <button
                        onClick={() => openTranscript(student, record)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-[11px]"
                      >
                        <span>Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
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
