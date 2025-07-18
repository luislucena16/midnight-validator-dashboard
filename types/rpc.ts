export interface RPCRequest {
  jsonrpc: string
  method: string
  params?: any[]
  id: number
}

export interface RPCResponse<T = any> {
  jsonrpc: string
  result?: T
  error?: {
    code: number
    message: string
  }
  id: number
}

export interface ChainStatus {
  isSyncing: boolean
  peers: number
  bestHash: string
  bestNumber: number
  finalizedHash: string
  finalizedNumber: number
}

export interface BlockHeader {
  parentHash: string
  number: string
  stateRoot: string
  extrinsicsRoot: string
  digest: {
    logs: any[]
  }
}

export interface Block {
  header: BlockHeader
  extrinsics: any[]
}

export interface AriadneParameters {
  epochLength: number
  slotDuration: number
  dParameter?: {
    numPermissionedCandidates: number
    numRegisteredCandidates: number
  }
  permissionedCandidates?: Array<{
    sidechainPublicKey: string
  }>
  candidateRegistrations?: Record<string, any>
  [key: string]: any
}

export interface SystemInfo {
  chain: string
  version: string
  nodeName: string
}

export interface Peer {
  peerId: string
  roles: string
  protocolVersion: number
  bestHash: string
  bestNumber: number
}

export interface SyncState {
  startingBlock: number
  currentBlock: number
  highestBlock: number
}

export interface SidechainStatus {
  sidechain: {
    epoch: number
    slot: number
    nextEpochTimestamp: number
  }
  mainchain: {
    epoch: number
    slot: number
    nextEpochTimestamp: number
  }
}

export interface ValidatorMetrics {
  publicKey: string
  uptime: number
  nodeKey: string
  startTime: number
  keys: string[]
  epoch: number
  blocksProduced: number
  latestBlock: number
  finalizedBlock: number
  syncStatus: string
  peerCount: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}
