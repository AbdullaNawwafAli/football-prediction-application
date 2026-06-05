import z from "zod"

export const onboardingSchema= z.object({
 display_name: z.string().min(1, "Display name is required"),
 profile_picture: z.instanceof(File, {
    message: "Profile picture is required",
  }),
  team_id: z.string().min(1, "Team ID is required"),
})
