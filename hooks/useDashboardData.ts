"use client"

import { useState, useEffect } from "react"
import { useRPC } from "./useRPC"
import type { ChainStatus, BlockHeader, SystemInfo } from "@/types/rpc"

export function useDashboardData() {
  const { call } = useRPC()
  const [data, setData] = useState({
    chainInfo: null as SystemInfo | null,
    chainStatus: null as ChainStatus | null,
    latestHeader: null as BlockHeader | null,
    finalizedHead: null as BlockHeader | null,
    methods: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchDashboardData = async () => {
    setIsLoading(true)

    try {
      const [chain, version, status, header, finalizedHead, rpcMethodsResp] = await Promise.all([
        call<string>("system_chain"),
        call<string>("system_version"),
        call<ChainStatus>("sidechain_getStatus"),
        call<BlockHeader>("chain_getHeader"),
        call<BlockHeader>("chain_getFinalizedHead"),
        call<{ version: number; methods: string[] }>("rpc_methods"),
      ])

      setData({
        chainInfo: {
          chain: chain || "Unknown",
          version: version || "Unknown",
          nodeName: "Midnight Node",
        },
        chainStatus: status,
        latestHeader: header,
        finalizedHead: finalizedHead,
        methods: rpcMethodsResp?.methods ?? [],
      })

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000)

    return () => clearInterval(interval)
  }, [])

  return { ...data, isLoading, lastUpdate, refresh: fetchDashboardData }
}
