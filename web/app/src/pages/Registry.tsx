import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, Database, ArrowUpDown } from 'lucide-react'
import { useRegistry } from '../hooks/useRegistry'
import SourceCard from '../components/SourceCard'

type SortKey = 'newest' | 'credibility' | 'bias' | 'reliability'

export default function Registry() {
  const { sources, total, loading, error, refresh } = useRegistry()
  const [query, setQuery]   = useState('')
  const [sort, setSort]     = useState<SortKey>('newest')
  const [refreshing, setRefreshing] = useState(false)

  const filtered = useMemo(() => {
    let list = [...sources]

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (s) =>
          s.domain.toLowerCase().includes(q) ||
          s.url.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      if (sort === 'newest')      return parseInt(b.source_id) - parseInt(a.source_id)
      if (sort === 'credibility') return parseInt(b.credibility_score) - parseInt(a.credibility_score)
      if (sort === 'bias')        return parseInt(a.bias_score) - parseInt(b.bias_score)
      if (sort === 'reliability') return parseInt(b.reliability_score) - parseInt(a.reliability_score)
      return 0
    })

    return list
  }, [sources, query, sort])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setTimeout(() => setRefreshing(false), 600)
  }

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'newest',      label: 'Newest' },
    { key: 'credibility', label: 'Credibility' },
    { key: 'reliability', label: 'Reliability' },
    { key: 'bias',        label: 'Least Bias' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-mono text-verity-500 uppercase tracking-widest mb-2">On-Chain Registry</p>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-ink-900">Source Intelligence</h1>
              <p className="text-sm text-sand-400 font-body mt-1">
                {loading ? 'Loading…' : `${total} source${total !== 1 ? 's' : ''} evaluated by GenLayer validators`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ddd8ce] bg-[#f7f4ef]">
                <Database size={13} className="text-verity-500" />
                <span className="text-xs font-mono text-ink-700">{total} records</span>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg border border-[#ddd8ce] hover:bg-sand-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={15} className={`text-ink-700 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search + sort */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by domain, URL, or summary…"
              className="verity-input pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ArrowUpDown size={13} className="text-sand-400" />
            <div className="flex gap-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    sort === opt.key
                      ? 'bg-verity-500 text-white'
                      : 'border border-[#ddd8ce] text-ink-700 hover:bg-sand-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* States */}
        {error && (
          <div className="verity-card p-6 text-center mb-8">
            <p className="text-sm text-score-low font-body">{error}</p>
            <button onClick={handleRefresh} className="mt-3 verity-btn-ghost text-xs">Try again</button>
          </div>
        )}

        {loading && !sources.length && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="verity-card p-5 animate-pulse">
                <div className="h-4 bg-sand-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-sand-200 rounded w-1/2 mb-5" />
                <div className="h-16 bg-sand-200 rounded mb-5" />
                <div className="flex justify-around">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="w-14 h-14 rounded-full bg-sand-200" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="verity-card p-12 text-center">
            <Globe2 size={32} className="text-sand-300 mx-auto mb-3" />
            <p className="font-display font-semibold text-ink-700 mb-1">
              {query ? 'No sources match your search.' : 'No sources yet.'}
            </p>
            <p className="text-sm text-sand-400 font-body">
              {query ? 'Try a different search term.' : 'Be the first to submit a source for evaluation.'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((source, i) => (
              <SourceCard key={source.source_id} source={source} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// fallback icon inline to avoid extra import
function Globe2({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
