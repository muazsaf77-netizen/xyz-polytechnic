import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, Mail, Globe } from 'lucide-react'
import { useLang } from '@/hooks/useLanguage'
import { supabase } from '@/lib/supabase'

export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const { t, language, setLanguage } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: phoneData } = await supabase
          .from('settings')
          .select('setting_value')
          .eq('setting_key', 'phone')
          .single()

        const { data: emailData } = await supabase
          .from('settings')
          .select('setting_value')
          .eq('setting_key', 'email')
          .single()

        if (phoneData) setPhone(phoneData.setting_value)
        if (emailData) setEmail(emailData.setting_value)
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const navLinks = [
    { label: t('nav_home'), path: '/' },
    { label: t('nav_about'), path: '/about' },
    { label: t('nav_academics'), path: '/academics' },
    { label: t('nav_admissions'), path: '/admissions' },
    { label: t('nav_news'), path: '/news' },
    { label: t('nav_industry'), path: '/industry' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-2 hover:opacity-80">
                <Phone size={16} />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:opacity-80">
                <Mail size={16} />
                <span>{email}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <Globe size={16} />
              <span>{language === 'en' ? 'ኦም' : 'EN'}</span>
            </button>
            <a href="/student/login" className="hover:opacity-80">
              {t('nav_student_login')}
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 font-bold text-xl text-primary-600 hover:opacity-80"
            >
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                XYZ
              </div>
              <span className="hidden sm:inline">XYZ Polytechnic</span>
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Apply Now CTA */}
              <button
                onClick={() => navigate('/admissions')}
                className="hidden sm:block bg-accent-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                {t('apply_now')}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path)
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left py-3 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate('/admissions')
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full mt-3 bg-accent-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                {t('apply_now')}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-lg font-bold mb-4">XYZ Polytechnic College</h3>
            <p className="text-gray-400 text-sm">
              Empowering the next generation of technical professionals through quality education and industry partnerships.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">{t('quick_links')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav_home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/academics')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav_academics')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admissions')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav_admissions')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/news')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav_news')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">{t('contact_us')}</h4>
            {phone && (
              <p className="text-sm text-gray-400 mb-2">
                <span className="block text-gray-300">Phone:</span>
                {phone}
              </p>
            )}
            {email && (
              <p className="text-sm text-gray-400">
                <span className="block text-gray-300">Email:</span>
                {email}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 XYZ Polytechnic College. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
