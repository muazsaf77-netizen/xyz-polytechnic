import { useState, useEffect } from 'react'
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Program {
  id: string
  code: string
  name_en: string
  name_am: string
}

export function AdmissionsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [referenceNo, setReferenceNo] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    applicant_name_en: '',
    applicant_name_am: '',
    email: '',
    phone: '',
    gender: 'M',
    date_of_birth: '',
    program_id: '',
    preferred_level: '',
    education_level: '',
  })
  const { t, isAm } = useLang()

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data } = await supabase
          .from('programs')
          .select('id, code, name_en, name_am')
          .eq('is_active', true)
          .order('name_en')

        if (data) setPrograms(data)
      } catch (error) {
        console.error('Failed to fetch programs:', error)
      }
    }

    fetchPrograms()
  }, [])

  const generateReferenceNo = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
    return `XYZ-${year}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (
        !formData.applicant_name_en ||
        !formData.email ||
        !formData.phone ||
        !formData.date_of_birth ||
        !formData.program_id
      ) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const refNo = generateReferenceNo()

      const { error: submitError } = await supabase
        .from('admissions')
        .insert([
          {
            reference_no: refNo,
            applicant_name_en: formData.applicant_name_en,
            applicant_name_am: formData.applicant_name_am,
            gender: formData.gender,
            date_of_birth: formData.date_of_birth,
            email: formData.email,
            phone: formData.phone,
            program_id: formData.program_id,
            preferred_level: formData.preferred_level,
            education_level: formData.education_level,
            status: 'pending',
          },
        ])

      if (submitError) throw submitError

      setReferenceNo(refNo)
      setSubmitted(true)
      setFormData({
        applicant_name_en: '',
        applicant_name_am: '',
        email: '',
        phone: '',
        gender: 'M',
        date_of_birth: '',
        program_id: '',
        preferred_level: '',
        education_level: '',
      })
    } catch (err) {
      console.error('Submission failed:', err)
      setError('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (submitted) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4 md:px-8">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('application_success')}
          </h1>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <p className="text-gray-600 mb-2 text-sm">{t('reference_number')}</p>
            <p className="text-2xl font-bold text-green-600 font-mono">
              {referenceNo}
            </p>
          </div>
          <p className="text-gray-600 mb-6">
            Please save this reference number. You can use it to track your application status.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors w-full"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-800 text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('nav_admissions')}
          </h1>
          <p className="text-blue-100">
            {t('admissions_title')}
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {t('application_form')}
            </h2>

            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('full_name')} *
                  </label>
                  <input
                    type="text"
                    name="applicant_name_en"
                    value={formData.applicant_name_en}
                    onChange={handleChange}
                    placeholder="Enter full name (English)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('full_name_am')}
                  </label>
                  <input
                    type="text"
                    name="applicant_name_am"
                    value={formData.applicant_name_am}
                    onChange={handleChange}
                    placeholder="ሙሉ ስም (አማርኛ)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+251 xxx xxx xxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('gender')}
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="M">{t('male')}</option>
                  <option value="F">{t('female')}</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('date_of_birth')} *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              {/* Program Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('select_program')} *
                </label>
                <select
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                >
                  <option value="">-- {t('select_program')} --</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {isAm ? program.name_am : program.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('preferred_level')}
                </label>
                <select
                  name="preferred_level"
                  value={formData.preferred_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">-- Select Level --</option>
                  {['I', 'II', 'III', 'IV', 'V'].map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('education_level')}
                </label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">-- Select Education Level --</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor">Bachelor</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                {loading ? 'Submitting...' : t('submit_application')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
