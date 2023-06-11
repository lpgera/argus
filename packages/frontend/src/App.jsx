import '@fontsource/roboto'
import { SnackbarProvider } from 'notistack'
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles'
import { ThemeProvider } from '@emotion/react'
import Frame from './Frame'
import useDarkMode from './hooks/useDarkMode'

const CustomTheme = ({ render }) => {
  const [darkMode] = useDarkMode()

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
    <SnackbarProvider>
      <CustomTheme
        render={({ theme }) => (
          <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <Frame />
            </ThemeProvider>
          </MuiThemeProvider>
        )}
      />
    </SnackbarProvider>
  )
}
