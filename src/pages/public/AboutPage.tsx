import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Page {
  id: string
  slug: string
  title_en: string
  title_am: string
  body_en: string
  body_am: string
  is_published: boolean
}

export function AboutPage() {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const { isAm } = useLang()

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const { data } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', 'about')
          .single()

        if (data) setPage(data)
      } catch (error) {
        console.error('Failed to fetch about page:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-800 text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">
            {isAm ? page.title_am : page.title_en}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: isAm ? page.body_am : page.body_en,
            }}
          />
        </div>
      </section>
    </div>
  )
}
