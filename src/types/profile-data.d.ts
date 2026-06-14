import type { Database } from "#/types/database.types"

export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]

// Only the columns the app actually reads. `getProfileApi` selects exactly
// these (not `*`) so unused columns (created_at, updated_at, football_heri,
// rick_rolled — which are write-only easter-egg flags) never leave the DB.
export type ProfileData = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "display_name" | "email" | "avatar_url" | "favorite_team"
>

export interface CreateProfileDto {
  userId: string
  displayName: string
  profilePicture: File | undefined
  teamId: string
  email: string
}
