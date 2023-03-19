import { useCallback, useEffect, useRef, useState } from 'react'
import useEventListener from './useEventListener'

function parseJSON(value) {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value ?? '')
  } catch {
    return undefined
  }
}

export default function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? parseJSON(item) : initialValue
    } catch (error) {
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = useState(readValue)

  const setValueRef = useRef()

  setValueRef.current = (value) => {
    try {
      if (value === null) {
        window.localStorage.removeItem(key)
        window.dispatchEvent(new Event('local-storage'))
        setStoredValue(value)
        return
      }
      const newValue = value instanceof Function ? value(storedValue) : value
      window.localStorage.setItem(key, JSON.stringify(newValue))
      setStoredValue(newValue)
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  const setValue = useCallback((value) => setValueRef.current?.(value), [])

  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  const handleStorageChange = useCallback(() => {
    setStoredValue(readValue())
  }, [readValue])

  // event from other windows
  useEventListener('storage', handleStorageChange)
  // event from current window
  useEventListener('local-storage', handleStorageChange)

  return [storedValue, setValue]
}
