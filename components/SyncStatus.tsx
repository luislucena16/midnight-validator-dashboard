"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderSyncIcon as Sync, Database, CheckCircle, Activity } from "lucide-react"
import type { SyncState, ChainStatus, BlockHeader } from "@/types/rpc"

interface SyncStatusProps {
  syncState: SyncState | null
  chainStatus: ChainStatus | null
  latestHeader: BlockHeader | null
  finalizedHeader: BlockHeader | null
  isLoading: boolean
}

export function SyncStatus({ syncState, chainStatus, latestHeader, finalizedHeader, isLoading }: SyncStatusProps) {
  const getSyncProgress = () => {
    if (!syncState) return 100
    const { startingBlock, currentBlock, highestBlock } = syncState
    if (highestBlock <= startingBlock) return 100
    return Math.round(((currentBlock - startingBlock) / (highestBlock - startingBlock)) * 100)
  }

  const getSyncStatus = () => {
    if (!chainStatus) return { status: "Unknown", color: "secondary" }
    if (chainStatus.isSyncing) return { status: "Syncing", color: "yellow" }
    return { status: "Synced", color: "green" }
  }

  const syncProgress = getSyncProgress()
  const syncStatus = getSyncStatus()
  const latestBlockNumber = latestHeader?.number ? Number.parseInt(latestHeader.number, 16) : 0
  const finalizedBlockNumber = finalizedHeader?.number ? Number.parseInt(finalizedHeader.number, 16) : 0
  const blockGap = latestBlockNumber - finalizedBlockNumber

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sync className="h-5 w-5 text-green-500" />
          Blockchain Synchronization
          <Badge variant={syncStatus.color as any}>{syncStatus.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sync Progress */}
        {chainStatus?.isSyncing && syncState && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Sync Progress</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{syncState.startingBlock.toLocaleString()}</div>
                <div className="text-muted-foreground">Starting Block</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{syncState.currentBlock.toLocaleString()}</div>
                <div className="text-muted-foreground">Current Block</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{syncState.highestBlock.toLocaleString()}</div>
                <div className="text-muted-foreground">Target Block</div>
              </div>
            </div>
          </div>
        )}

        {/* Block Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Latest Block */}
          <div className="text-center space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">#{latestBlockNumber.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Latest Block</div>
              {latestHeader?.parentHash && (
                <code className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded block border">
                  {latestHeader.parentHash.slice(0, 16)}...{latestHeader.parentHash.slice(-8)}
                </code>
              )}
            </div>
          </div>

          {/* Finalized Block */}
          <div className="text-center space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">#{finalizedBlockNumber.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Finalized Block</div>
              {finalizedHeader?.parentHash && (
                <code className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded block border">
                  {finalizedHeader.parentHash.slice(0, 16)}...{finalizedHeader.parentHash.slice(-8)}
                </code>
              )}
            </div>
          </div>

          {/* Block Gap */}
          <div className="text-center space-y-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-center">
              <Activity className="h-6 w-6 text-orange-500" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-600">{blockGap}</div>
              <div className="text-sm text-muted-foreground">Blocks Behind</div>
              <Badge variant={blockGap <= 2 ? "default" : "destructive"} className="text-xs">
                {blockGap <= 2 ? "Normal" : "Lagging"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Sync Summary */}
        <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{syncProgress}%</div>
              <div className="text-sm text-muted-foreground">Synchronization Complete</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{chainStatus?.peers || 0}</div>
              <div className="text-sm text-muted-foreground">Connected Peers</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
