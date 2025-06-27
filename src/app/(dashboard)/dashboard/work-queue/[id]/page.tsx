// src/app/(dashboard)/dashboard/work-queue/[id]/page.tsx

import { notFound } from 'next/navigation'
import { mockCases } from '@/lib/mock-cases'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  params: { id: string }
}

export default function CaseDetailPage({ params }: Props) {
  const { id } = params
  const caseData = mockCases.find((c) => c.id === id)

  if (!caseData) notFound()

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Case Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-800">
          <div>
            <strong>Case ID:</strong> <span className="font-mono">{caseData.id}</span>
          </div>
          <div>
            <strong>Category:</strong> <span className="capitalize">{caseData.category}</span>
          </div>
          <div>
            <strong>Submitted By:</strong> {caseData.name}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <Badge variant={caseData.status === 'open' ? 'default' : 'outline'}>
              {caseData.status}
            </Badge>
          </div>
          <div>
            <strong>Submitted On:</strong> {caseData.date}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline">Assign</Button>
            <Button variant="destructive">Close Case</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
