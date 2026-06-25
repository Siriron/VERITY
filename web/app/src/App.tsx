import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Registry from './pages/Registry'
import Submit from './pages/Submit'
import { useRegistry } from './hooks/useRegistry'

type Page = 'landing' | 'registry' | 'submit'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const { total } = useRegistry()

  const navigate = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={navigate} currentPage={page} />

      <main className="flex-1">
        {page === 'landing'   && <Landing onNavigate={navigate} totalSources={total} />}
        {page === 'registry'  && <Registry />}
        {page === 'submit'    && <Submit />}
      </main>

      <Footer />
    </div>
  )
}
