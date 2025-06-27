'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

const TrackSchema = z.object({
  caseType: z.string().min(1, 'Select a case type'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  caseId: z.string().min(1, 'Case ID is required'),
})

export default function TrackCasePage() {
  const methods = useForm<z.infer<typeof TrackSchema>>({
    resolver: zodResolver(TrackSchema),
    defaultValues: {
      caseType: '',
      name: '',
      email: '',
      caseId: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof TrackSchema>) => {
    console.log('Tracking:', data)
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
        Track Your Case
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Enter the required information to find your case.
      </p>

      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={methods.control}
            name="caseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fuel">Fuel Supply & Distribution</SelectItem>
                    <SelectItem value="ehs">Environmental, Health & Safety</SelectItem>
                    <SelectItem value="other">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="caseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. cse_abc123xyz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? 'Searching...' : 'Track Case'}
          </Button>
        </Form>
      </FormProvider>
    </main>
  )
}
