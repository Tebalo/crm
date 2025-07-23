import { PrismaClient, DocumentType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create Regulatory Authorities
  const bob = await prisma.regulatoryAuthority.upsert({
    where: { code: 'BOB' },
    update: {},
    create: {
      name: 'Bank of Botswana',
      code: 'BOB',
      description: 'Central bank of Botswana responsible for monetary policy, banking supervision, and financial system stability.',
      website: 'https://www.bankofbotswana.bw',
      contactInfo: {
        phone: '+267 360 6000',
        email: 'info@bob.bw',
        address: 'Private Bag 154, Gaborone, Botswana',
        officeHours: 'Monday-Friday 8:00-17:00',
        fax: '+267 390 2432'
      }
    }
  })

  const nbfira = await prisma.regulatoryAuthority.upsert({
    where: { code: 'NBFIRA' },
    update: {},
    create: {
      name: 'Non-Bank Financial Institutions Regulatory Authority',
      code: 'NBFIRA',
      description: 'Regulates and supervises non-bank financial institutions including insurance companies, pension funds, and capital markets.',
      website: 'https://www.nbfira.org.bw',
      contactInfo: {
        phone: '+267 318 1380',
        email: 'info@nbfira.org.bw',
        address: 'Plot 74654, Prime Plaza Extension 9, Gaborone',
        officeHours: 'Monday-Friday 8:00-17:00',
        emergencyContact: '+267 318 1390'
      }
    }
  })

  const fia = await prisma.regulatoryAuthority.upsert({
    where: { code: 'FIA' },
    update: {},
    create: {
      name: 'Financial Intelligence Agency',
      code: 'FIA',
      description: 'Responsible for combating money laundering, terrorist financing, and other financial crimes.',
      website: 'https://www.fia.gov.bw',
      contactInfo: {
        phone: '+267 318 0774',
        email: 'info@fia.gov.bw',
        address: 'Plot 2374, Extension 15, Gaborone',
        officeHours: 'Monday-Friday 8:00-16:30',
        emergencyContact: '+267 318 0775'
      }
    }
  })

  console.log('Regulatory authorities created')

  // Create sample documents
  const bankingAct = await prisma.document.create({
    data: {
      title: 'Banking Act 2020',
      description: 'The primary legislation governing banking operations in Botswana',
      type: DocumentType.ACT,
      category: 'banking',
      subcategory: 'primary-legislation',
      tags: ['banking', 'legislation', 'BOB', 'prudential'],
      authorityId: bob.id,
      version: '1.0',
      effectiveDate: new Date('2020-01-01'),
      expiryDate: null,
      fileUrl: '/documents/banking-act-2020.pdf',
      fileName: 'banking-act-2020.pdf',
      fileSize: 2048000,
      content: 'The Banking Act 2020 provides the legal framework for banking operations in Botswana...',
    }
  })

  const amlGuidelines = await prisma.document.create({
    data: {
      title: 'Anti-Money Laundering Guidelines 2023',
      description: 'Comprehensive guidelines for preventing money laundering and terrorist financing',
      type: DocumentType.GUIDELINE,
      category: 'aml-cft',
      subcategory: 'prevention',
      tags: ['AML', 'CTF', 'compliance', 'FIA', 'reporting'],
      authorityId: fia.id,
      version: '2.1',
      effectiveDate: new Date('2023-06-01'),
      expiryDate: new Date('2026-05-31'),
      fileUrl: '/documents/aml-guidelines-2023.pdf',
      fileName: 'aml-guidelines-2023.pdf',
      fileSize: 1536000,
      content: 'These guidelines outline the requirements for financial institutions to prevent money laundering...',
    }
  })

  const insuranceRegulations = await prisma.document.create({
    data: {
      title: 'Insurance Industry Regulations 2022',
      description: 'Regulations governing the insurance industry in Botswana',
      type: DocumentType.REGULATION,
      category: 'insurance',
      subcategory: 'industry-regulation',
      tags: ['insurance', 'regulation', 'NBFIRA', 'solvency'],
      authorityId: nbfira.id,
      version: '1.3',
      effectiveDate: new Date('2022-04-01'),
      expiryDate: null,
      fileUrl: '/documents/insurance-regulations-2022.pdf',
      fileName: 'insurance-regulations-2022.pdf',
      fileSize: 1792000,
      content: 'These regulations establish the framework for insurance operations in Botswana...',
    }
  })

  const capitalRequirementsDirective = await prisma.document.create({
    data: {
      title: 'Bank Capital Requirements Directive 2024',
      description: 'Updated capital adequacy requirements for banks',
      type: DocumentType.DIRECTIVE,
      category: 'prudential',
      subcategory: 'capital-adequacy',
      tags: ['capital', 'prudential', 'BOB', 'basel'],
      authorityId: bob.id,
      version: '1.0',
      effectiveDate: new Date('2024-01-01'),
      expiryDate: null,
      fileUrl: '/documents/capital-requirements-2024.pdf',
      fileName: 'capital-requirements-2024.pdf',
      fileSize: 896000,
      content: 'This directive outlines the minimum capital requirements for banking institutions...',
    }
  })

  console.log('Sample documents created')

  // Create compliance requirements
  const bankingLicenseReq = await prisma.complianceRequirement.create({
    data: {
      title: 'Banking License Application',
      description: 'Complete application process for obtaining a banking license in Botswana',
      mandatory: true,
      businessTypes: ['banking'],
      serviceTypes: ['deposit-taking', 'lending'],
      documentId: bankingAct.id,
      estimatedCost: 500000,
      estimatedTimeframe: '6-12 months',
      dependencies: ['Capital Requirements Compliance', 'Fit and Proper Assessment']
    }
  })

  const amlComplianceReq = await prisma.complianceRequirement.create({
    data: {
      title: 'AML/CFT Compliance Program',
      description: 'Establish comprehensive anti-money laundering and counter-terrorist financing program',
      mandatory: true,
      businessTypes: ['banking', 'insurance', 'fintech', 'payments'],
      serviceTypes: ['deposit-taking', 'lending', 'payment-processing', 'foreign-exchange', 'remittances'],
      documentId: amlGuidelines.id,
      estimatedCost: 150000,
      estimatedTimeframe: '3-6 months',
      dependencies: ['Customer Due Diligence Procedures', 'Suspicious Transaction Reporting System']
    }
  })

  const insuranceLicenseReq = await prisma.complianceRequirement.create({
    data: {
      title: 'Insurance License Application',
      description: 'Application process for insurance company license',
      mandatory: true,
      businessTypes: ['insurance'],
      serviceTypes: ['insurance-underwriting'],
      documentId: insuranceRegulations.id,
      estimatedCost: 250000,
      estimatedTimeframe: '4-8 months',
      dependencies: ['Solvency Requirements', 'Actuarial Valuation']
    }
  })

  const capitalAdequacyReq = await prisma.complianceRequirement.create({
    data: {
      title: 'Capital Adequacy Compliance',
      description: 'Maintain minimum capital adequacy ratios as per regulatory requirements',
      mandatory: true,
      businessTypes: ['banking'],
      serviceTypes: ['deposit-taking', 'lending'],
      documentId: capitalRequirementsDirective.id,
      estimatedCost: 75000,
      estimatedTimeframe: '2-3 months',
      dependencies: ['Risk Management Framework', 'Internal Capital Assessment']
    }
  })

  console.log('Compliance requirements created')

  // Create FAQs
  const bankingFAQ1 = await prisma.fAQ.create({
    data: {
      question: 'What are the minimum capital requirements for starting a bank in Botswana?',
      answer: 'The minimum paid-up capital for a commercial bank in Botswana is P100 million. This requirement ensures that banks have adequate capital to support their operations and protect depositors.',
      category: 'banking',
      tags: ['capital', 'banking-license', 'requirements'],
      authorityId: bob.id,
      //priority: 'HIGH',
      //isPublished: true
    }
  })

  const amlFAQ1 = await prisma.fAQ.create({
    data: {
      question: 'How often should suspicious transaction reports be filed?',
      answer: 'Suspicious transaction reports should be filed immediately upon detection, but no later than 3 business days after the suspicion arises. Financial institutions must maintain proper documentation and follow up procedures.',
      category: 'aml-cft',
      tags: ['STR', 'reporting', 'compliance'],
      authorityId: fia.id,
      // priority: 'HIGH',
      //isPublished: true
    }
  })

  const insuranceFAQ1 = await prisma.fAQ.create({
    data: {
      question: 'What is the solvency ratio requirement for insurance companies?',
      answer: 'Insurance companies must maintain a minimum solvency ratio of 150% at all times. This means that admissible assets must be at least 1.5 times the required solvency margin.',
      category: 'insurance',
      tags: ['solvency', 'capital', 'requirements'],
      authorityId: nbfira.id,
    }
  })

  const generalFAQ1 = await prisma.fAQ.create({
    data: {
      question: 'How can I access regulatory documents and updates?',
      answer: 'All regulatory documents are available through this portal. You can browse by authority, document type, or use the search function. Subscribe to notifications to receive updates when new documents are published.',
      category: 'general',
      tags: ['documents', 'access', 'portal'],
      authorityId: bob.id
    }
  })

  console.log('FAQs created')

  // Create sample user accounts
  const account1 = await prisma.account.create({
    data: {
      email: 'compliance.officer@standardbank.co.bw',
      name: 'Sarah Mokone',
      gender: 'female',
      nationality: 'Motswana',
      preferences: {
        create: {
          preferredAuthorities: ['BOB', 'FIA'],
          businessType: 'banking',
          experienceLevel: 'expert',
          notificationSettings: {
            email: true,
            sms: false,
            push: true
          },
          dashboardLayout: 'default'
        }
      },
      contact: {
        create: {
          phoneNumber: '+267 71234567',
          email: 'compliance.officer@standardbank.co.bw',
          city: 'Gaborone',
          country: 'Botswana',
          socialMedia: {
            linkedin: 'https://linkedin.com/in/sarah-mokone'
          }
        }
      }
    }
  })

  const account2 = await prisma.account.create({
    data: {
      email: 'risk.manager@botswanainsurance.co.bw',
      name: 'Thabo Kgosi',
      gender: 'male',
      nationality: 'Motswana',
      preferences: {
        create: {
          preferredAuthorities: ['NBFIRA'],
          businessType: 'insurance',
          experienceLevel: 'intermediate',
          notificationSettings: {
            email: true,
            sms: true,
            push: false
          },
          dashboardLayout: 'default'
        }
      },
      contact: {
        create: {
          phoneNumber: '+267 72345678',
          email: 'risk.manager@botswanainsurance.co.bw',
          city: 'Gaborone',
          country: 'Botswana',
          socialMedia: {}
        }
      }
    }
  })

  console.log('Sample accounts created')

  // Create sample subscriptions
  await prisma.subscription.create({
    data: {
      accountId: account1.id,
      type: 'DOCUMENT_UPDATES',
      categories: ['banking', 'aml-cft'],
      authorities: ['BOB', 'FIA'],
      frequency: 'immediate'
    }
  })

  await prisma.subscription.create({
    data: {
      accountId: account2.id,
      type: 'NEW_REGULATIONS',
      categories: ['insurance'],
      authorities: ['NBFIRA'],
      frequency: 'weekly'
    }
  })

  console.log('Subscriptions created')

  // Create sample downloads
  await prisma.download.create({
    data: {
      accountId: account1.id,
      documentId: bankingAct.id,
      downloadType: 'document'
    }
  })

  await prisma.download.create({
    data: {
      accountId: account1.id,
      documentId: amlGuidelines.id,
      downloadType: 'document'
    }
  })

  await prisma.download.create({
    data: {
      accountId: account2.id,
      documentId: insuranceRegulations.id,
      downloadType: 'document'
    }
  })

  console.log('Sample downloads created')

  // Create search history
  await prisma.searchHistory.create({
    data: {
      accountId: account1.id,
      query: 'banking capital requirements',
      filters: {
        authority: 'BOB',
        category: 'prudential'
      },
      resultCount: 5
    }
  })

  await prisma.searchHistory.create({
    data: {
      accountId: account2.id,
      query: 'insurance solvency',
      filters: {
        authority: 'NBFIRA',
        category: 'insurance'
      },
      resultCount: 3
    }
  })

  console.log('Search history created')

  console.log('✅ Seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log('- 3 Regulatory Authorities (BOB, NBFIRA, FIA)')
  console.log('- 4 Sample Documents (Acts, Guidelines, Regulations, Directives)')
  console.log('- 4 Compliance Requirements')
  console.log('- 4 FAQs')
  console.log('- 2 User Accounts with Preferences and Contacts')
  console.log('- 2 Subscriptions')
  console.log('- 3 Download Records')
  console.log('- 2 Search History Records')
  console.log('\n🔗 Test Data Ready!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })