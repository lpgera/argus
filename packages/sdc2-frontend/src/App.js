import 'fontsource-roboto'
import { SnackbarProvider } from 'notistack'
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core/styles'
import { ThemeProvider } from 'styled-components'
import { AuthProvider } from './AuthContext'
import Frame from './Frame'
import { AxiosProvider } from './AxiosContext'
import { DarkModeContext, DarkModeProvider } from './DarkModeContext'
import { useContext } from 'react'

const CustomTheme = ({ render }) => {
  const { darkMode } = useContext(DarkModeContext)

  const theme = createTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1a237e',
      },
      secondary: {
        main: '#74B1D2',
      },
    },
  })

  return render({ theme })
}

export default function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <AxiosProvider>
          <DarkModeProvider>
            <CustomTheme
              render={({ theme }) => (
                <MuiThemeProvider theme={theme}>
                  <ThemeProvider theme={theme}>
                    <Frame />
                  </ThemeProvider>
                </MuiThemeProvider>
              )}
            />
          </DarkModeProvider>
        </AxiosProvider>
      </SnackbarProvider>
    </AuthProvider>
  )
}
