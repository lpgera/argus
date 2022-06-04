import { useContext, useState } from 'react'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import styled from '@emotion/styled'
import Container from '@mui/material/Container'
import logo from './logo.svg'
import useApiClient from './useApiClient'
import { AuthContext } from './AuthContext'

const StyledDiv = styled.div(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}))

export default function Login() {
  const theme = useTheme()
  const { dispatch: authDispatch } = useContext(AuthContext)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [{ error }, login] = useApiClient('/login', {
    method: 'post',
    data: {
      username,
      password,
    },
    isLazy: true,
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    const { token } = await login()
    authDispatch({ type: 'login', token })
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <StyledDiv>
        <img src={logo} width="64" height="64" alt={'Logo'} />
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form
          style={{
            marginTop: theme.spacing(1),
          }}
          onSubmit={onSubmit}
          noValidate
        >
          <TextField
            color="secondary"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoFocus
            error={!!error}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            color="secondary"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            error={!!error}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{
              margin: theme.spacing(3, 0, 2),
            }}
          >
            Login
          </Button>
        </form>
      </StyledDiv>
    </Container>
  )
}
