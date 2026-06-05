import { Card, CardContent, CardHeader, CardTitle } from "#/components/shadcn/ui/card"
import { FieldGroup } from "#/components/shadcn/ui/field"
import { useAppForm } from "#/components/tanstackform/hooks/hooks"
import { useAuthStore } from "#/stores/auth.store"
import { onboardingSchema } from "../schema/onboardingSchema"

const OnboardingForm = () => {
    const { user } = useAuthStore()
    console.log(user)
    const form = useAppForm({
        defaultValues: {
            display_name: "",
            profile_picture: undefined as File | undefined,
            team_id: "",
        },
        validators: { onSubmit: onboardingSchema },
        onSubmit: async ({ value }) => {
            console.log(value)
        },
    })

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Onboarding Form</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    id="onboarding-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        <form.AppField name="display_name">
                            {(field) => <field.Input label="Display Name" description="Please set an appropriate display name you will not be able to change this later." />}
                        </form.AppField>
                        <form.AppField
                            name="profile_picture"
                        >
                            {(field) => <field.FileInput label="Profile Picture" description="Please set an appropriate display name you will not be able to change this later.X" />}
                        </form.AppField>

                    </FieldGroup>

                </form>
            </CardContent>
        </Card>
    )
}

export default OnboardingForm