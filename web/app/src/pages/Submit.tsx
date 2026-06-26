// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AlertCircle, CheckCircle, Info, Wallet, LogOut } from 'lucide-react'
import { submitSource } from '../lib/genlayer'
import { useWallet } from '../hooks/useWallet'

type Step = 'form' | 'submitting' | 'success' | 'error'

export default function Submit() {
  const { account, connecting, error: walletError, connect, disconnect } = useWallet()
  const [url, setUrl]         = useState('')
  const [domain, setDomain]   = useState('')
  const [step, setStep]       = useState<Step>('form')
  const [status, setStatus]   = useState('')
  const [errMsg, setErrMsg]   = useState('')

  const isValidUrl = (s: string) => {
    try { new URL(s); return true } catch { return false }
  }

  const canSubmit = !!account && isValidUrl(url) && domain.trim().length > 0

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
    setStatus('')
    try {
      await submitSource(url.trim(), domain.trim(), setStatus)
      setStep('success')
    } catch (e: any) {
      setErrMsg(e?.message || 'Transaction failed.')
      setStep('error')
    }
  }

  const reset = () => {
    setUrl(''); setDomain('')
    setStatus(''); setErrMsg(''); setStep('form')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-5">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <p className="text-xs font-mono text-verity-500 uppercase tracking-widest mb-2">Protocol Write</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink-900 mb-2">Submit a Source</h1>
          <p className="text-sm text-sand-400 font-body leading-relaxed">
            GenLayer validators will fetch the URL live and reach LLM consensus on its
            credibility, bias, and reliability. The result is minted immutably on Bradbury.
          </p>
        </motion.div>

        {/* Wallet bar */}
        <div className="verity-card px-5 py-4 flex items-center justify-between mb-5">
          {account ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-mono text-ink-800">{account.slice(0,6)}…{account.slice(-4)}</span>
                <span className="text-xs text-sand-400">· Bradbury</span>
              </div>
              <button onClick={disconnect} className="flex items-center gap-1.5 text-xs text-sand-400 hover:text-ink-700 transition-colors">
                <LogOut size={13} /> Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-sand-400" />
                <span className="text-sm text-sand-400 font-body">No wallet connected</span>
              </div>
              <button onClick={connect} disabled={connecting}
                className="verity-btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <Wallet size={13} />
                {connecting ? 'Connecting…' : 'Connect MetaMask'}
              </button>
            </div>
          )}
        </div>

        {walletError && <p className="text-xs text-score-low mb-4 font-body px-1">{walletError}</p>}

        <AnimatePresence mode="wait">

          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="verity-card p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1.5 font-body">
                    Source URL <span className="text-score-low">*</span>
                  </label>
                  <input type="url" value={url}
                    onChange={(e) => { setUrl(e.target.value); autoDomain(e.target.value) }}
                    placeholder="https://example.com/article" className="verity-input" />
                  {url && !isValidUrl(url) && (
                    <p className="text-xs text-score-low mt-1.5 font-body">Enter a valid URL including https://</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1.5 font-body">
                    Domain Name <span className="text-score-low">*</span>
                  </label>
                  <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com" className="verity-input" />
                  <p className="text-xs text-sand-400 mt-1 font-body">Auto-filled from URL — edit if needed</p>
                </div>
                <button onClick={account ? handleSubmit : connect}
                  disabled={account ? !canSubmit : connecting}
                  className={`verity-btn-primary flex items-center justify-center gap-2 py-3 text-base mt-1 ${(account ? !canSubmit : connecting) ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {account
                    ? <><Send size={15} /> Submit for Evaluation</>
                    : <><Wallet size={15} /> Connect MetaMask to Submit</>}
                </button>
              </div>

              <div className="mt-4 verity-card p-4 flex items-start gap-3">
                <Info size={14} className="text-verity-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-sand-500 font-body leading-relaxed">
                  Connect MetaMask and add Bradbury (ChainID 4221, RPC: rpc-bradbury.genlayer.com).
                  Fund your account at{' '}
                  <a href="https://faucet.genlayer.com" target="_blank" rel="noopener noreferrer"
                     className="text-verity-500 hover:underline">faucet.genlayer.com</a>.
                  Scores appear once consensus is reached (~1–3 min).
                </p>
              </div>
            </motion.div>
          )}

          {step === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="verity-card p-10 text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-verity-100" />
                <div className="absolute inset-0 rounded-full border-2 border-verity-500 border-t-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full bg-verity-50 flex items-center justify-center">
                  <Send size={14} className="text-verity-500" />
                </div>
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-lg mb-2">Submitting to Bradbury</h3>
              <p className="text-sm text-sand-400 font-body">{status || 'Confirm the transaction in MetaMask…'}</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="verity-card p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-xl mb-2">Source Recorded On-Chain</h3>
              <p className="text-sm text-sand-400 font-body mb-6 leading-relaxed">
                Validators have reached consensus. The scores are now minted on Bradbury and
                will appear in the registry shortly.
              </p>
              <button onClick={reset} className="verity-btn-ghost text-sm">Submit Another</button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="verity-card p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={24} className="text-score-low" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-xl mb-2">Submission Failed</h3>
              <p className="text-sm text-sand-400 font-body mb-2">{errMsg}</p>
              <p className="text-xs text-sand-400 font-body mb-6">
                Fund your Bradbury account at{' '}
                <a href="https://faucet.genlayer.com" target="_blank" rel="noopener noreferrer"
                   className="text-verity-500 hover:underline">faucet.genlayer.com</a>.
              </p>
              <button onClick={() => setStep('form')} className="verity-btn-primary text-sm">Try Again</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
