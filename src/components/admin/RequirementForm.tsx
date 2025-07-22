'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  ComplianceRequirementFormData, 
  DocumentWithDetails, 
  ValidationError,
  AdminApiResponse,
  BusinessType,
  ServiceType 
} from '@/types/admin'

interface RequirementFormProps {
  documents: DocumentWithDetails[]
  initialData?: Partial<ComplianceRequirementFormData>
  onSuccess: () => void
  onCancel: () => void
}

export function RequirementForm({ documents, initialData, onSuccess, onCancel }: RequirementFormProps) {
  const [formData, setFormData] = useState<ComplianceRequirementFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    mandatory: initialData?.mandatory || true,
    businessTypes: initialData?.businessTypes || [],
    serviceTypes: initialData?.serviceTypes || [],
    documentId: initialData?.documentId || '',
    estimatedCost: initialData?.estimatedCost,
    estimatedTimeframe: initialData?.estimatedTimeframe || '',
    dependencies: initialData?.dependencies || []
  })

  const [errors, setErrors] = useState<ValidationError[]>([])
  const [loading, setLoading] = useState(false)
  const [newDependency, setNewDependency] = useState('')

  const businessTypes: BusinessType[] = [
    'banking', 'insurance', 'fintech', 'payments', 'asset-management', 'microfinance'
  ]

  const serviceTypes: ServiceType[] = [
    'deposit-taking', 'lending', 'payment-processing', 'foreign-exchange',
    'investment-advisory', 'insurance-underwriting', 'asset-custody', 'remittances',
    'cryptocurrency', 'mobile-money', 'peer-to-peer-lending'
  ]

  const timeframeOptions = [
    '1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3-6 months', '6+ months'
  ]

  const handleInputChange = (field: keyof ComplianceRequirementFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  const toggleBusinessType = (type: string) => {
    const currentTypes = formData.businessTypes
    if (currentTypes.includes(type)) {
      handleInputChange('businessTypes', currentTypes.filter(t => t !== type))
    } else {
      handleInputChange('businessTypes', [...currentTypes, type])
    }
  }

  const toggleServiceType = (type: string) => {
    const currentTypes = formData.serviceTypes
    if (currentTypes.includes(type)) {
      handleInputChange('serviceTypes', currentTypes.filter(t => t !== type))
    } else {
      handleInputChange('serviceTypes', [...currentTypes, type])
    }
  }

  const addDependency = () => {
    if (newDependency.trim() && !formData.dependencies.includes(newDependency.trim())) {
      handleInputChange('dependencies', [...formData.dependencies, newDependency.trim()])
      setNewDependency('')
    }
  }

  const removeDependency = (dependency: string) => {
    handleInputChange('dependencies', formData.dependencies.filter(d => d !== dependency))
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = []

    if (!formData.title.trim()) {
      newErrors.push({ field: 'title', message: 'Title is required' })
    }

    if (!formData.description.trim()) {
      newErrors.push({ field: 'description', message: 'Description is required' })
    }

    if (!formData.documentId) {
      newErrors.push({ field: 'documentId', message: 'Document is required' })
    }

    if (formData.businessTypes.length === 0) {
      newErrors.push({ field: 'businessTypes', message: 'At least one business type is required' })
    }

    if (formData.serviceTypes.length === 0) {
      newErrors.push({ field: 'serviceTypes', message: 'At least one service type is required' })
    }

    if (formData.estimatedCost && formData.estimatedCost < 0) {
      newErrors.push({ field: 'estimatedCost', message: 'Cost must be a positive number' })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/requirements', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result: AdminApiResponse = await response.json()

      if (result.success) {
        onSuccess()
      } else {
        setErrors(result.errors || [{ field: 'general', message: result.message || 'Failed to save requirement' }])
      }
    } catch (error) {
      console.error('Failed to save requirement:', error)
      setErrors([{ field: 'general', message: 'Failed to save requirement. Please try again.' }])
    } finally {
      setLoading(false)
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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Requirement Details</CardTitle>
          <CardDescription>Basic information about the compliance requirement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Requirement title"
              className={cn(getFieldError('title') && "border-red-500")}
            />
            {getFieldError('title') && (
              <p className="text-sm text-red-500">{getFieldError('title')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the requirement"
              rows={3}
              className={cn(getFieldError('description') && "border-red-500")}
            />
            {getFieldError('description') && (
              <p className="text-sm text-red-500">{getFieldError('description')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document">Related Document *</Label>
              <Select
                value={formData.documentId}
                onValueChange={(value) => handleInputChange('documentId', value)}
              >
                <SelectTrigger className={cn(getFieldError('documentId') && "border-red-500")}>
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title} ({doc.authority.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('documentId') && (
                <p className="text-sm text-red-500">{getFieldError('documentId')}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="mandatory"
                checked={formData.mandatory}
                onCheckedChange={(checked) => handleInputChange('mandatory', checked)}
              />
              <Label htmlFor="mandatory">Mandatory requirement</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicability */}
      <Card>
        <CardHeader>
          <CardTitle>Applicability</CardTitle>
          <CardDescription>Which business and service types this requirement applies to</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Types *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {businessTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`business-${type}`}
                    checked={formData.businessTypes.includes(type)}
                    onCheckedChange={() => toggleBusinessType(type)}
                  />
                  <Label htmlFor={`business-${type}`} className="text-sm capitalize">
                    {type.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError('businessTypes') && (
              <p className="text-sm text-red-500">{getFieldError('businessTypes')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Service Types *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {serviceTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${type}`}
                    checked={formData.serviceTypes.includes(type)}
                    onCheckedChange={() => toggleServiceType(type)}
                  />
                  <Label htmlFor={`service-${type}`} className="text-sm capitalize">
                    {type.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError('serviceTypes') && (
              <p className="text-sm text-red-500">{getFieldError('serviceTypes')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost and Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Cost & Timeline</CardTitle>
          <CardDescription>Estimated cost and timeframe for compliance</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Estimated Cost (BWP)</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.estimatedCost || ''}
              onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || undefined)}
              placeholder="0.00"
              className={cn(getFieldError('estimatedCost') && "border-red-500")}
            />
            {getFieldError('estimatedCost') && (
              <p className="text-sm text-red-500">{getFieldError('estimatedCost')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Estimated Timeframe</Label>
            <Select
              value={formData.estimatedTimeframe}
              onValueChange={(value) => handleInputChange('estimatedTimeframe', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle>Dependencies</CardTitle>
          <CardDescription>Other requirements that must be completed first</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newDependency}
              onChange={(e) => setNewDependency(e.target.value)}
              placeholder="Add dependency"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addDependency()
                }
              }}
            />
            <Button type="button" onClick={addDependency} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.dependencies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.dependencies.map(dependency => (
                <Badge key={dependency} variant="secondary" className="text-sm">
                  {dependency}
                  <button
                    type="button"
                    onClick={() => removeDependency(dependency)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            initialData ? 'Update Requirement' : 'Create Requirement'
          )}
        </Button>
      </div>
    </form>
  )
}
