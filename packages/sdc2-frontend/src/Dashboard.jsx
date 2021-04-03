import { useContext, useState } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Hidden from '@material-ui/core/Hidden'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
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
import { ReactComponent as Logo } from './logo.svg'
import useApiClient from './useApiClient'
import { AuthContext } from './AuthContext'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24,
  },
  logo: {
    width: 24,
    height: 24,
    fill: 'white',
    marginRight: 8,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginRight: 16,
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: 180,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    width: 60,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}))

export default function Dashboard() {
  const { dispatch: authDispatch } = useContext(AuthContext)
  const [{ data }] = useApiClient('/location')

  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const drawer = () => (
    <List>
      <ListItem button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <KeyIcon />
        </ListItemIcon>
        <ListItemText primary="Api keys" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <DiagnosticsIcon />
        </ListItemIcon>
        <ListItemText primary="Diagnostics" />
      </ListItem>
      <ListItem
        button
        onClick={() => {
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
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Logo className={classes.logo} />
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Sensor data collection
          </Typography>
        </Toolbar>
      </AppBar>
      <Hidden xsDown>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.appBarSpacer} />
          {drawer()}
        </Drawer>
      </Hidden>
      <Hidden smUp>
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          onClose={() => setOpen(false)}
          open={open}
        >
          {drawer()}
        </Drawer>
      </Hidden>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <>{JSON.stringify(data, null, 2)}</>
        </Container>
      </main>
    </div>
  )
}
