import { motion } from 'framer-motion'
import { ExternalLink, Globe } from 'lucide-react'
import { type SourceRecord, scoreColor, scoreLabel, BRADBURY_EXPLORER, truncateAddress } from '../lib/genlayer'
import ScoreRing from './ScoreRing'

interface SourceCardProps {
  source: SourceRecord
  index: number
}

export default function SourceCard({ source, index }: SourceCardProps) {
  const cred  = parseInt(source.credibility_score)
  const bias  = parseInt(source.bias_score)
  const rel   = parseInt(source.reliability_score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="verity-card p-5 hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-verity-50 border border-verity-100 flex items-center justify-center flex-shrink-0">
            <Globe size={15} className="text-verity-500" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-ink-900 text-sm leading-tight truncate">
              {source.domain}
            </p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sand-400 hover:text-verity-500 transition-colors flex items-center gap-1 mt-0.5"
            >
              <span className="truncate max-w-[200px]">{source.url}</span>
              <ExternalLink size={10} className="flex-shrink-0" />
            </a>
          </div>
        </div>
        <span className={source.status === 'ACTIVE' ? 'tag-active' : 'tag-archived'}>
          <span className={`w-1.5 h-1.5 rounded-full ${source.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-sand-400'}`} />
          {source.status}
        </span>
      </div>

      {/* Summary */}
      <p className="text-xs text-ink-700 leading-relaxed mb-4 line-clamp-2 font-body">
        {source.summary}
      </p>

      {/* Score rings */}
      <div className="flex items-center justify-around py-3 border-t border-b border-[#ddd8ce] mb-4">
        <ScoreRing
          score={cred}
          size={64}
          color={scoreColor(cred, 'credibility')}
          label="Credibility"
          strokeWidth={5}
        />
        <ScoreRing
          score={bias}
          size={64}
          color={scoreColor(bias, 'bias')}
          label="Bias"
          strokeWidth={5}
        />
        <ScoreRing
          score={rel}
          size={64}
          color={scoreColor(rel, 'reliability')}
          label="Reliability"
          strokeWidth={5}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-sand-400">
          #{source.source_id} · {truncateAddress(source.submitter)}
        </span>
        <a
          href={`${BRADBURY_EXPLORER}/address/0xd1Dbf820eD19E7371EA72aB57a159263391A543C`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-verity-500 hover:text-verity-600 transition-colors flex items-center gap-1"
        >
          On-chain <ExternalLink size={10} />
        </a>
      </div>
    </motion.div>
  )
}
