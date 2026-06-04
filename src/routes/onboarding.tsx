import { Button } from '#/components/shadcn/ui/button'
import { Input } from '#/components/shadcn/ui/input'
import { supabase } from '#/lib/supabase/supabase'
import { useAuthStore } from '#/stores/auth.store'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'


export const Route = createFileRoute('/onboarding')({
    component: OnboardingPage,
})

// You'll replace this with the actual 2026 World Cup teams later
// when your match data pipeline is set up in Phase 2
const TEAMS = ['Brazil', 'France', 'England', 'Germany', 'Argentina', 'Spain']

function OnboardingPage() {
    const { user, setProfile } = useAuthStore()
    const navigate = useNavigate()

    const [displayName, setDisplayName] = useState('')
    const [favoriteTeam, setFavoriteTeam] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [nameError, setNameError] = useState('')
    const [loading, setLoading] = useState(false)

    // Check uniqueness as the user types (debounce this in production)
    const checkDisplayName = async (value: string) => {
        setDisplayName(value)
        if (value.length < 3) return

        const { data } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('display_name', value)
            .single()

        setNameError(data ? 'This display name is already taken' : '')
    }

    const handleSubmit = async () => {
        if (!user || nameError || !displayName || !favoriteTeam) return
        setLoading(true)

        let avatar_url = null

        // Upload avatar if provided
        if (avatarFile) {
            const ext = avatarFile.name.split('.').pop()
            const path = `${user.id}/avatar.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, avatarFile, { upsert: true })

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(path)
                avatar_url = publicUrl
            }
        }

        // Insert the profile row
        const { data: profile, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                display_name: displayName,
                favorite_team: favoriteTeam,
                avatar_url,
            })
            .select()
            .single()

        if (error) {
            // Handle race condition — someone took the name between check and insert
            if (error.code === '23505') {
                setNameError('This display name was just taken, try another')
            }
            setLoading(false)
            return
        }

        setProfile(profile)
        navigate({ to: '/dashboard' })
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col gap-6 w-full max-w-md p-8">
                <h1 className="text-2xl font-bold">Set up your profile</h1>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Display name</label>
                    <Input
                        value={displayName}
                        onChange={(e) => checkDisplayName(e.target.value)}
                        placeholder="Enter a unique display name"
                    />
                    {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Favourite team</label>
                    <select
                        value={favoriteTeam}
                        onChange={(e) => setFavoriteTeam(e.target.value)}
                        className="border rounded-md px-3 py-2"
                    >
                        <option value="">Select a team</option>
                        {TEAMS.map((team) => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Profile picture (optional)</label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    />
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading || !!nameError || !displayName || !favoriteTeam}
                >
                    {loading ? 'Setting up...' : 'Continue'}
                </Button>
            </div>
        </div>
    )
}