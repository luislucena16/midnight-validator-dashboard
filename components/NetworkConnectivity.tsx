"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, Users, Copy, Globe, Activity } from "lucide-react"
import type { Peer } from "@/types/rpc"

interface NetworkConnectivityProps {
  peers: Peer[]
  peerCount: number
  localPeerId: string | null
  isLoading: boolean
}

export function NetworkConnectivity({ peers, peerCount, localPeerId, isLoading }: NetworkConnectivityProps) {
  const getConnectionStatus = () => {
    if (peerCount === 0) return { status: "Disconnected", color: "destructive" }
    if (peerCount < 3) return { status: "Poor", color: "yellow" }
    if (peerCount < 8) return { status: "Good", color: "blue" }
    return { status: "Excellent", color: "green" }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-blue-500" />
          Network Connectivity
          <Badge variant={connectionStatus.color as any}>{connectionStatus.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-600">{peerCount}</div>
            <div className="text-sm text-muted-foreground">Connected Peers</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-green-600">{peers.filter((p) => p.roles === "FULL").length}</div>
            <div className="text-sm text-muted-foreground">Full Nodes</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-purple-600">
              {peers.filter((p) => p.roles === "AUTHORITY").length}
            </div>
            <div className="text-sm text-muted-foreground">Validators</div>
          </div>
        </div>

        {/* Local Peer ID */}
        {localPeerId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Local Peer ID</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="text-sm font-mono flex-1 break-all">{localPeerId}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(localPeerId)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Connected Peers List */}
        {peers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="font-medium">Connected Peers</span>
              <Badge variant="secondary">{peers.length}</Badge>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {peers.slice(0, 10).map((peer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {peer.roles || "UNKNOWN"}
                    </Badge>
                    <div>
                      <code className="text-xs font-mono">
                        {peer.peerId?.slice(0, 12)}...{peer.peerId?.slice(-8)}
                      </code>
                      <div className="text-xs text-muted-foreground">Block #{peer.bestNumber || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              ))}
              {peers.length > 10 && (
                <div className="text-center py-2">
                  <Badge variant="secondary">+{peers.length - 10} more peers</Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
