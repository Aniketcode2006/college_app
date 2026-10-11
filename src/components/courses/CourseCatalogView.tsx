import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { Course, Department } from '../../types';
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
  List, 
  GraduationCap
} from 'lucide-react';
import { CourseFormModal } from './CourseFormModal';
import { CourseDetailModal } from './CourseDetailModal';

const DEPARTMENTS: (Department | 'All Departments')[] = [
  'All Departments',
  'Computer Science & Engineering',
  'Electrical & Computer Engineering',
  'Biological & Biomedical Sciences',
  'Mathematics & Statistics',
  'Business & Economics',
];

export const CourseCatalogView: React.FC = () => {
  const { 
    courses, 
    role, 
    deleteCourse, 
    toggleEnrollment 
  } = useCollege();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'All Departments'>('All Departments');
  const [selectedCredits, setSelectedCredits] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'open' | 'enrolled'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Maya Lin is student s-1 for student view
  const currentStudentId = 's-1';

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Search match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Department match
      if (selectedDept !== 'All Departments' && c.department !== selectedDept) {
        return false;
      }

      // Credits match
      if (selectedCredits !== 'all' && c.credits !== Number(selectedCredits)) {
        return false;
      }

      // Availability match
      if (availabilityFilter === 'open' && c.enrolledStudentIds.length >= c.capacity) {
        return false;
      }
      if (availabilityFilter === 'enrolled' && !c.enrolledStudentIds.includes(currentStudentId)) {
        return false;
      }

      return true;
    });
  }, [courses, searchTerm, selectedDept, selectedCredits, availabilityFilter]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setIsFormModalOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    deleteCourse(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Course Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse accredited courses, prerequisites, lecture schedules, and real-time seat capacities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code (e.g. CS-301), title, instructor, or keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department selector */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
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
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-mono"
          >
            <option value="all">All Credits</option>
            <option value="3">3 Credits</option>
            <option value="4">4 Credits</option>
          </select>

          {/* Availability filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">All Availability</option>
            <option value="open">Open Seats Only</option>
            {role === 'student' && <option value="enrolled">My Enrolled Courses</option>}
          </select>
        </div>

        {/* Results count & active tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
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
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Display */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No courses match your search criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your department filter, credits, or keyword search terms.
          </p>
          {role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Create New Course
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const isEnrolled = course.enrolledStudentIds.includes(currentStudentId);
            const enrolledCount = course.enrolledStudentIds.length;
            const isFull = enrolledCount >= course.capacity;
            const pctFilled = Math.min(100, Math.round((enrolledCount / course.capacity) * 100));

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-sm"
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 tracking-wide">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3
                    onClick={() => setDetailCourse(course)}
                    className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 hover:text-indigo-600 cursor-pointer"
                  >
                    {course.title}
                  </h3>

                  <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {course.department}
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Schedule & Room */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {course.schedule.days.join(', ')} · {course.schedule.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-500">{course.schedule.room}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Enrolled Capacity</span>
                      </span>
                      <span className="font-mono font-medium text-slate-700">
                        {enrolledCount} / {course.capacity} ({pctFilled}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isFull
                            ? 'bg-rose-500'
                            : pctFilled > 80
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pctFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Prerequisites unboxed */}
                  <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-600 shrink-0">Prereq:</span>
                    <span className="truncate text-slate-600 font-mono">
                      {course.prerequisites.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailCourse(course)}
                    className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    View Syllabus
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Student role: Enroll / Drop */}
                    {role === 'student' && (
                      <button
                        onClick={() => toggleEnrollment(course.id, currentStudentId)}
                        disabled={!isEnrolled && isFull}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
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
                            <span>Drop</span>
                          </>
                        ) : isFull ? (
                          <span>Full</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Enroll</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Admin actions: Edit & Delete */}
                    {role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                          title="Edit course details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(course.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
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
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Title & Department</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => {
                  const isEnrolled = course.enrolledStudentIds.includes(currentStudentId);
                  const enrolledCount = course.enrolledStudentIds.length;
                  const isFull = enrolledCount >= course.capacity;

                  return (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {course.code}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setDetailCourse(course)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {course.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {course.department}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {course.credits} Cr
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800">{course.instructor.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {course.instructor.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">
                          {course.schedule.days.join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {course.schedule.time}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <span className={isFull ? 'text-rose-600 font-bold' : ''}>
                          {enrolledCount}
                        </span>
                        /{course.capacity}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailCourse(course)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md font-medium text-[11px]"
                          >
                            Details
                          </button>

                          {role === 'student' && (
                            <button
                              onClick={() => toggleEnrollment(course.id, currentStudentId)}
                              disabled={!isEnrolled && isFull}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
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
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(course.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
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
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Confirm Course Removal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this course? Enrolled students will be automatically unenrolled and associated grading records will be cleared.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Edit/Create Modal */}
      <CourseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialCourse={editingCourse}
      />

      {/* Course Detail / Syllabus Modal */}
      <CourseDetailModal
        course={detailCourse}
        isOpen={Boolean(detailCourse)}
        onClose={() => setDetailCourse(null)}
        onEdit={(course) => {
          setEditingCourse(course);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
};
