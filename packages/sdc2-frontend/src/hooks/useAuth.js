import useLocalStorage from './useLocalStorage'

export default function useAuth() {
  const [token, setToken] = useLocalStorage('sdc2-token')

  return [token, setToken]
}
