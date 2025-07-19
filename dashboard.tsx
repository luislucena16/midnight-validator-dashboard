"use client"

import { NodeInfo } from "./components/NodeInfo"
import { SyncStatus } from "./components/SyncStatus"
import { ValidatorMonitor } from "./components/ValidatorMonitor"
import { BlockExplorer } from "./components/BlockExplorer"
import { MethodsPanel } from "./components/MethodsPanel"
import { LocalEndpointsSetup } from "./components/LocalEndpointsSetup"
import { useNodeData } from "./hooks/useNodeData"

export default function MidnightDashboard() {
  const {
    chainInfo,
    nodeVersion,
    localPeerId,
    peers,
    peerCount,
    latestHeader,
    finalizedHeader,
    syncState,
    chainStatus,
    sidechainAndMainchainStatus,
    methods,
    isLoading,
    lastUpdate,
    refresh,
    healthPeers,
  } = useNodeData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Midnight Node Monitor
          </h1>
          <p className="text-muted-foreground">Professional node monitoring dashboard for Midnight blockchain</p>
        </div>

        {/* Interactive Tools Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Interactive Tools</h2>
            <p className="text-sm text-muted-foreground">Monitor validators and explore blockchain data</p>
          </div>

          {/* Validator Monitor */}
          <ValidatorMonitor />

          {/* Block Explorer */}
          <BlockExplorer />
        </div>

        {/* Local Development Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Local Development</h2>
            <p className="text-sm text-muted-foreground">Setup and interact with your local Midnight node</p>
          </div>

          {/* Local Endpoints Setup */}
          <LocalEndpointsSetup />
        </div>

        {/* Node Status Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Network Status</h2>
            <p className="text-sm text-muted-foreground">Real-time information about your Midnight node</p>
          </div>

          {/* Node Information */}
          <NodeInfo
            chainInfo={chainInfo}
            nodeVersion={nodeVersion}
            sidechainAndMainchainStatus={sidechainAndMainchainStatus}
            lastUpdate={lastUpdate}
            onRefresh={refresh}
            isLoading={isLoading}
          />

          {/* Sync Status */}
          <SyncStatus
            syncState={syncState}
            chainStatus={chainStatus}
            latestHeader={latestHeader}
            finalizedHeader={finalizedHeader}
            isLoading={isLoading}
            healthPeers={healthPeers}
          />
        </div>

        {/* Technical Information Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Technical Information</h2>
            <p className="text-sm text-muted-foreground">Available RPC methods and technical details</p>
          </div>

          {/* RPC Methods Panel */}
          <MethodsPanel methods={methods} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>
            Connected to <code className="bg-muted px-2 py-1 rounded text-xs">rpc.testnet-02.midnight.network</code>
          </p>
          <p className="mt-1">Auto-refreshes every 30 seconds • Professional Node Monitoring</p>
        </div>
      </div>
    </div>
  )
}
