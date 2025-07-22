import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export interface SessionData {
  sessionId: string
  userId: string
  expires: Date
  tokenHash: string
  ipAddress?: string
  userAgent?: string
  deviceInfo?: string
}

export interface DecodedTokenPayload {
  user_id: number
  exp: number
  roles: string[]
  profile: {
    username: string
    first_name: string
    last_name: string
    email: string
  }
}

class SessionService {
  // Create a new session after successful authentication
  async createSession(
    decodedPayload: DecodedTokenPayload,
    accessToken: string,
    refreshToken: string,
    clientInfo: {
      ipAddress?: string
      userAgent?: string
    }
  ) {
    const tokenHash = this.hashToken(accessToken)
    const sessionToken = crypto.randomUUID()
    const expires = new Date(decodedPayload.exp * 1000) // Convert Unix timestamp
    const { profile, roles } = decodedPayload
    const userName = `${profile.first_name} ${profile.last_name}`.trim()
    const userRole = this.mapRole(roles)
    
    // Create session without foreign key
    const session = await prisma.session.create({
      data: {
        sessionToken,
        externalUserId: decodedPayload.user_id.toString(),
        userEmail: profile.email,
        userName: userName || profile.username,
        userRole,
        expires,
        tokenHash,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceInfo: this.parseDeviceInfo(clientInfo.userAgent),
        isActive: true,
      }
    })

    // Create analytics record
    await prisma.sessionAnalytics.create({
      data: {
        externalUserId: decodedPayload.user_id.toString(),
        userEmail: profile.email,
        userName: userName || profile.username,
        userRole,
        sessionId: session.id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceType: this.getDeviceType(clientInfo.userAgent),
      }
    })

    return {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      user: {
        id: decodedPayload.user_id.toString(),
        email: profile.email,
        name: userName || profile.username,
        role: userRole,
      },
      expires: session.expires,
    }
  }

  // Validate session
  async validateSession(sessionToken: string, tokenHash?: string) {
    const session = await prisma.session.findUnique({
      where: { sessionToken }
    })

    if (!session || !session.isActive || session.expires < new Date()) {
      return null
    }

    // Optionally validate token hash
    if (tokenHash && session.tokenHash !== tokenHash) {
      return null
    }

    // Update last accessed time
    await prisma.session.update({
      where: { id: session.id },
      data: { lastAccessed: new Date() }
    })

    return {
      sessionId: session.id,
      user: {
        id: session.externalUserId,
        email: session.userEmail,
        name: session.userName,
        role: session.userRole,
      },
      expires: session.expires,
    }
  }

  // Revoke session(s)
  async revokeSession(sessionToken: string, revokedBy?: string, reason?: string) {
    await prisma.session.update({
      where: { sessionToken },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy,
        revokeReason: reason,
      }
    })

    // Update analytics with logout time
    const session = await prisma.session.findUnique({
      where: { sessionToken },
     // include: { sessionAnalytics: true }
    })

    if (session) {
      await prisma.sessionAnalytics.updateMany({
        where: { sessionId: session.id, logoutTime: null },
        data: {
          logoutTime: new Date(),
          duration: Math.floor((Date.now() - session.createdAt.getTime()) / 1000)
        }
      })
    }
  }

  // Revoke all sessions for a user
  async revokeAllUserSessions(externalUserId: string, revokedBy?: string, reason?: string) {
    const sessions = await prisma.session.findMany({
      where: { externalUserId, isActive: true }
    })

    await prisma.session.updateMany({
      where: { externalUserId, isActive: true },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy,
        revokeReason: reason,
      }
    })

    // Update analytics for all sessions
    for (const session of sessions) {
      await prisma.sessionAnalytics.updateMany({
        where: { sessionId: session.id, logoutTime: null },
        data: {
          logoutTime: new Date(),
          duration: Math.floor((Date.now() - session.createdAt.getTime()) / 1000)
        }
      })
    }
  }

  // Get active sessions for a user
  async getUserActiveSessions(externalUserId: string) {
    return prisma.session.findMany({
      where: {
        externalUserId,
        isActive: true,
        expires: { gt: new Date() }
      },
      orderBy: { lastAccessed: 'desc' }
    })
  }

  // Get session analytics
  async getSessionAnalytics(externalUserId?: string, days = 30) {
    const where = {
      loginTime: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      },
      ...(externalUserId && { externalUserId })
    }

    return prisma.sessionAnalytics.findMany({
      where,
      orderBy: { loginTime: 'desc' }
    })
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions() {
    const expiredSessions = await prisma.session.findMany({
      where: {
        OR: [
          { expires: { lt: new Date() } },
          { isActive: false }
        ]
      }
    })

    // Update analytics for expired sessions without logout time
    for (const session of expiredSessions) {
      await prisma.sessionAnalytics.updateMany({
        where: { sessionId: session.id, logoutTime: null },
        data: {
          logoutTime: session.revokedAt || session.expires,
          duration: Math.floor(((session.revokedAt || session.expires).getTime() - session.createdAt.getTime()) / 1000)
        }
      })
    }

    // Delete old sessions (keep for audit trail)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await prisma.session.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        isActive: false
      }
    })
  }

  // Private helper methods
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private mapRole(roles: string[]): string {
    if (roles.includes('admin')) return 'ADMIN'
    if (roles.includes('supervisor')) return 'SUPERVISOR'
    if (roles.includes('agent')) return 'AGENT'
    return 'VIEWER'
  }

  private parseDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown'
    
    if (userAgent.includes('Mobile')) return 'Mobile'
    if (userAgent.includes('Tablet')) return 'Tablet'
    if (userAgent.includes('Desktop')) return 'Desktop'
    
    return 'Unknown'
  }

  private getDeviceType(userAgent?: string): string {
    if (!userAgent) return 'Unknown'
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'Mobile'
    if (/Tablet|iPad/.test(userAgent)) return 'Tablet'
    
    return 'Desktop'
  }
}

export const sessionService = new SessionService()