import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Course {
  id: string
  course_code: string
  course_name_en: string
  course_name_am: string
  credit_hours: number
  program_id: string
  programs?: {
    name_en: string
    name_am: string
  }
}

interface Program {
  id: string
  name_en: string
  name_am: string
}

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const { t, isAm } = useLang()

  const [formData, setFormData] = useState({
    course_code: '',
    course_name_en: '',
    course_name_am: '',
    credit_hours: 3,
    program_id: '',
  })

  useEffect(() => {
    fetchCourses()
    fetchPrograms()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('*, programs(name_en, name_am)')
        .order('created_at', { ascending: false })

      if (data) setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const { data } = await supabase
        .from('programs')
        .select('id, name_en, name_am')
        .eq('is_active', true)

      if (data) setPrograms(data)
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCourse) {
        await supabase
          .from('courses')
          .update(formData)
          .eq('id', editingCourse.id)
      } else {
        await supabase
          .from('courses')
          .insert([formData])
      }

      setShowModal(false)
      setEditingCourse(null)
      setFormData({
        course_code: '',
        course_name_en: '',
        course_name_am: '',
        credit_hours: 3,
        program_id: '',
      })
      fetchCourses()
    } catch (error) {
      console.error('Failed to save course:', error)
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      course_code: course.course_code,
      course_name_en: course.course_name_en,
      course_name_am: course.course_name_am,
      credit_hours: course.credit_hours,
      program_id: course.program_id,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      await supabase.from('courses').delete().eq('id', id)
      fetchCourses()
    } catch (error) {
      console.error('Failed to delete course:', error)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('courses_management')}</h1>
          <p className="text-gray-600">{t('courses_desc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null)
            setFormData({
              course_code: '',
              course_name_en: '',
              course_name_am: '',
              credit_hours: 3,
              program_id: '',
            })
            setShowModal(true)
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={20} />
          {t('add_course')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('course_code')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('course_name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('program')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('credit_hours')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.course_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isAm ? course.course_name_am : course.course_name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isAm ? course.programs?.name_am : course.programs?.name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.credit_hours}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(course)} className="text-primary-600 hover:text-primary-700 mr-4">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-700">
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
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingCourse ? t('edit_course') : t('add_course')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('course_code')}</label>
                  <input
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_en')}</label>
                  <input
                    type="text"
                    value={formData.course_name_en}
                    onChange={(e) => setFormData({ ...formData, course_name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_am')}</label>
                  <input
                    type="text"
                    value={formData.course_name_am}
                    onChange={(e) => setFormData({ ...formData, course_name_am: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('program')}</label>
                  <select
                    value={formData.program_id}
                    onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">{t('select_program')}</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {isAm ? prog.name_am : prog.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('credit_hours')}</label>
                  <input
                    type="number"
                    value={formData.credit_hours}
                    onChange={(e) => setFormData({ ...formData, credit_hours: parseInt(e.target.value) })}
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
