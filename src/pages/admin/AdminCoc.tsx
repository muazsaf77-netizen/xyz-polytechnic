import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Award } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface CocResult {
  id: string
  student_id: string
  course_id: string
  coc_type: string
  result: string
  exam_date: string
  certificate_no: string
  students?: {
    full_name_en: string
    full_name_am: string
  }
  courses?: {
    course_name_en: string
    course_name_am: string
  }
}

interface Student {
  id: string
  full_name_en: string
  full_name_am: string
}

interface Course {
  id: string
  course_name_en: string
  course_name_am: string
}

export function AdminCoc() {
  const [results, setResults] = useState<CocResult[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResult, setEditingResult] = useState<CocResult | null>(null)
  const { t, isAm } = useLang()

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    coc_type: 'Level I',
    result: 'Competent',
    exam_date: '',
    certificate_no: '',
  })

  useEffect(() => {
    fetchResults()
    fetchStudents()
    fetchCourses()
  }, [])

  const fetchResults = async () => {
    try {
      const { data } = await supabase
        .from('coc_results')
        .select('*, students(full_name_en, full_name_am), courses(course_name_en, course_name_am)')
        .order('exam_date', { ascending: false })

      if (data) setResults(data)
    } catch (error) {
      console.error('Failed to fetch CoC results:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const { data } = await supabase.from('students').select('id, full_name_en, full_name_am')
      if (data) setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const { data } = await supabase.from('courses').select('id, course_name_en, course_name_am')
      if (data) setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingResult) {
        await supabase.from('coc_results').update(formData).eq('id', editingResult.id)
      } else {
        await supabase.from('coc_results').insert([formData])
      }

      setShowModal(false)
      setEditingResult(null)
      resetForm()
      fetchResults()
    } catch (error) {
      console.error('Failed to save CoC result:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      student_id: '',
      course_id: '',
      coc_type: 'Level I',
      result: 'Competent',
      exam_date: '',
      certificate_no: '',
    })
  }

  const handleEdit = (result: CocResult) => {
    setEditingResult(result)
    setFormData({
      student_id: result.student_id,
      course_id: result.course_id,
      coc_type: result.coc_type,
      result: result.result,
      exam_date: result.exam_date,
      certificate_no: result.certificate_no || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      await supabase.from('coc_results').delete().eq('id', id)
      fetchResults()
    } catch (error) {
      console.error('Failed to delete CoC result:', error)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('coc_management')}</h1>
          <p className="text-gray-600">{t('coc_desc')}</p>
        </div>
        <button
          onClick={() => {
            setEditingResult(null)
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={20} />
          {t('add_coc')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('student')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('course')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('coc_type')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('result')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('exam_date')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {isAm ? result.students?.full_name_am : result.students?.full_name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isAm ? result.courses?.course_name_am : result.courses?.course_name_en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.coc_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${result.result === 'Competent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {result.result}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(result.exam_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(result)} className="text-primary-600 hover:text-primary-700 mr-4">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(result.id)} className="text-red-600 hover:text-red-700">
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
              {editingResult ? t('edit_coc') : t('add_coc')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('student')}</label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">{t('select_student')}</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {isAm ? s.full_name_am : s.full_name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('course')}</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">{t('select_course')}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAm ? c.course_name_am : c.course_name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('coc_type')}</label>
                  <select
                    value={formData.coc_type}
                    onChange={(e) => setFormData({ ...formData, coc_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {['Level I', 'Level II', 'Level III', 'Level IV', 'Level V'].map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('result')}</label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Competent">{t('competent')}</option>
                    <option value="Not Competent">{t('not_competent')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('exam_date')}</label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('certificate_no')}</label>
                  <input
                    type="text"
                    value={formData.certificate_no}
                    onChange={(e) => setFormData({ ...formData, certificate_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
