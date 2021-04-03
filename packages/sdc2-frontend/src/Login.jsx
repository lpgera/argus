import { useContext, useState } from 'react'
import useApiClient from './useApiClient'
import { AuthContext } from './AuthContext'

export default function Login() {
  const { dispatch: authDispatch } = useContext(AuthContext)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [{ error }, login] = useApiClient(
    {
      method: 'post',
      url: '/login',
      data: {
        username,
        password,
      },
    },
    { manual: true }
  )

  const onSubmit = async (e) => {
    e.preventDefault()
    const {
      data: { token },
    } = await login()
    authDispatch({ type: 'login', token })
  }

  return (
    <form onSubmit={onSubmit}>
      <p>
        <label>
          Username:{' '}
          <input
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </p>
      <p>
        <label>
          Password:{' '}
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </p>
      {error ? <p>Invalid credentials.</p> : null}
      <p>
        <button type="submit">Login</button>
      </p>
    </form>
  )
}
