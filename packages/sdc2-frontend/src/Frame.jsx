import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import Login from './Login'
import Dashboard from './Dashboard'

export default function Frame() {
  const { state: authState } = useContext(AuthContext)
  return <>{authState.token ? <Dashboard /> : <Login />}</>
}
