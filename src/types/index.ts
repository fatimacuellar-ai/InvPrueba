export interface Sucursal {
  id: string
  nombre: string
  ciudad: string
  direccion: string
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  categoria: 'Electrónica' | 'Ropa' | 'Alimentos' | 'Herramientas'
  stock: number
  precio: number
  stock_minimo: number
  sucursal_id: string
  sucursales?: Sucursal
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  nombre: string
  sucursal_id: string | null
  rol: 'admin' | 'usuario'
  created_at: string
  sucursales?: Sucursal
}

export type Categoria = 'Electrónica' | 'Ropa' | 'Alimentos' | 'Herramientas'
