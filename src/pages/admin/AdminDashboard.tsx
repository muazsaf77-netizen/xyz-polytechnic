import { useState, useEffect } from 'react'
import { Users, BookOpen, Award, FileText, TrendingUp, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalPrograms: number
  totalStudents: number
  totalAdmissions: number
  pendingAdmissions: number
  newsCount: number
  cocResults: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalStudents: 0,
    totalAdmissions: 0,
    pendingAdmissions: 0,
    newsCount: 0,
    cocResults: 0,
  })
  const [loading, setLoading] = useState(true)
  const { adminName } = useAuth()
  const { t } = useLang()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: programCount } = await supabase
          .from('programs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })

        const { count: admissionCount } = await supabase
          .from('admissions')
          .select('*', { count: 'exact', head: true })

        const { count: pendingCount } = await supabase
          .from('admissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        const { count: newsCount } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)

        const { count: cocCount } = await supabase
          .from('coc_results')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalPrograms: programCount || 0,
          totalStudents: studentCount || 0,
          totalAdmissions: admissionCount || 0,
          pendingAdmissions: pendingCount || 0,
          newsCount: newsCount || 0,
          cocResults: cocCount || 0,
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
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
    { label: t('total_programs'), value: stats.totalPrograms, icon: BookOpen, color: 'bg-blue-500' },
    { label: t('total_students'), value: stats.totalStudents, icon: Users, color: 'bg-green-500' },
    { label: t('total_admissions'), value: stats.totalAdmissions, icon: UserPlus, color: 'bg-amber-500' },
    { label: t('pending_admissions'), value: stats.pendingAdmissions, icon: FileText, color: 'bg-red-500' },
    { label: t('published_news'), value: stats.newsCount, icon: FileText, color: 'bg-purple-500' },
    { label: t('coc_results'), value: stats.cocResults, icon: Award, color: 'bg-teal-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('welcome_message')}, {adminName || 'Admin'}!
        </h1>
        <p className="text-gray-600">{t('admin_dashboard_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <TrendingUp className="text-gray-300" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
