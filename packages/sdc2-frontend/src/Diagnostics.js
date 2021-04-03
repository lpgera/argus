import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import { makeStyles } from '@material-ui/core/styles'
import useApiClient from './useApiClient'
import Spinner from './Spinner'

const useStyles = makeStyles(() => ({
  tableHeader: {
    fontWeight: 'bold',
  },
}))

const getTooltipDate = (isoDateString) => {
  const date = new Date(isoDateString)
  return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
}

export default function Diagnostics() {
  const [{ loading, data }] = useApiClient('/diagnostics')

  const classes = useStyles()

  const table = () => {
    if (loading && !data) {
      return <Spinner />
    }

    return (
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeader}>Location</TableCell>
              <TableCell className={classes.tableHeader}>Type</TableCell>
              <TableCell className={classes.tableHeader}>Last seen</TableCell>
              <TableCell className={classes.tableHeader}>Last value</TableCell>
              <TableCell className={classes.tableHeader}>
                Last 24h count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={`${row.location}-${row.type}`}>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <Tooltip title={getTooltipDate(row.latestCreatedAt)}>
                    <span>{row.latestFromNow}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>{row.latestvalue}</TableCell>
                <TableCell>{row.lastDayCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <>
      <h1>Diagnostics</h1>

      {table()}
    </>
  )
}
