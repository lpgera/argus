import useApiClient from './useApiClient'

export default function Dashboard() {
  const [{ data }] = useApiClient('/location')

  return <>{JSON.stringify(data, null, 2)}</>
}
