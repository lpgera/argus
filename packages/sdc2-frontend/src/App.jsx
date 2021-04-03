import './App.css'
import { AuthProvider } from './AuthContext'
import Frame from './Frame'

export default function App() {
  return (
    <AuthProvider>
      <Frame />
    </AuthProvider>
  )
}
