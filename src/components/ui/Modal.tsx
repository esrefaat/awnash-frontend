"use client"

import * as React from "react"
import { X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "bg-card border-border"
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <DialogTitle className="text-lg font-medium">
            {title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-foreground",
              isRTL ? "mr-auto" : "ml-auto"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="pt-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
