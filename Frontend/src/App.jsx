import { useState } from 'react'
import TabBar from './components/TabBar'
import InsightPage from './pages/InsightPage'
import MetricsPage from './pages/MetricsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [activeTab, setActiveTab] = useState('insight')
  const [apiData, setApiData] = useState(null)

  return (
    <div className="min-h-screen bg-[#F2F1EE] flex justify-center overflow-hidden">
      {/* Ambient blobs — warm orange tint on white */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-16 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'rgba(0,0,0,0.03)' }} />
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(0,0,0,0.02)' }} />
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'rgba(0,0,0,0.02)' }} />
      </div>

      {/* App shell */}
      <div className="relative w-full max-w-[430px] min-h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto pb-28">
          {activeTab === 'insight' && <InsightPage data={apiData} onUpload={setApiData} />}
          {activeTab === 'metrics' && <MetricsPage data={apiData} onUpload={setApiData} />}
          {activeTab === 'profile' && <ProfilePage data={apiData} />}
        </div>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}

export default App
