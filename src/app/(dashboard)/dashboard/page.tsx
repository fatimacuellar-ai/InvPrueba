import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KPICard from '@/components/KPICard'
import { Package, DollarSign, AlertTriangle, Tag } from 'lucide-react'
import { Producto } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, sucursales(*)')
    .eq('id', user.id)
    .single()

  const { data: productos } = await supabase
    .from('productos')
    .select('*, sucursales(*)')
    .returns<Producto[]>()

  const items = productos ?? []

  const totalProductos = items.length
  const valorInventario = items.reduce((sum, p) => sum + p.precio * p.stock, 0)
  const bajoStock = items.filter(p => p.stock <= p.stock_minimo).length
  const categorias = [...new Set(items.map(p => p.categoria))].length

  const categoriaStats = items.reduce((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = { cantidad: 0, valor: 0 }
    acc[p.categoria].cantidad += 1
    acc[p.categoria].valor += p.precio * p.stock
    return acc
  }, {} as Record<string, { cantidad: number; valor: number }>)

  const productosBajoStock = items.filter(p => p.stock <= p.stock_minimo)

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          {profile?.rol === 'admin' ? 'Vista global de todas las sucursales' : `${profile?.sucursales?.nombre ?? 'Tu sucursal'}`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Productos"
          value={totalProductos}
          subtitle="Artículos registrados"
          icon={Package}
          color="blue"
        />
        <KPICard
          title="Valor del Inventario"
          value={`$${valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
          subtitle="Valor total en stock"
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Bajo Stock Mínimo"
          value={bajoStock}
          subtitle="Requieren reposición"
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Categorías"
          value={categorias}
          subtitle="Tipos de productos"
          icon={Tag}
          color="purple"
        />
      </div>

      {/* Stats by category + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400" />
            Resumen por Categoría
          </h2>
          <div className="space-y-3">
            {Object.entries(categoriaStats).map(([cat, stats]) => (
              <div key={cat} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{cat}</p>
                  <p className="text-slate-400 text-xs">{stats.cantidad} productos</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm font-semibold">
                    ${stats.valor.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Alertas de Stock
          </h2>
          {productosBajoStock.length === 0 ? (
            <p className="text-slate-400 text-sm">No hay productos bajo stock mínimo.</p>
          ) : (
            <div className="space-y-2">
              {productosBajoStock.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{p.nombre}</p>
                    <p className="text-slate-400 text-xs">{p.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-sm">{p.stock} uds</p>
                    <p className="text-slate-500 text-xs">mín: {p.stock_minimo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
