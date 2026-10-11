import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  UserPlus, 
  Search, 
  X, 
  AlertTriangle, 
  LayoutGrid, 
  List, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { StudentRegisterModal } from './StudentRegisterModal.jsx';
import { StudentDetailDrawer } from './StudentDetailDrawer.jsx';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Electrical & Computer Engineering',
  'Biological & Biomedical Sciences',
  'Mathematics & Statistics',
  'Business & Economics',
];

const YEARS = ['All Years', 'Freshman', 'Sophomore', 'Junior', 'Senior'];

export const StudentRegistrationView = ({
  isRegisterModalOpen,
  setIsRegisterModalOpen,
}) => {
  const { students, role, isCompactMode } = useCollege();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [detailStudent, setDetailStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        student.firstName.toLowerCase().includes(q) ||
        student.lastName.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedDept !== 'All Departments' && student.department !== selectedDept) {
        return false;
      }

      if (selectedYear !== 'All Years' && student.year !== selectedYear) {
        return false;
      }

      if (selectedStatus !== 'all' && student.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [students, searchTerm, selectedDept, selectedYear, selectedStatus]);

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Directory & Academic Matriculation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional student records, academic standings, cumulative GPAs, and advisor assignments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <TableDensityToggle />

          {role === 'admin' && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID (e.g. STU-2024-001), or email..."
              className="w-full pl-9 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Academic Year filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Enrolled</option>
            <option value="Academic Probation">Academic Probation</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          <span>
            Displaying <strong className="font-mono text-slate-900">{filteredStudents.length}</strong> of{' '}
            <strong className="font-mono text-slate-900">{students.length}</strong> registered students
          </span>

          {(searchTerm || selectedDept !== 'All Departments' || selectedYear !== 'All Years' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('All Departments');
                setSelectedYear('All Years');
                setSelectedStatus('all');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Table View - Smaller, compact, cleaner layout */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No students match the criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your department or standing filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className={`w-full text-left ${isCompactMode ? 'table-compact' : ''}`}>
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Department & Degree</th>
                  <th className="py-2.5 px-3">Standing</th>
                  <th className="py-2.5 px-3">GPA</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => {
                  const isProbation = student.status === 'Academic Probation' || student.gpa < 2.0;
                  const isAtRiskAttendance = student.attendanceRate < 75;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setDetailStudent(student)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.firstName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                            />
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-br ${student.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs`}
                            >
                              {student.firstName[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-2 px-3 font-mono font-medium text-slate-700">
                        {student.studentId}
                      </td>

                      {/* Department */}
                      <td className="py-2 px-3">
                        <div className="text-slate-800 leading-tight">{student.program}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {student.department}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-2 px-3 text-slate-700">
                        <div>{student.year}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{student.cohort}</div>
                      </td>

                      {/* GPA */}
                      <td className="py-2 px-3">
                        <span
                          className={`font-mono font-bold ${
                            isProbation ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {student.gpa.toFixed(2)}
                        </span>
                      </td>

                      {/* Attendance */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-semibold ${
                              isAtRiskAttendance ? 'text-rose-600 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {student.attendanceRate}%
                          </span>
                          {isAtRiskAttendance && (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                            isProbation
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : student.status === 'Active'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-slate-500 bg-slate-100'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailStudent(student);
                          }}
                          className="flex items-center gap-1 ml-auto text-indigo-600 hover:text-indigo-800 font-medium text-[11px] cursor-pointer"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStudents.map((student) => {
            const isProbation = student.status === 'Academic Probation' || student.gpa < 2.0;

            return (
              <div
                key={student.id}
                onClick={() => setDetailStudent(student)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.firstName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${student.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                        >
                          {student.firstName[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400">
                          {student.studentId}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isProbation
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {student.year}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 font-medium">
                    {student.program}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {student.department}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">
                      {student.gpa.toFixed(2)} GPA
                    </span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`font-mono text-[11px] ${
                        student.attendanceRate < 75 ? 'text-rose-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {student.attendanceRate}% Attd
                    </span>
                  </div>

                  <span className="text-indigo-600 font-semibold text-[11px]">
                    Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <StudentRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      <StudentDetailDrawer
        student={detailStudent}
        isOpen={Boolean(detailStudent)}
        onClose={() => setDetailStudent(null)}
      />
    </div>
  );
};
