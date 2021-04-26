import { useContext, useState } from 'react'
import React from 'react'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { useTheme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import styled from 'styled-components'
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
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <StyledDiv>
        <img
          src={logo}
          style={{
            width: 64,
          }}
          alt={'Logo'}
        />
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
            variant="outlined"
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
            variant="outlined"
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
