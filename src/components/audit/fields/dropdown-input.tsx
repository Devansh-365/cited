"use client"

import React, { useState } from "react"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/lib/utils/constants"

const VALID_IDS = CATEGORIES.map((c) => c.id) as [string, ...string[]]

const categorySchema = z.enum(VALID_IDS, {
  message: "Please select a valid category",
})

export function DropdownInput({
  onSubmit,
  className,
  isLast = false,
}: {
  onSubmit: (value: string) => void
  className?: string
  isLast?: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    const result = categorySchema.safeParse(id)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setError(null)
    setSelected(id)
    onSubmit(result.data)
  }

  return (
    <div className="my-4 flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat.id}
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all",
              selected === cat.id
                ? "border-[#104eb3] bg-[#104eb3]/10 text-[#104eb3]"
                : "border-gray-200 hover:border-[#104eb3]/50 hover:bg-[#104eb3]/5"
            )}
            onClick={() => handleSelect(cat.id)}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-current text-xs font-medium">
              {String.fromCharCode(65 + idx)}
            </span>
            <div>
              <p className="font-medium">{cat.label}</p>
              <p className="text-xs text-gray-500">{cat.examples}</p>
            </div>
          </button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
