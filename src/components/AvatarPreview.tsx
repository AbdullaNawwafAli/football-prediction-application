import { useEffect, useId, useState } from "react"
import { Camera, UserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/shadcn/ui/avatar"
import { cn } from "#/lib/shadcn/utils/utils"
import { FieldDescription } from "./shadcn/ui/field"

type AvatarPreviewProps = {
  file: File | undefined
  onChange: (file: File | undefined) => void
  className?: string
}

const AvatarPreview = ({ file, onChange, className }: AvatarPreviewProps) => {
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
          <Avatar className={cn("size-24", className)}>
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
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0])}
        />
      </label>
      <FieldDescription>Click to upload a photo</FieldDescription>
    </div>
  )
}

export default AvatarPreview
