"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackButton({
  fallbackHref,
  label,
  className = "gap-2 text-foreground hover:bg-secondary",
}: {
  fallbackHref: string
  label: string
  className?: string
}) {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 2) {
          router.back()
        } else {
          router.push(fallbackHref)
        }
      }}
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Button>
  )
}
