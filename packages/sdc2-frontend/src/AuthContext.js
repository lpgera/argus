import React, { createContext, useReducer } from 'react'

export const LOCAL_STORAGE_KEY = 'sdc2-token'

const initialState = {
  token: window.localStorage.getItem(LOCAL_STORAGE_KEY),
}

export const AuthContext = createContext({
  state: initialState,
  dispatch: () => {},
})

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'login':
        window.localStorage.setItem(LOCAL_STORAGE_KEY, action.token)
        return {
          ...state,
          token: action.token,
        }
      case 'logout':
        window.localStorage.removeItem(LOCAL_STORAGE_KEY)
        return {
          ...state,
          token: null,
        }
      default:
        throw new Error(`Invalid action ${action}`)
    }
  }, initialState)

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}
