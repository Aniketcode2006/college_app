/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CollegeProvider, useCollege } from './context/CollegeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CourseCatalogView } from './components/courses/CourseCatalogView';
import { AttendanceTrackerView } from './components/attendance/AttendanceTrackerView';
import { GradingView } from './components/grading/GradingView';
import { StudentRegistrationView } from './components/students/StudentRegistrationView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ToastContainer } from './components/common/Toast';
import { CourseFormModal } from './components/courses/CourseFormModal';
import { StudentRegisterModal } from './components/students/StudentRegisterModal';

function MainApp() {
  const { activeTab } = useCollege();
  const [isRegisterStudentOpen, setIsRegisterStudentOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Header */}
      <Header
        onOpenRegisterStudent={() => setIsRegisterStudentOpen(true)}
        onOpenAddCourse={() => setIsAddCourseOpen(true)}
      />

      {/* Main Viewport Split with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onOpenRegisterStudent={() => setIsRegisterStudentOpen(true)}
          onOpenAddCourse={() => setIsAddCourseOpen(true)}
        />

        {/* Dynamic Content Surface */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenRegisterStudent={() => setIsRegisterStudentOpen(true)}
              onOpenAddCourse={() => setIsAddCourseOpen(true)}
            />
          )}

          {activeTab === 'courses' && <CourseCatalogView />}

          {activeTab === 'attendance' && <AttendanceTrackerView />}

          {activeTab === 'grading' && <GradingView />}

          {activeTab === 'students' && (
            <StudentRegistrationView
              isRegisterModalOpen={isRegisterStudentOpen}
              setIsRegisterModalOpen={setIsRegisterStudentOpen}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <StudentRegisterModal
        isOpen={isRegisterStudentOpen}
        onClose={() => setIsRegisterStudentOpen(false)}
      />

      <CourseFormModal
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
      />

      {/* Responsive Toast Feedback System */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <CollegeProvider>
      <MainApp />
    </CollegeProvider>
  );
}
