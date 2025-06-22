'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const FeedbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  message: z.string().min(5, 'Feedback must be at least 5 characters'),
})

export default function FeedbackForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FeedbackSchema>>({
    resolver: zodResolver(FeedbackSchema),
  })

  const onSubmit = async (data: z.infer<typeof FeedbackSchema>) => {
    const res = await fetch('/api/surveys/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/thank-you')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <Input placeholder="Your Name" {...register('name')} />
      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}

      <Input placeholder="Your Email (optional)" type="email" {...register('email')} />
      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

      <Textarea placeholder="Your feedback or complaint..." rows={6} {...register('message')} />
      {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}

      <Button type="submit" disabled={isSubmitting}>Submit</Button>
    </form>
  )
}
