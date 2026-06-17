import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Award } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Program {
  id: string
  code: string
  name_en: string
  name_am: string
  tvet_level: string
  duration_months: number
  total_credits: number
  description_en: string
  description_am: string
  entry_requirement_en: string
  entry_requirement_am: string
  career_prospects_en: string
  career_prospects_am: string
}

interface Course {
  id: string
  code: string
  name_en: string
  name_am: string
  credit_hours: number
  course_type: string
  semester: number
}

export function ProgramDetailPage() {
  const { code } = useParams<{ code: string }>()
  const [program, setProgram] = useState<Program | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { isAm } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch program
        const { data: programData } = await supabase
          .from('programs')
          .select('*')
          .eq('code', code)
          .single()

        if (programData) {
          setProgram(programData)

          // Fetch courses
          const { data: coursesData } = await supabase
            .from('courses')
            .select('*')
            .eq('program_id', programData.id)
            .order('semester')

          if (coursesData) setCourses(coursesData)
        }
      } catch (error) {
        console.error('Failed to fetch program details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (code) fetchData()
  }, [code])

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

  if (!program) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8">
        <button
          onClick={() => navigate('/academics')}
          className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Academics
        </button>
        <div className="text-center">
          <p className="text-gray-600 text-lg">Program not found</p>
        </div>
      </div>
    )
  }

  const groupedCourses = courses.reduce(
    (acc, course) => {
      const semester = course.semester || 1
      if (!acc[semester]) acc[semester] = []
      acc[semester].push(course)
      return acc
    },
    {} as Record<number, Course[]>
  )

  return (
    <div className="bg-white">
      {/* Back Button */}
      <div className="bg-gray-50 px-4 md:px-8 py-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/academics')}
            className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Academics
          </button>
        </div>
      </div>

      {/* Program Header */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-800 text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-2">
                Code: {program.code}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {isAm ? program.name_am : program.name_en}
              </h1>
            </div>
            <span className="bg-accent-400 text-gray-900 px-4 py-2 rounded-lg font-bold text-lg">
              Level {program.tvet_level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-blue-100">
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>{program.duration_months} months</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={20} />
              <span>{program.total_credits} Credits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {isAm ? program.description_am : program.description_en}
                </div>
              </div>

              {/* Entry Requirements */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Entry Requirements
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {isAm ? program.entry_requirement_am : program.entry_requirement_en}
                </div>
              </div>

              {/* Career Prospects */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Career Prospects
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {isAm ? program.career_prospects_am : program.career_prospects_en}
                </div>
              </div>

              {/* Curriculum */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Curriculum</h2>
                {Object.entries(groupedCourses)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([semester, semesterCourses]) => (
                    <div key={semester} className="mb-8">
                      <h3 className="text-lg font-semibold text-primary-600 mb-4">
                        Semester {semester}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-300">
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                Course Code
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                Course Name
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                Credits
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                Type
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {semesterCourses.map((course) => (
                              <tr
                                key={course.id}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <td className="py-3 px-4 font-semibold text-gray-700">
                                  {course.code}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {isAm ? course.name_am : course.name_en}
                                </td>
                                <td className="py-3 px-4 text-center text-gray-700">
                                  {course.credit_hours}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                    {course.course_type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-primary-50 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Program Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">TVET Level</p>
                    <p className="text-lg font-bold text-primary-600">
                      Level {program.tvet_level}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="text-lg font-bold text-gray-900">
                      {program.duration_months} Months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                    <p className="text-lg font-bold text-gray-900">
                      {program.total_credits}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                    <p className="text-lg font-bold text-gray-900">
                      {courses.length}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admissions')}
                  className="w-full mt-8 bg-accent-400 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
