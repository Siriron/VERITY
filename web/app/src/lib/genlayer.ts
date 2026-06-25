import { createClient, testnetBradbury } from 'genlayer-js'

export const CONTRACT_ADDRESS = '0xd1Dbf820eD19E7371EA72aB57a159263391A543C'
export const BRADBURY_EXPLORER = 'https://explorer-bradbury.genlayer.com'

export const client = createClient({ chain: testnetBradbury })

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
    const result = await client.readContract({
      address:      CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_all_sources',
      args:         [limit],
    })
    return JSON.parse(result as string) as SourceRecord[]
  } catch {
    return []
  }
}

export async function getSource(id: number): Promise<SourceRecord | null> {
  try {
    const result = await client.readContract({
      address:      CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_source',
      args:         [id],
    })
    const parsed = JSON.parse(result as string)
    if (parsed.error) return null
    return parsed as SourceRecord
  } catch {
    return null
  }
}

export async function getTotal(): Promise<number> {
  try {
    const result = await client.readContract({
      address:      CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_total',
      args:         [],
    })
    const parsed = JSON.parse(result as string)
    return parseInt(parsed.total || '0')
  } catch {
    return 0
  }
}

export async function submitSource(
  url: string,
  domain: string,
  senderAddress: string
): Promise<string> {
  const txClient = createClient({
    chain:   testnetBradbury,
    account: { address: senderAddress as `0x${string}` },
  })
  const hash = await txClient.writeContract({
    address:      CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'submit_source',
    args:         [url, domain],
  })
  return hash as string
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
