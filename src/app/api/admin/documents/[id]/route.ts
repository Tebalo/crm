import { requireRole } from '@/lib/auth-middleware';
import { AdminApiResponse } from '@/types/admin';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<AdminApiResponse>> {
  try {
    // Require admin role
    await requireRole(request, 'ADMIN')

    const { id } = params

    // Delete document and cascade to requirements
    await prisma.document.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete document'
    }, { status: 500 })
  }
}
