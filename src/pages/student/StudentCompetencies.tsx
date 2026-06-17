import { useState } from 'react'
import { Brain, CheckCircle } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'

export function StudentCompetencies() {
  const { t } = useLang()

  // Placeholder competencies data
  const competencies = [
    { id: 1, name: 'Introduction to Safety', status: 'Completed', module: 'Core' },
    { id: 2, name: 'Hand Tools Usage', status: 'Completed', module: 'Core' },
    { id: 3, name: 'Measurement Techniques', status: 'In Progress', module: 'Core' },
    { id: 4, name: 'Basic Electrical', status: 'Pending', module: 'Specialization' },
    { id: 5, name: 'Technical Drawing', status: 'Pending', module: 'Specialization' },
  ]

  const statusColors: Record<string, string> = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Pending': 'bg-gray-100 text-gray-800',
  }

  const completedCount = competencies.filter(c => c.status === 'Completed').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('competencies')}</h1>
        <p className="text-gray-600">{t('competencies_desc')}</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 p-4 rounded-lg">
              <Brain className="text-primary-600" size={32} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">{t('progress')}</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount} / {competencies.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">{t('completion')}</p>
            <p className="text-2xl font-bold text-green-600">
              {Math.round((completedCount / competencies.length) * 100)}%
            </p>
          </div>
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 rounded-full h-2 transition-all"
            style={{ width: `${(completedCount / competencies.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {competencies.map((comp) => (
          <div key={comp.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {comp.status === 'Completed' && (
                  <CheckCircle className="text-green-500" size={20} />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{comp.name}</h3>
                  <p className="text-gray-500 text-sm">{comp.module}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[comp.status]}`}>
                {comp.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
