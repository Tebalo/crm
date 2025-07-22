import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  try {
    await mkdir(uploadDir, { recursive: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Directory might already exist
    console.log('Upload directory already exists or could not be created')
  }
}

export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${timestamp}_${sanitizedName}`
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}