// components/work-queue-table.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import Link from 'next/link'

type CaseItem = {
  id: string
  caseType: string
  status: string
  contactName: string
  createdAt: string
}

const sampleCases: CaseItem[] = [
  {
    id: 'cse_123456',
    caseType: 'Fuel',
    status: 'New',
    contactName: 'John Doe',
    createdAt: '2025-06-21',
  },
  {
    id: 'cse_789012',
    caseType: 'EHS',
    status: 'In Progress',
    contactName: 'Jane Smith',
    createdAt: '2025-06-20',
  },
  {
    id: 'cse_345678',
    caseType: 'General',
    status: 'Resolved',
    contactName: 'Alice M.',
    createdAt: '2025-06-19',
  },
]

export default function WorkQueueTable() {
  const [cases] = useState<CaseItem[]>(sampleCases)

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.id}</TableCell>
              <TableCell>{c.caseType}</TableCell>
              <TableCell>{c.status}</TableCell>
              <TableCell>{c.contactName}</TableCell>
              <TableCell>{c.createdAt}</TableCell>
              <TableCell className="text-right">
                <Link href={`/dashboard/work-queue/${c.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
