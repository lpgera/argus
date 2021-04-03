import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    height: '50vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

export default function Spinner() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  )
}
