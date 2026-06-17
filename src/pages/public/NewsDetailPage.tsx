import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface News {
  id: string
  slug: string
  title_en: string
  title_am: string
  excerpt_en: string
  excerpt_am: string
  body_en: string
  body_am: string
  featured_image?: string
  category: string
  published_at: string
}

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [news, setNews] = useState<News | null>(null)
  const [relatedNews, setRelatedNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const { isAm } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Fetch main news
        const { data: newsData } = await supabase
          .from('news')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single()

        if (newsData) {
          setNews(newsData)

          // Fetch related news (same category, different article)
          const { data: relatedData } = await supabase
            .from('news')
            .select('*')
            .eq('category', newsData.category)
            .eq('is_published', true)
            .neq('id', newsData.id)
            .order('published_at', { ascending: false })
            .limit(3)

          if (relatedData) setRelatedNews(relatedData)
        }
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchNews()
  }, [slug])

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

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8">
        <button
          onClick={() => navigate('/news')}
          className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={20} />
          Back to News
        </button>
        <div className="text-center">
          <p className="text-gray-600 text-lg">News article not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Back Button */}
      <div className="bg-gray-50 px-4 md:px-8 py-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/news')}
            className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to News
          </button>
        </div>
      </div>

      {/* Featured Image */}
      {news.featured_image && (
        <div className="px-4 md:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <img
              src={news.featured_image}
              alt={isAm ? news.title_am : news.title_en}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Article Header */}
      <section className="py-8 px-4 md:px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {news.category && (
              <span className="bg-primary-100 text-primary-700 px-4 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                <Tag size={16} />
                {news.category}
              </span>
            )}
            <span className="text-gray-600 text-sm inline-flex items-center gap-2">
              <Calendar size={16} />
              {new Date(news.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isAm ? news.title_am : news.title_en}
          </h1>

          <p className="text-xl text-gray-600">
            {isAm ? news.excerpt_am : news.excerpt_en}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: isAm ? news.body_am : news.body_en,
            }}
          />
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-20 px-4 md:px-8 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related News</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
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
                      <p className="text-white text-sm font-semibold">News Image</p>
                    </div>
                  )}

                  <div className="p-6">
                    {item.category && (
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {item.category}
                      </span>
                    )}

                    <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {isAm ? item.title_am : item.title_en}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {isAm ? item.excerpt_am : item.excerpt_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
