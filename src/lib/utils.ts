import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function generateCaseNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `BOL-${year}${month}${day}-${random}`
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-800'
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800'
    case 'RESOLVED':
      return 'bg-green-100 text-green-800'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'LOW':
      return 'bg-green-100 text-green-800'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800'
    case 'URGENT':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}