import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import '@/App.css'

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Public Pages
import { HomePage } from '@/pages/public/HomePage'
import { AboutPage } from '@/pages/public/AboutPage'
import { AcademicsPage } from '@/pages/public/AcademicsPage'
import { ProgramDetailPage } from '@/pages/public/ProgramDetailPage'
import { NewsPage } from '@/pages/public/NewsPage'
import { NewsDetailPage } from '@/pages/public/NewsDetailPage'
import { AdmissionsPage } from '@/pages/public/AdmissionsPage'
import { IndustryPage } from '@/pages/public/IndustryPage'

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { StudentCourses } from '@/pages/student/StudentCourses'
import { StudentCocResults } from '@/pages/student/StudentCocResults'
import { StudentAttachments } from '@/pages/student/StudentAttachments'
import { StudentCompetencies } from '@/pages/student/StudentCompetencies'
import { StudentLoginPage } from '@/pages/student/StudentLoginPage'

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminPrograms } from '@/pages/admin/AdminPrograms'
import { AdminCourses } from '@/pages/admin/AdminCourses'
import { AdminTrainers } from '@/pages/admin/AdminTrainers'
import { AdminNews } from '@/pages/admin/AdminNews'
import { AdminCoc } from '@/pages/admin/AdminCoc'
import { AdminAdmissions } from '@/pages/admin/AdminAdmissions'
import { AdminStudents } from '@/pages/admin/AdminStudents'
import { AdminSettings } from '@/pages/admin/AdminSettings'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminPages } from '@/pages/admin/AdminPages'

function NotFound() {
  return <div className="p-8 text-center">404 - Page Not Found</div>
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/academics/:programCode" element={<ProgramDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/industry" element={<IndustryPage />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student/login" element={<StudentLoginPage />} />
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/coc" element={<StudentCocResults />} />
          <Route path="/student/attachments" element={<StudentAttachments />} />
          <Route path="/student/competencies" element={<StudentCompetencies />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/programs" element={<AdminPrograms />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/trainers" element={<AdminTrainers />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/coc" element={<AdminCoc />} />
          <Route path="/admin/admissions" element={<AdminAdmissions />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/pages" element={<AdminPages />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
