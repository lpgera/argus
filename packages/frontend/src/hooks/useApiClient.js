import { useCallback, useEffect, useReducer } from 'react'
import { useSnackbar } from 'notistack'
import useIsMounted from './useIsMounted'
import useAuth from './useAuth'

export default function useApiClient(
  path = null,
  { data = null, method = 'GET', isLazy = false } = {}
) {
  const isMounted = useIsMounted()
  const [token, setToken] = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const initialState = {
    error: undefined,
    loading: false,
    data: undefined,
  }

  const [state, dispatch] = useReducer((state, { type, payload }) => {
    switch (type) {
      case 'loading':
        return { ...state, loading: true }
      case 'fetched':
        return { ...state, loading: false, data: payload }
      case 'error':
        return { ...state, loading: false, error: payload }
      default:
        return state
    }
  }, initialState)

  const initPath = path
  const initData = data
  const initMethod = method

  const doFetch = useCallback(
    async (path = initPath, { data = initData, method = initMethod } = {}) => {
      if (!path) {
        return
      }

      dispatch({ type: 'loading' })

      try {
        const response = await fetch(`ajax${path}`, {
          method,
          headers: {
            'x-authorization-token': token,
            'content-type': 'application/json',
          },
          body: data ? JSON.stringify(data) : null,
        })

        if (!isMounted()) {
          return
        }

        if (!response.ok) {
          if (response.status === 401) {
            setToken(null)
          }

          throw new Error(response.statusText)
        }

        const responseData = await response.json()

        dispatch({ type: 'fetched', payload: responseData })

        return responseData
      } catch (error) {
        if (!isMounted()) {
          return
        }

        enqueueSnackbar(error.message, {
          variant: 'error',
        })

        dispatch({ type: 'error', payload: error })

        throw error
      }
    },
    [
      token,
      setToken,
      isMounted,
      enqueueSnackbar,
      initPath,
      initData,
      initMethod,
    ]
  )

  useEffect(() => {
    if (isLazy) {
      return
    }

    void doFetch()
  }, [isLazy, doFetch])

  return [state, doFetch]
}
