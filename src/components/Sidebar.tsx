'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Package, LayoutDashboard, BarChart3, LogOut,
  Store, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { Profile } from '@/types'

interface SidebarProps {
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventario', label: 'Inventario', icon: Package },
  { href: '/graficos', label: 'Gráficos', icon: BarChart3 },
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col transition-all duration-300 relative`}>
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-slate-800 border border-slate-600 rounded-full p-1 text-slate-400 hover:text-white transition z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">InvDashboard</h1>
              <p className="text-slate-400 text-xs">Inventario</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-slate-700/50 space-y-2">
        {!collapsed && profile && (
          <div className="px-3 py-2 rounded-xl bg-slate-800/50">
            <p className="text-white text-sm font-medium truncate">{profile.nombre}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Store className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <p className="text-slate-400 text-xs truncate">
                {profile.sucursales?.nombre ?? 'Sin sucursal'}
              </p>
            </div>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              profile.rol === 'admin'
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {profile.rol === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
