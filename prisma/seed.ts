import { PrismaClient, UserRole, CaseStatus, Priority, CaseSource } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@botswanaoil.com' },
    update: {},
    create: {
      email: 'admin@botswanaoil.com',
      name: 'System Administrator',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create supervisor user
  const supervisorPassword = await bcrypt.hash('supervisor123', 12)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@botswanaoil.com' },
    update: {},
    create: {
      email: 'supervisor@botswanaoil.com',
      name: 'John Supervisor',
      password: supervisorPassword,
      role: UserRole.SUPERVISOR,
    },
  })

  // Create agent users
  const agentPassword = await bcrypt.hash('agent123', 12)
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@botswanaoil.com' },
    update: {},
    create: {
      email: 'agent1@botswanaoil.com',
      name: 'Alice Agent',
      password: agentPassword,
      role: UserRole.AGENT,
    },
  })

  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@botswanaoil.com' },
    update: {},
    create: {
      email: 'agent2@botswanaoil.com',
      name: 'Bob Agent',
      password: agentPassword,
      role: UserRole.AGENT,
    },
  })

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      title: 'Fuel Quality Complaint',
      description: 'Customer reports poor fuel quality at Gaborone Station. Vehicle experiencing engine problems after refueling.',
      status: CaseStatus.OPEN,
      priority: Priority.HIGH,
      category: 'Quality Control',
      source: CaseSource.WEB_FORM,
      contactName: 'Thabo Molefe',
      contactEmail: 'thabo.molefe@email.com',
      contactPhone: '+267 71234567',
      assignedToId: agent1.id,
    },
  })

  const case2 = await prisma.case.create({
    data: {
      title: 'Service Station Hours Inquiry',
      description: 'Customer wants to know about extended hours for the new Francistown location.',
      status: CaseStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      category: 'General Inquiry',
      source: CaseSource.EMAIL,
      contactName: 'Mpho Setlhare',
      contactEmail: 'mpho.setlhare@email.com',
      contactPhone: '+267 72345678',
      assignedToId: agent2.id,
    },
  })

  const case3 = await prisma.case.create({
    data: {
      title: 'Billing Discrepancy',
      description: 'Corporate customer reports incorrect charges on their monthly fuel bill. Amount seems higher than expected usage.',
      status: CaseStatus.RESOLVED,
      priority: Priority.HIGH,
      category: 'Billing',
      source: CaseSource.PHONE,
      contactName: 'Keabetswe Mogorosi',
      contactEmail: 'keabetswe@corporateclient.com',
      contactPhone: '+267 73456789',
      assignedToId: agent1.id,
      resolvedAt: new Date(),
    },
  })

  // Create case activities
  await prisma.caseActivity.createMany({
    data: [
      {
        caseId: case1.id,
        userId: agent1.id,
        type: 'CREATED',
        title: 'Case Created',
        content: 'New fuel quality complaint received from web form.',
      },
      {
        caseId: case1.id,
        userId: agent1.id,
        type: 'ASSIGNED',
        title: 'Case Assigned',
        content: 'Case assigned to Alice Agent for investigation.',
      },
      {
        caseId: case2.id,
        userId: agent2.id,
        type: 'CREATED',
        title: 'Case Created',
        content: 'Inquiry about service station hours received via email.',
      },
      {
        caseId: case2.id,
        userId: agent2.id,
        type: 'COMMENT',
        title: 'Information Gathered',
        content: 'Contacted Francistown location manager for current hours information.',
        isInternal: true,
      },
      {
        caseId: case3.id,
        userId: agent1.id,
        type: 'CREATED',
        title: 'Case Created',
        content: 'Billing discrepancy reported via phone call.',
      },
      {
        caseId: case3.id,
        userId: agent1.id,
        type: 'COMMENT',
        title: 'Investigation Complete',
        content: 'Found billing error in system. Corrected charges and issued credit.',
      },
      {
        caseId: case3.id,
        userId: agent1.id,
        type: 'RESOLVED',
        title: 'Case Resolved',
        content: 'Billing error corrected. Customer notified and credit applied.',
      },
    ],
  })

  console.log('Seeding finished.')
  console.log('Created users:')
  console.log('- Admin: admin@botswanaoil.com / admin123')
  console.log('- Supervisor: supervisor@botswanaoil.com / supervisor123')
  console.log('- Agent 1: agent1@botswanaoil.com / agent123')
  console.log('- Agent 2: agent2@botswanaoil.com / agent123')
  console.log('Created 3 sample cases with activities.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })