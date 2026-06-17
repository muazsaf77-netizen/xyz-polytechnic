import { useState, useEffect } from 'react'
import { BookOpen, Award, Briefcase, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface StudentStats {
  enrolledCourses: number
  completedCocs: number
  attachmentStatus: string
  competenciesCompleted: number
}

export function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    completedCocs: 0,
    attachmentStatus: 'Not Started',
    competenciesCompleted: 0,
  })
  const [loading, setLoading] = useState(true)
  const { studentName } = useAuth()
  const { t } = useLang()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        if (!studentId) return

        const { count: courseCount } = await supabase
          .from('student_courses')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)

        const { count: cocCount } = await supabase
          .from('coc_results')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)

        const { data: attachment } = await supabase
          .from('industry_attachments')
          .select('status')
          .eq('student_id', studentId)
          .single()

        setStats({
          enrolledCourses: courseCount || 0,
          completedCocs: cocCount || 0,
          attachmentStatus: attachment?.status || 'Not Started',
          competenciesCompleted: 0,
        })
      } catch (error) {
        console.error('Failed to fetch student stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    { label: t('my_courses'), value: stats.enrolledCourses, icon: BookOpen, color: 'bg-blue-500' },
    { label: t('my_coc'), value: stats.completedCocs, icon: Award, color: 'bg-green-500' },
    { label: t('my_attachments'), value: stats.attachmentStatus, icon: Briefcase, color: 'bg-amber-500' },
    { label: t('competencies'), value: stats.competenciesCompleted, icon: Clock, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('welcome_message')}, {studentName || 'Student'}!
        </h1>
        <p className="text-gray-600">{t('dashboard_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
