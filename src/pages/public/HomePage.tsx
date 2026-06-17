import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users, Briefcase, Award, TrendingUp } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Program {
  id: string
  code: string
  name_en: string
  name_am: string
  tvet_level: string
  duration_months: number
}

interface News {
  id: string
  slug: string
  title_en: string
  title_am: string
  excerpt_en: string
  excerpt_am: string
  featured_image?: string
  published_at: string
}

interface Stat {
  label: string
  value: string
  icon: React.ReactNode
}

export function HomePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [news, setNews] = useState<News[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const { t, isAm } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured programs
        const { data: programsData } = await supabase
          .from('programs')
          .select('id, code, name_en, name_am, tvet_level, duration_months')
          .eq('is_active', true)
          .limit(6)

        if (programsData) setPrograms(programsData)

        // Fetch latest news
        const { data: newsData } = await supabase
          .from('news')
          .select('id, slug, title_en, title_am, excerpt_en, excerpt_am, featured_image, published_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(3)

        if (newsData) setNews(newsData)

        // Fetch stats
        const { count: studentCount } = await supabase
          .from('admissions')
          .select('*', { count: 'exact', head: true })

        const { count: programCount } = await supabase
          .from('programs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        const { count: attachmentCount } = await supabase
          .from('industry_attachments')
          .select('*', { count: 'exact', head: true })

        setStats([
          { label: t('stats_students'), value: String(studentCount || 0), icon: <Users className="text-accent-400" /> },
          { label: t('stats_programs'), value: String(programCount || 0), icon: <BookOpen className="text-primary-600" /> },
          { label: t('stats_attachment'), value: String(attachmentCount || 0), icon: <Briefcase className="text-green-500" /> },
          { label: t('stats_coc'), value: '150+', icon: <Award className="text-blue-500" /> },
        ])
      } catch (error) {
        console.error('Failed to fetch home page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [t])

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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-blue-800 text-white py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t('hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/academics')}
                className="bg-accent-400 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                {t('hero_cta')}
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/admissions')}
                className="border-2 border-white hover:bg-white hover:text-primary-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                {t('hero_cta2')}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Programs Section */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('programs_title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('programs_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="bg-gradient-to-r from-primary-600 to-blue-800 h-40 flex items-end p-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {isAm ? program.name_am : program.name_en}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Level {program.tvet_level}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {program.duration_months} {t('months')}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/academics/${program.code}`)}
                    className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-2 mt-4"
                  >
                    {t('read_more')}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/academics')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              {t('nav_academics')}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="bg-gray-50 py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('nav_news')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/news/${item.slug}`)}
              >
                {item.featured_image && (
                  <img
                    src={item.featured_image}
                    alt="News"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <p className="text-gray-500 text-sm mb-2">
                    {new Date(item.published_at).toLocaleDateString()}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {isAm ? item.title_am : item.title_en}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {isAm ? item.excerpt_am : item.excerpt_en}
                  </p>
                  <button className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-2">
                    {t('read_more')}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-800 text-white py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('admissions_title')}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your journey towards a successful career in the technical field
          </p>
          <button
            onClick={() => navigate('/admissions')}
            className="bg-accent-400 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {t('apply_now')}
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  )
}

// Add missing import
import { BookOpen } from 'lucide-react'
