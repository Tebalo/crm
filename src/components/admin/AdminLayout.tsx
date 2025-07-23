'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, FileText, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        if (userData.role === 'ADMIN' || userData.role === 'AUTHORITY_ADMIN') {
          setUser(userData)
        } else {
          setError('Access denied. Admin privileges required.')
        }
      } else {
        setError('Authentication required')
      }
    
    } catch (err) {
      setError('Failed to verify authentication')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {error || 'Access denied. Please login with admin privileges.'}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold">Financial Regulatory Portal</h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            <Button variant="ghost" className="flex items-center space-x-2 py-4">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-2 py-4">
              <Users className="h-4 w-4" />
              <span>Requirements</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-2 py-4">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-2 py-4">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}