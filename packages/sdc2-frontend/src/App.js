import 'fontsource-roboto'
import { SnackbarProvider } from 'notistack'
import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core/styles'
import { ThemeProvider } from 'styled-components'
import { AuthProvider } from './AuthContext'
import Frame from './Frame'
import { AxiosProvider } from './AxiosContext'

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
      <SnackbarProvider>
        <AxiosProvider>
          <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <Frame />
            </ThemeProvider>
          </MuiThemeProvider>
        </AxiosProvider>
      </SnackbarProvider>
    </AuthProvider>
  )
}
