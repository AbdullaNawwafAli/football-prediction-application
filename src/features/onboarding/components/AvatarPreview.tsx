import { useEffect, useId, useRef, useState } from "react"
import { Camera, UserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/shadcn/ui/avatar"
import { cn } from "#/lib/shadcn/utils/utils"
import { FieldDescription, FieldError } from "../../../components/shadcn/ui/field"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

type AvatarPreviewProps = {
  file: File | undefined
  onChange: (file: File | undefined) => void
  errors?: Array<{ message?: string } | undefined>
  isInvalid?: boolean
  className?: string
  initialUrl?: string
}

const AvatarPreview = ({ file, onChange, errors, isInvalid, className, initialUrl }: AvatarPreviewProps) => {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  const [typeError, setTypeError] = useState<string | undefined>()

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]

    if (!selected) {
      onChange(undefined)
      setTypeError(undefined)
      return
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setTypeError("Only JPG, PNG, and WebP images are allowed")
      onChange(undefined)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    if (selected.size > MAX_FILE_SIZE) {
      setTypeError("Image must be smaller than 5MB")
      onChange(undefined)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setTypeError(undefined)
    onChange(selected)
  }

  const hasError = !!typeError || isInvalid

  return (
    <div className="flex flex-col items-center gap-2">
      <label htmlFor={id} className="group cursor-pointer">
        <div className="relative">
          <Avatar className={cn("size-24", hasError && "ring-2 ring-destructive ring-offset-2", className)}>
            <AvatarImage src={previewUrl ?? initialUrl} alt="Profile picture preview" />
            <AvatarFallback>
              <UserRound className="size-1/2 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-6 text-white" />
          </div>
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </label>
      <FieldDescription>Click to upload a photo · JPG, PNG, or WebP</FieldDescription>
      {typeError && <FieldError errors={[{ message: typeError }]} />}
      {!typeError && isInvalid && <FieldError errors={errors} />}
    </div>
  )
}

export default AvatarPreview
