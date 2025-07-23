import { z } from "zod"
import { CaseStatus, Priority, CaseSource } from "@prisma/client"

// // Auth Schemas
// export const signInSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(1, "Password is required"),
// })

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // role: z.nativeEnum(UserRole).default(UserRole.AGENT),
})

// User Schemas
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  // role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
})

// Case Schemas
export const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  category: z.string().optional(),
  source: z.nativeEnum(CaseSource).default(CaseSource.WEB_FORM),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  assignedToId: z.string().optional(),
})

export const updateCaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  category: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  assignedToId: z.string().optional(),
})

// Public feedback form schema
export const feedbackSchema = z.object({
  title: z.string().min(1, "Subject is required").max(255, "Subject too long"),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  contactName: z.string().min(1, "Name is required"),
  contactEmail: z.string().email("Valid email address is required"),
  contactPhone: z.string().optional(),
  category: z.string().optional(),
})

// Case Activity Schema
export const addCaseActivitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  isInternal: z.boolean().default(false),
})

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registrationStepOneSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number, and special character"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const registrationStepTwoSchema = z.object({
  // Personal/Organization Details
  accountType: z.enum(["individual", "organization"], {
    required_error: "Please select account type",
  }),
  
  // Personal Details (for individuals)
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
  identityNumber: z.string().optional(),
  passport: z.string().optional(),
  
  // Organization Details (for organizations)
  organizationName: z.string().optional(),
  registrationNumber: z.string().optional(),
  businessType: z.string().optional(),
  serviceTypes: z.array(z.string()).default([]),
  
  // Contact Information
  phoneNumber: z.string().optional(),
  telephone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Botswana"),
  
  // Social Media (optional)
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  
  // Preferences
  preferredAuthorities: z.array(z.string()).default([]),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  
  // Notifications
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  
  // Terms and Privacy
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy",
  }),
})

export type SignInInput = z.infer<typeof signInSchema>
export type RegistrationStepOneInput = z.infer<typeof registrationStepOneSchema>
export type RegistrationStepTwoInput = z.infer<typeof registrationStepTwoSchema>

// Types
// export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
export type AddCaseActivityInput = z.infer<typeof addCaseActivitySchema>