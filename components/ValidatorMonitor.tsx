"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Search,
  Clock,
  Key,
  Activity,
  Database,
  Users,
  Cpu,
  HardDrive,
  MemoryStick,
  CheckCircle,
  AlertCircle,
  Copy,
  Settings,
} from "lucide-react"
import { useRPC } from "@/hooks/useRPC"

function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }
  return { copied, copy }
}

export function ValidatorMonitor() {
  const { call, isLoading } = useRPC()
  const [validatorData, setValidatorData] = useState<{
    isRegistered: boolean
    uptime: number
    startTime: Date | null
    blocksProduced: number | string
    runtime: number
    performance: number
    status: string
    nodeKey: string | null
    sessionKeys: string[]
    memoryGB: number | null
    memoryUsedPercent?: number | null
    cpuUsedPercent?: number | null
    diskUsedGB?: number | null
    diskUsedPercent?: number | null
    connectedPeers: number | null
  } | null>(null)
  const [connectedPeers, setConnectedPeers] = useState<number | null>(null)
  const copyHookValidatorMonitor = useCopyToClipboard()

  useEffect(() => {
    // Fetch connected peers from system_health
    const fetchPeers = async () => {
      try {
        const health = await call("system_health")
        setConnectedPeers(health?.peers ?? 0)
      } catch (err) {
        setConnectedPeers(0)
      }
    }
    fetchPeers()
    const interval = setInterval(fetchPeers, 30000)
    return () => clearInterval(interval)
  }, [call])

  const searchValidator = async () => {
    try {
      const [blocksProduced, uptime, status, startTime, runtime, memory, cpu, disk, nodeKey, connectedPeers] = await Promise.all([
        fetchBlocksProduced(),
        fetchUptime(),
        fetchStatus(),
        fetchStartTime(),
        fetchRuntime(),
        fetchMemory(),
        fetchCpu(),
        fetchDisk(),
        fetchNodeKey(),
        fetchConnectedPeers(),
      ])
      console.log("[ValidatorMonitor] blocksProduced:", blocksProduced)
      console.log("[ValidatorMonitor] uptime:", uptime)
      console.log("[ValidatorMonitor] status:", status)
      console.log("[ValidatorMonitor] /api/start-time response:", startTime)
      console.log("[ValidatorMonitor] /api/runtime response:", runtime)
      console.log("[ValidatorMonitor] /api/memory response:", memory)
      console.log("[ValidatorMonitor] /api/cpu response:", cpu)
      console.log("[ValidatorMonitor] /api/disk response:", disk)
      console.log("[ValidatorMonitor] /api/node-key response:", nodeKey)
      console.log("[ValidatorMonitor] /api/connected-peers response:", connectedPeers)
      setValidatorData({
        isRegistered: true,
        uptime: typeof uptime === "number" ? uptime : 0,
        startTime: (startTime && startTime.startTimeISO) ? startTime.startTimeISO : null,
        blocksProduced: typeof blocksProduced === "number" ? blocksProduced : 0,
        runtime: (runtime && typeof runtime.runtime === "number") ? runtime.runtime : 0,
        memoryGB: (memory && typeof memory.memTotalGB === "number") ? memory.memTotalGB : null,
        memoryUsedPercent: (memory && typeof memory.memUsedPercent === "number") ? memory.memUsedPercent : null,
        cpuUsedPercent: (cpu && typeof cpu.usedPercent === "number") ? cpu.usedPercent : null,
        diskUsedGB: (disk && typeof disk.usedGB === "number") ? disk.usedGB : null,
        diskUsedPercent: (disk && typeof disk.usedPercent === "number") ? disk.usedPercent : null,
        connectedPeers: (connectedPeers && typeof connectedPeers.peers === "number") ? connectedPeers.peers : null,
        performance: 0,
        status: status || "N/A",
        nodeKey: (nodeKey && typeof nodeKey.nodeKey === "string") ? nodeKey.nodeKey : null,
        sessionKeys: [],
      })
    } catch (error) {
      console.error("Failed to fetch validator data:", error)
      setValidatorData({
        isRegistered: true,
        uptime: 0,
        startTime: null,
        blocksProduced: 0,
        runtime: 0,
        memoryGB: null,
        memoryUsedPercent: null,
        cpuUsedPercent: null,
        diskUsedGB: null,
        diskUsedPercent: null,
        connectedPeers: null,
        performance: 0,
        status: "N/A",
        nodeKey: null,
        sessionKeys: [],
      })
    }
  }

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      alert("Error while copying")
    }
  }

  async function fetchBlocksProduced() {
    try {
      const res = await fetch("/api/blocks-produced")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/blocks-produced response:", data)
      if (typeof data.blocksProduced === "number") {
        return data.blocksProduced
      }
      return null
    } catch (err) {
      console.error("Error fetching blocks produced:", err)
      return null
    }
  }

  async function fetchUptime() {
    try {
      const res = await fetch("/api/uptime")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/uptime response:", data)
      if (typeof data.uptimePercent === "number") {
        return data.uptimePercent
      }
      return null
    } catch (err) {
      console.error("Error fetching uptime:", err)
      return null
    }
  }

  async function fetchStatus() {
    try {
      const res = await fetch("/api/status")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/status response:", data)
      if (typeof data.status === "string") {
        return data.status
      }
      return data
    } catch (err) {
      console.error("Error fetching status:", err)
      return "N/A"
    }
  }

  async function fetchStartTime() {
    try {
      const res = await fetch("/api/start-time")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/start-time response:", data)
      return data
    } catch (err) {
      console.error("Error fetching start time:", err)
      return null
    }
  }

  async function fetchRuntime() {
    try {
      const res = await fetch("/api/runtime")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/runtime response:", data)
      return data
    } catch (err) {
      console.error("Error fetching runtime:", err)
      return null
    }
  }

  async function fetchMemory() {
    try {
      const res = await fetch("/api/memory")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/memory response:", data)
      return data
    } catch (err) {
      console.error("Error fetching memory:", err)
      return null
    }
  }

  async function fetchCpu() {
    try {
      const res = await fetch("/api/cpu")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/cpu response:", data)
      return data
    } catch (err) {
      console.error("Error fetching CPU:", err)
      return null
    }
  }

  async function fetchDisk() {
    try {
      const res = await fetch("/api/disk")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/disk response:", data)
      return data
    } catch (err) {
      console.error("Error fetching disk:", err)
      return null
    }
  }

  async function fetchNodeKey() {
    try {
      const res = await fetch("/api/node-key")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/node-key response:", data)
      return data
    } catch (err) {
      console.error("Error fetching node key:", err)
      return null
    }
  }

  async function fetchConnectedPeers() {
    try {
      const res = await fetch("/api/connected-peers")
      const data = await res.json()
      console.log("[ValidatorMonitor] /api/connected-peers response:", data)
      return data
    } catch (err) {
      console.error("Error fetching connected peers:", err)
      return null
    }
  }

  // Ejecuta la búsqueda automáticamente al montar el componente y cada 30 segundos
  useEffect(() => {
    searchValidator();
    const interval = setInterval(searchValidator, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          Validator Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monitor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monitor">Monitor Validator</TabsTrigger>
            <TabsTrigger value="local-setup">Local Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            {/* Validator Results */}
            {validatorData && (
              <div className="space-y-6">
                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      {validatorData.isRegistered ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {validatorData.isRegistered ? "Registered" : "Not Registered"}
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">{validatorData.uptime}%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{validatorData.blocksProduced}</div>
                    <div className="text-sm text-muted-foreground">Blocks Produced</div>
                  </div>

                  <div className="text-center space-y-2">
                    <Badge variant={validatorData.status === "Synced" ? "default" : "secondary"}>
                      {validatorData.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                </div>

                <Separator />

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <Card className="border-0 bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Performance</span>
                          <span>{validatorData.performance}%</span>
                        </div>
                        <Progress value={validatorData.performance} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Start Time</span>
                          <div className="font-mono text-xs">{validatorData.startTime ? new Date(validatorData.startTime).toLocaleString() : "N/A"}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Runtime</span>
                          <div className="font-mono text-xs">
                            {typeof validatorData.runtime === "number" ? validatorData.runtime : "N/A"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Resources */}
                  <Card className="border-0 bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-orange-500" />
                        System Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">CPU Usage</span>
                          </div>
                          <span className="text-sm font-medium">
                            {validatorData.cpuUsedPercent !== null && validatorData.cpuUsedPercent !== undefined
                              ? `${validatorData.cpuUsedPercent.toFixed(2)}%`
                              : "N/A"}
                          </span>
                        </div>
                        <Progress value={validatorData.cpuUsedPercent ?? 0} className="h-1" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MemoryStick className="h-3 w-3 text-green-500" />
                            <span className="text-sm">Memory</span>
                          </div>
                          <span className="text-sm font-medium">
                            {validatorData.memoryGB !== null && validatorData.memoryUsedPercent !== null && validatorData.memoryUsedPercent !== undefined
                              ? `${validatorData.memoryGB.toFixed(2)} GB (${validatorData.memoryUsedPercent.toFixed(2)}%)`
                              : "N/A"}
                          </span>
                        </div>
                        <Progress value={validatorData.memoryUsedPercent ?? 0} className="h-1" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-3 w-3 text-purple-500" />
                            <span className="text-sm">Disk Usage</span>
                          </div>
                          <span className="text-sm font-medium">
                            {validatorData.diskUsedGB !== null && validatorData.diskUsedGB !== undefined && validatorData.diskUsedPercent !== null && validatorData.diskUsedPercent !== undefined
                              ? `${validatorData.diskUsedGB.toFixed(2)} GB (${validatorData.diskUsedPercent.toFixed(2)}%)`
                              : "N/A"}
                          </span>
                        </div>
                        <Progress value={validatorData.diskUsedPercent ?? 0} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Validator Keys */}
                <Card className="border-0 bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-500" />
                      Validator Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">Node Key</div>
                          <code className="text-xs text-muted-foreground font-mono break-all">
                            {validatorData.nodeKey || "N/A"}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                          <div className="relative flex flex-col items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyHookValidatorMonitor.copy(validatorData.nodeKey || "N/A")}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {copyHookValidatorMonitor.copied && (
                              <span className="absolute top-full mt-1 text-xs text-green-600 bg-white px-2 py-1 rounded shadow z-10">
                                Copied!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {validatorData.sessionKeys.map((key, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">Session Key #{index + 1}</div>
                            <code className="text-xs text-muted-foreground font-mono break-all">{key}</code>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge variant="outline" className="text-xs">
                              Registered
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Network Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-0 bg-muted/50 text-center p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{validatorData.connectedPeers !== null && validatorData.connectedPeers !== undefined ? validatorData.connectedPeers : "-"}</div>
                    <div className="text-sm text-muted-foreground">Connected Peers</div>
                  </Card>

                  <Card className="border-0 bg-muted/50 text-center p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Database className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {validatorData.status !== undefined && validatorData.status !== null
                        ? (
                          <span className={validatorData.status === "Synced" ? "text-green-600" : "text-orange-600"}>
                            {validatorData.status}
                          </span>
                        )
                        : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </Card>

                  <Card className="border-0 bg-muted/50 text-center p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">2.3s</div>
                    <div className="text-sm text-muted-foreground">Avg Block Time</div>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="local-setup" className="space-y-6">
            {/* Local Setup Instructions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold">Local Node Setup</h3>
                <Badge variant="secondary" className="font-mono text-xs">
                  127.0.0.1:9944
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Use these commands to interact with your local Midnight validator node:
              </p>

              {/* Quick Commands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-0 bg-blue-50 dark:bg-blue-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Key className="h-4 w-4 text-blue-500" />
                      Check Your Validator Key
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-black text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                      <pre>{`curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"author_hasKey","params":["${validatorData?.nodeKey || ""}", "aura"],"id":1}' | jq .`}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST http://127.0.0.1:9944 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"author_hasKey","params":["${validatorData?.nodeKey || ""}", "aura"],"id":1}' | jq .`,
                        )
                      }
                      className="w-full"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Command
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-green-50 dark:bg-green-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      Check Node Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-black text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                      <pre>{`curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"system_nodeRoles","params":[],"id":1}' | jq .`}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST http://127.0.0.1:9944 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"system_nodeRoles","params":[],"id":1}' | jq .`,
                        )
                      }
                      className="w-full"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Command
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
