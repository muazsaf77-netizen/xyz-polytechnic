import { useState, useEffect } from 'react'
import { Briefcase, Building, MapPin, Calendar } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Attachment {
  id: string
  organization_name: string
  start_date: string
  end_date: string
  status: string
  supervisor_name?: string
  location?: string
}

export function StudentAttachments() {
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    const fetchAttachment = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        if (!studentId) return

        const { data } = await supabase
          .from('industry_attachments')
          .select('*')
          .eq('student_id', studentId)
          .single()

        if (data) setAttachment(data)
      } catch (error) {
        console.error('Failed to fetch attachment:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttachment()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('my_attachments')}</h1>
        <p className="text-gray-600">{t('attachments_desc')}</p>
      </div>

      {!attachment ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">{t('no_attachment')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-xl">{attachment.organization_name}</h3>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[attachment.status] || 'bg-gray-100 text-gray-800'}`}>
                {attachment.status}
              </span>
            </div>
            <Briefcase className="text-primary-600" size={32} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-gray-600 text-sm">{t('duration')}</p>
                <p className="text-gray-900 font-medium">
                  {new Date(attachment.start_date).toLocaleDateString()} - {new Date(attachment.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {attachment.location && (
              <div className="flex items-center gap-3">
                <MapPin className="text-gray-400" size={20} />
                <div>
                  <p className="text-gray-600 text-sm">{t('location')}</p>
                  <p className="text-gray-900 font-medium">{attachment.location}</p>
                </div>
              </div>
            )}

            {attachment.supervisor_name && (
              <div className="flex items-center gap-3">
                <Building className="text-gray-400" size={20} />
                <div>
                  <p className="text-gray-600 text-sm">{t('supervisor')}</p>
                  <p className="text-gray-900 font-medium">{attachment.supervisor_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
