"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInSchema, type SignInInput } from "@/lib/validations/auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Auth API configuration
const AUTH_API_URL = "http://74.208.205.44:8019/api/auth_microservice/login/"
const DECODE_API_URL = "http://74.208.205.44:8019/api/auth_microservice/decode-token/"

interface AuthResponse {
  access: string
  refresh: string
}

interface DecodedTokenResponse {
  payload: {
    user_id: number
    exp: number
    roles: string[]
    profile: {
      username: string
      first_name: string
      last_name: string
      email: string
    }
  }
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const getClientInfo = () => {
    return {
      ipAddress: '', // You might want to get this from a service
      userAgent: navigator.userAgent,
    }
  }

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true)

    try {
      // Step 1: Authenticate with external service
      const authResponse = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.email,
          password: data.password,
        }),
      })

      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => null)
        throw new Error(errorData?.message || "Invalid credentials")
      }

      const authData: AuthResponse = await authResponse.json()

      // Step 2: Decode the token to get user info
      const decodeResponse = await fetch(DECODE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: authData.access,
        }),
      })

      if (!decodeResponse.ok) {
        throw new Error("Failed to decode token")
      }

      const decodedData: DecodedTokenResponse = await decodeResponse.json()

      // Step 3: Create session in your database
      const sessionResponse = await fetch('/api/auth/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decodedPayload: decodedData.payload,
          accessToken: authData.access,
          refreshToken: authData.refresh,
          clientInfo: getClientInfo(),
        }),
      })

      if (!sessionResponse.ok) {
        throw new Error("Failed to create session")
      }

      const sessionData = await sessionResponse.json()

      // Step 4: Store session info in sessionStorage (not localStorage for security)
      sessionStorage.setItem('session_token', sessionData.sessionToken)
      sessionStorage.setItem('access_token', authData.access)
      sessionStorage.setItem('refresh_token', authData.refresh)
      sessionStorage.setItem('user_data', JSON.stringify({
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: sessionData.user.role,
        expires: sessionData.expires,
      }))

      toast("Login Successful", {
        description: `Welcome back, ${decodedData.payload.profile.first_name}!`,
      })

      // Redirect based on user role
      const userRoles = decodedData.payload.roles || []
      if (userRoles.includes("admin") || sessionData.user.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
      
      router.refresh()

    } catch (error) {
      console.error("Login error:", error)
      toast("Login Failed", {
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    toast("GitHub Sign-in", {
      description: "GitHub authentication not configured for this endpoint."
    })
  }

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your credentials below to access your account
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email/Username</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@fia.com"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
              onClick={(e) => {
                e.preventDefault()
                toast("Password Reset", {
                  description: "Password reset functionality will be available in the next version.",
                })
              }}
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
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
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>

        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={handleGitHubSignIn}
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Login with GitHub
        </Button> */}
      </div>

      <div className="text-center text-sm">
        <div className="text-muted-foreground mb-2">
          Demo accounts for testing:
        </div>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div>Demo: john_doe / SecureP@ssword123</div>
          <div>Check API documentation for other test accounts</div>
        </div>
      </div>

      <div className="text-center text-sm">
        Staff only access.{" "}
        <a 
          href="/feedback" 
          className="underline underline-offset-4 hover:text-primary"
        >
          Submit feedback as customer
        </a>
      </div>
    </form>
  )
}