import { useContext, useState } from 'react'
import { useSnackbar } from 'notistack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import styled from '@emotion/styled'
import debounce from './debounce'
import useApiClient from './useApiClient'
import Spinner from './Spinner'
import { AxiosContext } from './AxiosContext'

function DeleteConfirm({ id, onConfirm }) {
  const theme = useTheme()
  const [anchor, setAnchor] = useState(null)

  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label={'Delete API key'}
        size="large"
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
          <div>Are you sure you want to delete this API key?</div>
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

const StyledTableHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
})

export default function ApiKeys() {
  const theme = useTheme()
  const [{ data = [], loading }, refetch] = useApiClient('/api-key')
  const { enqueueSnackbar } = useSnackbar()
  const { axios } = useContext(AxiosContext)
  const updateApiKey = async ({ id, data }) => {
    await axios.patch(`/api-key/${id}`, data)
  }
  const deleteApiKey = async ({ id }) => {
    await axios.delete(`/api-key/${id}`)
  }
  const createApiKey = async () => {
    await axios.post(`/api-key`)
  }

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
                <StyledTableHeaderCell>Token</StyledTableHeaderCell>
                <StyledTableHeaderCell>Read access</StyledTableHeaderCell>
                <StyledTableHeaderCell>Write access</StyledTableHeaderCell>
                <StyledTableHeaderCell>Comment</StyledTableHeaderCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.token}</TableCell>
                  <TableCell>
                    <Checkbox
                      color="secondary"
                      checked={!!row.canRead}
                      onChange={async (e) => {
                        await updateApiKey({
                          id: row.id,
                          data: {
                            canRead: e.target.checked,
                          },
                        })
                        await refetch()
                        enqueueSnackbar('Read access updated', {
                          variant: 'success',
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      color="secondary"
                      checked={!!row.canWrite}
                      onChange={async (e) => {
                        await updateApiKey({
                          id: row.id,
                          data: {
                            canWrite: e.target.checked,
                          },
                        })
                        await refetch()
                        enqueueSnackbar('Write access updated', {
                          variant: 'success',
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      color="secondary"
                      variant="standard"
                      defaultValue={row.comment}
                      onChange={debounce(async (e) => {
                        await updateApiKey({
                          id: row.id,
                          data: {
                            comment: e.target.value,
                          },
                        })
                        await refetch()
                        enqueueSnackbar('Comment updated', {
                          variant: 'success',
                        })
                      }, 500)}
                    />
                  </TableCell>
                  <TableCell>
                    <DeleteConfirm
                      id={row.id}
                      onConfirm={async () => {
                        await deleteApiKey({ id: row.id })
                        await refetch()
                        enqueueSnackbar('API key deleted', {
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
            onClick={async () => {
              await createApiKey()
              await refetch()
              enqueueSnackbar('API key created', {
                variant: 'success',
              })
            }}
          >
            Create new API key
          </Button>
        </div>
      </>
    )
  }
  return (
    <>
      <h1>Api keys</h1>

      {table()}
    </>
  )
}
