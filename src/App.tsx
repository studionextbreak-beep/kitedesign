import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import TemplatesPage from './pages/TemplatesPage'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import Editor from './pages/Editor'
import NotFound from './pages/NotFound'
import { seedStarterDesigns } from './lib/storage'
import { bootstrapCloud } from './lib/sync'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => {
    seedStarterDesigns()
    void bootstrapCloud()
  }, [])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
