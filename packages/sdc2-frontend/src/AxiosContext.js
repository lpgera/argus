import { createContext, useContext, useEffect } from 'react'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { AuthContext, LOCAL_STORAGE_KEY } from './AuthContext'

axios.interceptors.request.use((config) => {
  const backendUrl =
    process.env.NODE_ENV === 'development' ? 'http://localhost:4000/' : ''
  const token = localStorage.getItem(LOCAL_STORAGE_KEY)
  return {
    ...config,
    baseURL: `${backendUrl}ajax`,
    headers: { 'x-authorization-token': token },
  }
})

export const AxiosContext = createContext({})

export const AxiosProvider = ({ children }) => {
  const { dispatch: authDispatch } = useContext(AuthContext)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.message === 'Network Error') {
          enqueueSnackbar('Uh-oh... it looks like you are offline.', {
            variant: 'error',
          })
        } else if (error.response && error.response.status === 401) {
          enqueueSnackbar('Your session has expired, please login again.', {
            variant: 'error',
          })
          authDispatch({ type: 'logout' })
        }

        return Promise.reject(error)
      }
    )

    return () => axios.interceptors.response.eject(responseInterceptor)
  }, [authDispatch, enqueueSnackbar])

  return (
    <AxiosContext.Provider value={{ axios }}>{children}</AxiosContext.Provider>
  )
}
