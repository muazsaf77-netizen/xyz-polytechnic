import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface News {
  id: string
  slug: string
  title_en: string
  title_am: string
  excerpt_en: string
  excerpt_am: string
  content_en: string
  content_am: string
  featured_image: string
  is_published: boolean
  published_at: string
}

export function AdminNews() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const { t, isAm } = useLang()

  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_am: '',
    excerpt_en: '',
    excerpt_am: '',
    content_en: '',
    content_am: '',
    featured_image: '',
    is_published: false,
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setNews(data)
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newsData = {
        ...formData,
        published_at: formData.is_published ? new Date().toISOString() : null,
      }

      if (editingNews) {
        await supabase.from('news').update(newsData).eq('id', editingNews.id)
      } else {
        await supabase.from('news').insert([newsData])
      }

      setShowModal(false)
      setEditingNews(null)
      resetForm()
      fetchNews()
    } catch (error) {
      console.error('Failed to save news:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      slug: '',
      title_en: '',
      title_am: '',
      excerpt_en: '',
      excerpt_am: '',
      content_en: '',
      content_am: '',
      featured_image: '',
      is_published: false,
    })
  }

  const handleEdit = (item: News) => {
    setEditingNews(item)
    setFormData({
      slug: item.slug,
      title_en: item.title_en,
      title_am: item.title_am,
      excerpt_en: item.excerpt_en,
      excerpt_am: item.excerpt_am,
      content_en: item.content_en,
      content_am: item.content_am,
      featured_image: item.featured_image || '',
      is_published: item.is_published,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      await supabase.from('news').delete().eq('id', id)
      fetchNews()
    } catch (error) {
      console.error('Failed to delete news:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('news_management')}</h1>
          <p className="text-gray-600">{t('news_desc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingNews(null)
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={20} />
          {t('add_news')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('title')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('published_at')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {isAm ? item.title_am : item.title_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${item.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.is_published ? t('published') : t('draft')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.published_at ? new Date(item.published_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(item)} className="text-primary-600 hover:text-primary-700 mr-4">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingNews ? t('edit_news') : t('add_news')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('title_en')}</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title_en: e.target.value,
                        slug: generateSlug(e.target.value),
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('title_am')}</label>
                  <input
                    type="text"
                    value={formData.title_am}
                    onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('excerpt_en')}</label>
                  <textarea
                    value={formData.excerpt_en}
                    onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('excerpt_am')}</label>
                  <textarea
                    value={formData.excerpt_am}
                    onChange={(e) => setFormData({ ...formData, excerpt_am: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('image_url')}</label>
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    {t('publish_now')}
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">
                  {t('btn_cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                  {t('btn_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
