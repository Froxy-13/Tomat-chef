import { createContext, useContext, useReducer, useMemo } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(i => i.product.id === action.product.id)
      if (existing) {
        return state.map(i =>
          i.product.id === action.product.id
            ? { ...i, quantity: Math.min(i.product.stock, i.quantity + action.quantity) }
            : i
        )
      }
      return [...state, { product: action.product, quantity: action.quantity }]
    }
    case 'UPDATE':
      if (action.quantity <= 0) return state.filter(i => i.product.id !== action.id)
      return state.map(i =>
        i.product.id === action.id
          ? { ...i, quantity: Math.min(i.product.stock, action.quantity) }
          : i
      )
    case 'REMOVE':
      return state.filter(i => i.product.id !== action.id)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  const count    = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.product.price * i.quantity, 0), [items])

  const addItem    = (product, quantity = 1) => dispatch({ type: 'ADD', product, quantity })
  const updateItem = (id, quantity)          => dispatch({ type: 'UPDATE', id, quantity })
  const removeItem = (id)                    => dispatch({ type: 'REMOVE', id })
  const clearCart  = ()                      => dispatch({ type: 'CLEAR' })

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
