import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminUser {
  id: string
  email: string
  name: string
}

interface StudentUser {
  id: string
  email: string
  studentId: string
  name: string
}

interface AuthContextType {
  isAdmin: boolean
  isStudent: boolean
  adminName: string | null
  studentName: string | null
  studentId: string | null
  adminLogin: (email: string, password: string) => Promise<void>
  adminLogout: () => Promise<void>
  studentLogin: (email: string, password: string) => Promise<void>
  studentLogout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const [adminName, setAdminName] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const adminStored = localStorage.getItem('adminUser')
          const studentStored = localStorage.getItem('studentUser')

          if (adminStored) {
            const admin = JSON.parse(adminStored) as AdminUser
            setIsAdmin(true)
            setAdminName(admin.name)
          }

          if (studentStored) {
            const student = JSON.parse(studentStored) as StudentUser
            setIsStudent(true)
            setStudentName(student.name)
            setStudentId(student.studentId)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const adminLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || email.split('@')[0],
        }
        localStorage.setItem('adminUser', JSON.stringify(adminUser))
        setIsAdmin(true)
        setAdminName(adminUser.name)
      }
    } catch (error) {
      console.error('Admin login failed:', error)
      throw error
    }
  }

    const adminLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('adminUser')
      setIsAdmin(false)
      setAdminName(null)
    } catch (error) {
      console.error('Admin logout failed:', error)
      throw error
    }
  }

  const studentLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const studentUser: StudentUser = {
          id: data.user.id,
          email: data.user.email || '',
          studentId: data.user.user_metadata?.studentId || data.user.id.substring(0, 8),
          name: data.user.user_metadata?.name || email.split('@')[0],
        }
        localStorage.setItem('studentUser', JSON.stringify(studentUser))
        localStorage.setItem('studentId', studentUser.studentId)
        setIsStudent(true)
        setStudentName(studentUser.name)
        setStudentId(studentUser.studentId)
      }
    } catch (error) {
      console.error('Student login failed:', error)
      throw error
    }
  }

  const studentLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('studentUser')
      localStorage.removeItem('studentId')
      setIsStudent(false)
      setStudentName(null)
      setStudentId(null)
    } catch (error) {
      console.error('Student logout failed:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    isAdmin,
    isStudent,
    adminName,
    studentName,
    studentId,
    adminLogin,
    adminLogout,
    studentLogin,
    studentLogout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
