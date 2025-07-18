"use client"

import { useState, useEffect } from "react"
import { useRPC } from "./useRPC"
import type { ChainStatus, BlockHeader, SystemInfo, Peer, SyncState, SidechainStatus } from "@/types/rpc"

export function useNodeData() {
  const { call } = useRPC()
  const [data, setData] = useState({
    // Basic Info
    chainInfo: null as SystemInfo | null,
    nodeVersion: null as string | null,
    localPeerId: null as string | null,

    // Network & Connectivity
    peers: [] as Peer[],
    peerCount: 0,

    // Blockchain State
    latestHeader: null as BlockHeader | null,
    finalizedHead: null as BlockHeader | null,
    finalizedHeader: null as BlockHeader | null,

    // Sync Status
    syncState: null as SyncState | null,
    chainStatus: null as ChainStatus | null,

    // Sidechain
    sidechainStatus: null as SidechainStatus | null,

    // Methods
    methods: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchNodeData = async () => {
    setIsLoading(true)

    // Helper para extraer valor o null de un resultado de AllSettled
    const pick = <T,>(res: PromiseSettledResult<T>): T | null => (res.status === "fulfilled" ? res.value : null)

    try {
      const results = await Promise.allSettled([
        call<string>("system_chain"), // 0
        call<string>("system_version"), // 1
        call<string>("system_localPeerId"), // 2  (puede fallar)
        call<Peer[]>("system_peers"), // 3  (puede fallar)
        call<BlockHeader>("chain_getHeader"), // 4
        call<string>("chain_getFinalizedHead"), // 5
        call<SyncState>("system_syncState"), // 6
        call<ChainStatus>("sidechain_getStatus"), // 7
        call<SidechainStatus>("sidechain_getStatus"), // 8
        call<{ version: number; methods: string[] }>("rpc_methods"), // 9
      ])

      const [
        chain,
        version,
        localPeerId,
        peers,
        latestHeader,
        finalizedHeadHash,
        syncState,
        chainStatus,
        sidechainStatus,
        methodsResp,
      ] = results.map(pick)

      // Si el encabezado finalizado está disponible tratamos de traerlo;
      // esta segunda llamada también puede fallar, así que la protegemos.
      let finalizedHeader: BlockHeader | null = null
      if (finalizedHeadHash) {
        try {
          finalizedHeader = await call<BlockHeader>("chain_getHeader", [finalizedHeadHash])
        } catch (e) {
          console.warn("Unable to fetch finalized header:", e)
        }
      }

      setData({
        chainInfo: chain && version ? { chain, version, nodeName: "Midnight Node" } : null,
        nodeVersion: version,
        localPeerId,
        peers: peers || [],
        peerCount: peers?.length || 0,
        latestHeader,
        finalizedHead: finalizedHeadHash
          ? {
              parentHash: finalizedHeadHash,
              number: "0x0",
              stateRoot: "",
              extrinsicsRoot: "",
              digest: { logs: [] },
            }
          : null,
        finalizedHeader,
        syncState,
        chainStatus,
        sidechainStatus,
        methods: methodsResp?.methods || [],
      })

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to fetch node data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNodeData()

    // Auto-refresh every 30 seconds for node monitoring
    const interval = setInterval(fetchNodeData, 30000)

    return () => clearInterval(interval)
  }, [])

  return { ...data, isLoading, lastUpdate, refresh: fetchNodeData }
}
