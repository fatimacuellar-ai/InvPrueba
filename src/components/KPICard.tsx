import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange'
  trend?: string
}

const colorMap = {
  blue: 'bg-slate-800/50 border-blue-500/20',
  green: 'bg-slate-800/50 border-emerald-500/20',
  red: 'bg-slate-800/50 border-red-500/20',
  purple: 'bg-slate-800/50 border-purple-500/20',
  orange: 'bg-slate-800/50 border-orange-500/20',
}

const iconBg = {
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
}

const trendColor = {
  blue: 'text-blue-400',
  green: 'text-emerald-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
}

export default function KPICard({ title, value, subtitle, icon: Icon, color, trend }: KPICardProps) {
  return (
    <div className={`backdrop-blur border rounded-2xl p-6 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
          {trend && <p className={`text-xs mt-2 ${trendColor[color]}`}>{trend}</p>}
        </div>
        <div className={`${iconBg[color]} p-3 rounded-xl flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
