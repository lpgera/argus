import { useContext, useState } from 'react'
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import CssBaseline from '@material-ui/core/CssBaseline'
import Hidden from '@material-ui/core/Hidden'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Slide from '@material-ui/core/Slide'
import useScrollTrigger from '@material-ui/core/useScrollTrigger'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import DashboardIcon from '@material-ui/icons/Dashboard'
import KeyIcon from '@material-ui/icons/VpnKey'
import DiagnosticsIcon from '@material-ui/icons/LocalHospital'
import LogoutIcon from '@material-ui/icons/ExitToApp'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Container from '@material-ui/core/Container'
import MenuIcon from '@material-ui/icons/Menu'
import Brightness4 from '@material-ui/icons/Brightness4'
import BrightnessHigh from '@material-ui/icons/BrightnessHigh'
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
    width: variant === 'permanent' && !open ? 60 : 180,
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
          <StyledAppBar>
            <Toolbar
              style={{
                paddingRight: theme.spacing(1),
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
              >
                <MenuIcon />
              </IconButton>
              <StyledLogo />

              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography
                  component="h1"
                  variant="h6"
                  color="inherit"
                  noWrap
                  style={{
                    flexGrow: 1,
                  }}
                >
                  Sensor Data Collection
                </Typography>
              </Link>

              <IconButton
                aria-label={'Toggle dark mode'}
                onClick={() => toggleDarkMode()}
                style={{ marginLeft: 'auto', marginRight: 0 }}
                color={'inherit'}
              >
                {darkMode ? <BrightnessHigh /> : <Brightness4 />}
              </IconButton>
            </Toolbar>
          </StyledAppBar>
        </HideOnScroll>

        <Hidden xsDown>
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
            {drawer()}
          </StyledDrawer>
        </Hidden>
        <StyledMain>
          <StyledToolbarSpacer />
          <StyledContainer>
            <Switch>
              <Route path="/api-keys">
                <ApiKeys />
              </Route>
              <Route path="/diagnostics">
                <Diagnostics />
              </Route>
              <Route path="/measurements">
                <MeasurementChart />
              </Route>
              <Route path="/">
                <Dashboard />
              </Route>
            </Switch>
          </StyledContainer>
        </StyledMain>
      </div>
    </Router>
  )
}
