import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthErrorPageProps {
  searchParams: { error?: string }
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const error = searchParams.error

  const getErrorMessage = (error: string | undefined) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again."
      case "EmailNotVerified":
        return "Please verify your email address before signing in."
      case "AccountNotLinked":
        return "This email is already associated with another account. Please sign in with your original method."
      case "AccessDenied":
        return "Access denied. You don't have permission to access this application."
      case "Verification":
        return "The verification link has expired or is invalid. Please request a new one."
      default:
        return "An error occurred during authentication. Please try again."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">BO</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              Botswana Oil CRM
            </span>
          </Link>
        </div>

        {/* Error Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border">
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Error
              </h2>
              <p className="text-sm text-gray-600">
                {getErrorMessage(error)}
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Go Home
                </Button>
              </Link>
            </div>

            {error && (
              <details className="text-left">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-auto">
                  Error: {error}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          Need help? Contact support at{" "}
          <a 
            href="mailto:support@botswanaoil.com"
            className="text-blue-600 hover:text-blue-500"
          >
            support@botswanaoil.com
          </a>
        </div>
      </div>
    </div>
  )
}