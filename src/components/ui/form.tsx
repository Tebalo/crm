/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import {
  useFormContext,
  Controller,
  FormProvider,
  useFormState,
} from 'react-hook-form'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

export const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => {
  return <form {...props}>{children}</form>
}

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props} />
))
FormItem.displayName = 'FormItem'

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <Label ref={ref} className={cn(className)} {...props} />
))
FormLabel.displayName = 'FormLabel'

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
))
FormControl.displayName = 'FormControl'

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
FormDescription.displayName = 'FormDescription'

export const FormMessage = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()

  const error = errors[name as keyof typeof errors]
  if (!error) return null

  return (
    <p className="text-sm font-medium text-destructive">
      {(error as any)?.message?.toString()}
    </p>
  )
}

export const FormField = ({ ...props }: any) => {
  return <Controller {...props} />
}
