import { useEffect, useId, useState } from "react"
import { UserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/shadcn/ui/avatar"
import { cn } from "#/lib/shadcn/utils/utils"
import { FieldContent, FieldDescription } from "./shadcn/ui/field"


type AvatarPreviewProps = {
  file: File | undefined
  onChange: (file: File | undefined) => void
  size?: "sm" | "default" | "lg"
  className?: string
}

const AvatarPreview = ({ file, onChange, size = "lg", className }: AvatarPreviewProps) => {
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
    <label htmlFor={id} className="cursor-pointer">
      <Avatar className={cn("size-24", className)}>
        <AvatarImage src={previewUrl} alt="Profile picture preview" />
        <AvatarFallback>
          <UserRound className="size-1/2 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0])}
      />
    
    </label>
  )
}

export default AvatarPreview
