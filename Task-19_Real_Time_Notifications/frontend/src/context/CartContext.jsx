import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  function addToCart(product, quantity = 1) {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + quantity } : i
        )
      }
      return [...prev, { ...product, qty: quantity }]
    })
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  function updateQty(id, qty) {
    if (qty < 1) return
    setCartItems(prev =>
      prev.map(i => (i.id === id ? { ...i, qty } : i))
    )
  }

  function clearCart() {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
