"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Code, Zap } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface MethodsPanelProps {
  methods: string[]
}

export function MethodsPanel({ methods }: MethodsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const categorizeMethod = (method: string) => {
    if (method.startsWith("chain_")) return "chain"
    if (method.startsWith("sidechain_")) return "sidechain"
    if (method.startsWith("system_")) return "system"
    if (method.startsWith("state_")) return "state"
    if (method.startsWith("rpc_")) return "rpc"
    return "other"
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      chain: "bg-blue-100 text-blue-800",
      sidechain: "bg-purple-100 text-purple-800",
      system: "bg-green-100 text-green-800",
      state: "bg-orange-100 text-orange-800",
      rpc: "bg-gray-100 text-gray-800",
      other: "bg-yellow-100 text-yellow-800",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const groupedMethods = methods.reduce(
    (acc, method) => {
      const category = categorizeMethod(method)
      if (!acc[category]) acc[category] = []
      acc[category].push(method)
      return acc
    },
    {} as Record<string, string[]>,
  )

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-500" />
                Available RPC Methods
                <Badge variant="secondary">{methods.length}</Badge>
              </CardTitle>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {Object.entries(groupedMethods).map(([category, categoryMethods]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium capitalize">{category} Methods</span>
                  <Badge variant="outline">{categoryMethods.length}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryMethods.map((method) => (
                    <Badge key={method} className={`font-mono text-xs ${getCategoryColor(category)}`}>
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
