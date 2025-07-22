import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CaseSchema } from '@/lib/validations/case'


export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = CaseSchema.parse(body)

    const created = await prisma.case.create({
      data: {
        title: 'Environmental, Health & Safety Issue',
        description: parsed.issue,
        category: 'ehs',
        contactName: parsed.name,
        contactEmail: parsed.email,
        source: 'WEB_FORM',
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    })

    return NextResponse.json({ success: true, case: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request', details: error }, { status: 400 })
  }
}
