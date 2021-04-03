import { useContext, useEffect } from 'react'
import axios from 'axios'
import useAxios from 'axios-hooks'
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

const useApiClient = (...args) => {
  const { dispatch: authDispatch } = useContext(AuthContext)

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response.status === 403) {
          authDispatch({ type: 'logout' })
          return Promise.reject(error)
        } else {
          return Promise.reject(error)
        }
      }
    )

    return () => axios.interceptors.response.eject(responseInterceptor)
  }, [authDispatch])

  return useAxios(...args)
}

export default useApiClient
