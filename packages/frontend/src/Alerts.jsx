import { useState } from 'react'
import { useSnackbar } from 'notistack'
import styled from '@emotion/styled'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import Popover from '@mui/material/Popover'
import useApiClient from './hooks/useApiClient'
import Spinner from './Spinner'
import AddAlertDialog from './AddAlertDialog'

const StyledTableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
})

function DeleteConfirm({ id, onConfirm }) {
  const theme = useTheme()
  const [anchor, setAnchor] = useState(null)

  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label={'Delete alert'}
        size="small"
      >
        <DeleteIcon />
      </IconButton>

      <Popover
        id={id}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorEl={anchor}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
      >
        <div style={{ padding: theme.spacing(2) }}>
          <div>Are you sure you want to delete this alert?</div>
          <div style={{ marginTop: theme.spacing(2), textAlign: 'right' }}>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              onClick={onConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </Popover>
    </>
  )
}

export default function Alerts() {
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const [{ data = [], loading }, refetch] = useApiClient('/alert')
  const [, apiClient] = useApiClient()
  const deleteAlert = async ({ id }) => {
    await apiClient(`/alert/${id}`, { method: 'DELETE' })
  }
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const table = () => {
    if (loading && !data.length) {
      return <Spinner />
    }

    return (
      <>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>Location</StyledTableHeaderCell>
                <StyledTableHeaderCell>Type</StyledTableHeaderCell>
                <StyledTableHeaderCell>Comparison</StyledTableHeaderCell>
                <StyledTableHeaderCell>Value</StyledTableHeaderCell>
                <StyledTableHeaderCell>Ntfy URL</StyledTableHeaderCell>
                <StyledTableHeaderCell width={64} />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.comparison}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>{row.ntfyUrl}</TableCell>
                  <TableCell>
                    <DeleteConfirm
                      id={row.id}
                      onConfirm={async () => {
                        await deleteAlert({ id: row.id })
                        await refetch()
                        enqueueSnackbar('Alert deleted', {
                          variant: 'success',
                        })
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{ marginTop: theme.spacing(2), textAlign: 'right' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Create new alert
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <h1>Alerts</h1>

      <AddAlertDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false)
          refetch()
        }}
      />

      {table()}
    </>
  )
}
