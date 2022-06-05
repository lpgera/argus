import { useEffect, useLayoutEffect, useRef } from 'react'

export default function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef()

  useLayoutEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!element || !element.addEventListener) {
      return
    }
    const eventListener = (event) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)
    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}
