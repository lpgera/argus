import { useState } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import styled, { useTheme } from 'styled-components'
import useApiClient from './useApiClient'
import Spinner from './Spinner'

const StyledTableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
})

const getTooltipDate = (isoDateString) => {
  const date = new Date(isoDateString)
  return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
}

export default function Diagnostics() {
  const theme = useTheme()
  const [{ data = [] }] = useApiClient('/diagnostics')
  const [showStale, setShowStale] = useState(false)

  const visibleItems = showStale ? data : data.filter(({ isStale }) => !isStale)

  const table = () => {
    if (!data.length) {
      return <Spinner />
    }

    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: theme.spacing(1) }}>
          <FormControlLabel
            control={
              <Checkbox
                name="showStale"
                checked={showStale}
                onChange={(e) => setShowStale(e.target.checked)}
              />
            }
            label="Show stale locations"
          />
        </div>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>Location</StyledTableHeaderCell>
                <StyledTableHeaderCell>Type</StyledTableHeaderCell>
                <StyledTableHeaderCell>Last seen</StyledTableHeaderCell>
                <StyledTableHeaderCell>Last value</StyledTableHeaderCell>
                <StyledTableHeaderCell>Last 24h count</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleItems.map((row) => (
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
      </>
    )
  }

  return (
    <>
      <h1>Diagnostics</h1>

      {table()}
    </>
  )
}
