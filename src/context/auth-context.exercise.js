// 🐨 create and export a React context variable for the AuthContext
// 💰 using React.createContext
import * as React from 'react'
import * as auth from 'auth-provider'
import {client} from '../utils/api-client'
import {useAsync} from '../utils/hooks'
import {FullPageSpinner, FullPageErrorFallback} from '../components/lib'

const AuthContext = React.createContext()
AuthContext.displayName = 'AuthContext'

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('`useAuth` must be used within a `AuthContext.Provider`')
  }
  return context
}

export function useAuthenticatedClient() {
  const {
    user: {token},
  } = useAuth()

  return React.useCallback(
    (endpoint, options) => client(endpoint, {token, ...options}),
    [token],
  )
}

async function getUser() {
  let user = null

  const token = await auth.getToken()
  if (token) {
    const data = await client('me', {token})
    user = data.user
  }

  return user
}

export function AuthProvider({children}) {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
  } = useAsync()

  React.useEffect(() => {
    run(getUser())
  }, [run])

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }

  const login = form => auth.login(form).then(user => setData(user))
  const register = form => auth.register(form).then(user => setData(user))
  const logout = () => {
    auth.logout()
    setData(null)
  }

  if (isSuccess) {
    return (
      <AuthContext.Provider
        value={{
          user,
          login,
          register,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }
}
