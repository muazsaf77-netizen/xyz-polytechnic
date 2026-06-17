import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, User } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Trainer {
  id: string
  full_name_en: string
  full_name_am: string
  email: string
  phone: string
  specialization: string
  is_active: boolean
}

export function AdminTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null)
  const { t, isAm } = useLang()

  const [formData, setFormData] = useState({
    full_name_en: '',
    full_name_am: '',
    email: '',
    phone: '',
    specialization: '',
  })

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      const { data } = await supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setTrainers(data)
    } catch (error) {
      console.error('Failed to fetch trainers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTrainer) {
        await supabase.from('trainers').update(formData).eq('id', editingTrainer.id)
      } else {
        await supabase.from('trainers').insert([formData])
      }

      setShowModal(false)
      setEditingTrainer(null)
      setFormData({
        full_name_en: '',
        full_name_am: '',
        email: '',
        phone: '',
        specialization: '',
      })
      fetchTrainers()
    } catch (error) {
      console.error('Failed to save trainer:', error)
    }
  }

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer)
    setFormData({
      full_name_en: trainer.full_name_en,
      full_name_am: trainer.full_name_am,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      await supabase.from('trainers').delete().eq('id', id)
      fetchTrainers()
    } catch (error) {
      console.error('Failed to delete trainer:', error)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('trainers_management')}</h1>
          <p className="text-gray-600">{t('trainers_desc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingTrainer(null)
            setFormData({ full_name_en: '', full_name_am: '', email: '', phone: '', specialization: '' })
            setShowModal(true)
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={20} />
          {t('add_trainer')}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {isAm ? trainer.full_name_am : trainer.full_name_en}
                  </h3>
                  <p className="text-gray-500 text-sm">{trainer.specialization}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(trainer)} className="text-primary-600 hover:text-primary-700">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(trainer.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{trainer.email}</p>
              <p>{trainer.phone}</p>
            </div>
            <div className="mt-4">
              <span className={`px-2 py-1 text-xs rounded-full ${trainer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {trainer.is_active ? t('active') : t('inactive')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingTrainer ? t('edit_trainer') : t('add_trainer')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_en')}</label>
                  <input
                    type="text"
                    value={formData.full_name_en}
                    onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_am')}</label>
                  <input
                    type="text"
                    value={formData.full_name_am}
                    onChange={(e) => setFormData({ ...formData, full_name_am: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('specialization')}</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
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
