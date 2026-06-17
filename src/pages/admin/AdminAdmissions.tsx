import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Admission {
  id: string
  reference_no: string
  applicant_name_en: string
  applicant_name_am: string
  email: string
  phone: string
  gender: string
  date_of_birth: string
  program_id: string
  status: string
  created_at: string
  programs?: {
    name_en: string
    name_am: string
  }
}

export function AdminAdmissions() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { t, isAm } = useLang()

  useEffect(() => {
    fetchAdmissions()
  }, [])

  const fetchAdmissions = async () => {
    try {
      const { data } = await supabase
        .from('admissions')
        .select('*, programs(name_en, name_am)')
        .order('created_at', { ascending: false })

      if (data) setAdmissions(data)
    } catch (error) {
      console.error('Failed to fetch admissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await supabase.from('admissions').update({ status }).eq('id', id)
      fetchAdmissions()
    } catch (error) {
      console.error('Failed to update admission status:', error)
    }
  }

  const filteredAdmissions = admissions.filter((a) => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('admissions_management')}</h1>
        <p className="text-gray-600">{t('admissions_desc')}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(status)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('reference_no')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('applicant_name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('program')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdmissions.map((admission) => (
              <tr key={admission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {admission.reference_no}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isAm ? admission.applicant_name_am : admission.applicant_name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isAm ? admission.programs?.name_am : admission.programs?.name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[admission.status] || 'bg-gray-100 text-gray-800'}`}>
                    {t(admission.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(admission.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {admission.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => updateStatus(admission.id, 'approved')}
                        className="text-green-600 hover:text-green-700"
                        title={t('approve')}
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => updateStatus(admission.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                        title={t('reject')}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
