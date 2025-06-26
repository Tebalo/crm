'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { mockCases } from '@/lib/mock-cases'

const categories = ['all', 'fuel', 'ehs', 'feedback']
const statuses = ['all', 'open', 'in review', 'closed']

export default function WorkQueuePage() {
  const [cases] = useState(mockCases)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const categoryMatch = selectedCategory === 'all' || c.category === selectedCategory
      const statusMatch = selectedStatus === 'all' || c.status === selectedStatus
      const searchMatch =
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase())

      return categoryMatch && statusMatch && searchMatch
    })
  }, [cases, selectedCategory, selectedStatus, searchTerm])

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CSR Work Queue</CardTitle>

          <div className="mt-4 flex flex-wrap gap-4 items-end">
            {/* Category Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
              <Select onValueChange={setSelectedCategory} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <Select onValueChange={setSelectedStatus} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Case</label>
              <Input
                placeholder="Search by Case ID or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
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
                {filteredCases.map((item) => (
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
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No cases match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  )
}
