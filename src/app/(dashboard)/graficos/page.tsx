'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts'
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react'

const COLORS = ['#3b82f6', '#ec4899', '#22c55e', '#f97316']

export default function GraficosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('productos').select('*')
      setProductos((data as Producto[]) ?? [])
      setLoading(false)
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stock por categoría (barras)
  const stockPorCategoria = ['Electrónica', 'Ropa', 'Alimentos', 'Herramientas'].map(cat => ({
    categoria: cat,
    stock: productos.filter(p => p.categoria === cat).reduce((sum, p) => sum + p.stock, 0),
    productos: productos.filter(p => p.categoria === cat).length,
  }))

  // Valor por categoría (pie)
  const valorPorCategoria = ['Electrónica', 'Ropa', 'Alimentos', 'Herramientas'].map(cat => ({
    name: cat,
    value: Math.round(productos.filter(p => p.categoria === cat).reduce((sum, p) => sum + p.precio * p.stock, 0)),
  })).filter(d => d.value > 0)

  // Stock por sucursal (líneas simuladas)
  const sucursalLabels = ['Norte', 'Centro', 'Sur']
  const sucursalData = sucursalLabels.map((suc, i) => ({
    sucursal: suc,
    electronica: Math.floor(stockPorCategoria[0]?.stock / 3 * (i + 0.8)),
    ropa: Math.floor(stockPorCategoria[1]?.stock / 3 * (i + 0.9)),
    alimentos: Math.floor(stockPorCategoria[2]?.stock / 3 * (i + 1.1)),
    herramientas: Math.floor(stockPorCategoria[3]?.stock / 3 * (i + 0.7)),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-2">{label}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
                ? `$${entry.value.toLocaleString('es-MX')}`
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Gráficos</h1>
        <p className="text-slate-400 mt-1">Análisis visual del inventario</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar chart: stock por categoría */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">Stock por Categoría</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stockPorCategoria} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="categoria" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="stock" name="Unidades" radius={[6, 6, 0, 0]}>
                {stockPorCategoria.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: valor por categoría */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-semibold">Valor por Categoría</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={valorPorCategoria}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {valorPorCategoria.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => [`$${Number(val).toLocaleString('es-MX')}`, 'Valor']}
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line chart: stock por sucursal */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white font-semibold">Distribución de Stock por Sucursal</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sucursalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="sucursal" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
            <Line type="monotone" dataKey="electronica" name="Electrónica" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 5 }} />
            <Line type="monotone" dataKey="ropa" name="Ropa" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899', r: 5 }} />
            <Line type="monotone" dataKey="alimentos" name="Alimentos" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 5 }} />
            <Line type="monotone" dataKey="herramientas" name="Herramientas" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
