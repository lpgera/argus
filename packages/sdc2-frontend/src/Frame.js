import { useContext, useState } from 'react'
import { HashRouter as Router, Link, Route, Routes } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import styled from '@emotion/styled'
import CssBaseline from '@mui/material/CssBaseline'
import Hidden from '@mui/material/Hidden'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import Slide from '@mui/material/Slide'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import DashboardIcon from '@mui/icons-material/Dashboard'
import KeyIcon from '@mui/icons-material/VpnKey'
import DiagnosticsIcon from '@mui/icons-material/LocalHospital'
import LogoutIcon from '@mui/icons-material/ExitToApp'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import MenuIcon from '@mui/icons-material/Menu'
import Brightness4 from '@mui/icons-material/Brightness4'
import BrightnessHigh from '@mui/icons-material/BrightnessHigh'
import { ReactComponent as Logo } from './logo.svg'
import { AuthContext } from './AuthContext'
import { DarkModeContext } from './DarkModeContext'
import Login from './Login'
import Dashboard from './Dashboard'
import ApiKeys from './ApiKeys'
import Diagnostics from './Diagnostics'
import MeasurementChart from './MeasurementChart'
import useLocalStorage from './useLocalStorage'

const StyledLogo = styled(Logo)(({ theme }) => ({
  width: theme.spacing(3),
  minWidth: theme.spacing(3),
  height: theme.spacing(3),
  fill: 'white',
  marginRight: theme.spacing(1),
}))

const StyledToolbarSpacer = styled.div(({ theme }) => theme.mixins.toolbar)

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}))

const StyledDrawer = styled(Drawer)(({ theme, variant, open }) => ({
  '> .MuiPaper-root': {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    width: variant === 'permanent' && !open ? 57 : 180,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration:
        variant === 'permanent' && !open
          ? theme.transitions.duration.leavingScreen
          : theme.transitions.duration.enteringScreen,
    }),
  },
}))

const StyledMain = styled.main({
  flexGrow: 1,
  minHeight: '100vh',
  overflow: 'auto',
})

const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: 1000,
  margin: '0 auto',
  paddingBottom: theme.spacing(2),
}))

function HideOnScroll({ children }) {
  const scrollTrigger = useScrollTrigger()
  return (
    <Slide appear={false} direction="down" in={!scrollTrigger}>
      {children}
    </Slide>
  )
}

export default function Frame() {
  const theme = useTheme()
  const { state: authState, dispatch: authDispatch } = useContext(AuthContext)
  const { darkMode, toggle: toggleDarkMode } = useContext(DarkModeContext)
  const [drawerOpen, setDrawerOpen] = useLocalStorage('sdc2-drawer-open', false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  if (!authState.token) {
    return <Login />
  }

  const drawer = () => (
    <List>
      <ListItem
        button
        component={Link}
        to="/"
        onClick={() => setMobileDrawerOpen(false)}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to="/api-keys"
        onClick={() => setMobileDrawerOpen(false)}
      >
        <ListItemIcon>
          <KeyIcon />
        </ListItemIcon>
        <ListItemText primary="Api keys" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to="/diagnostics"
        onClick={() => setMobileDrawerOpen(false)}
      >
        <ListItemIcon>
          <DiagnosticsIcon />
        </ListItemIcon>
        <ListItemText primary="Diagnostics" />
      </ListItem>
      <ListItem
        button
        onClick={() => {
          setMobileDrawerOpen(false)
          authDispatch({ type: 'logout' })
        }}
      >
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </List>
  )

  return (
    <Router>
      <div
        style={{
          display: 'flex',
        }}
      >
        <CssBaseline />
        <HideOnScroll>
          <StyledAppBar enableColorOnDark>
            <Toolbar
              style={{
                display: 'flex',
                paddingRight: theme.spacing(2),
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={() => {
                  setDrawerOpen(!drawerOpen)
                  setMobileDrawerOpen(!mobileDrawerOpen)
                }}
                style={{
                  marginRight: theme.spacing(2),
                }}
                size="large"
              >
                <MenuIcon />
              </IconButton>
              <StyledLogo />

              <Link
                to="/"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  flexGrow: 1,
                  flexShrink: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="h1" variant="h6" color="inherit" noWrap>
                  Sensor Data Collection
                </Typography>
              </Link>

              <IconButton
                aria-label={'Toggle dark mode'}
                onClick={() => toggleDarkMode()}
                color={'inherit'}
                size="large"
              >
                {darkMode ? <BrightnessHigh /> : <Brightness4 />}
              </IconButton>
            </Toolbar>
          </StyledAppBar>
        </HideOnScroll>

        <Hidden smDown>
          <StyledDrawer variant="permanent" open={drawerOpen}>
            <StyledToolbarSpacer />
            {drawer()}
          </StyledDrawer>
        </Hidden>
        <Hidden smUp>
          <StyledDrawer
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
          >
            <StyledToolbarSpacer />
            {drawer()}
          </StyledDrawer>
        </Hidden>
        <StyledMain>
          <StyledToolbarSpacer />
          <StyledContainer>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="diagnostics" element={<Diagnostics />} />
              <Route path="measurements" element={<MeasurementChart />} />
            </Routes>
          </StyledContainer>
        </StyledMain>
      </div>
    </Router>
  )
}
