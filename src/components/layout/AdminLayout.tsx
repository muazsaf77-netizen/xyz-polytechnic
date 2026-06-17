import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, Users, BookOpen, FileText, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLanguage'

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { adminLogout, adminName } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: t('admin_dashboard'), path: '/admin', icon: LayoutDashboard },
    { label: 'Programs', path: '/admin/programs', icon: BookOpen },
    { label: 'Admissions', path: '/admin/admissions', icon: Users },
    { label: 'News', path: '/admin/news', icon: MessageSquare },
    { label: 'Pages', path: '/admin/pages', icon: FileText },
  ]

  const handleLogout = async () => {
    try {
      await adminLogout()
      navigate('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-primary-600 text-white transition-transform duration-300`}
      >
        <div className="p-6 border-b border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">XYZ Admin</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-white"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-primary-100 text-sm">Welcome, {adminName || 'Admin'}</p>
        </div>

        <nav className="p-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path)
                      setIsSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-700 font-semibold'
                        : 'hover:bg-primary-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
          >
            <LogOut size={20} />
            <span>{t('btn_logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-700"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <div className="w-10 h-10 bg-primary-600 rounded-full"></div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
    </div>
  )
}
