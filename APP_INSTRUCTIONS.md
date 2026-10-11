# Unity College Management System — Custom Instructions & Design Guidelines

## 1. Design System & Aesthetics
- **Framework & Styling**: React 19 + TypeScript + Tailwind CSS (v4).
- **Typography**: 
  - Primary Display & Body: `Plus Jakarta Sans`, system-ui, sans-serif.
  - Numbers, Codes & Telemetry: `JetBrains Mono` with `tabular-nums` for rock-solid tabular alignment.
- **Color Palette & Discipline (60-30-10 Rule)**:
  - 60% Canvas: Slate-50 background (`#f8fafc`), clean crisp white surfaces (`#ffffff`).
  - 30% Structural: Slate-200 borders (`#e2e8f0`), Slate-600/700 typography.
  - 10% Accent: Academic Navy (`#0f172a`), Indigo-600 (`#4f46e5`), Emerald-600 (`#16a34a` for active/present), Amber-600 (`#d97706` for late/warning), Crimson-600 (`#dc2626` for absent/danger).
- **Anti-Slop Restraint**:
  - Zero-pill metadata: Render tags, course credits, and timestamps as unboxed clean text separated with `·` or `/`.
  - Single-line controls: All buttons, tabs, and tags must not wrap onto two lines.
  - No decorative status dots without live semantic meaning.
  - No broken external image placeholders; use styled SVG insignias and color-coded avatar monograms.

## 2. Core Functional Modules
1. **Course Catalog & Curriculum Management**:
   - **Administrator Capabilities**:
     - Create new courses (Code, Title, Description, Department, Credits, Prerequisites, Capacity, Instructor, Schedule, Room).
     - Edit existing courses and update syllabus/assessment weighting.
     - Delete courses with confirmation guardrails.
   - **Student / Public Catalog Browser**:
     - Real-time search by Course Code, Title, or Keyword.
     - Multi-faceted filter by Department, Minimum Credits, and Availability.
     - Course detail drawer / modal displaying prerequisites, instructor office hours, schedule, capacity bar, and one-click enrollment simulation.
2. **Student Registration & Directory**:
   - Multi-step / structured student registration modal with validation.
   - Comprehensive student profile drawers with GPA, attendance stats, emergency contact, advisor, and enrolled courses.
3. **Interactive Grading System**:
   - Course gradebook spreadsheet with inline score editing.
   - Real-time recalculation of weighted percentage, letter grade, and 4.0 GPA scale.
   - Grade distribution histogram and statistical metrics (Average, Median, Highest, Lowest).
   - Grade publishing controls (Draft vs Published) and CSV export.
4. **Real-Time Attendance Tracking for Professors**:
   - Live session control (Start / Pause / Complete lecture).
   - Quick one-click roll-call marking: Present (P), Late (L), Absent (A), Excused (E).
   - Interactive QR Kiosk mode with live check-in simulator feed.
   - Real-time attendance rate calculation and threshold compliance alerts (<75%).
5. **Multi-Role Perspectives**:
   - Switchable role bar: Administrator, Professor, and Student views with role-appropriate permissions.
