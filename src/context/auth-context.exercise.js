// 🐨 create and export a React context variable for the AuthContext
// 💰 using React.createContext
import * as React from 'react'

export const AuthContext = React.createContext()

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('`useAuth` must be used within a `AuthContext.Provider`')
  }
  return context
}
