import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Page {
  id: string
  slug: string
  title_en: string
  title_am: string
  content_en: string
  content_am: string
  is_published: boolean
}

export function AdminPages() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const { t, isAm } = useLang()

  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_am: '',
    content_en: '',
    content_am: '',
    is_published: false,
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setPages(data)
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPage) {
        await supabase.from('pages').update(formData).eq('id', editingPage.id)
      } else {
        await supabase.from('pages').insert([formData])
      }

      setShowModal(false)
      setEditingPage(null)
      resetForm()
      fetchPages()
    } catch (error) {
      console.error('Failed to save page:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      slug: '',
      title_en: '',
      title_am: '',
      content_en: '',
      content_am: '',
      is_published: false,
    })
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      slug: page.slug,
      title_en: page.title_en,
      title_am: page.title_am,
      content_en: page.content_en,
      content_am: page.content_am,
      is_published: page.is_published,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      await supabase.from('pages').delete().eq('id', id)
      fetchPages()
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('pages_management')}</h1>
          <p className="text-gray-600">{t('pages_desc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingPage(null)
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={20} />
          {t('add_page')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('title')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {isAm ? page.title_am : page.title_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{page.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${page.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {page.is_published ? t('published') : t('draft')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(page)} className="text-primary-600 hover:text-primary-700 mr-4">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-700">
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
              {editingPage ? t('edit_page') : t('add_page')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="about, contact, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('title_en')}</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('content_en')}</label>
                  <textarea
                    value={formData.content_en}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('content_am')}</label>
                  <textarea
                    value={formData.content_am}
                    onChange={(e) => setFormData({ ...formData, content_am: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={6}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="page_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="page_published" className="text-sm font-medium text-gray-700">
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
