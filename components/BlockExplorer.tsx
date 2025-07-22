"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Hash, Database, Info, Users, UserCheck, Copy } from "lucide-react"
import type { Block, AriadneParameters } from "@/types/rpc"

function useCopyToClipboard(timeout = 2000) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const copy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), timeout)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }
  return { copiedIndex, copy }
}

export function BlockExplorer() {
  const [blockNumber, setBlockNumber] = useState("")
  const [blockData, setBlockData] = useState<{
    hash: string | null
    block: Block | null
    parameters: AriadneParameters | null
  }>({
    hash: null,
    block: null,
    parameters: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const copyHookBlockExplorer = useCopyToClipboard()

  const exploreBlock = async () => {
    if (!blockNumber) return
    setIsLoading(true)
    setBlockData({ hash: null, block: null, parameters: null })
    try {
      const blockNum = Number.parseInt(blockNumber)
      // Get block hash
      const hashRes = await fetch(`/api/block-hash?number=${blockNum}`)
      const hashJson = await hashRes.json()
      if (!hashRes.ok || !hashJson.hash) {
        console.error("[BlockExplorer] Error obteniendo hash:", hashJson)
        setIsLoading(false)
        return
      }
      const hash = hashJson.hash
      // Get block data and Ariadne parameters in parallel
      const [blockResp, parametersResp] = await Promise.all([
        fetch(`/api/block?hash=${hash}`),
        fetch(`/api/ariadne-parameters?number=${blockNum}`),
      ])
      const blockJson = await blockResp.json()
      const parametersJson = await parametersResp.json()
      setBlockData({
        hash,
        block: blockJson.block ?? null,
        parameters: parametersResp.ok ? parametersJson : null,
      })
    } catch (error) {
      console.error("[BlockExplorer] Error en exploreBlock:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Block Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter block number..."
            value={blockNumber}
            onChange={(e) => setBlockNumber(e.target.value)}
            className="flex-1"
          />
          <Button onClick={exploreBlock} disabled={isLoading || !blockNumber} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {isLoading ? "Loading..." : "Explore"}
          </Button>
        </div>

        {/* Block Results */}
        {blockData.hash && (
          <div className="space-y-4">
            {/* Block Hash */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Block Hash</span>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <code className="text-sm font-mono break-all">{blockData.hash}</code>
              </div>
            </div>

            <Separator />

            {/* Block Details */}
            {blockData.block && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Block Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Block Number</span>
                    <Badge variant="outline" className="font-mono">
                      {blockData.block?.header?.number
                        ? `#${Number.parseInt(blockData.block.header.number, 16)}`
                        : "N/A"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Extrinsics Count</span>
                    <Badge variant="outline">{blockData.block.extrinsics.length}</Badge>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Parent Hash</span>
                    <code className="text-xs font-mono bg-muted p-1 rounded block">
                      {blockData.block.header.parentHash.slice(0, 20)}...
                    </code>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">State Root</span>
                    <code className="text-xs font-mono bg-muted p-1 rounded block">
                      {blockData.block.header.stateRoot.slice(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Ariadne Parameters */}
            {blockData.parameters && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Ariadne Parameters</span>
                </div>

                {/* D Parameter Section */}
                {blockData.parameters.dParameter && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />D Parameter
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-muted-foreground">Permissioned Candidates</span>
                          <div className="text-2xl font-bold text-blue-600">
                            {blockData.parameters.dParameter.numPermissionedCandidates || 0}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-muted-foreground">Registered Candidates</span>
                          <div className="text-2xl font-bold text-green-600">
                            {blockData.parameters.dParameter.numRegisteredCandidates || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Permissioned Candidates Section */}
                {blockData.parameters.permissionedCandidates &&
                  Array.isArray(blockData.parameters.permissionedCandidates) && (
                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          Permissioned Candidates
                          <Badge variant="secondary">{blockData.parameters.permissionedCandidates.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {blockData.parameters.permissionedCandidates
                            .slice(0, 5)
                            .map((candidate: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    #{index + 1}
                                  </Badge>
                                  <div>
                                    <div className="text-sm font-medium">Sidechain Public Key</div>
                                    <code className="text-xs text-muted-foreground">
                                      {candidate.sidechainPublicKey?.slice(0, 16)}...
                                      {candidate.sidechainPublicKey?.slice(-8)}
                                    </code>
                                  </div>
                                </div>
                                <div className="relative flex flex-col items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyHookBlockExplorer.copy(candidate.sidechainPublicKey, index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  {copyHookBlockExplorer.copiedIndex === index && (
                                    <span className="absolute top-full mt-1 text-xs text-green-600 bg-white px-2 py-1 rounded shadow z-10">
                                      Copied!
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          {blockData.parameters.permissionedCandidates.length > 5 && (
                            <div className="text-center py-2">
                              <Badge variant="secondary">
                                +{blockData.parameters.permissionedCandidates.length - 5} more candidates
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Candidate Registrations Section */}
                {blockData.parameters.candidateRegistrations && (
                  (() => {
                    const totalRegs = Object.keys(blockData.parameters.candidateRegistrations).length;
                    return (
                      <Card className="border-l-4 border-l-emerald-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                            Candidate Registrations
                            <Badge variant="secondary">
                              {totalRegs}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(blockData.parameters.candidateRegistrations)
                              .slice(0, 3)
                              .map(([key, registration]: [string, any], index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      Registration #{index + 1}
                                    </Badge>
                                    <div className="relative flex flex-col items-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyHookBlockExplorer.copy(key, index)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      {copyHookBlockExplorer.copiedIndex === index && (
                                        <span className="absolute top-full mt-1 text-xs text-green-600 bg-white px-2 py-1 rounded shadow z-10">
                                          Copied!
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                      <span className="font-medium text-muted-foreground">Registration Key</span>
                                      <code className="block text-xs bg-muted p-2 rounded font-mono">
                                        {key.slice(0, 20)}...{key.slice(-12)}
                                      </code>
                                    </div>

                                    {registration.sidechainPubKey && (
                                      <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Sidechain Pub Key</span>
                                        <code className="block text-xs bg-muted p-2 rounded font-mono">
                                          {registration.sidechainPubKey.slice(0, 20)}...
                                          {registration.sidechainPubKey.slice(-12)}
                                        </code>
                                      </div>
                                    )}

                                    {registration.epochNumber && (
                                      <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Epoch Number</span>
                                        <Badge variant="secondary">{registration.epochNumber}</Badge>
                                      </div>
                                    )}

                                    {registration.blockNumber && (
                                      <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Block Number</span>
                                        <Badge variant="secondary">{registration.blockNumber}</Badge>
                                      </div>
                                    )}

                                    {registration.StakeError && (
                                      <div className="space-y-1">
                                        <span className="font-medium text-muted-foreground">Stake Status</span>
                                        <Badge variant="destructive" className="text-xs">
                                          {registration.StakeError}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}

                            {totalRegs > 3 && (
                              <div className="text-center py-2">
                                <Badge variant="secondary">
                                  +{totalRegs - 3} more registrations
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()
                )}

                {/* Raw Data Fallback for Other Parameters */}
                {Object.entries(blockData.parameters)
                  .filter(([key]) => !["dParameter", "permissionedCandidates", "candidateRegistrations"].includes(key))
                  .map(([key, value]) => (
                    <Card key={key} className="border-l-4 border-l-gray-400">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-3 rounded-lg">
                          <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                            {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
