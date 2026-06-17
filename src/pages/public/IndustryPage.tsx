import { useState, useEffect } from 'react'
import { BarChart3, Users, Briefcase, TrendingUp } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Attachment {
  id: string
  student_id: string
  company_name: string
  start_date: string
  end_date: string
  status: string
}

interface Stat {
  label: string
  value: string | number
  icon: React.ReactNode
}

export function IndustryPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all attachments
        const { data: attachmentsData, count } = await supabase
          .from('industry_attachments')
          .select('*', { count: 'exact' })
          .order('start_date', { ascending: false })
          .limit(10)

        if (attachmentsData) {
          setAttachments(attachmentsData)
        }

        // Calculate stats
        const statusBreakdown = attachmentsData?.reduce(
          (acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ) || {}

        const companySet = new Set(attachmentsData?.map((a) => a.company_name) || [])

        setStats([
          {
            label: 'Total Attachments',
            value: count || 0,
            icon: <Briefcase className="text-primary-600" />,
          },
          {
            label: 'Active Placements',
            value: statusBreakdown['active'] || 0,
            icon: <Users className="text-accent-400" />,
          },
          {
            label: 'Completed',
            value: statusBreakdown['completed'] || 0,
            icon: <TrendingUp className="text-green-500" />,
          },
          {
            label: 'Partner Companies',
            value: companySet.size,
            icon: <BarChart3 className="text-blue-500" />,
          },
        ])
      } catch (error) {
        console.error('Failed to fetch industry data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-800 text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('nav_industry')}
          </h1>
          <p className="text-blue-100">
            Bridging Education and Industry Through Practical Experience
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 md:py-16 px-4 md:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Industry Attachment Programme
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                XYZ Polytechnic College is committed to providing students with real-world
                industry experience. Our Industry Attachment Programme partners with leading
                companies to offer students the opportunity to apply classroom knowledge in
                practical settings.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through these attachments, students develop professional skills, build industry
                connections, and enhance their employability while contributing valuable work
                experience to their career portfolios.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Real-world Experience',
                'Professional Networking',
                'Skill Development',
                'Career Preparation',
              ].map((item, idx) => (
                <div key={idx} className="bg-primary-50 rounded-lg p-4 text-center">
                  <p className="font-semibold text-primary-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4 text-4xl">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Attachments */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Recent Student Placements
          </h2>

          {attachments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No placements yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Company Name
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Student ID
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Start Date
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      End Date
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((attachment) => (
                    <tr key={attachment.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-900 font-semibold">
                        {attachment.company_name}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {attachment.student_id}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {new Date(attachment.start_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {attachment.end_date
                          ? new Date(attachment.end_date).toLocaleDateString()
                          : 'Ongoing'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            attachment.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : attachment.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {attachment.status.charAt(0).toUpperCase() +
                            attachment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Partner Companies Section */}
      <section className="bg-gray-50 py-12 md:py-20 px-4 md:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Industry Partners
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We work with leading organizations across various sectors to provide quality
            industry experience for our students. Our partners play a crucial role in
            shaping the next generation of technical professionals.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {['Manufacturing Sector', 'IT & Technology', 'Energy & Mining', 'Construction', 'Telecommunications', 'Financial Services'].map(
              (sector, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow"
                >
                  <Briefcase className="mx-auto mb-4 text-primary-600" size={32} />
                  <h3 className="text-lg font-bold text-gray-900">{sector}</h3>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Gain Industry Experience?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Apply to XYZ Polytechnic College and start your journey towards a successful career.
          </p>
        </div>
      </section>
    </div>
  )
}
