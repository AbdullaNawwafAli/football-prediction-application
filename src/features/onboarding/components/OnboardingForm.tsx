import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/shadcn/ui/card'
import { Button } from '#/components/shadcn/ui/button'
import { FieldGroup } from '#/components/shadcn/ui/field'
import { useAppForm } from '#/components/tanstackform/hooks/hooks'
import { useAuthStore } from '#/stores/auth.store'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '#/lib/supabase/supabase'
import { onboardingSchema } from '../schema/onboardingSchema'
import createTeamsQueryOptions from '../hooks/createTeamsQueryOptions'
import { submitProfile } from '../services/submitProfile'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState } from 'react'
import type { ComboboxOption } from '#/components/tanstackform/components/FormCombobox'
import AvatarPreview from '#/components/AvatarPreview'

const OnboardingForm = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>Loading teams...</div>}>
          <OnboardingFormContent />
        </Suspense>
      </CardContent>
    </Card>
  )
}

function OnboardingFormContent() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    onSubmit: async ({ value }) => {
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      if (!user.email) {
        setError('User not authenticated')
        return
      }

      try {
        setIsSubmitting(true)
        setError(null)

        await submitProfile({
          userId: user.id,
          displayName: value.display_name,
          profilePicture: value.profile_picture,
          teamId: value.team_id,
          email: user.email,
        })

        navigate({ to: '/dashboard', replace: true })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to complete onboarding',
        )
        setIsSubmitting(false)
      }
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
        <span className='flex flex-col justify-center items-center gap-2'>
         
        <form.AppField name="profile_picture">
  {(field) => (
    <AvatarPreview
      file={field.state.value}
      onChange={field.handleChange}
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

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Completing...' : 'Complete Onboarding'}
      </Button>
    </form>
  )
}

export default OnboardingForm
