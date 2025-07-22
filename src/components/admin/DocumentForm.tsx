'use client'

import { useState, useRef } from 'react'
import { DocumentType } from '@prisma/client'
import { Upload, X, Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { 
  DocumentFormData, 
  AuthorityOption, 
  UploadProgress, 
  ValidationError,
  AdminApiResponse 
} from '@/types/admin'

interface DocumentFormProps {
  authorities: AuthorityOption[]
  initialData?: Partial<DocumentFormData>
  onSuccess: () => void
  onCancel: () => void
}

export function DocumentForm({ authorities, initialData, onSuccess, onCancel }: DocumentFormProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'POLICY',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    tags: initialData?.tags || [],
    authorityId: initialData?.authorityId || '',
    version: initialData?.version || '1.0',
    effectiveDate: initialData?.effectiveDate,
    expiryDate: initialData?.expiryDate,
    file: undefined
  })

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [newTag, setNewTag] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypes: DocumentType[] = [
    'ACT', 'REGULATION', 'POLICY', 'GUIDELINE', 'DIRECTIVE', 'FORM', 'CIRCULAR', 'ANNOUNCEMENT'
  ]

  const categories = [
    'licensing', 'compliance', 'policy', 'reporting', 'governance', 
    'supervision', 'enforcement', 'consumer-protection', 'anti-money-laundering'
  ]

  const handleInputChange = (field: keyof DocumentFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear specific field errors
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        setErrors([{ field: 'file', message: 'Only PDF, Word, and text files are allowed' }])
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors([{ field: 'file', message: 'File size must be less than 10MB' }])
        return
      }

      setFormData(prev => ({ ...prev, file }))
      setErrors(prev => prev.filter(error => error.field !== 'file'))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = []

    if (!formData.title.trim()) {
      newErrors.push({ field: 'title', message: 'Title is required' })
    }

    if (!formData.authorityId) {
      newErrors.push({ field: 'authorityId', message: 'Authority is required' })
    }

    if (!formData.category.trim()) {
      newErrors.push({ field: 'category', message: 'Category is required' })
    }

    if (!initialData && !formData.file) {
      newErrors.push({ field: 'file', message: 'File is required for new documents' })
    }

    if (formData.expiryDate && formData.effectiveDate && 
        formData.expiryDate <= formData.effectiveDate) {
      newErrors.push({ field: 'expiryDate', message: 'Expiry date must be after effective date' })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setUploadProgress({ isUploading: true, progress: 0, fileName: formData.file?.name })

    try {
      const submitFormData = new FormData()
      
      // Add all form fields
      submitFormData.append('title', formData.title)
      if (formData.description) submitFormData.append('description', formData.description)
      submitFormData.append('type', formData.type)
      submitFormData.append('category', formData.category)
      if (formData.subcategory) submitFormData.append('subcategory', formData.subcategory)
      submitFormData.append('tags', JSON.stringify(formData.tags))
      submitFormData.append('authorityId', formData.authorityId)
      submitFormData.append('version', formData.version)
      
      if (formData.effectiveDate) {
        submitFormData.append('effectiveDate', formData.effectiveDate.toISOString())
      }
      if (formData.expiryDate) {
        submitFormData.append('expiryDate', formData.expiryDate.toISOString())
      }
      
      if (formData.file) {
        submitFormData.append('file', formData.file)
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const response = await fetch('/api/admin/documents', {
        method: initialData ? 'PUT' : 'POST',
        body: submitFormData
      })

      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, progress: 100 }))

      const result: AdminApiResponse = await response.json()

      if (result.success) {
        setTimeout(() => {
          onSuccess()
        }, 500)
      } else {
        setErrors(result.errors || [{ field: 'general', message: result.message || 'Upload failed' }])
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setErrors([{ field: 'general', message: 'Upload failed. Please try again.' }])
    } finally {
      setTimeout(() => {
        setUploadProgress({ isUploading: false, progress: 0 })
      }, 1000)
    }
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Errors */}
      {errors.some(error => error.field === 'general') && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.find(error => error.field === 'general')?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploadProgress.isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading {uploadProgress.fileName}...</span>
                <span>{uploadProgress.progress}%</span>
              </div>
              <Progress value={uploadProgress.progress} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Document title, type, and categorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Document title"
                className={cn(getFieldError('title') && "border-red-500")}
              />
              {getFieldError('title') && (
                <p className="text-sm text-red-500">{getFieldError('title')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Document Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: DocumentType) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authority">Regulatory Authority *</Label>
              <Select
                value={formData.authorityId}
                onValueChange={(value) => handleInputChange('authorityId', value)}
              >
                <SelectTrigger className={cn(getFieldError('authorityId') && "border-red-500")}>
                  <SelectValue placeholder="Select authority" />
                </SelectTrigger>
                <SelectContent>
                  {authorities.map(authority => (
                    <SelectItem key={authority.id} value={authority.id}>
                      {authority.name} ({authority.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('authorityId') && (
                <p className="text-sm text-red-500">{getFieldError('authorityId')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categorization */}
        <Card>
          <CardHeader>
            <CardTitle>Categorization</CardTitle>
            <CardDescription>Category, subcategory, and tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={cn(getFieldError('category') && "border-red-500")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('category') && (
                <p className="text-sm text-red-500">{getFieldError('category')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="e.g., banking, insurance"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Effective Dates</CardTitle>
          <CardDescription>When the document becomes effective and expires</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Effective Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.effectiveDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.effectiveDate ? (
                    format(formData.effectiveDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={formData.effectiveDate}
                  onSelect={(date) => handleInputChange('effectiveDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expiryDate && "text-muted-foreground",
                    getFieldError('expiryDate') && "border-red-500"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.expiryDate ? (
                    format(formData.expiryDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={formData.expiryDate}
                  onSelect={(date) => handleInputChange('expiryDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {getFieldError('expiryDate') && (
              <p className="text-sm text-red-500">{getFieldError('expiryDate')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Document File</CardTitle>
          <CardDescription>
            {initialData ? 'Upload a new file to replace the existing one' : 'Upload the document file (PDF, Word, or Text)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                getFieldError('file') ? "border-red-300" : "border-gray-300 hover:border-gray-400"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              {formData.file ? (
                <div>
                  <p className="font-medium">{formData.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Click to upload a file</p>
                  <p className="text-sm text-gray-500">PDF, Word, or Text files up to 10MB</p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {getFieldError('file') && (
              <p className="text-sm text-red-500">{getFieldError('file')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={uploadProgress.isUploading}
          className="min-w-32"
        >
          {uploadProgress.isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {initialData ? 'Update Document' : 'Upload Document'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}