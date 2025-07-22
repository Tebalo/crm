import { z } from "zod"
import { CaseStatus, Priority, CaseSource } from "@prisma/client"

// Auth Schemas
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

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

// Types
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
export type AddCaseActivityInput = z.infer<typeof addCaseActivitySchema>