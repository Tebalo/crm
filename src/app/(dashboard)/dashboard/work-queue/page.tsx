'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockCases } from '@/lib/mock-cases'

export default function WorkQueuePage() {
  const [cases] = useState(mockCases)

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CSR Work Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[70vh] overflow-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-2">Case ID</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Submitted</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-blue-700">{item.id}</td>
                    <td className="px-4 py-2 capitalize">{item.category}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">
                      <Badge variant={item.status === 'open' ? 'default' : 'outline'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{item.date}</td>
                    <td className="px-4 py-2 text-right">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  )
}
