// components/registration-form.tsx

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
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  registrationStepOneSchema, 
  registrationStepTwoSchema,
  type RegistrationStepOneInput,
  type RegistrationStepTwoInput 
} from "@/lib/validations/auth"
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Building,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"

// Registration API configuration
const REGISTER_API_URL = "http://74.208.205.44:8019/api/auth_microservice/register/"

interface RegistrationResponse {
  message: string
}

export function RegistrationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [stepOneData, setStepOneData] = useState<RegistrationStepOneInput | null>(null)
  const router = useRouter()

  // Step 1 Form
  const stepOneForm = useForm<RegistrationStepOneInput>({
    resolver: zodResolver(registrationStepOneSchema),
    defaultValues: {
      isStaff: false,
      isSuperuser: false,
    }
  })

  // Step 2 Form
  const stepTwoForm = useForm<RegistrationStepTwoInput>({
    resolver: zodResolver(registrationStepTwoSchema),
    defaultValues: {
      accountType: "individual",
      country: "Botswana",
      serviceTypes: [],
      preferredAuthorities: [],
      emailNotifications: true,
      smsNotifications: false,
      agreeToTerms: false,
      agreeToPrivacy: false,
    }
  })

  const accountType = stepTwoForm.watch("accountType")

  // Step 1 Submit
  const onStepOneSubmit = async (data: RegistrationStepOneInput) => {
    setStepOneData(data)
    setCurrentStep(2)
  }

  // Step 2 Submit (Final Registration)
  const onStepTwoSubmit = async (stepTwoData: RegistrationStepTwoInput) => {
    if (!stepOneData) {
      toast("Error", { description: "Missing registration data. Please start over." })
      setCurrentStep(1)
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Register with external service
      const registrationResponse = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: stepOneData.username,
          password: stepOneData.password,
          first_name: stepOneData.firstName,
          last_name: stepOneData.lastName,
          email: stepOneData.email,
          is_staff: stepOneData.isStaff,
          is_superuser: stepOneData.isSuperuser,
        }),
      })

      if (!registrationResponse.ok) {
        const errorData = await registrationResponse.json().catch(() => null)
        throw new Error(errorData?.message || "Registration failed")
      }

      const registrationResult: RegistrationResponse = await registrationResponse.json()

      // Step 2: Save additional profile data (console log for now)
      console.log("=== REGISTRATION SUCCESSFUL ===")
      console.log("External API Response:", registrationResult)
      console.log("Step 1 Data (Saved to External API):", stepOneData)
      console.log("Step 2 Data (Additional Profile - TO BE SAVED TO YOUR DB):", stepTwoData)
      
      // Prepare complete profile data for your database
      const completeProfileData = {
        // Basic user info (already saved externally)
        externalUserData: {
          username: stepOneData.username,
          email: stepOneData.email,
          firstName: stepOneData.firstName,
          lastName: stepOneData.lastName,
          isStaff: stepOneData.isStaff,
          isSuperuser: stepOneData.isSuperuser,
        },
        
        // Extended profile data for your Account model
        accountData: {
          accountType: stepTwoData.accountType,
          gender: stepTwoData.gender,
          birthDate: stepTwoData.birthDate ? new Date(stepTwoData.birthDate) : null,
          nationality: stepTwoData.nationality,
          identityNumber: stepTwoData.identityNumber,
          passport: stepTwoData.passport,
          organizationName: stepTwoData.organizationName,
          registrationNumber: stepTwoData.registrationNumber,
          businessType: stepTwoData.businessType,
          serviceTypes: stepTwoData.serviceTypes,
        },
        
        // Contact data for Contact model
        contactData: {
          phoneNumber: stepTwoData.phoneNumber,
          telephone: stepTwoData.telephone,
          address: stepTwoData.address,
          city: stepTwoData.city,
          postalCode: stepTwoData.postalCode,
          country: stepTwoData.country,
          email: stepOneData.email, // Reference email
          socialMedia: {
            facebook: stepTwoData.facebook || null,
            twitter: stepTwoData.twitter || null,
            linkedin: stepTwoData.linkedin || null,
          }
        },
        
        // Preferences data for UserPreferences model
        preferencesData: {
          preferredAuthorities: stepTwoData.preferredAuthorities,
          businessType: stepTwoData.businessType,
          experienceLevel: stepTwoData.experienceLevel,
          notificationSettings: {
            email: stepTwoData.emailNotifications,
            sms: stepTwoData.smsNotifications,
          }
        }
      }

      console.log("=== COMPLETE PROFILE DATA STRUCTURE ===")
      console.log(JSON.stringify(completeProfileData, null, 2))

      // TODO: When you have endpoints, replace console.log with:
      // const profileResponse = await fetch('/api/auth/complete-profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(completeProfileData)
      // })

      toast("Registration Successful!", {
        description: `Welcome ${stepOneData.firstName}! Please check your email to verify your account.`,
      })

      // Redirect to login page
      router.push("/setup/personalization")
      
    } catch (error) {
      console.error("Registration error:", error)
      toast("Registration Failed", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const goBackToStepOne = () => {
    setCurrentStep(1)
  }

  const businessTypes = [
    "banking", "insurance", "fintech", "payments", "asset-management", "microfinance"
  ]

  const serviceTypes = [
    "deposit-taking", "lending", "payment-processing", "foreign-exchange",
    "investment-advisory", "insurance-underwriting", "asset-custody", "remittances",
    "cryptocurrency", "mobile-money", "peer-to-peer-lending"
  ]

  const authorities = [
    { code: "BOB", name: "Bank of Botswana" },
    { code: "NBFIRA", name: "NBFIRA" },
    { code: "FIA", name: "Financial Intelligence Agency" },
  ]

  const countries = [
    "Botswana", "South Africa", "Namibia", "Zimbabwe", "Zambia", "Other"
  ]

  // STEP 1 RENDER
  if (currentStep === 1) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Step 1 of 2: Basic account information
          </p>
        </div>

        <form onSubmit={stepOneForm.handleSubmit(onStepOneSubmit)} className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              {...stepOneForm.register("username")}
              className={stepOneForm.formState.errors.username ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {stepOneForm.formState.errors.username && (
              <p className="text-sm text-destructive">{stepOneForm.formState.errors.username.message}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...stepOneForm.register("email")}
              className={stepOneForm.formState.errors.email ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {stepOneForm.formState.errors.email && (
              <p className="text-sm text-destructive">{stepOneForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                {...stepOneForm.register("firstName")}
                className={stepOneForm.formState.errors.firstName ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {stepOneForm.formState.errors.firstName && (
                <p className="text-sm text-destructive">{stepOneForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                {...stepOneForm.register("lastName")}
                className={stepOneForm.formState.errors.lastName ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {stepOneForm.formState.errors.lastName && (
                <p className="text-sm text-destructive">{stepOneForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                {...stepOneForm.register("password")}
                className={stepOneForm.formState.errors.password ? "border-destructive pr-10" : "pr-10"}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {stepOneForm.formState.errors.password && (
              <p className="text-sm text-destructive">{stepOneForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...stepOneForm.register("confirmPassword")}
                className={stepOneForm.formState.errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {stepOneForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{stepOneForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Profile Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/auth/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </a>
          </div>
        </form>
      </div>
    )
  }

  // STEP 2 RENDER - Profile Details
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Complete your profile</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Step 2 of 2: Additional information to personalize your experience
        </p>
      </div>

      <form onSubmit={stepTwoForm.handleSubmit(onStepTwoSubmit)} className="grid gap-6">
        {/* Account Type */}
        <div className="grid gap-3">
          <Label>Account Type</Label>
          <RadioGroup
            value={accountType}
            onValueChange={(value) => stepTwoForm.setValue("accountType", value as "individual" | "organization")}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Individual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="organization" id="organization" />
              <Label htmlFor="organization" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Organization
              </Label>
            </div>
          </RadioGroup>
        </div>

        {accountType === "individual" ? (
          // Individual Fields
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => stepTwoForm.setValue("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birthDate">Date of Birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...stepTwoForm.register("birthDate")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  placeholder="e.g., Motswana"
                  {...stepTwoForm.register("nationality")}
                />
              </div>
              <div>
                <Label htmlFor="identityNumber">Identity Number</Label>
                <Input
                  id="identityNumber"
                  placeholder="National ID number"
                  {...stepTwoForm.register("identityNumber")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="passport">Passport Number (Optional)</Label>
              <Input
                id="passport"
                placeholder="Passport number"
                {...stepTwoForm.register("passport")}
              />
            </div>
          </div>
        ) : (
          // Organization Fields
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Organization Information</h3>
            
            <div>
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                placeholder="Company or organization name"
                {...stepTwoForm.register("organizationName")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="Business registration number"
                  {...stepTwoForm.register("registrationNumber")}
                />
              </div>
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select onValueChange={(value) => stepTwoForm.setValue("businessType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Service Types (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {serviceTypes.map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      onCheckedChange={(checked) => {
                        const currentServices = stepTwoForm.getValues("serviceTypes")
                        if (checked) {
                          stepTwoForm.setValue("serviceTypes", [...currentServices, service])
                        } else {
                          stepTwoForm.setValue("serviceTypes", currentServices.filter(s => s !== service))
                        }
                      }}
                    />
                    <Label htmlFor={service} className="text-sm">
                      {service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phoneNumber">Mobile Phone</Label>
              <Input
                id="phoneNumber"
                placeholder="+267 12345678"
                {...stepTwoForm.register("phoneNumber")}
              />
            </div>
            <div>
              <Label htmlFor="telephone">Telephone (Optional)</Label>
              <Input
                id="telephone"
                placeholder="+267 1234567"
                {...stepTwoForm.register("telephone")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Street address"
              {...stepTwoForm.register("address")}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Gaborone"
                {...stepTwoForm.register("city")}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="Postal code"
                {...stepTwoForm.register("postalCode")}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select 
                value={stepTwoForm.watch("country")}
                onValueChange={(value) => stepTwoForm.setValue("country", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="grid gap-3">
            <h4 className="text-sm font-medium">Social Media (Optional)</h4>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  {...stepTwoForm.register("facebook")}
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/youraccount"
                  {...stepTwoForm.register("twitter")}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  {...stepTwoForm.register("linkedin")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Preferences</h3>
          
          <div>
            <Label>Preferred Regulatory Authorities</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {authorities.map(authority => (
                <div key={authority.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={authority.code}
                    onCheckedChange={(checked) => {
                      const currentAuthorities = stepTwoForm.getValues("preferredAuthorities")
                      if (checked) {
                        stepTwoForm.setValue("preferredAuthorities", [...currentAuthorities, authority.code])
                      } else {
                        stepTwoForm.setValue("preferredAuthorities", currentAuthorities.filter(a => a !== authority.code))
                      }
                    }}
                  />
                  <Label htmlFor={authority.code} className="text-sm">
                    {authority.name} ({authority.code})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <Select onValueChange={(value) => stepTwoForm.setValue("experienceLevel", value as "beginner" | "intermediate" | "expert")}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - New to financial regulations</SelectItem>
                <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                <SelectItem value="expert">Expert - Extensive experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={stepTwoForm.watch("emailNotifications")}
                onCheckedChange={(checked) => stepTwoForm.setValue("emailNotifications", !!checked)}
              />
              <Label htmlFor="emailNotifications">
                Email notifications for document updates and regulatory changes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsNotifications"
                checked={stepTwoForm.watch("smsNotifications")}
                onCheckedChange={(checked) => stepTwoForm.setValue("smsNotifications", !!checked)}
              />
              <Label htmlFor="smsNotifications">
                SMS notifications for urgent regulatory alerts
              </Label>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Terms & Privacy</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={stepTwoForm.watch("agreeToTerms")}
                onCheckedChange={(checked) => stepTwoForm.setValue("agreeToTerms", !!checked)}
              />
              <Label htmlFor="agreeToTerms" className="text-sm">
                I agree to the{" "}
                <a href="/terms" className="underline hover:text-primary" target="_blank">
                  Terms and Conditions
                </a>
              </Label>
            </div>
            {stepTwoForm.formState.errors.agreeToTerms && (
              <p className="text-sm text-destructive">{stepTwoForm.formState.errors.agreeToTerms.message}</p>
            )}
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToPrivacy"
                checked={stepTwoForm.watch("agreeToPrivacy")}
                onCheckedChange={(checked) => stepTwoForm.setValue("agreeToPrivacy", !!checked)}
              />
              <Label htmlFor="agreeToPrivacy" className="text-sm">
                I agree to the{" "}
                <a href="/privacy" className="underline hover:text-primary" target="_blank">
                  Privacy Policy
                </a>
              </Label>
            </div>
            {stepTwoForm.formState.errors.agreeToPrivacy && (
              <p className="text-sm text-destructive">{stepTwoForm.formState.errors.agreeToPrivacy.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goBackToStepOne}
            disabled={isLoading}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading || !stepTwoForm.watch("agreeToTerms") || !stepTwoForm.watch("agreeToPrivacy")}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Registration
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By registering, you agree to receive updates about regulatory changes 
            and compliance requirements relevant to your selected preferences.
          </p>
        </div>
      </form>
    </div>
  )
}