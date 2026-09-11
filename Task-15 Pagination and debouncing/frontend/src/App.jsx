import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Navbar         from './components/Navbar'
import Footer         from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute     from './components/AdminRoute'

import Home          from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import Orders        from './pages/Orders'
import Login         from './pages/Login'
import Register      from './pages/Register'

import AdminProducts from './pages/admin/AdminProducts'
import ProductForm   from './pages/admin/ProductForm'
import AdminOrders   from './pages/admin/AdminOrders'

export default function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app-wrapper">
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      />

      <main>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer — protected */}
          <Route path="/"            element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart"        element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout"    element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders"      element={<ProtectedRoute><Orders /></ProtectedRoute>} />

          {/* Admin — role-guarded */}
          <Route path="/admin/products"          element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/products/add"      element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/admin/orders"            element={<AdminRoute><AdminOrders /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
