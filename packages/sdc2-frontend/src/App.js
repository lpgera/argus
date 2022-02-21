import 'fontsource-roboto'
import { SnackbarProvider } from 'notistack'
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles'
import { ThemeProvider } from '@emotion/react'
import { AuthProvider } from './AuthContext'
import Frame from './Frame'
import { AxiosProvider } from './AxiosContext'
import { DarkModeContext, DarkModeProvider } from './DarkModeContext'
import { useContext } from 'react'

const CustomTheme = ({ render }) => {
  const { darkMode } = useContext(DarkModeContext)

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1a237e',
      },
      secondary: {
        main: '#74B1D2',
      },
      ...(darkMode
        ? {
            background: {
              default: '#303030',
              paper: '#424242',
            },
          }
        : {}),
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
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
