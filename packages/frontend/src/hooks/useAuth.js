import useLocalStorage from './useLocalStorage'

export default function useAuth() {
  const [token, setToken] = useLocalStorage('argus-token')

  return [token, setToken]
}
