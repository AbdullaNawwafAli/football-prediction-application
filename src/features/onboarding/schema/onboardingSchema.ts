import z from "zod"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const onboardingSchema = z.object({
  display_name: z.string().min(1, "Display name is required"),
  profile_picture: z
    .instanceof(File, { message: "Profile picture is required" })
    .refine(
      (file) => ALLOWED_TYPES.includes(file.type),
      { message: "Only JPG, PNG, and WebP images are allowed" }
    ),
  team_id: z.string().min(1, "Team ID is required"),
})
