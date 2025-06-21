import { PrismaClient} from '@prisma/client'
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
      role: 'ADMIN',
    },
  })

  console.log('Admin created:', admin.email)

  // Create agent
  const agentPassword = await bcrypt.hash('agent123', 12)
  const agent = await prisma.user.upsert({
    where: { email: 'agent@botswanaoil.com' },
    update: {},
    create: {
      email: 'agent@botswanaoil.com',
      name: 'Test Agent',
      password: agentPassword,
      role: 'AGENT',
    },
  })

  console.log('Agent created:', agent.email)

  // Create a test case
  const testCase = await prisma.case.create({
    data: {
      caseNumber: 'BOL-TEST-001',
      title: 'Test Case',
      description: 'This is a test case for verification',
      status: 'OPEN',
      priority: 'MEDIUM',
      source: 'WEB_FORM',
      contactName: 'Test User',
      contactEmail: 'test@example.com',
      assignedToId: agent.id,
    },
  })

  console.log('Test case created:', testCase.caseNumber)
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })