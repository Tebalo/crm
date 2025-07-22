import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, $Enums } from '@prisma/client'
import { requireRole } from '@/lib/auth-middleware'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import type { AdminApiResponse, DocumentWithDetails } from '@/types/admin'

const prisma = new PrismaClient()

export async function GET(request: NextRequest): Promise<NextResponse<AdminApiResponse<DocumentWithDetails[]>>> {
  try {
    // Require admin role
    await requireRole(request, 'ADMIN')

    const documents = await prisma.document.findMany({
      include: {
        authority: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        requirements: {
          select: {
            id: true,
            title: true,
            mandatory: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: documents
    })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch documents'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AdminApiResponse>> {
  try {
    // Require admin role
    // await requireRole(request, 'ADMIN')

    const formData = await request.formData()
    
    // Extract form fields with proper type validation
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const typeValue = formData.get('type') as string
    const category = formData.get('category') as string
    const subcategory = formData.get('subcategory') as string | null
    const tags = JSON.parse(formData.get('tags') as string || '[]') as string[]
    const authorityId = formData.get('authorityId') as string
    const version = formData.get('version') as string
    const effectiveDate = formData.get('effectiveDate') 
      ? new Date(formData.get('effectiveDate') as string) 
      : null
    const expiryDate = formData.get('expiryDate') 
      ? new Date(formData.get('expiryDate') as string) 
      : null
    const file = formData.get('file') as File | null

    // Validate document type using Prisma enum
    const validDocumentTypes: $Enums.DocumentType[] = [
      'ACT', 'REGULATION', 'POLICY', 'GUIDELINE', 'DIRECTIVE', 'FORM', 'CIRCULAR', 'ANNOUNCEMENT'
    ]
    
    if (!validDocumentTypes.includes(typeValue as $Enums.DocumentType)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid document type',
        errors: [{ field: 'type', message: `Type must be one of: ${validDocumentTypes.join(', ')}` }]
      }, { status: 400 })
    }

    const documentType = typeValue as $Enums.DocumentType

    // Handle file upload
    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileSize: number | null = null

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      fileName = `${timestamp}_${sanitizedName}`
      
      // Save file (you might want to use a cloud storage service instead)
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      const filePath = join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)
      fileUrl = `/uploads/${fileName}`
      fileSize = file.size
    }

    // Create document with proper types
    const document = await prisma.document.create({
      data: {
        title,
        description,
        type: documentType,
        category,
        subcategory,
        tags,
        authorityId,
        version,
        effectiveDate,
        expiryDate,
        fileUrl,
        fileName,
        fileSize
      }
    })

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload document'
    }, { status: 500 })
  }
}