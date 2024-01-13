import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import useApiClient from './hooks/useApiClient'

export default function AddAlertDialog({ isOpen, onClose }) {
  const [{ data = [] }] = useApiClient('/location')
  const [, apiClient] = useApiClient()
  const createAlert = async (data) => {
    await apiClient(`/alert`, { data, method: 'POST' })
  }

  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [comparison, setComparison] = useState('')
  const [value, setValue] = useState('')
  const [ntfyUrl, setNtfyUrl] = useState('')

  const locations = [...new Set(data.map(({ location }) => location))]
  const types = [...new Set(data.map(({ type }) => type))]
  const comparisons = ['<', '<=', '=', '>=', '>']

  const clear = () => {
    setLocation('')
    setType('')
    setComparison('')
    setValue('')
  }

  return (
    <>
      <Dialog
        fullWidth
        open={isOpen}
        onClose={() => {
          clear()
          onClose()
        }}
      >
        <DialogTitle>Create new alert</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" color="secondary">
            <InputLabel id="location-label">Location</InputLabel>
            <Select
              labelId="location-label"
              value={location}
              label="Location"
              onChange={(e) => setLocation(e.target.value)}
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" color="secondary">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value)}
            >
              {types.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" color="secondary">
            <InputLabel id="comparison-label">Comparison</InputLabel>
            <Select
              labelId="comparison-label"
              value={comparison}
              label="Comparison"
              onChange={(e) => setComparison(e.target.value)}
            >
              {comparisons.map((comparison) => (
                <MenuItem key={comparison} value={comparison}>
                  {comparison}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            color="secondary"
            id="value"
            label="Value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            margin="dense"
          />
          <TextField
            fullWidth
            color="secondary"
            id="ntfyUrl"
            label="Ntfy URL"
            type="text"
            value={ntfyUrl}
            onChange={(e) => setNtfyUrl(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={
              !location ||
              !type ||
              !comparison ||
              value === '' ||
              ntfyUrl === ''
            }
            color="secondary"
            variant="contained"
            onClick={async () => {
              await createAlert({ location, type, comparison, value, ntfyUrl })
              clear()
              onClose()
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
