export interface ConfirmKill {
  id: string
  kill: number
  timestamp: string
}

export interface PointList {
  [key: string]: ConfirmKill
}

export interface UserNFT {
  address: string
  chainId: string
  metadata: string
  tokenAddress: string
  tokenId: number
}