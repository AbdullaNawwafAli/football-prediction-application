import { FieldGroup } from '#/components/shadcn/ui/field'
import { Spinner } from '#/components/shadcn/ui/spinner'
import type { ComboboxOption } from '#/components/tanstack-form/components/FormCombobox'
import { useAppForm } from '#/components/tanstack-form/hooks/hooks'
import { useAuthStore } from '#/stores/auth.store'
import { useAudioStore } from '#/stores/audio.store'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { flushSync } from 'react-dom'
import { toast } from 'sonner'
import createTeamsQueryOptions from '../hooks/createTeamsQueryOptions'
import { onboardingSchema } from '../schema/onboardingSchema'
import { createProfileApi } from '../services/createProfile'
import type { ProfileData, CreateProfileDto } from '../../../types/profile-data'
import AvatarPreview from './AvatarPreview'
import { Button } from '#/components/shadcn/ui/button'

function OnboardingFormContent() {
  const { user, setProfile } = useAuthStore()
  const setPlaying = useAudioStore((s) => s.setPlaying)
  const navigate = useNavigate()

  const { mutateAsync, isPending } = useMutation<
    ProfileData,
    Error,
    CreateProfileDto
  >({
    mutationFn: createProfileApi,
    onSuccess: (profile) => {
      flushSync(() => setProfile(profile))
      setPlaying(true)
      form.setFieldValue('profile_picture', undefined)
      navigate({ to: '/dashboard', replace: true })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  const { data: teams } = useSuspenseQuery(createTeamsQueryOptions())

  const teamOptions: ComboboxOption[] = teams.map((team) => ({
    value: String(team.id),
    label: team.name,
    icon: team.crest_url || undefined,
  }))

  const form = useAppForm({
    defaultValues: {
      display_name: '',
      profile_picture: undefined as File | undefined,
      team_id: '',
    },
    validators: { onSubmit: onboardingSchema },
    onSubmit: ({ value }) => {
      if (!user?.id || !user.email) return
      mutateAsync({
        userId: user.id,
        displayName: value.display_name,
        profilePicture: value.profile_picture,
        teamId: value.team_id,
        email: user.email,
      })
    },
  })

  return (
    <form
      id="onboarding-form"
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
                isInvalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              />
            )}
          </form.AppField>
        </span>

        <form.AppField name="display_name">
          {(field) => (
            <field.Input
              label="Display Name"
              description="Please set an appropriate display name you will not be able to change this later."
            />
          )}
        </form.AppField>

        <form.AppField name="team_id">
          {(field) => (
            <field.Combobox
              label="Select Your Team"
              description="Choose your favorite team"
              options={teamOptions}
              placeholder="Search teams..."
            />
          )}
        </form.AppField>
      </FieldGroup>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Spinner />}
        {isPending ? 'Creating Profile...' : 'Create Profile'}
      </Button>
    </form>
  )
}

export default OnboardingFormContent
