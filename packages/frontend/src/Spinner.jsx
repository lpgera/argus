import CircularProgress from '@mui/material/CircularProgress'
import styled from '@emotion/styled'

const SpinnerContainer = styled.div({
  display: 'flex',
  height: '50vh',
  justifyContent: 'center',
  alignItems: 'center',
})

export default function Spinner() {
  return (
    <SpinnerContainer>
      <CircularProgress />
    </SpinnerContainer>
  )
}
