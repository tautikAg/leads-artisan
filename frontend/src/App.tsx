import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LeadsPage from './pages/LeadsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <LeadsPage />
      </div>
    </QueryClientProvider>
  )
}

export default App
