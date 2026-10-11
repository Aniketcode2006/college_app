import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_COURSES, 
  INITIAL_GRADES, 
  INITIAL_LIVE_SESSION, 
  PAST_SESSIONS 
} from '../data/mockData.js';

export function calculateGrade(weightedScore) {
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

const CollegeContext = createContext(null);

export const CollegeProvider = ({ children }) => {
  // Authentication & Role
  const [role, setRole] = useState(() => {
    return localStorage.getItem('unity_role') || 'student';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('unity_auth');
    return saved !== null ? saved === 'true' : true;
  });

  const [currentStudentId, setCurrentStudentId] = useState(() => {
    return localStorage.getItem('unity_student_id') || 's-1';
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('unity_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  // Table density mode: 'compact' or 'comfortable'
  const [isCompactMode, setIsCompactMode] = useState(() => {
    const saved = localStorage.getItem('unity_compact_mode');
    return saved !== null ? saved === 'true' : true; // Default compact as requested
  });

  // Primary Data Collections
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('unity_students') || localStorage.getItem('veritas_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_STUDENTS;
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('unity_courses') || localStorage.getItem('veritas_courses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_COURSES;
  });

  const [grades, setGrades] = useState(() => {
    const saved = localStorage.getItem('unity_grades') || localStorage.getItem('veritas_grades');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_GRADES;
  });

  const [liveSession, setLiveSession] = useState(() => {
    const saved = localStorage.getItem('unity_live_session') || localStorage.getItem('veritas_live_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_LIVE_SESSION;
  });

  const [pastSessions] = useState(PAST_SESSIONS);
  const [selectedCourseId, setSelectedCourseId] = useState('c-1');
  const [toasts, setToasts] = useState([]);

  // Current logged in student
  const currentStudent = students.find((s) => s.id === currentStudentId) || (students.length > 0 ? students[0] : undefined);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('unity_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('unity_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentStudentId) {
      localStorage.setItem('unity_student_id', currentStudentId);
    }
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem('unity_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('unity_compact_mode', String(isCompactMode));
  }, [isCompactMode]);

  useEffect(() => {
    localStorage.setItem('unity_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('unity_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('unity_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('unity_live_session', JSON.stringify(liveSession));
  }, [liveSession]);

  const showToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student Authentication
  const loginAsStudent = (identifier) => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      showToast('Please enter your Student ID or university email.', 'error');
      return false;
    }

    const found = students.find((s) => 
      s.studentId.toLowerCase() === clean ||
      s.email.toLowerCase() === clean ||
      s.firstName.toLowerCase() === clean ||
      s.lastName.toLowerCase() === clean ||
      `${s.firstName} ${s.lastName}`.toLowerCase() === clean ||
      s.id.toLowerCase() === clean
    ) || students.find((s) =>
      s.studentId.toLowerCase().includes(clean) ||
      s.email.toLowerCase().includes(clean) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(clean)
    );

    if (found) {
      setCurrentStudentId(found.id);
      setRole('student');
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      showToast(`Welcome back, ${found.firstName} ${found.lastName}! Logged in as ${found.studentId}.`, 'success');
      return true;
    }

    showToast(`No student found matching "${identifier}". Try student ID like STU-2024-001 or select from the student roster.`, 'error');
    return false;
  };

  const loginAsFaculty = (targetRole) => {
    setRole(targetRole);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    showToast(`Signed in as ${targetRole === 'admin' ? 'Academic Registrar (Admin)' : 'Faculty Professor'}.`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Signed out of Unity College Portal.', 'info');
  };

  // Real-time Student Self Check-In
  const studentSelfCheckIn = (token) => {
    if (!currentStudent) {
      return { success: false, message: 'Please log in as a student to check in.' };
    }

    if (!liveSession.isLive) {
      showToast('No live attendance session is active right now.', 'error');
      return { success: false, message: 'Lecture session is currently closed.' };
    }

    const isEnrolled = currentStudent.enrolledCourseIds.includes(liveSession.courseId);
    if (!isEnrolled) {
      showToast(`You are not enrolled in ${liveSession.courseCode}.`, 'error');
      return { success: false, message: `You are not enrolled in ${liveSession.courseCode}.` };
    }

    const alreadyChecked = liveSession.records[currentStudent.id]?.status === 'Present';
    if (alreadyChecked) {
      showToast(`You are already marked Present for ${liveSession.courseCode}!`, 'info');
      return { success: true, message: 'Already checked in!' };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLiveSession((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [currentStudent.id]: {
          status: 'Present',
          timestamp: timeStr,
          method: 'QR Code',
          notes: token ? `Verified via token (${token})` : 'Student portal instant check-in',
        },
      },
    }));

    showToast(`✓ Check-In Confirmed! ${currentStudent.firstName} marked Present at ${timeStr}.`, 'success');
    return { success: true, message: 'Attendance verified!' };
  };

  // COURSE CATALOG CRUD
  const addCourse = (courseData) => {
    const newId = `c-${Date.now()}`;
    const newCourse = {
      ...courseData,
      id: newId,
      enrolledStudentIds: [],
      assessments: [
        { id: `asm-${newId}-1`, name: 'Assignments & Quizzes', category: 'Assignments', weight: 25, maxScore: 100 },
        { id: `asm-${newId}-2`, name: 'Midterm Examination', category: 'Midterm Exam', weight: 30, maxScore: 100 },
        { id: `asm-${newId}-3`, name: 'Term Project / Lab', category: 'Lab Projects', weight: 35, maxScore: 100 },
        { id: `asm-${newId}-4`, name: 'Attendance & Engagement', category: 'Attendance', weight: 10, maxScore: 100 },
      ],
    };

    setCourses((prev) => [newCourse, ...prev]);
    showToast(`Course "${newCourse.code}: ${newCourse.title}" successfully created.`, 'success');
    return newCourse;
  };

  const updateCourse = (id, updates) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Course details updated successfully.', 'success');
  };

  const deleteCourse = (id) => {
    const courseToDelete = courses.find((c) => c.id === id);
    if (!courseToDelete) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        enrolledCourseIds: s.enrolledCourseIds.filter((cid) => cid !== id),
      }))
    );
    setGrades((prev) => prev.filter((g) => g.courseId !== id));
    if (selectedCourseId === id) {
      setSelectedCourseId(courses.find((c) => c.id !== id)?.id || '');
    }
    showToast(`Course "${courseToDelete.code}" deleted.`, 'info');
  };

  const toggleEnrollment = (courseId, studentId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const isEnrolled = course.enrolledStudentIds.includes(studentId);

    if (isEnrolled) {
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
      setGrades((prev) => {
        const exists = prev.some((g) => g.courseId === courseId && g.studentId === studentId);
        if (exists) return prev;
        const newRecord = {
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
  const registerStudent = (data) => {
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

    const newStudent = {
      ...data,
      id: `s-${Date.now()}`,
      studentId,
      avatarBg,
    };

    setStudents((prev) => [newStudent, ...prev]);

    if (newStudent.enrolledCourseIds && newStudent.enrolledCourseIds.length > 0) {
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

  const updateStudent = (id, updates) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Student profile updated.', 'success');
  };

  const deleteStudent = (id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        enrolledStudentIds: c.enrolledStudentIds.filter((sid) => sid !== id),
      }))
    );
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    showToast(`Removed student ${student.firstName} ${student.lastName}.`, 'info');
  };

  // ATTENDANCE METHODS
  const updateAttendanceStatus = (
    studentId, 
    status, 
    method = 'Manual',
    notes
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

    const methods = ['QR Code', 'NFC Card'];
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

  const toggleSessionLive = (isLive) => {
    setLiveSession((prev) => ({ ...prev, isLive }));
    showToast(isLive ? 'Lecture attendance session is now LIVE' : 'Attendance session concluded & saved.', 'info');
  };

  // GRADING METHODS
  const updateGradeScore = (recordId, assessmentId, score) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.id !== recordId) return g;
        const newScores = { ...g.scores, [assessmentId]: score };
        
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

  const publishGrades = (courseId) => {
    setGrades((prev) =>
      prev.map((g) => (g.courseId === courseId ? { ...g, status: 'Published' } : g))
    );
    showToast('Final term grades published to student academic records.', 'success');
  };

  const unpublishGrades = (courseId) => {
    setGrades((prev) =>
      prev.map((g) => (g.courseId === courseId ? { ...g, status: 'Draft' } : g))
    );
    showToast('Grades reverted to draft status for faculty revision.', 'info');
  };

  const resetToDefaults = () => {
    localStorage.removeItem('unity_students');
    localStorage.removeItem('unity_courses');
    localStorage.removeItem('unity_grades');
    localStorage.removeItem('unity_live_session');
    localStorage.removeItem('unity_role');
    localStorage.removeItem('unity_student_id');
    localStorage.removeItem('veritas_students');
    localStorage.removeItem('veritas_courses');
    localStorage.removeItem('veritas_grades');
    localStorage.removeItem('veritas_live_session');
    setStudents(INITIAL_STUDENTS);
    setCourses(INITIAL_COURSES);
    setGrades(INITIAL_GRADES);
    setLiveSession(INITIAL_LIVE_SESSION);
    setRole('student');
    setCurrentStudentId('s-1');
    setIsAuthenticated(true);
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
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isCompactMode,
        setIsCompactMode,
        isAuthenticated,
        currentStudentId,
        setCurrentStudentId,
        currentStudent,
        loginAsStudent,
        loginAsFaculty,
        logout,
        studentSelfCheckIn,
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

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};
