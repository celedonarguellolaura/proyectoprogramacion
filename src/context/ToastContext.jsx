import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, title, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500)
  }, [])

  return (
    <Ctx.Provider value={{ toasts, addToast }}>
      {children}
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
