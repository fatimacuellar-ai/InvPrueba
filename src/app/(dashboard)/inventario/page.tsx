'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'
import { Search, Package, AlertTriangle, Filter } from 'lucide-react'

const CATEGORIAS = ['Todas', 'Electrónica', 'Ropa', 'Alimentos', 'Herramientas'] as const

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todas')
  const supabase = createClient()

  useEffect(() => {
    async function fetchProductos() {
      const { data } = await supabase
        .from('productos')
        .select('*, sucursales(*)')
        .order('nombre')
      setProductos((data as Producto[]) ?? [])
      setLoading(false)
    }
    fetchProductos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoriaFilter === 'Todas' || p.categoria === categoriaFilter
    return matchSearch && matchCat
  })

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      'Electrónica': 'bg-blue-500/20 text-blue-300',
      'Ropa': 'bg-pink-500/20 text-pink-300',
      'Alimentos': 'bg-green-500/20 text-green-300',
      'Herramientas': 'bg-orange-500/20 text-orange-300',
    }
    return map[cat] ?? 'bg-slate-500/20 text-slate-300'
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inventario</h1>
        <p className="text-slate-400 mt-1">{filtered.length} productos encontrados</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaFilter(cat)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  categoriaFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Package className="w-12 h-12 mb-3 opacity-50" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Producto</th>
                  <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Categoría</th>
                  <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Stock</th>
                  <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Stock Mín.</th>
                  <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Precio</th>
                  <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Valor Total</th>
                  <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Sucursal</th>
                  <th className="text-center text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map(p => {
                  const isBajo = p.stock <= p.stock_minimo
                  return (
                    <tr key={p.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium text-sm">{p.nombre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryColor(p.categoria)}`}>
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${isBajo ? 'text-red-400' : 'text-white'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-sm">{p.stock_minimo}</td>
                      <td className="px-6 py-4 text-right text-slate-300 text-sm">
                        ${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-medium text-sm">
                        ${(p.precio * p.stock).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {p.sucursales?.nombre ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isBajo ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Bajo
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
