import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

interface Settings {
  [key: string]: string
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { t } = useLang()

  const defaultSettings = {
    college_name_en: 'XYZ Polytechnic College',
    college_name_am: 'ኤክስዋይዜድ ቴክኒክ ኮሌጅ',
    phone: '+251 11 123 4567',
    email: 'info@xyzpolytechnic.edu.et',
    address_en: 'Addis Ababa, Ethiopia',
    address_am: 'አዲስ አበባ፣ ኢትዮጵያ',
    website: 'https://xyzpolytechnic.edu.et',
    facebook: '',
    twitter: '',
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*')

      if (data) {
        const settingsMap: Settings = {}
        data.forEach((item: any) => {
          settingsMap[item.setting_key] = item.setting_value
        })
        setSettings({ ...defaultSettings, ...settingsMap })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('settings')
          .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' })
      }
      alert(t('settings_saved'))
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('settings')}</h1>
          <p className="text-gray-600">{t('settings_desc')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? t('saving') : t('btn_save')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('general_settings')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('college_name_en')}
                </label>
                <input
                  type="text"
                  value={settings.college_name_en || ''}
                  onChange={(e) => handleChange('college_name_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('college_name_am')}
                </label>
                <input
                  type="text"
                  value={settings.college_name_am || ''}
                  onChange={(e) => handleChange('college_name_am', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contact_info')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                <input
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('address_info')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address_en')}</label>
                <input
                  type="text"
                  value={settings.address_en || ''}
                  onChange={(e) => handleChange('address_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address_am')}</label>
                <input
                  type="text"
                  value={settings.address_am || ''}
                  onChange={(e) => handleChange('address_am', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('social_media')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('website')}</label>
                <input
                  type="url"
                  value={settings.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input
                  type="url"
                  value={settings.facebook || ''}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
