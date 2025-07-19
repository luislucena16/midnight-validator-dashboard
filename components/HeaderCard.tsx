"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Activity, Database, GitBranch, Clock, RefreshCw } from "lucide-react"
import type { SystemInfo, ChainStatus, BlockHeader } from "@/types/rpc"
import { Button } from "@/components/ui/button"

interface HeaderCardProps {
  chainInfo: SystemInfo | null
  chainStatus: ChainStatus | null
  latestHeader: BlockHeader | null
  finalizedHead: BlockHeader | null
  isLoading: boolean
  lastUpdate: Date | null
  onRefresh: () => void
}

export function HeaderCard({
  chainInfo,
  chainStatus,
  latestHeader,
  finalizedHead,
  isLoading,
  lastUpdate,
  onRefresh,
}: HeaderCardProps) {
  const getStatusColor = (status: ChainStatus | null) => {
    if (!status) return "secondary"
    return status.isSyncing ? "yellow" : "green"
  }

  const getStatusText = (status: ChainStatus | null) => {
    if (!status) return "Unknown"
    return status.isSyncing ? "Syncing" : "Synced"
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-500" />
          Midnight Node Monitor
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">Last update: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Network Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Network</span>
            </div>
            <div className="text-2xl font-bold">{chainInfo?.chain || "Loading..."}</div>
            <div className="text-sm text-muted-foreground">Version: {chainInfo?.version || "Unknown"}</div>
          </div>

          <Separator orientation="vertical" className="hidden lg:block" />

          {/* Node Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <span className="font-medium">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(chainStatus) as any} className="text-sm">
                {getStatusText(chainStatus)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Peers: {chainStatus?.peers || 0}</div>
          </div>

          <Separator orientation="vertical" className="hidden lg:block" />

          {/* Latest Block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Latest Block</span>
            </div>
            <div className="text-2xl font-bold">
              {latestHeader?.number ? parseInt(latestHeader.number, 16) : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground font-mono">{latestHeader?.parentHash?.slice(0, 10)}...</div>
          </div>

          <Separator orientation="vertical" className="hidden lg:block" />

          {/* Finalized Block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Finalized</span>
            </div>
            <div className="text-2xl font-bold">
              {finalizedHead?.number ? parseInt(finalizedHead.number, 16) : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground font-mono">{finalizedHead?.parentHash?.slice(0, 10)}...</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
