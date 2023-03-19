import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useLocalStorage('argus-dark-mode', false)

  const toggle = useCallback(() => {
    setDarkMode((prevState) => !prevState)
  }, [setDarkMode])

  return [darkMode, toggle]
}
