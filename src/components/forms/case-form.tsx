'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const CaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  description: z.string().min(5, 'Issue description is too short'),
})

type Props = {
  caseType: 'fuel' | 'ehs'
}

export default function CaseForm({ caseType }: Props) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof CaseSchema>>({
    resolver: zodResolver(CaseSchema),
  })

  const onSubmit = async (data: z.infer<typeof CaseSchema>) => {
    const res = await fetch(`/api/cases/${caseType}`, {
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

      <Input placeholder="Your Email" type="email" {...register('email')} />
      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}

      <Textarea placeholder="Describe the issue..." rows={6} {...register('description')} />
      {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}

      <Button type="submit" disabled={isSubmitting}>Submit</Button>
    </form>
  )
}
