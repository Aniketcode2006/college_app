import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { 
  BarChart3, 
  Award, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  Download, 
  ShieldCheck 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { students, courses, grades, showToast } = useCollege();

  // Metrics
  const deansListStudents = students.filter((s) => s.gpa >= 3.8);
  const atRiskStudents = students.filter((s) => s.attendanceRate < 75 || s.gpa < 2.2);

  // Department enrollment breakdown
  const departmentCounts: Record<string, number> = {};
  students.forEach((s) => {
    departmentCounts[s.department] = (departmentCounts[s.department] || 0) + 1;
  });

  const handleExportInstitutionalReport = () => {
    showToast('Comprehensive institutional academic compliance audit downloaded.', 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Analytics & Institutional Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-departmental performance benchmarks, grade integrity audits, and student retention tracking
          </p>
        </div>

        <button
          onClick={handleExportInstitutionalReport}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Compliance Audit</span>
        </button>
      </div>

      {/* High-Level Benchmark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Dean&apos;s List Cohort</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-2">
            {deansListStudents.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            GPA &ge; 3.80 ({students.length > 0 ? Math.round((deansListStudents.length / students.length) * 100) : 0}% of student body)
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Attendance Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-2">
            {students.filter((s) => s.attendanceRate >= 75).length} / {students.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Meeting minimum 75% lecture threshold
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Early Interventions Required</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-rose-700 mt-2">
            {atRiskStudents.length}
          </div>
          <div className="text-xs text-rose-600/80 mt-1">
            Referred to Departmental Academic Advisors
          </div>
        </div>
      </div>

      {/* Grid: Department Distribution + Dean's List Honor Roll */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Enrollment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Enrollment by Academic Department</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(departmentCounts).map(([dept, count]) => {
              const pct = Math.round((count / students.length) * 100);

              return (
                <div key={dept} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{dept}</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dean's List Honor Roll */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Fall 2026 Dean&apos;s Honor Roll</span>
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {deansListStudents.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${s.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                  >
                    {s.firstName[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {s.firstName} {s.lastName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {s.studentId} · {s.program}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-indigo-700">
                  {s.gpa.toFixed(2)} GPA
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
