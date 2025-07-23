import { z } from "zod"

export const personalizationSchema = z.object({
  // Business Profile
  businessType: z.string().min(1, "Business type is required"),
  serviceTypes: z.array(z.string()).min(1, "At least one service type is required"),
  organizationSize: z.enum(["startup", "small", "medium", "large", "enterprise"], {
    required_error: "Organization size is required",
  }),
  primaryRole: z.string().min(1, "Primary role is required"),
  
  // Regulatory Focus
  preferredAuthorities: z.array(z.string()).min(1, "At least one authority is required"),
  complianceAreas: z.array(z.string()).min(1, "At least one compliance area is required"),
  riskTolerance: z.enum(["low", "medium", "high"], {
    required_error: "Risk tolerance is required",
  }),
  
  // Experience & Goals
  experienceLevel: z.enum(["beginner", "intermediate", "expert"], {
    required_error: "Experience level is required",
  }),
  primaryGoals: z.array(z.string()).min(1, "At least one goal is required"),
  timeCommitment: z.enum(["minimal", "moderate", "extensive"], {
    required_error: "Time commitment is required",
  }),
  
  // Notification Preferences
  documentUpdates: z.boolean().default(true),
  regulatoryChanges: z.boolean().default(true),
  complianceReminders: z.boolean().default(true),
  weeklyDigest: z.boolean().default(false),
  urgentAlerts: z.boolean().default(true),
  
  // Communication Preferences
  preferredChannel: z.enum(["email", "sms", "both"], {
    required_error: "Preferred communication channel is required",
  }),
  frequency: z.enum(["immediate", "daily", "weekly"], {
    required_error: "Notification frequency is required",
  }),
  
  // Dashboard Preferences
  dashboardLayout: z.enum(["compact", "detailed", "custom"], {
    required_error: "Dashboard layout is required",
  }),
  widgetPreferences: z.array(z.string()).default([]),
  defaultView: z.enum(["overview", "documents", "checklist", "calendar"], {
    required_error: "Default view is required",
  }),
  
  // Content Preferences
  contentTypes: z.array(z.string()).default([]),
  complexityLevel: z.enum(["basic", "intermediate", "advanced"], {
    required_error: "Content complexity level is required",
  }),
  languagePreference: z.enum(["english", "setswana"], {
    required_error: "Language preference is required",
  }),
})

export type PersonalizationInput = z.infer<typeof personalizationSchema>