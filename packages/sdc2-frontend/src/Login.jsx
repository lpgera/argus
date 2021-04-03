import { useContext, useState } from 'react'
import React from 'react'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import logo from './logo.svg'
import useApiClient from './useApiClient'
import { AuthContext } from './AuthContext'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: 64,
  },
  form: {
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

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

  const classes = useStyles()

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
      <div className={classes.paper}>
        <img src={logo} className={classes.logo} alt={'Logo'} />
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form className={classes.form} onSubmit={onSubmit} noValidate>
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
            className={classes.submit}
          >
            Login
          </Button>
        </form>
      </div>
    </Container>
  )
}
