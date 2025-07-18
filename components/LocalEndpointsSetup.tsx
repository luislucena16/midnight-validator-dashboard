"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Copy, Terminal, Key, Database, Users, Globe, Code, CheckCircle, AlertCircle } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const SAMPLE_PUBLIC_KEY = "0x0c0d41d20c9c2a87764cee14190abb33cfc3ff95e958f63c6234dce32e464f1b"

interface CurlExample {
  title: string
  description: string
  method: string
  icon: any
  curl: string
  category: "author" | "system" | "state" | "rpc"
}

const curlExamples: CurlExample[] = [
  {
    title: "Check Node Key",
    description: "Verify if the node has a specific key (e.g., Aura)",
    method: "author_hasKey",
    icon: Key,
    category: "author",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"author_hasKey","params":["${SAMPLE_PUBLIC_KEY}", "aura"],"id":1}' | jq .`,
  },
  {
    title: "Pending Extrinsics",
    description: "Get pending extrinsics in the mempool",
    method: "author_pendingExtrinsics",
    icon: Database,
    category: "author",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"author_pendingExtrinsics","params":[],"id":1}' | jq .`,
  },
  {
    title: "Connected Peers",
    description: "Get all connected peers",
    method: "system_health",
    icon: Users,
    category: "system",
    curl: `curl -X POST https://rpc.testnet-02.midnight.network/ \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"system_health","params":[],"id":1}' | jq .`,
  },
  {
    title: "Local Peer ID",
    description: "Get the libp2p ID of the node",
    method: "system_localPeerId",
    icon: Globe,
    category: "system",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"system_localPeerId","params":[],"id":1}' | jq .`,
  },
  {
    title: "Node Roles",
    description: "Check node roles (e.g., Authority)",
    method: "system_nodeRoles",
    icon: CheckCircle,
    category: "system",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"system_nodeRoles","params":[],"id":1}' | jq .`,
  },
  {
    title: "Runtime Metadata",
    description: "Get runtime metadata",
    method: "state_getMetadata",
    icon: Code,
    category: "state",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"state_getMetadata","params":[],"id":1}' | jq .`,
  },
  {
    title: "Runtime Version",
    description: "Get runtime version information",
    method: "state_getRuntimeVersion",
    icon: Database,
    category: "state",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"state_getRuntimeVersion","params":[],"id":1}' | jq .`,
  },
  {
    title: "Storage Key",
    description: "Read a storage key (requires SCALE-encoded key)",
    method: "state_getStorage",
    icon: Key,
    category: "state",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0",
    "method":"state_getStorage",
    "params":["0x...storage_key_hex"],
    "id":1
  }' | jq .`,
  },
  {
    title: "Available Methods",
    description: "List all available RPC methods",
    method: "rpc_methods",
    icon: Terminal,
    category: "rpc",
    curl: `curl -X POST http://127.0.0.1:9944 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"rpc_methods","params":[],"id":1}' | jq .`,
  },
]

const categoryInfo = {
  author: {
    name: "Author Methods",
    description: "Key management and transaction handling",
    color: "bg-blue-100 text-blue-800",
  },
  system: {
    name: "System Methods",
    description: "Node status and network information",
    color: "bg-green-100 text-green-800",
  },
  state: { name: "State Methods", description: "Runtime storage and metadata", color: "bg-purple-100 text-purple-800" },
  rpc: { name: "RPC Methods", description: "Available methods discovery", color: "bg-orange-100 text-orange-800" },
}

export function LocalEndpointsSetup() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const groupedExamples = curlExamples.reduce(
    (acc, example) => {
      if (!acc[example.category]) acc[example.category] = []
      acc[example.category].push(example)
      return acc
    },
    {} as Record<string, CurlExample[]>,
  )

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-500" />
          Setup Your Local Endpoints
          <Badge variant="secondary" className="font-mono text-xs">
            127.0.0.1:9944
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect to your local Midnight node using these RPC endpoints. Make sure your node is running with RPC
          enabled.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="author" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {info.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedExamples).map(([category, examples]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={categoryInfo[category as keyof typeof categoryInfo].color}>
                  🔧 {categoryInfo[category as keyof typeof categoryInfo].name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {categoryInfo[category as keyof typeof categoryInfo].description}
                </span>
              </div>

              <div className="space-y-4">
                {examples.map((example, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <Collapsible>
                      <CardHeader className="pb-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <div className="flex items-center gap-3">
                              <example.icon className="h-4 w-4 text-indigo-500" />
                              <div className="text-left">
                                <div className="font-medium">{example.title}</div>
                                <div className="text-sm text-muted-foreground">{example.description}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">
                              {example.method}
                            </Badge>
                          </Button>
                        </CollapsibleTrigger>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">cURL Command:</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(example.curl, index)}
                                className="h-8 px-3"
                              >
                                {copiedIndex === index ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                <span className="ml-1 text-xs">{copiedIndex === index ? "Copied!" : "Copy"}</span>
                              </Button>
                            </div>
                            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                              <pre className="whitespace-pre-wrap">{example.curl}</pre>
                            </div>
                            {example.method === "state_getStorage" && (
                              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                  <strong>Note:</strong> You need the SCALE-encoded storage key. Get it from metadata or
                                  use polkadot.js tools.
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Separator className="my-6" />

        {/* Quick Setup Guide */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indigo-500" />
            Quick Setup Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">1. Start Your Node</h4>
                <code className="text-xs bg-black text-green-400 p-2 rounded block">
                  ./midnight-node --rpc-port 9944 --rpc-cors all
                </code>
              </CardContent>
            </Card>
            <Card className="border-0 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">2. Test Connection</h4>
                <code className="text-xs bg-black text-green-400 p-2 rounded block">
                  curl -X POST http://127.0.0.1:9944 -H "Content-Type: application/json" -d '{"{"}
                  jsonrpc":"2.0","method":"system_chain","id":1{"}"}'
                </code>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sample Public Key Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-indigo-500" />
            <span className="font-medium">Sample Public Key Used</span>
          </div>
          <code className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded block border break-all">
            {SAMPLE_PUBLIC_KEY}
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Replace this with your actual validator public key when testing
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
