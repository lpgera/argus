import { SnackbarProvider } from 'notistack'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import { AuthProvider } from './AuthContext'
import Frame from './Frame'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#028090',
    },
  },
})

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <Frame />
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
