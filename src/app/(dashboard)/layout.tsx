import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import { Profile } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, sucursales(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar profile={profile as Profile | null} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
