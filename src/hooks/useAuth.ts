import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'VIEWER'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionExpires: Date | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionExpires: null,
  })
  const router = useRouter()

  // Load auth state from sessionStorage
  const loadAuthState = useCallback(() => {
    try {
      const sessionToken = sessionStorage.getItem('session_token')
      const userDataStr = sessionStorage.getItem('user_data')
      
      if (sessionToken && userDataStr) {
        const userData = JSON.parse(userDataStr)
        const expires = new Date(userData.expires)
        
        // Check if session is expired
        if (expires > new Date()) {
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            sessionExpires: expires,
          })
          return true
        } else {
          // Session expired, clean up
          clearAuthState()
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      clearAuthState()
    }
    return false
  }, [])

  // Clear auth state
  const clearAuthState = useCallback(() => {
    sessionStorage.removeItem('session_token')
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    sessionStorage.removeItem('user_data')
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpires: null,
    })
  }, [])

  // Validate session with server
  const validateSession = useCallback(async () => {
    try {
      const sessionToken = sessionStorage.getItem('session_token')
      const accessToken = sessionStorage.getItem('access_token')
      
      if (!sessionToken) return false

      const response = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          tokenHash: accessToken ? createTokenHash(accessToken) : undefined,
        }),
      })

      if (response.ok) {
        const sessionData = await response.json()
        
        // Update user data
        const updatedUserData = {
          ...sessionData.user,
          expires: sessionData.expires,
        }
        
        sessionStorage.setItem('user_data', JSON.stringify(updatedUserData))
        
        setAuthState({
          user: sessionData.user,
          isAuthenticated: true,
          isLoading: false,
          sessionExpires: new Date(sessionData.expires),
        })
        
        return true
      } else {
        clearAuthState()
        return false
      }
    } catch (error) {
      console.error('Session validation error:', error)
      clearAuthState()
      return false
    }
  }, [clearAuthState])

  // Logout function
  const logout = useCallback(async (reason?: string) => {
    try {
      const sessionToken = sessionStorage.getItem('session_token')
      
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken, reason }),
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthState()
      router.push('/login')
    }
  }, [clearAuthState, router])

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = sessionStorage.getItem('refresh_token')
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update tokens
        sessionStorage.setItem('access_token', data.access)
        sessionStorage.setItem('refresh_token', data.refresh)
        
        // Update user data with new expiry
        const updatedUserData = {
          ...authState.user,
          expires: new Date(data.decoded.exp * 1000),
        }
        
        sessionStorage.setItem('user_data', JSON.stringify(updatedUserData))
        
        setAuthState(prev => ({
          ...prev,
          sessionExpires: new Date(data.decoded.exp * 1000),
        }))
        
        return true
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout('Token refresh failed')
      return false
    }
  }, [authState.user, logout])

  // Check if token needs refresh (15 minutes before expiry)
  const checkTokenExpiry = useCallback(() => {
    if (authState.sessionExpires) {
      const now = new Date()
      const expiryTime = new Date(authState.sessionExpires)
      const timeUntilExpiry = expiryTime.getTime() - now.getTime()
      const fifteenMinutes = 15 * 60 * 1000

      if (timeUntilExpiry < fifteenMinutes && timeUntilExpiry > 0) {
        refreshToken()
      } else if (timeUntilExpiry <= 0) {
        logout('Session expired')
      }
    }
  }, [authState.sessionExpires, refreshToken, logout])

  // Initialize auth state on mount
  useEffect(() => {
    loadAuthState()
  }, [loadAuthState])

  // Set up periodic session validation (every 30 minutes)
  useEffect(() => {
    if (authState.isAuthenticated) {
      const interval = setInterval(() => {
        validateSession()
        checkTokenExpiry()
      }, 30 * 60 * 1000) // 30 minutes

      return () => clearInterval(interval)
    }
  }, [authState.isAuthenticated, validateSession, checkTokenExpiry])

  // Get authorization header for API calls
  const getAuthHeader = useCallback(() => {
    const accessToken = sessionStorage.getItem('access_token')
    const sessionToken = sessionStorage.getItem('session_token')
    
    return {
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      'X-Session-Token': sessionToken || '',
    }
  }, [])

  // Check if user has specific role
  const hasRole = useCallback((role: string | string[]) => {
    if (!authState.user) return false
    
    if (Array.isArray(role)) {
      return role.includes(authState.user.role)
    }
    
    return authState.user.role === role
  }, [authState.user])

  // Force session validation
  const forceValidateSession = useCallback(() => {
    return validateSession()
  }, [validateSession])

  return {
    ...authState,
    logout,
    refreshToken,
    validateSession: forceValidateSession,
    getAuthHeader,
    hasRole,
    clearAuthState,
  }
}

// Helper function to create token hash (simple version)
function createTokenHash(token: string): string {
  // In a real implementation, you'd want to use a proper hashing library
  // This is a simple hash for demonstration
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}