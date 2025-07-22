// lib/auth-middleware.ts

import { NextRequest } from 'next/server'
import { sessionService } from './session-service'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthContext {
  isAuthenticated: boolean
  user?: AuthenticatedUser
  sessionId?: string
}

/**
 * Helper function to get authentication context from request
 * Works with your existing session service
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  try {
    const sessionToken = request.cookies.get('session-token')?.value
    
    if (!sessionToken) {
      return { isAuthenticated: false }
    }

    const session = await sessionService.validateSession(sessionToken)
    
    if (!session) {
      return { isAuthenticated: false }
    }

    return {
      isAuthenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? '',
        role: session.user.role
      },
      sessionId: session.sessionId
    }
  } catch (error) {
    console.error('Auth context validation failed:', error)
    return { isAuthenticated: false }
  }
}

/**
 * Helper function that requires authentication
 * Returns user or throws error
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const authContext = await getAuthContext(request)
  
  if (!authContext.isAuthenticated || !authContext.user) {
    throw new Error('Authentication required')
  }

  return authContext.user
}

/**
 * Helper function to check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRole: string): boolean {
  const roleHierarchy = {
    'VIEWER': 0,
    'AGENT': 1,
    'SUPERVISOR': 2,
    'ADMIN': 3
  }

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] ?? 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0

  return userLevel >= requiredLevel
}

/**
 * Helper function that requires specific role
 */
export async function requireRole(request: NextRequest, requiredRole: string): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (!hasRole(user, requiredRole)) {
    throw new Error(`Role '${requiredRole}' required`)
  }

  return user
}

/**
 * Helper to ensure user account exists in database
 * Creates account if it doesn't exist (for external auth users)
 */
export async function ensureAccountExists(user: AuthenticatedUser) {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()

  try {
    await prisma.account.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Failed to ensure account exists:', error)
    throw new Error('Failed to create user account')
  } finally {
    await prisma.$disconnect()
  }
}