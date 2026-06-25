import { Shield, ExternalLink } from 'lucide-react'
import { BRADBURY_EXPLORER, CONTRACT_ADDRESS } from '../lib/genlayer'

export default function Footer() {
  return (
    <footer className="border-t border-[#ddd8ce] bg-[#f7f4ef] mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-verity-500 rounded-lg flex items-center justify-center">
              <Shield size={13} className="text-sand-100" />
            </div>
            <div>
              <span className="font-display font-bold text-ink-900 text-sm">VERITY</span>
              <p className="text-xs text-sand-400 font-body mt-0.5">On-Chain Source Intelligence Protocol</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={`${BRADBURY_EXPLORER}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-sand-400 hover:text-verity-500 transition-colors font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {CONTRACT_ADDRESS.slice(0, 10)}…{CONTRACT_ADDRESS.slice(-6)}
              <ExternalLink size={10} />
            </a>
            <p className="text-xs text-sand-400 font-body">
              Deployed on GenLayer Bradbury · Built with{' '}
              <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer"
                className="hover:text-verity-500 transition-colors">genlayer-js</a>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#ddd8ce] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-sand-400 font-body">
            © 2026 VERITY. Scores are LLM consensus — not editorial opinions.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Siriron/verity-genlayer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sand-400 hover:text-ink-900 transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink size={10} />
            </a>
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sand-400 hover:text-ink-900 transition-colors flex items-center gap-1"
            >
              GenLayer Docs <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
