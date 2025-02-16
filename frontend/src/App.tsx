import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import LeadsPage from './pages/LeadsPage'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import { websocketService } from './services/websocket'
import { showToast } from './utils/toast'

// Initialize React Query client
const queryClient = new QueryClient()

function App() {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe((message) => {
      // Only show notifications for remote updates
      if (message.isRemote) {
        switch (message.type) {
          case 'create':
            showToast.info(`New lead created: ${message.lead.name}`)
            break
          case 'update':
            showToast.info(`Lead updated: ${message.lead.name}`)
            break
          case 'delete':
            showToast.warning(`Lead deleted: ${message.lead.name}`)
            break
        }
      }
      
      // Always invalidate the cache for both local and remote updates
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    })

    return () => unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <LeadsPage />
        {/* Global Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </QueryClientProvider>
  )
}

export default App
