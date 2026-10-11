import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext.jsx';
import { 
  School, 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CalendarDays, 
  BookOpen, 
  Radio, 
  FileSpreadsheet, 
  HelpCircle,
  X
} from 'lucide-react';

export const LoginView = () => {
  const { students, loginAsStudent, loginAsFaculty, showToast } = useCollege();
  const [activePortal, setActivePortal] = useState('student');
  const [identifier, setIdentifier] = useState('STU-2024-001'); // Maya Lin default
  const [password, setPassword] = useState('student@2024');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live matching student preview based on what the user types
  const matchedStudent = useMemo(() => {
    if (!identifier.trim()) return null;
    const clean = identifier.trim().toLowerCase();
    return students.find((s) => 
      s.studentId.toLowerCase() === clean ||
      s.email.toLowerCase() === clean ||
      s.firstName.toLowerCase() === clean ||
      `${s.firstName} ${s.lastName}`.toLowerCase() === clean
    ) || null;
  }, [identifier, students]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (activePortal === 'student') {
        const success = loginAsStudent(identifier);
        if (!success) {
          setIsSubmitting(false);
        }
      } else {
        loginAsFaculty('professor');
      }
    }, 250);
  };

  const handleQuickStudentSelect = (studentId) => {
    setIdentifier(studentId);
    setPassword('student@2024');
    setIsSubmitting(true);
    setTimeout(() => {
      loginAsStudent(studentId);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Identity Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">
              Unity College
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Student Information System & Academic Gateway
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Academic Year 2026–2027 · Term Active</span>
          </div>
          <button
            type="button"
            onClick={() => setActivePortal(activePortal === 'student' ? 'faculty' : 'student')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {activePortal === 'student' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Switch to Faculty & Dean Portal</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Return to Student Login</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Split Body: Hero Showcase + Terminal Login Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Atmospheric University Identity & Student Features */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Official Student Computing Network</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Welcome to your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
                  Student Academic Portal
                </span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                Log in to access your individualized student dashboard, synchronized timetable, 
                course registration, real-time lecture attendance, and official academic grade transcripts.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2.5">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Class Timetable</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Personalized weekly lecture hours, hall directions & faculty listings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Course Catalog</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Browse curricula, elective offerings, credits & syllabus details.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                  <Radio className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Live Attendance</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Self-service QR check-in & automated attendance verification.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Gradebook & GPA</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Real-time marks, course weight rubrics & official transcript records.
                </p>
              </div>
            </div>

            {/* University Motto / Honor Pledge */}
            <div className="pt-2 text-xs text-slate-500 font-mono flex items-center gap-2">
              <span className="font-serif italic text-slate-400">&ldquo;In Veritate Unitas&rdquo;</span>
              <span>·</span>
              <span>Unity College Est. 1892</span>
            </div>
          </div>

          {/* Right Column: Unique Terminal Card */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Terminal Mode Selector */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {activePortal === 'student' ? (
                      <>
                        <GraduationCap className="w-5 h-5 text-indigo-400" />
                        <span>Student Single Sign-On (SSO)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span>Faculty & Administration Access</span>
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activePortal === 'student'
                      ? 'Authenticate with your matriculation credentials or student email'
                      : 'Professor roll-call consoles and Registrar administration'}
                  </p>
                </div>

                <div className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Secure 256-Bit</span>
                </div>
              </div>

              {activePortal === 'student' ? (
                /* Student Login Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Student ID / Email Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Student ID or Institutional Email
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        Format: STU-YYYY-XXX
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. STU-2024-001 or maya.lin@unity.edu"
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                      {matchedStudent && (
                        <div className="absolute right-3 top-3 text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Identified</span>
                        </div>
                      )}
                    </div>

                    {/* Live Matched Student Profile Preview Card */}
                    {matchedStudent && (
                      <div className="mt-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between animate-in fade-in duration-200">
                        <div className="flex items-center gap-3 min-w-0">
                          {matchedStudent.avatarUrl ? (
                            <img
                              src={matchedStudent.avatarUrl}
                              alt={matchedStudent.firstName}
                              className="w-9 h-9 rounded-full object-cover border border-indigo-400 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full bg-gradient-to-br ${matchedStudent.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}
                            >
                              {matchedStudent.firstName[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                              <span>{matchedStudent.firstName} {matchedStudent.lastName}</span>
                              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/60 px-1.5 py-0.2 rounded border border-indigo-700/50">
                                {matchedStudent.studentId}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-300 truncate mt-0.5">
                              {matchedStudent.program} · {matchedStudent.year}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="text-xs font-bold font-mono text-emerald-400 block">
                            {matchedStudent.gpa.toFixed(2)} GPA
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {matchedStudent.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Student Portal Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Forgot PIN / Help?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Keep student session active on this station</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">Demo: Any PIN</span>
                  </div>

                  {/* Main Sign In Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-50 cursor-pointer"
                  >
                    <span>
                      {isSubmitting ? 'Authenticating Student...' : 'Access Student Dashboard & Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* 1-Click Fast Student Pass Profiles Roster */}
                  <div className="pt-5 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Fast-Track 1-Click Student Passes:</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Select a student to enter immediately
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {students.slice(0, 4).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleQuickStudentSelect(s.studentId)}
                          className="p-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-indigo-950/30 transition-all text-left flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {s.avatarUrl ? (
                              <img
                                src={s.avatarUrl}
                                alt={s.firstName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${s.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}
                              >
                                {s.firstName[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                {s.firstName} {s.lastName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {s.studentId} · {s.year}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold pl-2 shrink-0">
                            {s.gpa.toFixed(2)} &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              ) : (
                /* Faculty & Admin Portal Options */
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Faculty professors and academic administrators can access their roll-call consoles, 
                    course management, grading matrices, and student directories:
                  </p>

                  <button
                    type="button"
                    onClick={() => loginAsFaculty('professor')}
                    className="w-full p-4 rounded-xl border border-slate-800 hover:border-emerald-500/80 bg-slate-950/60 hover:bg-emerald-950/30 transition-all text-left flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Prof. Dr. Evelyn Vance
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Chair of Computer Science & Engineering · Roll-Call & Grading
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsFaculty('admin')}
                    className="w-full p-4 rounded-xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-indigo-950/30 transition-all text-left flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Dean&apos;s Academic Registry
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Full Administrator Control · New Courses & Student Registrations
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  </button>

                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setActivePortal('student')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      &larr; Switch back to Student Sign-In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding & Legal */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Encrypted Unity Academic Single Sign-On (SSO) · Version 4.2.0</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>FERPA & Student Privacy Compliant</span>
          <span>·</span>
          <span>IT Helpdesk: registrar@unity.edu</span>
        </div>
      </footer>

      {/* Forgot PIN / Help Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-white">Student Account Assistance</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Your default student login utilizes your assigned matriculation ID (e.g. 
              <span className="font-mono text-indigo-300"> STU-2024-001</span>) or campus email. 
              Any password string is accepted in this simulation mode.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-300">Sample Student Credentials:</div>
              <div className="font-mono text-[11px] text-slate-400">
                • Maya Lin: <span className="text-indigo-400">STU-2024-001</span> (maya.lin@unity.edu)<br />
                • Marcus Sterling: <span className="text-indigo-400">STU-2024-002</span> (marcus.sterling@unity.edu)<br />
                • Sofia Alvarez: <span className="text-indigo-400">STU-2024-003</span> (sofia.alvarez@unity.edu)
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('STU-2024-001');
                  setPassword('student@2024');
                  setIsForgotModalOpen(false);
                  showToast('Filled default credentials for Maya Lin', 'info');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Auto-Fill Maya Lin Credentials
              </button>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
