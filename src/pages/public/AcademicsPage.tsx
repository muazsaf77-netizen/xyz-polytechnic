import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
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
}

type Level = 'All' | 'I' | 'II' | 'III' | 'IV' | 'V'

export function AcademicsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [selectedLevel, setSelectedLevel] = useState<Level>('All')
  const [loading, setLoading] = useState(true)
  const { t, isAm } = useLang()
  const navigate = useNavigate()

  const levels: Level[] = ['All', 'I', 'II', 'III', 'IV', 'V']

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data } = await supabase
          .from('programs')
          .select('id, code, name_en, name_am, tvet_level, duration_months, total_credits')
          .eq('is_active', true)
          .order('tvet_level')

        if (data) setPrograms(data)
      } catch (error) {
        console.error('Failed to fetch programs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  useEffect(() => {
    if (selectedLevel === 'All') {
      setFilteredPrograms(programs)
    } else {
      setFilteredPrograms(programs.filter((p) => p.tvet_level === selectedLevel))
    }
  }, [selectedLevel, programs])

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

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-800 text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('nav_academics')}
          </h1>
          <p className="text-blue-100">
            {t('programs_subtitle')}
          </p>
        </div>
      </section>

      {/* Level Filter */}
      <section className="py-8 px-4 md:px-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('level_filter')}
          </h3>
          <div className="flex flex-wrap gap-3">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  selectedLevel === level
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-600'
                }`}
              >
                {level === 'All' ? t('all_levels') : `Level ${level}`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col"
                >
                  <div className="bg-gradient-to-r from-primary-600 to-blue-800 h-40 flex items-end p-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {isAm ? program.name_am : program.name_en}
                      </h3>
                      <p className="text-blue-100 text-sm mt-1">
                        Code: {program.code}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Level {program.tvet_level}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-semibold text-gray-900">{program.duration_months}</p>
                          <p>{t('duration')}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{program.total_credits}</p>
                          <p>{t('credits')}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/academics/${program.code}`)}
                      className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-2 mt-4"
                    >
                      {t('read_more')}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
