import { flushSync } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '#/components/shadcn/ui/dialog'
import { Button } from '#/components/shadcn/ui/button'
import { Spinner } from '#/components/shadcn/ui/spinner'
import { FieldGroup } from '#/components/shadcn/ui/field'
import { useAppForm } from '#/components/tanstack-form/hooks/hooks'
import { useAuthStore } from '#/stores/auth.store'
import AvatarPreview from '#/features/onboarding/components/AvatarPreview'
import { updateProfileApi } from '../services/updateProfile'
import z from 'zod'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const editProfileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(20, 'Display name must be less than 20 characters'),
  profile_picture: z.union([
    z.instanceof(File).refine((file) => ALLOWED_TYPES.includes(file.type), { message: 'Only JPG, PNG, and WebP images are allowed' }),
    z.undefined(),
  ]),
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileDialog({ open, onOpenChange }: Props) {
  const { user, profile, setProfile } = useAuthStore()
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (updated) => {
      flushSync(() => setProfile(updated))
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      toast.success('Profile updated')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const form = useAppForm({
    defaultValues: {
      display_name: profile?.display_name ?? '',
      profile_picture: undefined as File | undefined,
    },
    validators: { onSubmit: editProfileSchema },
    onSubmit: ({ value }) => {
      if (!user?.id) return
      mutateAsync({
        userId: user.id,
        displayName: value.display_name,
        profilePicture: value.profile_picture,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <span className="flex flex-col justify-center items-center gap-2">
              <form.AppField name="profile_picture">
                {(field) => (
                  <AvatarPreview
                    file={field.state.value}
                    onChange={field.handleChange}
                    errors={field.state.meta.errors}
                    isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    initialUrl={profile?.avatar_url ?? undefined}
                  />
                )}
              </form.AppField>
            </span>

            <form.AppField name="display_name">
              {(field) => (
                <field.Input label="Display Name" />
              )}
            </form.AppField>
          </FieldGroup>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner />}
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
