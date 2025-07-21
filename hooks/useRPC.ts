"use client"

import { useState, useCallback } from "react"
import type { RPCRequest, RPCResponse } from "@/types/rpc"

const RPC_URL = "https://rpc.testnet-02.midnight.network"

export function useRPC() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(async (method: string, params: any[] = [], rpcUrl?: string): Promise<any | null> => {
    setIsLoading(true)
    setError(null)

    const request: RPCRequest = {
      jsonrpc: "2.0",
      method,
      params,
      id: Date.now(),
    }

    try {
      const response = await fetch(rpcUrl || RPC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: RPCResponse<any> = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      return data.result || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      if (errorMessage.includes("unsafe to be called externally")) {
        // These methods are intentionally disabled on public RPC endpoints.
        console.warn("RPC method restricted:", errorMessage)
      } else {
        console.error("RPC call failed:", errorMessage)
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { call, isLoading, error }
}
