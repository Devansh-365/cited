"use client"

import { Loader2 } from "lucide-react"

function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-6">
        <Loader2
          className="h-12 w-12 animate-spin text-[#104eb3]"
          strokeWidth={2}
        />
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full min-w-[30%] animate-pulse rounded-full bg-[#104eb3]" />
        </div>
        <span className="text-sm font-medium text-slate-600">Loading...</span>
      </div>
    </div>
  )
}

export default Loading
