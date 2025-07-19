"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, GitBranch, RefreshCw, Activity, Layers } from "lucide-react"
import type { SystemInfo, SidechainAndMainchainStatus } from "@/types/rpc"

interface NodeInfoProps {
  chainInfo: SystemInfo | null
  nodeVersion: string | null
  sidechainAndMainchainStatus: SidechainAndMainchainStatus | null
  lastUpdate: Date | null
  onRefresh: () => void
  isLoading: boolean
}

export function NodeInfo({ chainInfo, nodeVersion, sidechainAndMainchainStatus, lastUpdate, onRefresh, isLoading }: NodeInfoProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toUTCString()
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-purple-500" />
          Node Information
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">Updated: {lastUpdate.toLocaleTimeString()}</span>
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
      <CardContent className="space-y-6">
        {/* Basic Node Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Network</span>
            </div>
            <div>
              <div className="text-xl font-bold">{chainInfo?.chain || "Loading..."}</div>
              <div className="text-sm text-muted-foreground">Chain Network</div>
            </div>
          </div>

          <div className="space-y-3">
            <div style={{ marginLeft: '-40px' }}>
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium">Version</span>
            </div>
            <div style={{ marginLeft: '-60px' }}>
              <Badge variant="outline" className="font-mono">
                {nodeVersion || "Unknown"}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Node Version</div>
            </div>
          </div>
        </div>

        {/* Sidechain and Mainchain Status */}
        {sidechainAndMainchainStatus && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Chain Status</span>
            </div>

            {/* Sidechain */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Sidechain</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-orange-600">{sidechainAndMainchainStatus.sidechain.epoch}</div>
                  <div className="text-xs text-muted-foreground">Current Epoch</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-blue-600">{sidechainAndMainchainStatus.sidechain.slot}</div>
                  <div className="text-xs text-muted-foreground">Current Slot</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-mono text-green-600">
                    {formatTimestamp(sidechainAndMainchainStatus.sidechain.nextEpochTimestamp)}
                  </div>
                  <div className="text-xs text-muted-foreground">Next Epoch</div>
                </div>
              </div>
            </div>

            {/* Mainchain */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Mainchain</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-purple-600">{sidechainAndMainchainStatus.mainchain.epoch}</div>
                  <div className="text-xs text-muted-foreground">Current Epoch</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold text-indigo-600">{sidechainAndMainchainStatus.mainchain.slot}</div>
                  <div className="text-xs text-muted-foreground">Current Slot</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-mono text-green-600">
                    {formatTimestamp(sidechainAndMainchainStatus.mainchain.nextEpochTimestamp)}
                  </div>
                  <div className="text-xs text-muted-foreground">Next Epoch</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
