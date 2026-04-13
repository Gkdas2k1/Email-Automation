import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TemplatesPage from './components/TemplatesPage'
import RecipientsPage from './components/RecipientsPage'
import HistoryPage from './components/HistoryPage'
import SettingsPage from './components/SettingsPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/recipients" element={<RecipientsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
