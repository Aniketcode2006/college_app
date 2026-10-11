import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Student, 
  Course, 
  StudentGradeRecord, 
  AttendanceSession, 
  AttendanceStatus, 
  UserRole, 
  ActiveNavTab,
  AssessmentItem 
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_COURSES, 
  INITIAL_GRADES, 
  INITIAL_LIVE_SESSION, 
  PAST_SESSIONS 
} from '../data/mockData';

export function calculateGrade(weightedScore: number): { letterGrade: string; gpaPoint: number } {
  if (weightedScore >= 97) return { letterGrade: 'A+', gpaPoint: 4.0 };
  if (weightedScore >= 93) return { letterGrade: 'A', gpaPoint: 4.0 };
  if (weightedScore >= 90) return { letterGrade: 'A-', gpaPoint: 3.7 };
  if (weightedScore >= 87) return { letterGrade: 'B+', gpaPoint: 3.3 };
  if (weightedScore >= 83) return { letterGrade: 'B', gpaPoint: 3.0 };
  if (weightedScore >= 80) return { letterGrade: 'B-', gpaPoint: 2.7 };
  if (weightedScore >= 77) return { letterGrade: 'C+', gpaPoint: 2.3 };
  if (weightedScore >= 73) return { letterGrade: 'C', gpaPoint: 2.0 };
  if (weightedScore >= 70) return { letterGrade: 'C-', gpaPoint: 1.7 };
  if (weightedScore >= 65) return { letterGrade: 'D+', gpaPoint: 1.3 };
  if (weightedScore >= 60) return { letterGrade: 'D', gpaPoint: 1.0 };
  return { letterGrade: 'F', gpaPoint: 0.0 };
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface CollegeContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  students: Student[];
  courses: Course[];
  grades: StudentGradeRecord[];
  liveSession: AttendanceSession;
  pastSessions: AttendanceSession[];
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;

  // Course Catalog CRUD (Admin & Student)
  addCourse: (courseData: Omit<Course, 'id' | 'enrolledStudentIds' | 'assessments'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  toggleEnrollment: (courseId: string, studentId: string) => void;

  // Student Registration & Directory
  registerStudent: (data: Omit<Student, 'id' | 'studentId' | 'avatarBg'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Attendance Tracker
  updateAttendanceStatus: (
    studentId: string, 
    status: AttendanceStatus, 
    method?: 'Manual' | 'QR Code' | 'NFC Card', 
    notes?: string
  ) => void;
  markAllPresent: () => void;
  clearAllAttendance: () => void;
  simulateRandomCheckIn: () => void;
  toggleSessionLive: (isLive: boolean) => void;

  // Grading System
  updateGradeScore: (recordId: string, assessmentId: string, score: number) => void;
  publishGrades: (courseId: string) => void;
  unpublishGrades: (courseId: string) => void;

  // Reset
  resetToDefaults: () => void;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('veritas_role') as UserRole) || 'admin';
  });

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('veritas_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('veritas_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [grades, setGrades] = useState<StudentGradeRecord[]>(() => {
    const saved = localStorage.getItem('veritas_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [liveSession, setLiveSession] = useState<AttendanceSession>(() => {
    const saved = localStorage.getItem('veritas_live_session');
    return saved ? JSON.parse(saved) : INITIAL_LIVE_SESSION;
  });

  const [pastSessions] = useState<AttendanceSession[]>(INITIAL_SESSIONS_WRAP);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c-1');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('veritas_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('veritas_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('veritas_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('veritas_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('veritas_live_session', JSON.stringify(liveSession));
  }, [liveSession]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // COURSE MANAGEMENT
  const addCourse = (courseData: Omit<Course, 'id' | 'enrolledStudentIds' | 'assessments'>): Course => {
    const defaultAssessments: AssessmentItem[] = [
      { id: `asm-${Date.now()}-1`, name: 'Homework & Assignments', category: 'Assignments', weight: 25, maxScore: 100 },
      { id: `asm-${Date.now()}-2`, name: 'Midterm Examination', category: 'Midterm Exam', weight: 25, maxScore: 100 },
      { id: `asm-${Date.now()}-3`, name: 'Course Project / Labs', category: 'Lab Projects', weight: 25, maxScore: 100 },
      { id: `asm-${Date.now()}-4`, name: 'Final Examination', category: 'Final Exam', weight: 25, maxScore: 100 },
    ];

    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`,
      enrolledStudentIds: [],
      assessments: defaultAssessments,
    };

    setCourses((prev) => [newCourse, ...prev]);
    showToast(`Course "${newCourse.code}: ${newCourse.title}" successfully created.`, 'success');
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Course details updated successfully.', 'success');
  };

  const deleteCourse = (id: string) => {
    const courseToDelete = courses.find((c) => c.id === id);
    if (!courseToDelete) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
    // Remove from students' enrolledCourseIds
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        enrolledCourseIds: s.enrolledCourseIds.filter((cid) => cid !== id),
      }))
    );
    // Remove grades
    setGrades((prev) => prev.filter((g) => g.courseId !== id));
    if (selectedCourseId === id) {
      setSelectedCourseId(courses.find((c) => c.id !== id)?.id || '');
    }
    showToast(`Course "${courseToDelete.code}" deleted.`, 'info');
  };

  const toggleEnrollment = (courseId: string, studentId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const isEnrolled = course.enrolledStudentIds.includes(studentId);

    if (isEnrolled) {
      // Unenroll
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, enrolledStudentIds: c.enrolledStudentIds.filter((sid) => sid !== studentId) }
            : c
        )
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, enrolledCourseIds: s.enrolledCourseIds.filter((cid) => cid !== courseId) }
            : s
        )
      );
      showToast(`Dropped from course ${course.code}.`, 'info');
    } else {
      // Check capacity
      if (course.enrolledStudentIds.length >= course.capacity) {
        showToast(`Cannot enroll: ${course.code} is at maximum capacity (${course.capacity}).`, 'error');
        return;
      }
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, enrolledStudentIds: [...c.enrolledStudentIds, studentId] }
            : c
        )
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, enrolledCourseIds: [...s.enrolledCourseIds, courseId] }
            : s
        )
      );
      // Create empty grade record if none exists
      setGrades((prev) => {
        const exists = prev.some((g) => g.courseId === courseId && g.studentId === studentId);
        if (exists) return prev;
        const newRecord: StudentGradeRecord = {
          id: `g-${Date.now()}`,
          studentId,
          courseId,
          scores: {},
          weightedPercentage: 0,
          letterGrade: 'N/A',
          gpaPoint: 0.0,
          status: 'Draft',
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
        return [...prev, newRecord];
      });
      showToast(`Successfully enrolled in ${course.code}!`, 'success');
    }
  };

  // STUDENT REGISTRATION
  const registerStudent = (data: Omit<Student, 'id' | 'studentId' | 'avatarBg'>): Student => {
    const currentYear = new Date().getFullYear();
    const count = students.length + 1;
    const studentId = `STU-${currentYear}-${String(count).padStart(3, '0')}`;
    const avatarGradients = [
      'from-blue-600 to-indigo-700',
      'from-emerald-600 to-teal-700',
      'from-purple-600 to-pink-700',
      'from-amber-600 to-orange-700',
      'from-cyan-600 to-blue-700',
      'from-rose-600 to-red-700',
    ];
    const avatarBg = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

    const newStudent: Student = {
      ...data,
      id: `s-${Date.now()}`,
      studentId,
      avatarBg,
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Enroll in selected courses
    if (newStudent.enrolledCourseIds.length > 0) {
      setCourses((prev) =>
        prev.map((c) =>
          newStudent.enrolledCourseIds.includes(c.id)
            ? { ...c, enrolledStudentIds: [...c.enrolledStudentIds, newStudent.id] }
            : c
        )
      );
    }

    showToast(`Registered student ${newStudent.firstName} ${newStudent.lastName} (${studentId})`, 'success');
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Student profile updated.', 'success');
  };

  const deleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Remove from courses
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        enrolledStudentIds: c.enrolledStudentIds.filter((sid) => sid !== id),
      }))
    );
    // Remove grades
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    showToast(`Removed student ${student.firstName} ${student.lastName}.`, 'info');
  };

  // ATTENDANCE METHODS
  const updateAttendanceStatus = (
    studentId: string, 
    status: AttendanceStatus, 
    method: 'Manual' | 'QR Code' | 'NFC Card' = 'Manual',
    notes?: string
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLiveSession((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [studentId]: {
          status,
          timestamp: timeStr,
          method,
          notes: notes || prev.records[studentId]?.notes,
        },
      },
    }));
  };

  const markAllPresent = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const activeCourse = courses.find((c) => c.id === liveSession.courseId);
    const enrolledIds = activeCourse?.enrolledStudentIds || Object.keys(liveSession.records);

    const updatedRecords = { ...liveSession.records };
    enrolledIds.forEach((sid) => {
      updatedRecords[sid] = {
        status: 'Present',
        timestamp: timeStr,
        method: 'Manual',
      };
    });

    setLiveSession((prev) => ({
      ...prev,
      records: updatedRecords,
    }));
    showToast('Marked all students Present for this lecture session.', 'success');
  };

  const clearAllAttendance = () => {
    setLiveSession((prev) => ({
      ...prev,
      records: {},
    }));
    showToast('Cleared attendance roll-call for this session.', 'info');
  };

  const simulateRandomCheckIn = () => {
    const activeCourse = courses.find((c) => c.id === liveSession.courseId);
    const candidateIds = activeCourse?.enrolledStudentIds || [];
    // Find students not yet present
    const notPresent = candidateIds.filter((sid) => {
      const rec = liveSession.records[sid];
      return !rec || rec.status !== 'Present';
    });

    if (notPresent.length === 0) {
      showToast('All enrolled students have already checked in!', 'info');
      return;
    }

    const randomStudentId = notPresent[Math.floor(Math.random() * notPresent.length)];
    const student = students.find((s) => s.id === randomStudentId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const methods: ('QR Code' | 'NFC Card')[] = ['QR Code', 'NFC Card'];
    const chosenMethod = methods[Math.floor(Math.random() * methods.length)];

    setLiveSession((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [randomStudentId]: {
          status: 'Present',
          timestamp: timeStr,
          method: chosenMethod,
        },
      },
    }));

    if (student) {
      showToast(`⚡ Live Check-In: ${student.firstName} ${student.lastName} scanned via ${chosenMethod} (${timeStr})`, 'success');
    }
  };

  const toggleSessionLive = (isLive: boolean) => {
    setLiveSession((prev) => ({ ...prev, isLive }));
    showToast(isLive ? 'Lecture attendance session is now LIVE' : 'Attendance session concluded & saved.', 'info');
  };

  // GRADING METHODS
  const updateGradeScore = (recordId: string, assessmentId: string, score: number) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.id !== recordId) return g;
        const newScores = { ...g.scores, [assessmentId]: score };
        
        // Find course to get assessment weights
        const course = courses.find((c) => c.id === g.courseId);
        let weighted = 0;
        let totalWeight = 0;

        if (course) {
          course.assessments.forEach((asm) => {
            const asmScore = newScores[asm.id] !== undefined ? newScores[asm.id] : 0;
            const percentage = (asmScore / asm.maxScore) * 100;
            weighted += (percentage * asm.weight) / 100;
            totalWeight += asm.weight;
          });
        }

        const normalizedScore = totalWeight > 0 ? (weighted / totalWeight) * 100 : weighted;
        const rounded = Math.round(normalizedScore * 10) / 10;
        const { letterGrade, gpaPoint } = calculateGrade(rounded);

        return {
          ...g,
          scores: newScores,
          weightedPercentage: rounded,
          letterGrade,
          gpaPoint,
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
      })
    );
  };

  const publishGrades = (courseId: string) => {
    setGrades((prev) =>
      prev.map((g) => (g.courseId === courseId ? { ...g, status: 'Published' } : g))
    );
    showToast('Final term grades published to student academic records.', 'success');
  };

  const unpublishGrades = (courseId: string) => {
    setGrades((prev) =>
      prev.map((g) => (g.courseId === courseId ? { ...g, status: 'Draft' } : g))
    );
    showToast('Grades reverted to draft status for faculty revision.', 'info');
  };

  const resetToDefaults = () => {
    localStorage.removeItem('veritas_students');
    localStorage.removeItem('veritas_courses');
    localStorage.removeItem('veritas_grades');
    localStorage.removeItem('veritas_live_session');
    setStudents(INITIAL_STUDENTS);
    setCourses(INITIAL_COURSES);
    setGrades(INITIAL_GRADES);
    setLiveSession(INITIAL_LIVE_SESSION);
    showToast('Demo environment reset to initial campus state.', 'info');
  };

  return (
    <CollegeContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        students,
        courses,
        grades,
        liveSession,
        pastSessions,
        selectedCourseId,
        setSelectedCourseId,
        toasts,
        showToast,
        dismissToast,
        addCourse,
        updateCourse,
        deleteCourse,
        toggleEnrollment,
        registerStudent,
        updateStudent,
        deleteStudent,
        updateAttendanceStatus,
        markAllPresent,
        clearAllAttendance,
        simulateRandomCheckIn,
        toggleSessionLive,
        updateGradeScore,
        publishGrades,
        unpublishGrades,
        resetToDefaults,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
};

const INITIAL_SESSIONS_WRAP = PAST_SESSIONS;

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};
