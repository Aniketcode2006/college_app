import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { X, UserPlus, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Computer Engineering',
  'Biological & Biomedical Sciences',
  'Mathematics & Statistics',
  'Business & Economics',
];

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

export const StudentRegisterModal = ({ isOpen, onClose }) => {
  const { registerStudent, courses } = useCollege();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [program, setProgram] = useState('B.Sc. Computer Science');
  const [year, setYear] = useState('Freshman');
  const [cohort, setCohort] = useState('Class of 2030');
  const [enrollmentDate, setEnrollmentDate] = useState('2026-09-01');
  const [status, setStatus] = useState('Active');
  const [advisor, setAdvisor] = useState('Prof. Dr. Evelyn Vance');
  const [address, setAddress] = useState('Campus Residential Quad 101');
  
  // Emergency Contact
  const [emName, setEmName] = useState('');
  const [emRel, setEmRel] = useState('Parent');
  const [emPhone, setEmPhone] = useState('');

  // Course Enrollment Selection
  const [selectedCourseIds, setSelectedCourseIds] = useState(['c-1']);

  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide student first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid college email address.');
      return;
    }

    registerStudent({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || '+1 (555) 000-0000',
      department,
      program: program.trim(),
      year,
      cohort,
      enrollmentDate,
      status,
      gpa: 4.0,
      attendanceRate: 100.0,
      advisor: advisor.trim(),
      emergencyContact: {
        name: emName.trim() || 'Primary Guardian',
        relationship: emRel.trim() || 'Family',
        phone: emPhone.trim() || phone.trim(),
      },
      address: address.trim(),
      enrolledCourseIds: selectedCourseIds,
    });

    onClose();
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                New Student Matriculation & Registration
              </h2>
              <p className="text-xs text-slate-500">
                Official academic registry entry and initial course enrollment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[76vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              1. Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Lin"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student.name@unity.edu"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Residence / Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quad Hall 204 or Boston Street address"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              2. Academic Program
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. B.Sc. Computer Science"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Standing
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cohort
                </label>
                <input
                  type="text"
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Advisor
                </label>
                <input
                  type="text"
                  value={advisor}
                  onChange={(e) => setAdvisor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Initial Course Enrollment */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              3. Initial Course Enrollments
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              Select the initial active curriculum courses for this student:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {courses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);
                return (
                  <button
                    type="button"
                    key={course.id}
                    onClick={() => handleCourseToggle(course.id)}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-mono font-bold text-indigo-700 mr-1.5">
                        {course.code}
                      </span>
                      <span className="truncate">{course.title}</span>
                    </div>
                    <span className="text-[10px] font-mono shrink-0 text-slate-400">
                      {course.credits} Cr
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              4. Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emName}
                  onChange={(e) => setEmName(e.target.value)}
                  placeholder="e.g. Helen Lin"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Relationship</label>
                <input
                  type="text"
                  value={emRel}
                  onChange={(e) => setEmRel(e.target.value)}
                  placeholder="e.g. Mother, Guardian"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={emPhone}
                  onChange={(e) => setEmPhone(e.target.value)}
                  placeholder="+1 (555) 999-8877"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Register & Matriculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
