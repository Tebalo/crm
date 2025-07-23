'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, FileText, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DocumentForm } from './DocumentForm'
import { RequirementForm } from './RequirementForm'
import type { 
  DocumentWithDetails, 
  AuthorityOption, 
  AdminStats,
  AdminApiResponse 
} from '@/types/admin'

export default function AdminPanel() {
  const [documents, setDocuments] = useState<DocumentWithDetails[]>([])
  const [authorities, setAuthorities] = useState<AuthorityOption[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [showRequirementForm, setShowRequirementForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DocumentWithDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  const documentTypes = [
    'ACT', 'REGULATION', 'POLICY', 'GUIDELINE', 'DIRECTIVE', 'FORM', 'CIRCULAR', 'ANNOUNCEMENT'
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [documentsRes, authoritiesRes, statsRes] = await Promise.all([
        fetch('/api/admin/documents'),
        fetch('/api/admin/authorities'),
        fetch('/api/admin/stats')
      ])

      if (!documentsRes.ok || !authoritiesRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch admin data')
      }

      const documentsData: AdminApiResponse<DocumentWithDetails[]> = await documentsRes.json()
      const authoritiesData: AdminApiResponse<AuthorityOption[]> = await authoritiesRes.json()
      const statsData: AdminApiResponse<AdminStats> = await statsRes.json()

      if (documentsData.success && documentsData.data) {
        setDocuments(documentsData.data)
      }
      if (authoritiesData.success && authoritiesData.data) {
        setAuthorities(authoritiesData.data)
      }
      if (statsData.success && statsData.data) {
        setStats(statsData.data)
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE'
      })

      const result: AdminApiResponse = await response.json()

      if (result.success) {
        setDocuments(docs => docs.filter(doc => doc.id !== id))
        setError(null)
      } else {
        setError(result.message || 'Failed to delete document')
      }
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Failed to delete document')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesAuthority = selectedAuthority === 'all' || doc.authority.id === selectedAuthority
    const matchesType = selectedType === 'all' || doc.type === selectedType

    return matchesSearch && matchesAuthority && matchesType
  })

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ACT': 'bg-red-100 text-red-800',
      'REGULATION': 'bg-blue-100 text-blue-800',
      'POLICY': 'bg-green-100 text-green-800',
      'GUIDELINE': 'bg-yellow-100 text-yellow-800',
      'DIRECTIVE': 'bg-purple-100 text-purple-800',
      'FORM': 'bg-pink-100 text-pink-800',
      'CIRCULAR': 'bg-indigo-100 text-indigo-800',
      'ANNOUNCEMENT': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage regulatory documents and requirements</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showDocumentForm} onOpenChange={setShowDocumentForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
                <DialogDescription>
                  Upload a new regulatory document with requirements
                </DialogDescription>
              </DialogHeader>
              <DocumentForm
                authorities={authorities}
                onSuccess={() => {
                  setShowDocumentForm(false)
                  fetchData()
                }}
                onCancel={() => setShowDocumentForm(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showRequirementForm} onOpenChange={setShowRequirementForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Compliance Requirement</DialogTitle>
                <DialogDescription>
                  Create a new compliance requirement for existing documents
                </DialogDescription>
              </DialogHeader>
              <RequirementForm
                documents={documents}
                onSuccess={() => {
                  setShowRequirementForm(false)
                  fetchData()
                }}
                onCancel={() => setShowRequirementForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requirements</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequirements}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentUploads}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authorities</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{authorities.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>Search and filter regulatory documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Authorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authorities</SelectItem>
                    {authorities.map(auth => (
                      <SelectItem key={auth.id} value={auth.id}>
                        {auth.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Authority</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          {doc.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {doc.description}
                            </div>
                          )}
                          {doc.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {doc.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {doc.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{doc.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDocumentTypeColor(doc.type)}>
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{doc.authority.name}</div>
                          <div className="text-gray-500">{doc.authority.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{doc.category}</div>
                          {doc.subcategory && (
                            <div className="text-gray-500">{doc.subcategory}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doc.requirements.length} requirements
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingDocument(doc)
                              setShowDocumentForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents found</p>
                  <p className="text-sm text-gray-400">
                    {searchQuery || selectedAuthority !== 'all' || selectedType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Start by adding your first document'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements</CardTitle>
              <CardDescription>Manage business compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Requirements management interface would go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.documentsByType.map(item => (
                  <div key={item.type} className="flex justify-between items-center py-2">
                    <Badge className={getDocumentTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents by Authority</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.documentsByAuthority.map(item => (
                  <div key={item.authority} className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">{item.authority}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}