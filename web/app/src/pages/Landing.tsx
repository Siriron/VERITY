import { motion } from 'framer-motion'
import { Shield, Globe, Cpu, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react'
import { BRADBURY_EXPLORER, CONTRACT_ADDRESS } from '../lib/genlayer'

interface LandingProps {
  onNavigate: (page: 'registry' | 'submit') => void
  totalSources: number
}

const HOW_IT_WORKS = [
  {
    step: 'Submit',
    title: 'Register a source URL',
    desc: 'Provide any public URL and its domain name. The protocol accepts news sites, research publications, blogs, and institutional sources.',
    icon: Globe,
  },
  {
    step: 'Validate',
    title: 'GenLayer validators fetch and reason',
    desc: 'Multiple validators independently fetch the live content and run LLM analysis. They reach consensus through the Equivalence Principle — no single point of trust.',
    icon: Cpu,
  },
  {
    step: 'Score',
    title: 'Three scores minted on-chain',
    desc: 'Credibility, Bias, and Reliability scores (0–100) are stored immutably on Bradbury. Every domain builds a permanent, auditable trust record.',
    icon: Shield,
  },
]

const WHY_FEATURES = [
  'No deterministic proxy exists for media bias — only LLM reasoning over live content can evaluate it',
  'Validators reach consensus through the Equivalence Principle, not exact byte matching',
  'Scores are immutable once finalized — no editorial changes, no takedowns',
  'Every evaluation is traceable on the Bradbury explorer',
]

export default function Landing({ onNavigate, totalSources }: LandingProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-5 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(#1e56a0 1px, transparent 1px),
              linear-gradient(90deg, #1e56a0 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Scan line on hero panel */}
        <div className="absolute left-1/2 -translate-x-1/2 top-24 w-[520px] h-[260px] rounded-2xl overflow-hidden opacity-10 pointer-events-none hidden md:block">
          <div className="scan-line" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-verity-200 bg-verity-50 text-verity-600 text-xs font-mono mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live on GenLayer Bradbury
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black text-5xl md:text-6xl text-ink-900 leading-[1.08] tracking-tight mb-6"
          >
            Every source
            <br />
            <span className="text-verity-500">deserves a verdict.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-sand-500 font-body leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Submit any URL. GenLayer validators fetch the live content and reach
            LLM consensus on credibility, bias, and reliability. The scores are
            minted immutably on-chain — no editors, no takedowns.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => onNavigate('submit')}
              className="verity-btn-primary flex items-center gap-2 text-base px-7 py-3"
            >
              Submit a Source <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('registry')}
              className="verity-btn-ghost flex items-center gap-2 text-base px-7 py-3"
            >
              Browse Registry
            </button>
          </motion.div>

          {/* Live stat */}
          {totalSources > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-xs text-sand-400 font-mono"
            >
              {totalSources} source{totalSources !== 1 ? 's' : ''} evaluated on-chain
            </motion.p>
          )}
        </div>
      </section>

      {/* Contract badge */}
      <section className="px-5 pb-16">
        <div className="max-w-xl mx-auto">
          <a
            href={`${BRADBURY_EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="verity-card flex items-center justify-between px-5 py-4 hover:border-verity-300 transition-colors group"
          >
            <div>
              <p className="text-xs text-sand-400 font-body mb-0.5">VERITYCore · Bradbury Testnet</p>
              <p className="text-sm font-mono text-ink-800">{CONTRACT_ADDRESS}</p>
            </div>
            <ExternalLink size={15} className="text-sand-400 group-hover:text-verity-500 transition-colors" />
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-20 border-t border-[#ddd8ce]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-mono text-verity-500 uppercase tracking-widest mb-3">Protocol</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-900">How VERITY works</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="verity-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-verity-50 border border-verity-100 flex items-center justify-center">
                    <item.icon size={17} className="text-verity-500" />
                  </div>
                  <span className="text-xs font-mono text-sand-400 uppercase tracking-widest">{item.step}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-ink-900 mb-2">{item.title}</h3>
                <p className="text-sm text-sand-500 font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why GenLayer */}
      <section className="px-5 py-20 bg-[#f7f4ef] border-t border-[#ddd8ce]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-mono text-verity-500 uppercase tracking-widest mb-3">Why GenLayer</p>
              <h2 className="font-display font-bold text-3xl text-ink-900 mb-4 leading-tight">
                Bias has no<br />deterministic proxy.
              </h2>
              <p className="text-sm text-sand-500 font-body leading-relaxed">
                You cannot evaluate a source's credibility with a formula. It requires
                reading the live content and reasoning about it — exactly what GenLayer's
                Intelligent Contracts enable through LLM consensus and the Equivalence Principle.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-3"
            >
              {WHY_FEATURES.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-verity-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-700 font-body leading-relaxed">{feat}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24 border-t border-[#ddd8ce]">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-900 mb-4">
              Put a source on record.
            </h2>
            <p className="text-sm text-sand-500 font-body mb-8 leading-relaxed">
              Submit any URL and let GenLayer validators evaluate it. The scores are permanent,
              public, and verifiable by anyone.
            </p>
            <button
              onClick={() => onNavigate('submit')}
              className="verity-btn-primary flex items-center gap-2 mx-auto text-base px-8 py-3"
            >
              Submit a Source <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
