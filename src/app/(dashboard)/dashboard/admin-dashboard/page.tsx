/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Trash2, Shield, Clock, Users, Monitor, Smartphone, Tablet } from 'lucide-react'

interface SessionAnalytics {
  id: string
  userId: string
  sessionId: string
  loginTime: string
  logoutTime: string | null
  ipAddress: string | null
  userAgent: string | null
  location: string | null
  deviceType: string | null
  duration: number | null
  user: {
    email: string
    name: string | null
  }
}

export default function SessionManagementDashboard() {
  const [sessions, setSessions] = useState<SessionAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    days: '7',
    userId: '',
    deviceType: 'all'
  })
  const { getAuthHeader, hasRole } = useAuth()

  // Check if user has admin access
  // if (!hasRole(['ADMIN', 'SUPERVISOR'])) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-center">
  //         <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
  //         <h3 className="mt-2 text-sm font-semibold text-muted-foreground">Access Denied</h3>
  //         <p className="mt-1 text-sm text-muted-foreground">
  //           You don&apos;t have permission to view session analytics.
  //         </p>
  //       </div>
  //     </div>
  //   )
  // }

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        days: filter.days,
        ...(filter.userId && { userId: filter.userId })
      })

      const response = await fetch(`/api/auth/sessions?${params}`, {
        headers: getAuthHeader()
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      } else {
        toast("Error", {
          description: "Failed to load session data"
        })
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast("Error", {
        description: "Failed to load session data"
      })
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string, reason: string = 'Revoked by admin') => {
    try {
      const response = await fetch('/api/admin/sessions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          sessionToken: sessionId,
          revokedBy: 'admin',
          reason
        })
      })

      if (response.ok) {
        toast("Success", {
          description: "Session revoked successfully"
        })
        fetchSessions()
      } else {
        toast("Error", {
          description: "Failed to revoke session"
        })
      }
    } catch (error) {
      console.error('Error revoking session:', error)
      toast("Error", {
        description: "Failed to revoke session"
      })
    }
  }

  const revokeAllUserSessions = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/sessions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          userId,
          revokeAll: true,
          revokedBy: 'admin',
          reason: 'All sessions revoked by admin'
        })
      })

      if (response.ok) {
        toast("Success", {
          description: "All user sessions revoked successfully"
        })
        fetchSessions()
      } else {
        toast("Error", {
          description: "Failed to revoke all user sessions"
        })
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error)
      toast("Error", {
        description: "Failed to revoke all user sessions"
      })
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchSessions()
  }, [filter])

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Active'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getSessionStats = () => {
    const activeSessions = sessions.filter(s => !s.logoutTime).length
    const totalSessions = sessions.length
    const uniqueUsers = new Set(sessions.map(s => s.userId)).size
    const avgDuration = sessions
      .filter(s => s.duration)
      .reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.filter(s => s.duration).length

    return { activeSessions, totalSessions, uniqueUsers, avgDuration: Math.round(avgDuration / 60) }
  }

  const stats = getSessionStats()
  const filteredSessions = sessions.filter(session => {
    if (filter.deviceType !== 'all' && session.deviceType !== filter.deviceType) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6 p-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Management</h2>
          <p className="text-muted-foreground">Monitor and manage user sessions</p>
        </div>
        <Button onClick={fetchSessions} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}m</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={filter.days}
              onValueChange={(value) => setFilter(prev => ({ ...prev, days: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.deviceType}
              onValueChange={(value) => setFilter(prev => ({ ...prev, deviceType: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by user email..."
              value={filter.userId}
              onChange={(e) => setFilter(prev => ({ ...prev, userId: e.target.value }))}
              className="w-[250px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            {filteredSessions.length} sessions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8">No sessions found</div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.deviceType)}
                      <div>
                        <p className="font-medium">{session.user.name || session.user.email}</p>
                        <p className="text-sm text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Login: {new Date(session.loginTime).toLocaleString()}</p>
                      {session.logoutTime && (
                        <p>Logout: {new Date(session.logoutTime).toLocaleString()}</p>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>IP: {session.ipAddress || 'Unknown'}</p>
                      <p>Duration: {formatDuration(session.duration)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.logoutTime ? "secondary" : "default"}>
                      {session.logoutTime ? "Ended" : "Active"}
                    </Badge>
                    
                    {!session.logoutTime && hasRole('ADMIN') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(session.sessionId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}