import { useState, useEffect } from 'react'
import { Award, CheckCircle, XCircle } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface CocResult {
  id: string
  coc_type: string
  result: string
  exam_date: string
  certificate_no?: string
  courses: {
    course_name_en: string
    course_name_am: string
  }
}

export function StudentCocResults() {
  const [results, setResults] = useState<CocResult[]>([])
  const [loading, setLoading] = useState(true)
  const { t, isAm } = useLang()

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        if (!studentId) return

        const { data } = await supabase
          .from('coc_results')
          .select(`
            id,
            coc_type,
            result,
            exam_date,
            certificate_no,
            courses (
              course_name_en,
              course_name_am
            )
          `)
          .eq('student_id', studentId)
          .order('exam_date', { ascending: false })

        if (data) setResults(data)
      } catch (error) {
        console.error('Failed to fetch CoC results:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('my_coc')}</h1>
        <p className="text-gray-600">{t('coc_desc')}</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <Award className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">{t('no_coc')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((result) => {
            const isCompetent = result.result === 'Competent'
            return (
              <div key={result.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {isAm ? result.courses?.course_name_am : result.courses?.course_name_en}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {result.coc_type} - {new Date(result.exam_date).toLocaleDateString()}
                    </p>
                    {result.certificate_no && (
                      <p className="text-gray-500 text-sm mt-1">
                        {t('certificate_no')}: {result.certificate_no}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 ${isCompetent ? 'text-green-600' : 'text-red-600'}`}>
                    {isCompetent ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    <span className="font-semibold">{result.result}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
