import { GalleryVerticalEnd } from "lucide-react"
import { RegistrationForm } from "@/components/registration-form"
import Image from 'next/image'
import { PersonalizationForm } from "@/components/personalization-form"

export default function PersonalizationPage() {
  return (
    <div className="container mx-auto flex flex-col min-h-screen">
      <div className="flex flex-col gap-4 p-1 md:p-1">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span>Financial Regulatory Portal</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full ">
            <PersonalizationForm />
          </div>
        </div>
      </div>
    </div>
  )
}