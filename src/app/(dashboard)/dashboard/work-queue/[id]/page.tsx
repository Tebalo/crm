// src/app/(dashboard)/dashboard/work-queue/[id]/page.tsx
import { notFound } from 'next/navigation'
import { mockCases } from '@/lib/mock-cases'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = {
  params: { id: string }
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = params // ✅ destructured after params is awaited internally
  const caseData = mockCases.find((c) => c.id === id)

  if (!caseData) notFound()

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-4">Case Details</h1>
      <div className="space-y-4 border p-6 rounded-lg shadow-sm bg-white">
        <div>
          <strong>Case ID:</strong> {caseData.id}
        </div>
        <div>
          <strong>Category:</strong> {caseData.category}
        </div>
        <div>
          <strong>Submitted By:</strong> {caseData.name}
        </div>
        <div>
          <strong>Status:</strong>{' '}
          <Badge variant="outline">{caseData.status}</Badge>
        </div>
        <div>
          <strong>Date:</strong> {caseData.date}
        </div>
        {/* Add actions */}
        <div className="flex gap-4 mt-6">
          <Button variant="outline">Assign</Button>
          <Button variant="destructive">Close Case</Button>
        </div>
      </div>
    </div>
  )
}
