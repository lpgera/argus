import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Link from '@mui/material/Link'
import Spinner from './Spinner'
import useApiClient from './hooks/useApiClient'
import useDarkMode from './hooks/useDarkMode'

export default function Dashboard() {
  const theme = useTheme()
  const [darkMode] = useDarkMode()
  const [{ data = [], loading }] = useApiClient('/location')
  const [showStale, setShowStale] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const navigate = useNavigate()

  const linkColor = theme.palette.secondary[darkMode ? 'light' : 'dark']

  const visibleItems = showStale ? data : data.filter(({ isStale }) => !isStale)
  const visibleLocations = [
    ...new Set(visibleItems.map(({ location }) => location)),
  ]
  const visibleTypes = [...new Set(visibleItems.map(({ type }) => type))]

  const isValidItem = ({ location, type }) =>
    visibleItems.some(
      ({ location: l, type: t }) => l === location && t === type
    )
  const isSelected = ({ location, type }) =>
    selectedItems.some(
      ({ location: l, type: t }) => l === location && t === type
    )
  const isEveryItemSelected = (filterFunction) =>
    !visibleItems
      .filter(filterFunction)
      .some(
        ({ location, type }) =>
          !selectedItems.some(
            ({ location: l, type: t }) => l === location && t === type
          )
      )
  const selectAll = (filterFunction) => {
    const itemsToSelect = visibleItems
      .filter(filterFunction)
      .filter((i) => !isSelected(i))
    setSelectedItems((selectedItems) => [...selectedItems, ...itemsToSelect])
  }
  const deselectAll = (filterFunction) => {
    setSelectedItems(selectedItems.filter((i) => !filterFunction(i)))
  }
  const toggle = (filterFunction) => {
    if (isEveryItemSelected(filterFunction)) {
      deselectAll(filterFunction)
    } else {
      selectAll(filterFunction)
    }
  }
  const deselectStale = () => {
    const staleItems = data.filter(({ isStale }) => isStale)
    deselectAll(({ location, type }) =>
      staleItems.some(
        ({ location: l, type: t }) => l === location && t === type
      )
    )
  }

  const table = () => {
    if (!data.length && loading) {
      return <Spinner />
    }

    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: theme.spacing(1) }}>
          <FormControlLabel
            control={
              <Checkbox
                name="showStale"
                color="secondary"
                checked={showStale}
                onChange={(e) => {
                  deselectStale()
                  setShowStale(e.target.checked)
                }}
              />
            }
            label="Show stale locations"
          />
        </div>

        <TableContainer component={Paper}>
          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell />
                {visibleTypes.map((type) => (
                  <TableCell
                    key={type}
                    style={{
                      textAlign: 'center',
                      padding: theme.spacing(1, 0),
                    }}
                  >
                    <Link
                      href={'#'}
                      onClick={(e) => {
                        e.preventDefault()
                        toggle(({ type: t }) => t === type)
                      }}
                      style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        textDecoration: 'none',
                        color: linkColor,
                      }}
                    >
                      {type}
                    </Link>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleLocations.map((location) => (
                <TableRow key={location}>
                  <TableCell
                    component="th"
                    scope="row"
                    style={{ textAlign: 'right' }}
                  >
                    <Link
                      href={'#'}
                      style={{
                        textDecoration: 'none',
                        color: linkColor,
                      }}
                      onClick={(e) => {
                        toggle(({ location: l }) => l === location)
                        e.preventDefault()
                      }}
                    >
                      {location}
                    </Link>
                  </TableCell>
                  {visibleTypes.map((type) => (
                    <TableCell
                      key={type}
                      style={{ textAlign: 'center', padding: 0 }}
                    >
                      {isValidItem({ location, type }) ? (
                        <Checkbox
                          color="secondary"
                          size="small"
                          checked={isSelected({ location, type })}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems((selectedItems) => [
                                ...selectedItems,
                                { location, type },
                              ])
                            } else {
                              setSelectedItems((selectedItems) => [
                                ...selectedItems.filter(
                                  ({ location: l, type: t }) =>
                                    !(l === location && t === type)
                                ),
                              ])
                            }
                          }}
                        />
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div style={{ textAlign: 'right', marginTop: theme.spacing(2) }}>
          <Button
            variant="contained"
            color="secondary"
            disabled={!selectedItems.length}
            onClick={() => {
              const urlSearchParams = new URLSearchParams()
              for (const item of selectedItems) {
                urlSearchParams.append('location', item.location)
                urlSearchParams.append('type', item.type)
              }
              navigate({
                pathname: './measurements',
                search: urlSearchParams.toString(),
              })
            }}
          >
            Show selected measurements
          </Button>
        </div>
      </>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1>Dashboard</h1>

      {table()}
    </div>
  )
}
