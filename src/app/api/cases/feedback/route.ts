import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const FeedbackSchema = z.object({
  name: z.string().min(1),
  email: z.string().optional(),
  message: z.string().min(5),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = FeedbackSchema.parse(body)

    const created = await prisma.feedback.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        message: parsed.message,
      },
    })

    return NextResponse.json({ success: true, feedback: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request', details: error }, { status: 400 })
  }
}
