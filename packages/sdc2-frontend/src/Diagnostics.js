import { useState } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'
import styled from '@emotion/styled'
import Spinner from './Spinner'
import useApiClient from './hooks/useApiClient'

const StyledTableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
})

const StyledTableCell = styled(TableCell)({
  whiteSpace: 'nowrap',
})

const getTooltipDate = (isoDateString) => {
  const date = new Date(isoDateString)
  return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
}

export default function Diagnostics() {
  const theme = useTheme()
  const [{ data = [], loading }] = useApiClient('/diagnostics')
  const [showStale, setShowStale] = useState(false)

  const visibleItems = showStale ? data : data.filter(({ isStale }) => !isStale)

  const table = () => {
    if (loading && !data.length) {
      return <Spinner />
    }

    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: theme.spacing(1) }}>
          <FormControlLabel
            control={
              <Checkbox
                color="secondary"
                name="showStale"
                checked={showStale}
                onChange={(e) => setShowStale(e.target.checked)}
              />
            }
            label="Show stale locations"
          />
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>Location</StyledTableHeaderCell>
                <StyledTableHeaderCell>Type</StyledTableHeaderCell>
                <StyledTableHeaderCell>Last seen</StyledTableHeaderCell>
                <StyledTableHeaderCell>Value</StyledTableHeaderCell>
                <StyledTableHeaderCell>24h count</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleItems.map((row) => (
                <TableRow key={`${row.location}-${row.type}`}>
                  <StyledTableCell>{row.location}</StyledTableCell>
                  <StyledTableCell>{row.type}</StyledTableCell>
                  <StyledTableCell>
                    <Tooltip title={getTooltipDate(row.latestCreatedAt)}>
                      <span>{row.latestFromNow}</span>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell>{row.latestValue}</StyledTableCell>
                  <StyledTableCell>{row.lastDayCount}</StyledTableCell>
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
