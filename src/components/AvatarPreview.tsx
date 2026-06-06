import { useEffect, useId, useState } from "react"
import { Camera, UserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/shadcn/ui/avatar"
import { cn } from "#/lib/shadcn/utils/utils"
import { FieldDescription, FieldError } from "./shadcn/ui/field"

type AvatarPreviewProps = {
  file: File | undefined
  onChange: (file: File | undefined) => void
  errors?: Array<{ message?: string } | undefined>
  isInvalid?: boolean
  className?: string
}

const AvatarPreview = ({ file, onChange, errors, isInvalid, className }: AvatarPreviewProps) => {
  const id = useId()
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="flex flex-col items-center gap-2">
      <label htmlFor={id} className="group cursor-pointer">
        <div className="relative">
          <Avatar className={cn("size-24", isInvalid && "ring-2 ring-destructive ring-offset-2", className)}>
            <AvatarImage src={previewUrl} alt="Profile picture preview" />
            <AvatarFallback>
              <UserRound className="size-1/2 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-6 text-white" />
          </div>
        </div>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0])}
        />
      </label>
      <FieldDescription>Click to upload a photo · JPG, PNG, or WebP</FieldDescription>
      {isInvalid && <FieldError errors={errors} />}
    </div>
  )
}

export default AvatarPreview
