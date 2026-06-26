// @ts-nocheck
import { createClient } from 'genlayer-js'
import { testnetBradbury } from 'genlayer-js/chains'
import { NETWORKS } from './chains'

export const CONTRACT_ADDRESS = NETWORKS.bradbury.contractAddress
export const BRADBURY_EXPLORER = 'https://explorer-bradbury.genlayer.com'

export function getReadClient() {
  return createClient({ chain: testnetBradbury })
}

export async function getWriteClient() {
  if (!window.ethereum) throw new Error('No wallet detected. Please install MetaMask.')
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return createClient({
    chain:   testnetBradbury,
    account: accounts[0],
  })
}

declare global {
  interface Window { ethereum?: any }
}

export interface SourceRecord {
  source_id:         string
  submitter:         string
  url:               string
  domain:            string
  credibility_score: string
  bias_score:        string
  reliability_score: string
  summary:           string
  status:            string
  created_at:        string
}

export async function getAllSources(limit = 100): Promise<SourceRecord[]> {
  try {
    const client = getReadClient()
    const result = await client.readContract({
      address:      CONTRACT_ADDRESS,
      functionName: 'get_all_sources',
      args:         [limit],
    })
    const parsed = typeof result === 'string' ? JSON.parse(result) : result
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function getTotal(): Promise<number> {
  try {
    const client = getReadClient()
    const result = await client.readContract({
      address:      CONTRACT_ADDRESS,
      functionName: 'get_total',
      args:         [],
    })
    const parsed = typeof result === 'string' ? JSON.parse(result) : result
    return parseInt(parsed?.total ?? '0')
  } catch {
    return 0
  }
}

export async function submitSource(
  url: string,
  domain: string,
  onStatus?: (msg: string) => void
): Promise<void> {
  const client = await getWriteClient()
  onStatus?.('Submitting transaction…')
  const txHash = await client.writeContract({
    address:      CONTRACT_ADDRESS,
    functionName: 'submit_source',
    args:         [url, domain],
    value:        BigInt(0),
  })
  onStatus?.('Waiting for validator consensus…')
  let receipt = null
  let attempts = 0
  while (attempts < 60) {
    await new Promise(r => setTimeout(r, 3000))
    try {
      receipt = await client.getTransactionReceipt({ hash: txHash })
      if (receipt) break
    } catch {
      // still pending
    }
    attempts++
  }
  if (!receipt) throw new Error('Transaction timed out waiting for consensus.')
  onStatus?.('Source recorded on-chain!')
}

export function scoreColor(score: string | number, type: 'credibility' | 'bias' | 'reliability'): string {
  const n = parseInt(String(score))
  if (type === 'bias') {
    if (n <= 25) return '#1a7a4a'
    if (n <= 60) return '#b85c0a'
    return '#a01e1e'
  }
  if (n >= 70) return '#1a7a4a'
  if (n >= 40) return '#b85c0a'
  return '#a01e1e'
}

export function scoreLabel(score: string | number, type: 'credibility' | 'bias' | 'reliability'): string {
  const n = parseInt(String(score))
  if (type === 'bias') {
    if (n <= 20) return 'Neutral'
    if (n <= 50) return 'Slight Bias'
    if (n <= 75) return 'Moderate Bias'
    return 'High Bias'
  }
  if (n >= 75) return 'High'
  if (n >= 45) return 'Moderate'
  return 'Low'
}

export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
