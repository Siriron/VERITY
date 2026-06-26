import { useState, useEffect, useCallback } from 'react'

export function useWallet() {
  const [account, setAccount]     = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => { if (accounts[0]) setAccount(accounts[0]) })
    const handler = (accounts: string[]) => setAccount(accounts[0] || null)
    window.ethereum.on('accountsChanged', handler)
    return () => window.ethereum?.removeListener('accountsChanged', handler)
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
    } catch (e: any) {
      setError(e?.message || 'Connection failed.')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => setAccount(null), [])

  return { account, connecting, error, connect, disconnect }
}
