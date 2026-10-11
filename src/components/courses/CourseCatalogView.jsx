import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Users, 
  Clock, 
  MapPin, 
  LayoutGrid, 
  List
} from 'lucide-react';
import { CourseFormModal } from './CourseFormModal.jsx';
import { CourseDetailModal } from './CourseDetailModal.jsx';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Electrical & Computer Engineering',
  'Biological & Biomedical Sciences',
  'Mathematics & Statistics',
  'Business & Economics',
];

export const CourseCatalogView = () => {
  const { 
    courses, 
    role, 
    currentStudent,
    deleteCourse, 
    toggleEnrollment,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isCompactMode
  } = useCollege();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedCredits, setSelectedCredits] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [detailCourse, setDetailCourse] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Active student from auth session
  const currentStudentId = currentStudent?.id || 's-1';

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (selectedDept !== 'All Departments' && c.department !== selectedDept) {
        return false;
      }

      if (selectedCredits !== 'all' && c.credits !== Number(selectedCredits)) {
        return false;
      }

      if (availabilityFilter === 'open' && c.enrolledStudentIds.length >= c.capacity) {
        return false;
      }
      if (availabilityFilter === 'enrolled' && !c.enrolledStudentIds.includes(currentStudentId)) {
        return false;
      }

      return true;
    });
  }, [courses, searchTerm, selectedDept, selectedCredits, availabilityFilter, currentStudentId]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setIsFormModalOpen(true);
  };

  const handleConfirmDelete = (id) => {
    deleteCourse(id);
    setDeleteConfirmId(null);
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
      {/* Top Banner / Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Academic Course Catalog
            </h1>
            {role === 'student' && currentStudent && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentStudent.avatarUrl ? (
                  <img src={currentStudent.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {currentStudent.firstName[0]}
                  </span>
                )}
                <span>Enrolled as {currentStudent.firstName} {currentStudent.lastName} ({currentStudent.studentId})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'student' && currentStudent
              ? `Currently registered in ${courses.filter(c => c.enrolledStudentIds.includes(currentStudentId)).length} courses (${courses.filter(c => c.enrolledStudentIds.includes(currentStudentId)).reduce((sum, c) => sum + c.credits, 0)} credits) · Instant Enroll/Drop controls active`
              : 'Browse accredited courses, prerequisites, lecture schedules, and real-time seat capacities'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <TableDensityToggle />

          {role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
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
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code (e.g. CS-301), title, instructor, or keywords..."
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

          {/* Department selector */}
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

          {/* Credits selector */}
          <select
            value={selectedCredits}
            onChange={(e) => setSelectedCredits(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-mono"
          >
            <option value="all">All Credits</option>
            <option value="3">3 Credits</option>
            <option value="4">4 Credits</option>
          </select>

          {/* Availability filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Availability</option>
            <option value="open">Open Seats Only</option>
            {role === 'student' && <option value="enrolled">My Enrolled Courses</option>}
          </select>
        </div>

        {/* Results count & active tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="font-mono text-slate-900">{filteredCourses.length}</strong> of{' '}
              <strong className="font-mono text-slate-900">{courses.length}</strong> catalog courses
            </span>
            {selectedDept !== 'All Departments' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-600">{selectedDept}</span>
              </>
            )}
          </div>

          {(searchTerm || selectedDept !== 'All Departments' || selectedCredits !== 'all' || availabilityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('All Departments');
                setSelectedCredits('all');
                setAvailabilityFilter('all');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Roster Display Mode */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">No courses matching your search query.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW - Compact, clean card styling */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const isEnrolled = course.enrolledStudentIds.includes(currentStudentId);
            const enrolledCount = course.enrolledStudentIds.length;
            const isFull = enrolledCount >= course.capacity;

            return (
              <div
                key={course.id}
                className={`bg-white rounded-xl border transition-all flex flex-col justify-between ${
                  isEnrolled
                    ? 'border-indigo-300 ring-1 ring-indigo-100 shadow-xs'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                } ${isCompactMode ? 'p-3.5' : 'p-4'}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-400 font-mono ml-2">
                        {course.credits} Credits
                      </span>
                    </div>

                    {isEnrolled && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Enrolled</span>
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => setDetailCourse(course)}
                    className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer mt-2 leading-snug line-clamp-2"
                  >
                    {course.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{course.schedule.days.join(', ')} · {course.schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{course.schedule.room}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                      <Users className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">Faculty: {course.instructor.name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setDetailCourse(course)}
                    className="text-[11px] font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    View Syllabus
                  </button>

                  <div className="flex items-center gap-1.5">
                    {role === 'student' && (
                      <button
                        onClick={() => toggleEnrollment(course.id, currentStudentId)}
                        disabled={!isEnrolled && isFull}
                        className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                          isEnrolled
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : isFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isEnrolled ? (
                          <>
                            <X className="w-3 h-3" />
                            <span>Drop</span>
                          </>
                        ) : isFull ? (
                          <span>Full</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Enroll</span>
                          </>
                        )}
                      </button>
                    )}

                    {role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          title="Edit course details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(course.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW - Smaller, cleaner, compact table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className={`w-full text-left ${isCompactMode ? 'table-compact' : ''}`}>
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Title & Department</th>
                  <th className="py-2.5 px-3">Credits</th>
                  <th className="py-2.5 px-3">Instructor</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCourses.map((course) => {
                  const isEnrolled = course.enrolledStudentIds.includes(currentStudentId);
                  const enrolledCount = course.enrolledStudentIds.length;
                  const isFull = enrolledCount >= course.capacity;

                  return (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                        {course.code}
                      </td>
                      <td className="py-2 px-3">
                        <div
                          onClick={() => setDetailCourse(course)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {course.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {course.department}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {course.credits} Cr
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {course.instructor.name}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 font-mono">
                        <div>{course.schedule.days.join(', ')}</div>
                        <div className="text-[10px] text-slate-400">{course.schedule.time}</div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        <span className={isFull ? 'text-rose-600 font-bold' : ''}>
                          {enrolledCount}
                        </span>
                        /{course.capacity}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailCourse(course)}
                            className="px-2 py-0.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded font-medium text-[11px] cursor-pointer"
                          >
                            Details
                          </button>

                          {role === 'student' && (
                            <button
                              onClick={() => toggleEnrollment(course.id, currentStudentId)}
                              disabled={!isEnrolled && isFull}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                                isEnrolled
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                  : isFull
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {isEnrolled ? 'Drop' : isFull ? 'Full' : 'Enroll'}
                            </button>
                          )}

                          {role === 'admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(course)}
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(course.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900">Confirm Course Removal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this course? Enrolled students will be automatically unenrolled and associated grading records will be cleared.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CourseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialCourse={editingCourse}
      />

      <CourseDetailModal
        isOpen={Boolean(detailCourse)}
        onClose={() => setDetailCourse(null)}
        course={detailCourse}
        onEdit={(c) => {
          setDetailCourse(null);
          handleOpenEdit(c);
        }}
      />
    </div>
  );
};
