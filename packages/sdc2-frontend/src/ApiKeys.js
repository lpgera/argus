import { useState } from 'react'
import { useSnackbar } from 'notistack'
import debounce from 'lodash/debounce'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import Popover from '@material-ui/core/Popover'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import useApiClient from './useApiClient'
import Spinner from './Spinner'

function DeleteConfirm({ id, onConfirm }) {
  const [anchor, setAnchor] = useState(null)
  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
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
        <div style={{ padding: 16 }}>
          <div>Are you sure you want to delete this API key?</div>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
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

const useStyles = makeStyles(() => ({
  tableHeader: {
    fontWeight: 'bold',
  },
}))

export default function ApiKeys() {
  const [{ data = [] }, refetch] = useApiClient('/api-key')
  const { enqueueSnackbar } = useSnackbar()
  const [, execute] = useApiClient({}, { manual: true })
  const updateApiKey = async ({ id, data }) => {
    await execute({
      method: 'patch',
      url: `/api-key/${id}`,
      data,
    })
  }
  const deleteApiKey = async ({ id }) => {
    await execute({
      method: 'delete',
      url: `/api-key/${id}`,
    })
  }
  const createApiKey = async () => {
    await execute({
      method: 'post',
      url: `/api-key`,
    })
  }

  const classes = useStyles()

  const table = () => {
    if (!data.length) {
      return <Spinner />
    }

    return (
      <>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeader}>Token</TableCell>
                <TableCell className={classes.tableHeader}>
                  Read access
                </TableCell>
                <TableCell className={classes.tableHeader}>
                  Write access
                </TableCell>
                <TableCell className={classes.tableHeader}>Comment</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.token}</TableCell>
                  <TableCell>
                    <Checkbox
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
        <div style={{ marginTop: 16, textAlign: 'right' }}>
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
