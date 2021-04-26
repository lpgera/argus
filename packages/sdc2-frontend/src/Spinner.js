import CircularProgress from '@material-ui/core/CircularProgress'
import styled from 'styled-components'

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
