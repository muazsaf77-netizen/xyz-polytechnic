import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, User } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Student {
  id: string
  student_id: string
  full_name_en: string
  full_name_am: string
  email: string
  phone: string
  gender: string
  program_id: string
  enrollment_year: number
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

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const { t, isAm } = useLang()

  const [formData, setFormData] = useState({
    student_id: '',
    full_name_en: '',
    full_name_am: '',
    email: '',
    phone: '',
    gender: 'M',
    program_id: '',
    enrollment_year: new Date().getFullYear(),
  })

  useEffect(() => {
    fetchStudents()
    fetchPrograms()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data } = await supabase
        .from('students')
        .select('*, programs(name_en, name_am)')
        .order('created_at', { ascending: false })

      if (data) setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
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
      if (editingStudent) {
        await supabase.from('students').update(formData).eq('id', editingStudent.id)
      } else {
        await supabase.from('students').insert([formData])
      }

      setShowModal(false)
      setEditingStudent(null)
      resetForm()
      fetchStudents()
    } catch (error) {
      console.error('Failed to save student:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      student_id: '',
      full_name_en: '',
      full_name_am: '',
      email: '',
      phone: '',
      gender: 'M',
      program_id: '',
      enrollment_year: new Date().getFullYear(),
    })
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      student_id: student.student_id,
      full_name_en: student.full_name_en,
      full_name_am: student.full_name_am,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      program_id: student.program_id,
      enrollment_year: student.enrollment_year,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      await supabase.from('students').delete().eq('id', id)
      fetchStudents()
    } catch (error) {
      console.error('Failed to delete student:', error)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('students_management')}</h1>
          <p className="text-gray-600">{t('students_desc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null)
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={20} />
          {t('add_student')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('student_id')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('student_name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('program')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('enrollment_year')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.student_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isAm ? student.full_name_am : student.full_name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isAm ? student.programs?.name_am : student.programs?.name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.enrollment_year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(student)} className="text-primary-600 hover:text-primary-700 mr-4">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-700">
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
          <div className="bg-white rounded-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingStudent ? t('edit_student') : t('add_student')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('student_id')}</label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('gender')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="M">{t('male')}</option>
                    <option value="F">{t('female')}</option>
                  </select>
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
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isAm ? p.name_am : p.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('enrollment_year')}</label>
                  <input
                    type="number"
                    value={formData.enrollment_year}
                    onChange={(e) => setFormData({ ...formData, enrollment_year: parseInt(e.target.value) })}
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
