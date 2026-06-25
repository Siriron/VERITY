import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ExternalLink, Menu, X } from 'lucide-react'
import { BRADBURY_EXPLORER, CONTRACT_ADDRESS } from '../lib/genlayer'

interface NavbarProps {
  onNavigate: (page: 'landing' | 'registry' | 'submit') => void
  currentPage: string
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Registry', page: 'registry' as const },
    { label: 'Submit Source', page: 'submit' as const },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#f0ebe3]/95 backdrop-blur-md border-b border-[#ddd8ce] shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 bg-verity-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-sand-100" />
            </div>
            <span className="font-display font-bold text-lg text-ink-900 tracking-tight">
              VERITY
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  currentPage === link.page
                    ? 'bg-verity-50 text-verity-600'
                    : 'text-ink-700 hover:bg-sand-200'
                }`}
              >
                {link.label}
              </button>
            ))}
            <a
              href={`${BRADBURY_EXPLORER}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                         border border-[#ddd8ce] text-ink-700 hover:bg-sand-200 transition-colors duration-150"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Bradbury
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-sand-200 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#f0ebe3] border-b border-[#ddd8ce] shadow-lg md:hidden"
          >
            <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => { onNavigate(link.page); setMobileOpen(false) }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === link.page ? 'bg-verity-50 text-verity-600' : 'text-ink-700 hover:bg-sand-200'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <a
                href={`${BRADBURY_EXPLORER}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-ink-700 hover:bg-sand-200"
                onClick={() => setMobileOpen(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                View on Bradbury Explorer
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
