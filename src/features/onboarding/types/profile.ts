import type { Database } from "#/types/database.types"

export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

export interface SubmitProfileParams {
  userId: string
  displayName: string
  profilePicture: File | undefined
  teamId: string
  email: string
}
