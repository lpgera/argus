import { useState, useLayoutEffect } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import debounce from './debounce'

export default function useSize(target) {
  const [size, setSize] = useState()

  useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect())
  }, [target])

  useResizeObserver(
    target,
    debounce((entry) => setSize(entry.contentRect), 50)
  )

  return size
}
