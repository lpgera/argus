import { createContext, useState } from 'react'

export const LOCAL_STORAGE_KEY = 'sdc2-dark-mode'

const initialState = {
  darkMode: window.localStorage.getItem(LOCAL_STORAGE_KEY) === 'true',
}

export const DarkModeContext = createContext({
  state: initialState,
  toggle: () => {},
})

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(initialState.darkMode)

  const toggle = () =>
    setDarkMode((prevState) => {
      const newState = !prevState
      window.localStorage.setItem(LOCAL_STORAGE_KEY, newState.toString())
      return newState
    })

  return (
    <DarkModeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}
