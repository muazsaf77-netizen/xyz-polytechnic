import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface News {
  id: string
  slug: string
  title_en: string
  title_am: string
  excerpt_en: string
  excerpt_am: string
  featured_image?: string
  category: string
  published_at: string
}

export function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [filteredNews, setFilteredNews] = useState<News[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { t, isAm } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })

        if (data) {
          setNews(data)
          const uniqueCategories = [...new Set(data.map((item) => item.category))]
          setCategories(uniqueCategories.filter(Boolean))
        }
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  useEffect(() => {
    let filtered = news

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title_en.toLowerCase().includes(query) ||
          item.title_am.toLowerCase().includes(query) ||
          item.excerpt_en.toLowerCase().includes(query) ||
          item.excerpt_am.toLowerCase().includes(query)
      )
    }

    setFilteredNews(filtered)
  }, [news, selectedCategory, searchQuery])

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
            {t('nav_news')}
          </h1>
          <p className="text-blue-100">
            Stay updated with the latest news and announcements from XYZ Polytechnic
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-gray-50 py-8 px-4 md:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                {t('filter')}
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* News List */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group border border-gray-200"
                  onClick={() => navigate(`/news/${item.slug}`)}
                >
                  {item.featured_image ? (
                    <div className="relative overflow-hidden h-48 bg-gray-200">
                      <img
                        src={item.featured_image}
                        alt="News"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary-600 to-blue-800 flex items-center justify-center">
                      <div className="text-white text-center">
                        <p className="text-sm font-semibold">News Image</p>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {item.category && (
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {item.category}
                        </span>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(item.published_at).toLocaleDateString()}
                      </p>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {isAm ? item.title_am : item.title_en}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
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
          )}
        </div>
      </section>
    </div>
  )
}
