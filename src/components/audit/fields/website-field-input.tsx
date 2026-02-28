"use client"

import React, { useRef, useState } from "react"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const websiteSchema = z
  .string()
  .trim()
  .transform((val) => {
    if (!val) return val
    if (!/^https?:\/\//i.test(val)) return `https://${val}`
    return val
  })
  .pipe(
    z.union([
      z.literal(""),
      z.string().url("Please enter a valid URL (e.g. example.com)"),
    ])
  )

export function WebsiteFieldInput({
  onSubmit,
  className,
  isLast = false,
}: {
  onSubmit: (value: string) => void
  className?: string
  isLast?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fitsInSingleLine = () => {
    const textarea = textareaRef.current
    if (textarea) {
      const { scrollWidth, clientWidth } = textarea
      return scrollWidth <= clientWidth
    }
    return true
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  const handleSubmit = () => {
    const result = websiteSchema.safeParse(value)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setError(null)
    onSubmit(result.data)
  }

  return (
    <div className="my-4 flex flex-col gap-1">
      <Textarea
        ref={textareaRef}
        value={value}
        className={cn(
          `resize-none overflow-hidden border-none p-0 text-xl text-[#104eb3] outline-none placeholder:text-[#b8cae8] focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${fitsInSingleLine() ? "pb-0" : ""}`,
          className
        )}
        placeholder="https://yourbrand.com"
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          adjustTextareaHeight()
          setValue(e.target.value)
          if (error) setError(null)
        }}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <div className="flex">
        <Button
          className="h-10 rounded-md bg-[#104eb3] text-lg text-white hover:bg-[#104eb3]/80"
          onClick={handleSubmit}
        >
          {isLast ? "Submit" : "OK"}
        </Button>
      </div>
    </div>
  )
}
