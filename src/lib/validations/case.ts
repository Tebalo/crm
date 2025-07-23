import { z } from 'zod'

export const CaseSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(val => val.trim()),

  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .toLowerCase()
    .transform(val => val.trim()),

  issue: z
    .string()
    .min(10, 'Issue description must be at least 10 characters long')
    .max(2000, 'Issue description must not exceed 2000 characters')
    .regex(/^(?!.*(?:viagra|casino|lottery|winner|claim now|click here|free money)).*$/i, 
           'Content appears to contain spam or inappropriate material')
    .transform(val => val.trim()),

  // Optional fields with validations
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .transform(val => val ? val.trim().replace(/\s+/g, '') : undefined),

  department: z
    .enum(['ehs', 'hr', 'facilities', 'security', 'other'], {
      errorMap: () => ({ message: 'Please select a valid department' })
    })
    .optional()
    .default('ehs'),

  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      errorMap: () => ({ message: 'Please select a valid priority level' })
    })
    .optional()
    .default('MEDIUM'),

  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(200, 'Location must not exceed 200 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),

  incidentDate: z
    .string()
    .datetime('Please provide a valid date and time')
    .or(z.date())
    .optional()
    .transform(val => {
      if (!val) return undefined
      const date = new Date(val)
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      
      if (date > now) {
        throw new z.ZodError([{
          code: 'custom',
          message: 'Incident date cannot be in the future',
          path: ['incidentDate']
        }])
      }
      
      if (date < oneYearAgo) {
        throw new z.ZodError([{
          code: 'custom',
          message: 'Incident date cannot be more than one year ago',
          path: ['incidentDate']
        }])
      }
      
      return date
    }),

  severity: z
    .enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'], {
      errorMap: () => ({ message: 'Please select a valid severity level' })
    })
    .optional(),

  witnesses: z
    .array(z.string().email('Each witness must have a valid email'))
    .max(10, 'Cannot have more than 10 witnesses')
    .optional(),

  attachments: z
    .array(z.object({
      filename: z.string().min(1, 'Filename is required'),
      size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
      type: z.string().regex(/^(image|application\/pdf|text)/, 'Only images, PDFs, and text files are allowed')
    }))
    .max(5, 'Cannot upload more than 5 files')
    .optional(),

  anonymous: z
    .boolean()
    .optional()
    .default(false),

  followUp: z
    .boolean()
    .optional()
    .default(true),

  // Honeypot field to catch bots
  website: z
    .string()
    .max(0, 'This field should be empty')
    .optional()
    .transform(val => val || undefined),

}).strict() // Reject any additional fields not defined in schema

// Additional refinements for cross-field validation
.refine(data => {
  // If anonymous is true, don't require name
  if (data.anonymous && !data.name) {
    return true
  }
  return data.name && data.name.length >= 2
}, {
  message: 'Name is required unless submitting anonymously',
  path: ['name']
})

.refine(data => {
  // If anonymous is true, email is optional
  if (data.anonymous) {
    return true
  }
  return data.email && data.email.length > 0
}, {
  message: 'Email is required unless submitting anonymously',
  path: ['email']
})

.refine(data => {
  // If followUp is true, email must be provided
  if (data.followUp && !data.anonymous) {
    return data.email && data.email.length > 0
  }
  return true
}, {
  message: 'Email is required if you want to receive follow-up communications',
  path: ['email']
})

.refine(data => {
  // Check for suspicious patterns across multiple fields
  const suspiciousContent = [data.name, data.issue, data.location]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  
  const spamPatterns = /(viagra|casino|lottery|winner|claim now|free money|click here)/gi
  const matches = suspiciousContent.match(spamPatterns)
  
  return !matches || matches.length < 3 // Allow 1-2 false positives
}, {
  message: 'Content appears to contain spam or inappropriate material',
  path: ['issue']
})

// Export the inferred type
export type CaseInput = z.infer<typeof CaseSchema>