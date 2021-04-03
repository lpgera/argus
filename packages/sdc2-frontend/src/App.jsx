import { SnackbarProvider } from 'notistack'
import { AuthProvider } from './AuthContext'
import Frame from './Frame'

export default function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Frame />
      </SnackbarProvider>
    </AuthProvider>
  )
}
