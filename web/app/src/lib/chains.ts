export const NETWORKS = {
  bradbury: {
    id:              'bradbury',
    name:            'Bradbury',
    chainId:         4221,
    rpcUrl:          'https://rpc-bradbury.genlayer.com',
    explorerUrl:     'https://explorer-bradbury.genlayer.com',
    contractAddress: '0xd1Dbf820eD19E7371EA72aB57a159263391A543C' as `0x${string}`,
  },
} as const

export type NetworkKey = keyof typeof NETWORKS
