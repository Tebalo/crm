"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  Users,
  Clock,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BO</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Botswana Oil CRM</span>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Submit Feedback</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Public Forms</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/forms/fuel">Fuel Supply & Distribution</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/forms/ehs">Environmental, Health & Safety (EHS)</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/forms/feedback">General Feedback & Complaints</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/auth/signin">
              <Button>Staff Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">Botswana Oil</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your feedback matters to us. Submit your queries, complaints, or suggestions and track their progress in real-time.
        </p>
        <div className="space-x-4">
          <Link href="/forms/track">
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <Clock className="mr-2 h-5 w-5" />
              Track Your Case
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How We Help You
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-blue-600" />
                Easy Submission
              </CardTitle>
              <CardDescription>
                Submit your feedback through our simple web form or other communication channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Multiple ways to reach us - web forms, email, phone calls, or in-person visits. We make it easy for you to get in touch.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-6 w-6 text-blue-600" />
                Real-time Tracking
              </CardTitle>
              <CardDescription>
                Track the progress of your submissions with real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Stay informed about your case status with automatic notifications and progress updates throughout the resolution process.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-6 w-6 text-blue-600" />
                Expert Support
              </CardTitle>
              <CardDescription>
                Our dedicated team ensures your concerns are addressed promptly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Professional staff trained to handle your inquiries efficiently with proper escalation and resolution procedures.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <p className="text-gray-300">
                Email: support@botswanaoil.com<br />
                Phone: +267 123 4567<br />
                Address: Gaborone, Botswana
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/forms/fuel" className="hover:text-white">Fuel Supply</Link></li>
                <li><Link href="/forms/ehs" className="hover:text-white">EHS Issues</Link></li>
                <li><Link href="/forms/feedback" className="hover:text-white">General Feedback</Link></li>
                <li><Link href="/forms/feedback/track" className="hover:text-white">Track Case</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white">Staff Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-300">
                Botswana Oil is committed to providing excellent customer service and addressing all stakeholder concerns promptly and professionally.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Botswana Oil. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
