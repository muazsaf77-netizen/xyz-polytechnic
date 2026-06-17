import { useState, useEffect } from 'react'
import { BookOpen, Clock } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Course {
  id: string
  course_code: string
  course_name_en: string
  course_name_am: string
  credit_hours: number
  programs: {
    name_en: string
    name_am: string
  }
}

export function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { t, isAm } = useLang()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        if (!studentId) return

        const { data } = await supabase
          .from('student_courses')
          .select(`
            courses (
              id,
              course_code,
              course_name_en,
              course_name_am,
              credit_hours,
              programs (
                name_en,
                name_am
              )
            )
          `)
          .eq('student_id', studentId)

        if (data) {
          setCourses(data.map((sc: any) => sc.courses))
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('my_courses')}</h1>
        <p className="text-gray-600">{t('courses_desc')}</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">{t('no_courses')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {isAm ? course.course_name_am : course.course_name_en}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {course.course_code} - {isAm ? course.programs?.name_am : course.programs?.name_en}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>{course.credit_hours} {t('credit_hours')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
