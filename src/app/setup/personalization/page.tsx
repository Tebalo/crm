"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { 
  Building2,
  Shield,
  Target,
  Bell,
  Layout,
  FileText,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Star,
  Globe,
  Users,
  Clock,
  AlertTriangle,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { PersonalizationInput, personalizationSchema } from "@/lib/validations/personalization"

const PERSONALIZATION_STEPS = [
  { id: 1, title: "Business Profile", icon: Building2, description: "Tell us about your business" },
  { id: 2, title: "Regulatory Focus", icon: Shield, description: "Your compliance priorities" },
  { id: 3, title: "Experience & Goals", icon: Target, description: "Your expertise and objectives" },
  { id: 4, title: "Notifications", icon: Bell, description: "How you want to stay informed" },
  { id: 5, title: "Dashboard", icon: Layout, description: "Customize your workspace" },
  { id: 6, title: "Content", icon: FileText, description: "Preferred content settings" },
]

export default function PersonalizationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<PersonalizationInput>({
    resolver: zodResolver(personalizationSchema),
    defaultValues: {
      serviceTypes: [],
      preferredAuthorities: [],
      complianceAreas: [],
      primaryGoals: [],
      documentUpdates: true,
      regulatoryChanges: true,
      complianceReminders: true,
      weeklyDigest: false,
      urgentAlerts: true,
      widgetPreferences: [],
      contentTypes: [],
    }
  })

  const businessTypes = [
    { value: "banking", label: "Banking", icon: "🏦" },
    { value: "insurance", label: "Insurance", icon: "🛡️" },
    { value: "fintech", label: "FinTech", icon: "💳" },
    { value: "payments", label: "Payments", icon: "💰" },
    { value: "asset-management", label: "Asset Management", icon: "📈" },
    { value: "microfinance", label: "Microfinance", icon: "🏪" },
  ]

  const serviceTypes = [
    "Deposit-taking", "Lending", "Payment Processing", "Foreign Exchange",
    "Investment Advisory", "Insurance Underwriting", "Asset Custody", "Remittances",
    "Cryptocurrency", "Mobile Money", "Peer-to-peer Lending"
  ]

  const authorities = [
    { code: "BOB", name: "Bank of Botswana", icon: "🏛️" },
    { code: "NBFIRA", name: "NBFIRA", icon: "🏢" },
    { code: "FIA", name: "Financial Intelligence Agency", icon: "🔍" },
    { code: "PPADB", name: "PPADB", icon: "📋" },
  ]

  const complianceAreas = [
    "Anti-Money Laundering", "Know Your Customer", "Data Protection", "Consumer Protection",
    "Capital Requirements", "Risk Management", "Corporate Governance", "Market Conduct",
    "Cybersecurity", "Operational Resilience", "Climate Risk", "ESG Compliance"
  ]

  const primaryGoals = [
    "Ensure regulatory compliance", "Reduce compliance costs", "Improve risk management",
    "Stay updated on changes", "Streamline processes", "Train staff", "Prepare for audits",
    "Expand services", "Enter new markets", "Digital transformation"
  ]

  const widgets = [
    "Compliance Status", "Recent Updates", "Action Items", "Deadlines",
    "Document Library", "FAQ Quick Access", "Regulatory Calendar", "Risk Dashboard"
  ]

  const contentTypes = [
    "Regulatory Updates", "Best Practices", "Case Studies", "Templates",
    "Training Materials", "Industry News", "Expert Analysis", "Compliance Guides"
  ]

  const progress = (currentStep / PERSONALIZATION_STEPS.length) * 100

  const nextStep = () => {
    if (currentStep < PERSONALIZATION_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: PersonalizationInput) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log("=== PERSONALIZATION COMPLETED ===")
      console.log("Personalization Data:", JSON.stringify(data, null, 2))

      // Structure data for your database models
      const personalizationData = {
        userId: "current-user-id", // Replace with actual user ID
        businessProfile: {
          businessType: data.businessType,
          serviceTypes: data.serviceTypes,
          organizationSize: data.organizationSize,
          primaryRole: data.primaryRole,
        },
        regulatoryFocus: {
          preferredAuthorities: data.preferredAuthorities,
          complianceAreas: data.complianceAreas,
          riskTolerance: data.riskTolerance,
        },
        experience: {
          experienceLevel: data.experienceLevel,
          primaryGoals: data.primaryGoals,
          timeCommitment: data.timeCommitment,
        },
        preferences: {
          notifications: {
            documentUpdates: data.documentUpdates,
            regulatoryChanges: data.regulatoryChanges,
            complianceReminders: data.complianceReminders,
            weeklyDigest: data.weeklyDigest,
            urgentAlerts: data.urgentAlerts,
          },
          communication: {
            preferredChannel: data.preferredChannel,
            frequency: data.frequency,
          },
          dashboard: {
            layout: data.dashboardLayout,
            widgets: data.widgetPreferences,
            defaultView: data.defaultView,
          },
          content: {
            types: data.contentTypes,
            complexityLevel: data.complexityLevel,
            languagePreference: data.languagePreference,
          }
        },
        completedAt: new Date()
      }

      console.log("=== STRUCTURED DATA FOR DATABASE ===")
      console.log(JSON.stringify(personalizationData, null, 2))

      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/personalization', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(personalizationData)
      // })

      toast("Personalization Complete!", {
        description: "Your preferences have been saved. Welcome to your personalized portal!",
      })

      // Redirect to dashboard
      router.push("/dashboard")
      
    } catch (error) {
      console.error("Personalization error:", error)
      toast("Save Failed", {
        description: "Failed to save your preferences. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckboxChange = (field: keyof PersonalizationInput, value: string, checked: boolean) => {
    const currentValues = form.getValues(field) as string[]
    if (checked) {
      form.setValue(field, [...currentValues, value] as any)
    } else {
      form.setValue(field, currentValues.filter(v => v !== value) as any)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Business Profile
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Tell us about your business</h2>
              <p className="text-muted-foreground">
                This helps us tailor content and compliance requirements to your specific needs
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">What type of business are you? *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {businessTypes.map(type => (
                    <Card 
                      key={type.value}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        form.watch("businessType") === type.value && "ring-2 ring-primary"
                      )}
                      onClick={() => form.setValue("businessType", type.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium">{type.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {form.formState.errors.businessType && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.businessType.message}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Services you provide *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {serviceTypes.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={form.watch("serviceTypes").includes(service)}
                        onCheckedChange={(checked) => handleCheckboxChange("serviceTypes", service, !!checked)}
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.serviceTypes && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.serviceTypes.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationSize">Organization Size *</Label>
                  <Select onValueChange={(value) => form.setValue("organizationSize", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                      <SelectItem value="small">Small (11-50 employees)</SelectItem>
                      <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                      <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.organizationSize && (
                    <p className="text-sm text-destructive">{form.formState.errors.organizationSize.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="primaryRole">Your Primary Role *</Label>
                  <Select onValueChange={(value) => form.setValue("primaryRole", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceo">CEO/Managing Director</SelectItem>
                      <SelectItem value="compliance-officer">Compliance Officer</SelectItem>
                      <SelectItem value="risk-manager">Risk Manager</SelectItem>
                      <SelectItem value="legal-counsel">Legal Counsel</SelectItem>
                      <SelectItem value="operations-manager">Operations Manager</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.primaryRole && (
                    <p className="text-sm text-destructive">{form.formState.errors.primaryRole.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Regulatory Focus
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Your regulatory priorities</h2>
              <p className="text-muted-foreground">
                Help us understand which regulatory areas are most important to your business
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Which authorities do you work with? *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {authorities.map(authority => (
                    <Card 
                      key={authority.code}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        form.watch("preferredAuthorities").includes(authority.code) && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        const current = form.watch("preferredAuthorities")
                        if (current.includes(authority.code)) {
                          form.setValue("preferredAuthorities", current.filter(a => a !== authority.code))
                        } else {
                          form.setValue("preferredAuthorities", [...current, authority.code])
                        }
                      }}
                    >
                      <CardContent className="p-4 flex items-center space-x-3">
                        <div className="text-xl">{authority.icon}</div>
                        <div>
                          <div className="font-medium">{authority.name}</div>
                          <div className="text-sm text-muted-foreground">{authority.code}</div>
                        </div>
                        {form.watch("preferredAuthorities").includes(authority.code) && (
                          <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {form.formState.errors.preferredAuthorities && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.preferredAuthorities.message}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Key compliance areas *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {complianceAreas.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={form.watch("complianceAreas").includes(area)}
                        onCheckedChange={(checked) => handleCheckboxChange("complianceAreas", area, !!checked)}
                      />
                      <Label htmlFor={area} className="text-sm">{area}</Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.complianceAreas && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.complianceAreas.message}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Risk tolerance *</Label>
                <RadioGroup
                  value={form.watch("riskTolerance")}
                  onValueChange={(value) => form.setValue("riskTolerance", value as any)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="risk-low" />
                    <Label htmlFor="risk-low">Low - Highly conservative, prefer minimal risk</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="risk-medium" />
                    <Label htmlFor="risk-medium">Medium - Balanced approach to risk management</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="risk-high" />
                    <Label htmlFor="risk-high">High - Comfortable with higher risk for growth</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.riskTolerance && (
                  <p className="text-sm text-destructive">{form.formState.errors.riskTolerance.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3: // Experience & Goals
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Your experience and goals</h2>
              <p className="text-muted-foreground">
                Tell us about your expertise level and what you want to achieve
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Experience with financial regulations *</Label>
                <RadioGroup
                  value={form.watch("experienceLevel")}
                  onValueChange={(value) => form.setValue("experienceLevel", value as any)}
                  className="mt-3"
                >
                  <Card className={cn(form.watch("experienceLevel") === "beginner" && "ring-2 ring-primary")}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="beginner" id="exp-beginner" />
                        <div>
                          <Label htmlFor="exp-beginner" className="font-medium">Beginner</Label>
                          <p className="text-sm text-muted-foreground">New to financial regulations, need guidance on basics</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={cn(form.watch("experienceLevel") === "intermediate" && "ring-2 ring-primary")}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intermediate" id="exp-intermediate" />
                        <div>
                          <Label htmlFor="exp-intermediate" className="font-medium">Intermediate</Label>
                          <p className="text-sm text-muted-foreground">Some experience, familiar with basic requirements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={cn(form.watch("experienceLevel") === "expert" && "ring-2 ring-primary")}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expert" id="exp-expert" />
                        <div>
                          <Label htmlFor="exp-expert" className="font-medium">Expert</Label>
                          <p className="text-sm text-muted-foreground">Extensive experience, need advanced insights and updates</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </RadioGroup>
                {form.formState.errors.experienceLevel && (
                  <p className="text-sm text-destructive">{form.formState.errors.experienceLevel.message}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Primary goals (select all that apply) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {primaryGoals.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={form.watch("primaryGoals").includes(goal)}
                        onCheckedChange={(checked) => handleCheckboxChange("primaryGoals", goal, !!checked)}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.primaryGoals && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.primaryGoals.message}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Time commitment for compliance activities *</Label>
                <RadioGroup
                  value={form.watch("timeCommitment")}
                  onValueChange={(value) => form.setValue("timeCommitment", value as any)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="time-minimal" />
                    <Label htmlFor="time-minimal">Minimal - Quick updates and alerts only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="time-moderate" />
                    <Label htmlFor="time-moderate">Moderate - Regular review and planning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extensive" id="time-extensive" />
                    <Label htmlFor="time-extensive">Extensive - Deep dive into compliance management</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.timeCommitment && (
                  <p className="text-sm text-destructive">{form.formState.errors.timeCommitment.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4: // Notifications
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Stay informed</h2>
              <p className="text-muted-foreground">
                Configure how and when you want to receive updates
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Types</span>
                  </CardTitle>
                  <CardDescription>Choose what types of updates you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="documentUpdates" className="font-medium">Document Updates</Label>
                      <p className="text-sm text-muted-foreground">New documents and revisions</p>
                    </div>
                    <Checkbox
                      id="documentUpdates"
                      checked={form.watch("documentUpdates")}
                      onCheckedChange={(checked) => form.setValue("documentUpdates", !!checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="regulatoryChanges" className="font-medium">Regulatory Changes</Label>
                      <p className="text-sm text-muted-foreground">Important regulatory updates</p>
                    </div>
                    <Checkbox
                      id="regulatoryChanges"
                      checked={form.watch("regulatoryChanges")}
                      onCheckedChange={(checked) => form.setValue("regulatoryChanges", !!checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="complianceReminders" className="font-medium">Compliance Reminders</Label>
                      <p className="text-sm text-muted-foreground">Deadline and task reminders</p>
                    </div>
                    <Checkbox
                      id="complianceReminders"
                      checked={form.watch("complianceReminders")}
                      onCheckedChange={(checked) => form.setValue("complianceReminders", !!checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyDigest" className="font-medium">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Summary of weekly activities</p>
                    </div>
                    <Checkbox
                      id="weeklyDigest"
                      checked={form.watch("weeklyDigest")}
                      onCheckedChange={(checked) => form.setValue("weeklyDigest", !!checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="urgentAlerts" className="font-medium">Urgent Alerts</Label>
                      <p className="text-sm text-muted-foreground">Critical compliance issues</p>
                    </div>
                    <Checkbox
                      id="urgentAlerts"
                      checked={form.watch("urgentAlerts")}
                      onCheckedChange={(checked) => form.setValue("urgentAlerts", !!checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Channel *</CardTitle>
                    <CardDescription>How do you want to receive notifications?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={form.watch("preferredChannel")}
                      onValueChange={(value) => form.setValue("preferredChannel", value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="channel-email" />
                        <Label htmlFor="channel-email">Email only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="channel-sms" />
                        <Label htmlFor="channel-sms">SMS only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="channel-both" />
                        <Label htmlFor="channel-both">Both email and SMS</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.preferredChannel && (
                      <p className="text-sm text-destructive mt-2">{form.formState.errors.preferredChannel.message}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequency *</CardTitle>
                    <CardDescription>How often do you want to receive updates?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={form.watch("frequency")}
                      onValueChange={(value) => form.setValue("frequency", value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immediate" id="freq-immediate" />
                        <Label htmlFor="freq-immediate">Immediate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="freq-daily" />
                        <Label htmlFor="freq-daily">Daily digest</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="freq-weekly" />
                        <Label htmlFor="freq-weekly">Weekly digest</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.frequency && (
                      <p className="text-sm text-destructive mt-2">{form.formState.errors.frequency.message}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 5: // Dashboard
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Customize your workspace</h2>
              <p className="text-muted-foreground">
                Set up your dashboard to show the information that matters most to you
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Layout *</CardTitle>
                  <CardDescription>Choose how you want your dashboard to look</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.watch("dashboardLayout")}
                    onValueChange={(value) => form.setValue("dashboardLayout", value as any)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <Card className={cn(form.watch("dashboardLayout") === "compact" && "ring-2 ring-primary")}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="compact" id="layout-compact" />
                          <div>
                            <Label htmlFor="layout-compact" className="font-medium">Compact</Label>
                            <p className="text-sm text-muted-foreground">Dense layout with more information</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={cn(form.watch("dashboardLayout") === "detailed" && "ring-2 ring-primary")}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="detailed" id="layout-detailed" />
                          <div>
                            <Label htmlFor="layout-detailed" className="font-medium">Detailed</Label>
                            <p className="text-sm text-muted-foreground">Spacious layout with detailed views</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={cn(form.watch("dashboardLayout") === "custom" && "ring-2 ring-primary")}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="layout-custom" />
                          <div>
                            <Label htmlFor="layout-custom" className="font-medium">Custom</Label>
                            <p className="text-sm text-muted-foreground">Fully customizable layout</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                  {form.formState.errors.dashboardLayout && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.dashboardLayout.message}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Widgets</CardTitle>
                  <CardDescription>Select which widgets you want to see on your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {widgets.map(widget => (
                      <div key={widget} className="flex items-center space-x-2">
                        <Checkbox
                          id={widget}
                          checked={form.watch("widgetPreferences").includes(widget)}
                          onCheckedChange={(checked) => handleCheckboxChange("widgetPreferences", widget, !!checked)}
                        />
                        <Label htmlFor={widget} className="text-sm">{widget}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Default View *</CardTitle>
                  <CardDescription>Which page do you want to see when you first log in?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={(value) => form.setValue("defaultView", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview Dashboard</SelectItem>
                      <SelectItem value="documents">Document Library</SelectItem>
                      <SelectItem value="checklist">Compliance Checklist</SelectItem>
                      <SelectItem value="calendar">Regulatory Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.defaultView && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.defaultView.message}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 6: // Content
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Content preferences</h2>
              <p className="text-muted-foreground">
                Customize the type and complexity of content you receive
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Types</CardTitle>
                  <CardDescription>What types of content are you interested in?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {contentTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={form.watch("contentTypes").includes(type)}
                          onCheckedChange={(checked) => handleCheckboxChange("contentTypes", type, !!checked)}
                        />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Complexity Level *</CardTitle>
                    <CardDescription>What level of detail do you prefer?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={form.watch("complexityLevel")}
                      onValueChange={(value) => form.setValue("complexityLevel", value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="complexity-basic" />
                        <Label htmlFor="complexity-basic">Basic - Simple summaries and overviews</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intermediate" id="complexity-intermediate" />
                        <Label htmlFor="complexity-intermediate">Intermediate - Detailed explanations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="complexity-advanced" />
                        <Label htmlFor="complexity-advanced">Advanced - Technical and comprehensive</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.complexityLevel && (
                      <p className="text-sm text-destructive mt-2">{form.formState.errors.complexityLevel.message}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Language Preference *</CardTitle>
                    <CardDescription>Which language do you prefer?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={form.watch("languagePreference")}
                      onValueChange={(value) => form.setValue("languagePreference", value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="english" id="lang-english" />
                        <Label htmlFor="lang-english">English</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="setswana" id="lang-setswana" />
                        <Label htmlFor="lang-setswana">Setswana</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.languagePreference && (
                      <p className="text-sm text-destructive mt-2">{form.formState.errors.languagePreference.message}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)} {...props}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Personalize Your Experience</h1>
        <p className="text-muted-foreground text-lg">
          Help us customize the portal to meet your specific needs
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Step {currentStep} of {PERSONALIZATION_STEPS.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {PERSONALIZATION_STEPS.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center space-y-2 px-4 py-2 rounded-lg transition-colors min-w-[120px]",
                  isActive && "bg-primary/10 text-primary",
                  isCompleted && "bg-green-50 text-green-600",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  isActive && "border-primary bg-primary text-white",
                  isCompleted && "border-green-600 bg-green-600 text-white",
                  !isActive && !isCompleted && "border-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs opacity-75">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {currentStep === PERSONALIZATION_STEPS.length ? (
          <Button
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Setup</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={nextStep}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          You can change these preferences anytime in your account settings
        </p>
      </div>
    </div>
  )
}