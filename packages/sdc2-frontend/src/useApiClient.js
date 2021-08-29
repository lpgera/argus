import { useContext } from 'react'
import { makeUseAxios } from 'axios-hooks'
import { AxiosContext } from './AxiosContext'

const useApiClient = (config, options) => {
  const { axios } = useContext(AxiosContext)

  const useAxios = makeUseAxios({
    axios,
    defaultOptions: {
      useCache: false,
    },
  })

  return useAxios(config, options)
}

export default useApiClient
