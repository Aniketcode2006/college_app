export type Department = 
  | 'Computer Science & Engineering'
  | 'Electrical & Computer Engineering'
  | 'Biological & Biomedical Sciences'
  | 'Mathematics & Statistics'
  | 'Business & Economics';

export type AcademicYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';

export type StudentStatus = 'Active' | 'On Leave' | 'Academic Probation' | 'Graduated';

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2024-104"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: Department;
  program: string;
  year: AcademicYear;
  cohort: string;
  enrollmentDate: string;
  status: StudentStatus;
  gpa: number;
  attendanceRate: number; // percentage (0 - 100)
  advisor: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: string;
  avatarBg: string;
  enrolledCourseIds: string[];
}

export interface AssessmentItem {
  id: string;
  name: string;
  category: 'Assignments' | 'Midterm Exam' | 'Lab Projects' | 'Final Exam' | 'Attendance';
  weight: number; // percentage e.g. 25
  maxScore: number;
}

export type UserRole = 'admin' | 'professor' | 'student';

export interface Course {
  id: string;
  code: string; // e.g. "CS-301"
  title: string;
  description: string;
  department: Department;
  credits: number;
  prerequisites: string[]; // e.g. ["CS-201", "MATH-150"] or ["None"]
  capacity: number;
  enrolledStudentIds: string[];
  instructor: {
    id: string;
    name: string;
    title: string;
    email: string;
    office: string;
  };
  term: string; // "Fall 2026"
  schedule: {
    days: string[];
    time: string;
    room: string;
  };
  assessments: AssessmentItem[];
}

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  scores: Record<string, number>; // assessmentId -> raw score (0 to maxScore)
  weightedPercentage: number;
  letterGrade: string;
  gpaPoint: number;
  status: 'Draft' | 'Submitted' | 'Published';
  remarks?: string;
  lastUpdated: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Absent';

export interface AttendanceEntry {
  status: AttendanceStatus;
  timestamp?: string;
  method?: 'Manual' | 'QR Code' | 'NFC Card';
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  room: string;
  instructorName: string;
  isLive: boolean;
  records: Record<string, AttendanceEntry>; // studentId -> entry
  notes?: string;
}

export type ActiveNavTab = 
  | 'dashboard' 
  | 'attendance' 
  | 'grading' 
  | 'students' 
  | 'courses' 
  | 'analytics';
