import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AlertCircle, CheckCircle, ExternalLink, Info } from 'lucide-react'
import { submitSource, BRADBURY_EXPLORER } from '../lib/genlayer'

type Step = 'form' | 'submitting' | 'success' | 'error'

export default function Submit() {
  const [url, setUrl]       = useState('')
  const [domain, setDomain] = useState('')
  const [step, setStep]     = useState<Step>('form')
  const [txHash, setTxHash] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const isValidUrl = (s: string) => {
    try { new URL(s); return true } catch { return false }
  }

  const canSubmit = isValidUrl(url) && domain.trim().length > 0

  const autoDomain = (raw: string) => {
    try {
      const host = new URL(raw).hostname.replace(/^www\./, '')
      if (!domain) setDomain(host)
    } catch {}
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setStep('submitting')
    setErrMsg('')
    try {
      const hash = await submitSource(url.trim(), domain.trim())
      setTxHash(hash)
      setStep('success')
    } catch (e: any) {
      setErrMsg(
        e?.message || 'Transaction failed. Make sure your address is funded on Bradbury.'
      )
      setStep('error')
    }
  }

  const reset = () => {
    setUrl(''); setDomain('')
    setTxHash(''); setErrMsg(''); setStep('form')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-5">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-xs font-mono text-verity-500 uppercase tracking-widest mb-2">Protocol Write</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink-900 mb-2">Submit a Source</h1>
          <p className="text-sm text-sand-400 font-body leading-relaxed">
            GenLayer validators will fetch the URL live and reach LLM consensus on its
            credibility, bias, and reliability. The result is minted immutably on Bradbury.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* FORM */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="verity-card p-6 flex flex-col gap-5">

                {/* URL */}
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1.5 font-body">
                    Source URL <span className="text-score-low">*</span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); autoDomain(e.target.value) }}
                    placeholder="https://example.com/article"
                    className="verity-input"
                  />
                  {url && !isValidUrl(url) && (
                    <p className="text-xs text-score-low mt-1.5 font-body">Enter a valid URL including https://</p>
                  )}
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1.5 font-body">
                    Domain Name <span className="text-score-low">*</span>
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="verity-input"
                  />
                  <p className="text-xs text-sand-400 mt-1 font-body">Auto-filled from URL — edit if needed</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`verity-btn-primary flex items-center justify-center gap-2 py-3 text-base mt-1 ${
                    !canSubmit ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={15} />
                  Submit for Evaluation
                </button>
              </div>

              <div className="mt-4 verity-card p-4 flex items-start gap-3">
                <Info size={14} className="text-verity-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-sand-500 font-body leading-relaxed">
                  After submission, your transaction enters GenLayer's consensus pipeline
                  (Committing → Accepted → Finalized). Scores appear in the registry once
                  Accepted — typically within a few minutes. Connect your wallet via{' '}
                  <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer"
                     className="text-verity-500 hover:underline">studio.genlayer.com</a>
                  {' '}and fund it at{' '}
                  <a href="https://faucet.genlayer.com" target="_blank" rel="noopener noreferrer"
                     className="text-verity-500 hover:underline">faucet.genlayer.com</a>.
                </p>
              </div>
            </motion.div>
          )}

          {/* SUBMITTING */}
          {step === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="verity-card p-10 text-center"
            >
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-verity-100" />
                <div className="absolute inset-0 rounded-full border-2 border-verity-500 border-t-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full bg-verity-50 flex items-center justify-center">
                  <Send size={14} className="text-verity-500" />
                </div>
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-lg mb-2">Submitting to Bradbury</h3>
              <p className="text-sm text-sand-400 font-body">Broadcasting your transaction to the network…</p>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="verity-card p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-xl mb-2">Transaction Submitted</h3>
              <p className="text-sm text-sand-400 font-body mb-6 leading-relaxed">
                Your source is entering GenLayer's consensus pipeline.
                Validators are evaluating it now. Scores will appear in the
                registry once the transaction is Accepted.
              </p>
              {txHash && (
                <a
                  href={`${BRADBURY_EXPLORER}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#ddd8ce]
                             text-sm text-ink-700 hover:bg-sand-200 transition-colors font-mono mb-6"
                >
                  {txHash.slice(0, 18)}…
                  <ExternalLink size={13} />
                </a>
              )}
              <button onClick={reset} className="verity-btn-ghost text-sm">
                Submit Another
              </button>
            </motion.div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="verity-card p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={24} className="text-score-low" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-xl mb-2">Submission Failed</h3>
              <p className="text-sm text-sand-400 font-body mb-2">{errMsg}</p>
              <p className="text-xs text-sand-400 font-body mb-6">
                Fund your address at{' '}
                <a href="https://faucet.genlayer.com" target="_blank" rel="noopener noreferrer"
                   className="text-verity-500 hover:underline">faucet.genlayer.com</a>.
              </p>
              <button onClick={() => setStep('form')} className="verity-btn-primary text-sm">
                Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
