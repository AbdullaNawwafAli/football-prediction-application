import z from "zod"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

export const onboardingSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(20, "Display name must be less than 20 characters"),
  profile_picture: z
    .instanceof(File, { message: "Profile picture is required" })
    .refine(
      (file) => ALLOWED_TYPES.includes(file.type),
      { message: "Only JPG, PNG, and WebP images are allowed" }
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      { message: "Image must be smaller than 5MB" }
    ),
  team_id: z.string().min(1, "Team ID is required"),
})
