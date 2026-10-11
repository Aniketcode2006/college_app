import React, { useState, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  Award, 
  Radio, 
  BookOpen, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  FileText, 
  UserCheck, 
  Camera, 
  Upload, 
  Trash2, 
  X 
} from 'lucide-react';
import { StudentTranscriptModal } from '../grading/StudentTranscriptModal.jsx';
import { CourseDetailModal } from '../courses/CourseDetailModal.jsx';
import { TableDensityToggle } from '../common/TableDensityToggle.jsx';

// Curated realistic student portrait options for quick selection
const SAMPLE_PORTRAITS = [
  { label: 'Portrait 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { label: 'Portrait 2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  { label: 'Portrait 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
  { label: 'Portrait 4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Portrait 5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
  { label: 'Portrait 6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
];

export const StudentPortalView = () => {
  const { 
    currentStudent, 
    courses, 
    grades, 
    liveSession, 
    studentSelfCheckIn, 
    setActiveTab,
    students,
    setCurrentStudentId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    updateStudent,
    showToast,
    role,
    isCompactMode
  } = useCollege();

  const [checkInPasscode, setCheckInPasscode] = useState('UNITY-CS301-8924');
  const [selectedTranscriptCourse, setSelectedTranscriptCourse] = useState(null);
  const [selectedDetailCourse, setSelectedDetailCourse] = useState(null);
  
  // Profile picture modal & upload state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const fileInputRef = useRef(null);

  if (!currentStudent) {
    return (
      <div className="p-10 text-center text-slate-500">
        No active student session. Please log in.
      </div>
    );
  }

  // Handle local image file upload
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size should be less than 8MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            updateStudent(currentStudent.id, { avatarUrl: optimized });
          } else {
            updateStudent(currentStudent.id, { avatarUrl: dataUrl });
          }
          showToast('Profile picture updated successfully!', 'success');
          setIsPhotoModalOpen(false);
        };
        img.onerror = () => {
          updateStudent(currentStudent.id, { avatarUrl: dataUrl });
          showToast('Profile picture updated successfully!', 'success');
          setIsPhotoModalOpen(false);
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectPresetPhoto = (url) => {
    updateStudent(currentStudent.id, { avatarUrl: url });
    showToast('Profile picture updated!', 'success');
    setIsPhotoModalOpen(false);
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customPhotoUrl.trim()) return;
    updateStudent(currentStudent.id, { avatarUrl: customPhotoUrl.trim() });
    showToast('Profile picture updated from URL!', 'success');
    setCustomPhotoUrl('');
    setIsPhotoModalOpen(false);
  };

  const handleRemovePhoto = (e) => {
    if (e) e.stopPropagation();
    updateStudent(currentStudent.id, { avatarUrl: null });
    showToast('Profile picture removed.', 'info');
    setIsPhotoModalOpen(false);
  };

  // Enrolled courses for this student
  const enrolledCourses = courses.filter((c) =>
    (currentStudent.enrolledCourseIds || []).includes(c.id)
  );

  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);

  // Live session check
  const isEnrolledInLive = (currentStudent.enrolledCourseIds || []).includes(liveSession?.courseId);
  const myLiveRecord = liveSession?.records?.[currentStudent.id];
  const isCheckedInLive = myLiveRecord?.status === 'Present' || myLiveRecord?.status === 'Late';

  // Grades for this student
  const myGrades = enrolledCourses.map((c) => {
    const record = grades.find((g) => g.courseId === c.id && g.studentId === currentStudent.id);
    return { course: c, record };
  });

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    studentSelfCheckIn(checkInPasscode);
  };

  const currentGradeRecord = selectedTranscriptCourse
    ? grades.find((g) => g.courseId === selectedTranscriptCourse.id && g.studentId === currentStudent.id) || null
    : null;

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
      {/* Student Welcome Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Circular Student Profile Picture with Upload & Add Photo Functionality */}
          <div className="relative group shrink-0">
            <div
              onClick={() => setIsPhotoModalOpen(true)}
              title="Click to add or change profile picture"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-indigo-200 ring-4 ring-indigo-50 shadow-sm overflow-hidden flex items-center justify-center relative cursor-pointer hover:ring-indigo-200 transition-all select-none"
            >
              {currentStudent.avatarUrl ? (
                <img
                  src={currentStudent.avatarUrl}
                  alt={`${currentStudent.firstName} ${currentStudent.lastName}`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${currentStudent.avatarBg || 'from-indigo-600 to-indigo-800'} text-white flex items-center justify-center font-bold text-2xl shadow-inner`}
                >
                  {currentStudent.firstName ? currentStudent.firstName[0] : 'S'}
                </div>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                <Camera className="w-4 h-4 text-white mb-0.5" />
                <span className="text-[9px] font-semibold tracking-wide uppercase">
                  {currentStudent.avatarUrl ? 'Change' : 'Add Photo'}
                </span>
              </div>
            </div>

            {/* Circle camera action badge button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhotoModalOpen(true);
              }}
              title="Upload profile picture"
              aria-label="Upload profile picture"
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="font-bold text-indigo-700">{currentStudent.studentId}</span>
              <span aria-hidden="true">·</span>
              <span>{currentStudent.cohort}</span>
              <span aria-hidden="true">·</span>
              <span>{currentStudent.year}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Welcome back, {currentStudent.firstName} {currentStudent.lastName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentStudent.program} · {currentStudent.department}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
              >
                <Camera className="w-3 h-3" />
                <span>{currentStudent.avatarUrl ? 'Change Profile Picture' : 'Add Profile Picture'}</span>
              </button>
              {currentStudent.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] text-slate-400 hover:text-rose-600 px-1 py-0.5 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Persona Switcher only if role is faculty/admin */}
        {role !== 'student' ? (
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold text-[11px] px-1">Switch Student:</span>
            <select
              value={currentStudent.id}
              onChange={(e) => setCurrentStudentId(e.target.value)}
              className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {/* Primary Academic Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* GPA */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Cumulative GPA
            </span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {(currentStudent.gpa || 3.8).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(currentStudent.gpa || 3.8) >= 3.8
              ? "Dean's Honor Roll"
              : (currentStudent.gpa || 3.8) < 2.0
              ? 'Academic Probation'
              : 'Good Academic Standing'}
          </div>
        </div>

        {/* Attendance Rate */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Term Attendance
            </span>
            <Radio className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              (currentStudent.attendanceRate || 95) < 75 ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {currentStudent.attendanceRate || 95}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
            {(currentStudent.attendanceRate || 95) < 75 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Below 75%
              </span>
            ) : (
              <span>Exceeds threshold</span>
            )}
            <span className="text-indigo-600 font-semibold group-hover:underline">Logs &rarr;</span>
          </div>
        </div>

        {/* Enrolled Courses & Timetable */}
        <div 
          onClick={() => setActiveTab('timetable')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Class Timetable
            </span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {enrolledCourses.length} Classes
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
            <span className="font-mono">{totalCredits} Credit Hours</span>
            <span className="text-indigo-600 font-semibold group-hover:underline">View Grid &rarr;</span>
          </div>
        </div>

        {/* Faculty Advisor */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Academic Advisor
            </span>
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">
            {currentStudent.advisor}
          </div>
          <div className="text-[11px] text-indigo-600 mt-0.5 truncate font-mono">
            Turing Hall 410 · Office Hours
          </div>
        </div>
      </div>

      {/* Official Student Credentials & Institutional Record */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Official Student Record & Verified Credentials
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
            Status: {currentStudent.status} · Matriculated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 font-mono block">Student ID</span>
            <span className="font-mono font-bold text-indigo-700 block mt-0.5">{currentStudent.studentId}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 font-mono block">University Email</span>
            <span className="font-mono text-slate-800 truncate block mt-0.5" title={currentStudent.email}>
              {currentStudent.email}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 font-mono block">Phone Number</span>
            <span className="font-mono text-slate-800 block mt-0.5">{currentStudent.phone}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 font-mono block">Degree Program</span>
            <span className="text-slate-800 font-medium truncate block mt-0.5" title={currentStudent.program}>
              {currentStudent.program}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 font-mono block">Academic Standing</span>
            <span className="text-slate-800 font-medium block mt-0.5">{currentStudent.year} ({currentStudent.cohort})</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 font-mono block">Enrolled Date</span>
            <span className="font-mono text-slate-800 block mt-0.5">{currentStudent.enrollmentDate}</span>
          </div>
        </div>
      </div>

      {/* Real-time Lecture Attendance Check-In (When lecture is live) */}
      {liveSession && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE CLASSROOM SESSION
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {liveSession.courseCode} · {liveSession.date}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                {liveSession.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{liveSession.startTime} – {liveSession.endTime}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{liveSession.room}</span>
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{liveSession.instructorName}</span>
                </span>
              </div>
            </div>

            {/* Student Check-In Action Area */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 min-w-[260px]">
              {isCheckedInLive ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Attendance Verified!</span>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed font-mono">
                    Recorded as <strong className="text-white">{myLiveRecord?.status}</strong> at{' '}
                    <span className="text-emerald-300">{myLiveRecord?.timestamp || '10:00 AM'}</span>.
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Method: {myLiveRecord?.method || 'NFC / QR Verification'}
                  </div>
                </div>
              ) : isEnrolledInLive ? (
                <form onSubmit={handleCheckInSubmit} className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Check In to Class</span>
                    </span>
                    <span className="text-[10px] text-indigo-300 font-mono">Roll-Call Open</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={checkInPasscode}
                      onChange={(e) => setCheckInPasscode(e.target.value)}
                      placeholder="Enter token"
                      className="flex-1 px-2.5 py-1 text-xs font-mono bg-white text-slate-900 rounded-md focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-md transition-colors whitespace-nowrap"
                    >
                      Check In
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Enter code shown on instructor board or press Check In.
                  </p>
                </form>
              ) : (
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white">Not Enrolled in this Lecture</div>
                  <p className="text-[11px] text-slate-400">
                    You are not enrolled in {liveSession.courseCode}. Check catalog to enroll.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: My Enrolled Courses + Clean Gradebook Transcripts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Enrolled Courses Roster */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>My Enrolled Courses ({enrolledCourses.length})</span>
            </h3>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Browse Catalog &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {enrolledCourses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                You have not registered for any courses yet.
              </div>
            ) : (
              enrolledCourses.map((course) => {
                const gradeRec = grades.find(
                  (g) => g.courseId === course.id && g.studentId === currentStudent.id
                );

                return (
                  <div
                    key={course.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] mb-0.5">
                          <span className="font-bold text-indigo-700">{course.code}</span>
                          <span aria-hidden="true" className="text-slate-400">·</span>
                          <span className="text-slate-500">{course.credits} Credits</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {course.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {course.schedule?.days?.join(', ')} · {course.schedule?.time} · {course.schedule?.room}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {gradeRec ? (
                          <>
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {gradeRec.weightedPercentage}%
                            </div>
                            <span className="font-mono font-bold text-indigo-700 text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              {gradeRec.letterGrade}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 text-xs">In Progress</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Faculty: {course.instructor?.name}
                      </span>
                      <button
                        onClick={() => setSelectedDetailCourse(course)}
                        className="text-indigo-600 font-semibold hover:text-indigo-800 text-[11px]"
                      >
                        Syllabus &rarr;
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Gradebook Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Official Grades & Academic Transcripts</span>
            </h3>
            <TableDensityToggle />
          </div>

          <div className="space-y-2">
            {myGrades.map(({ course, record }) => {
              if (!record) return null;

              return (
                <div
                  key={course.id}
                  className={`rounded-lg border border-slate-200 bg-white flex items-center justify-between hover:bg-slate-50/70 transition-colors ${
                    isCompactMode ? 'p-2' : 'p-3'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-indigo-700">{course.code}</span>
                      <span className="text-[10px] text-slate-400">({record.status})</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                      {course.title}
                    </div>
                    {record.remarks && (
                      <p className="text-[10px] text-slate-500 truncate italic mt-0.5">
                        &quot;{record.remarks}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {record.weightedPercentage}%
                      </div>
                      <div className="text-[10px] font-mono text-indigo-700 font-bold">
                        {record.letterGrade} ({record.gpaPoint.toFixed(1)} pts)
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTranscriptCourse(course)}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                      title="View Official Transcript"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      <StudentTranscriptModal
        isOpen={Boolean(selectedTranscriptCourse && currentGradeRecord)}
        onClose={() => setSelectedTranscriptCourse(null)}
        student={currentStudent}
        course={selectedTranscriptCourse}
        gradeRecord={currentGradeRecord}
      />

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedDetailCourse}
        isOpen={Boolean(selectedDetailCourse)}
        onClose={() => setSelectedDetailCourse(null)}
      />

      {/* Hidden File Input for Direct Local Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileUpload}
      />

      {/* Profile Picture Upload & Customization Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Profile Picture</h3>
                  <p className="text-[11px] text-slate-500">Upload or select an avatar photo</p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Live Preview Circle */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-100 ring-4 ring-indigo-50/60 shadow-md overflow-hidden flex items-center justify-center relative mb-2 bg-slate-100">
                  {currentStudent.avatarUrl ? (
                    <img
                      src={currentStudent.avatarUrl}
                      alt="Student Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${currentStudent.avatarBg || 'from-indigo-600 to-indigo-800'} text-white flex items-center justify-center font-bold text-2xl`}
                    >
                      {currentStudent.firstName ? currentStudent.firstName[0] : 'S'}
                    </div>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {currentStudent.firstName} {currentStudent.lastName}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {currentStudent.studentId}
                </div>
              </div>

              {/* Action 1: Upload from Device */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Upload from Computer or Phone
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-xl flex items-center justify-center gap-2 text-indigo-700 font-semibold text-xs transition-colors cursor-pointer group"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span>Choose Image File (PNG, JPG, WebP)</span>
                </button>
              </div>

              {/* Action 2: Quick Sample Student Portraits */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Choose from Student Portraits
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {SAMPLE_PORTRAITS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetPhoto(p.url)}
                      title={p.label}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all p-0.5 hover:scale-105 cursor-pointer ${
                        currentStudent.avatarUrl === p.url
                          ? 'border-indigo-600 ring-2 ring-indigo-300'
                          : 'border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action 3: Image URL input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Or Enter Web Image URL
                </label>
                <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!customPhotoUrl.trim()}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {/* Action 4: Remove photo if set */}
              {currentStudent.avatarUrl && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Remove picture and restore initials:</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
