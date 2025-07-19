"use client"

import { useState, useEffect } from "react"
import { useRPC } from "./useRPC"
import type { ChainStatus, BlockHeader, SystemInfo, Peer, SyncState, SidechainAndMainchainStatus } from "@/types/rpc"

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

    // Sidechain and Mainchain
    sidechainAndMainchainStatus: null as SidechainAndMainchainStatus | null,

    // Methods
    methods: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [healthPeers, setHealthPeers] = useState<number | null>(null)

  const fetchNodeData = async () => {
    setIsLoading(true)

    // Helper para extraer valor o null de un resultado de AllSettled
    const pick = <T,>(res: PromiseSettledResult<T>): T | null => (res.status === "fulfilled" ? res.value : null)

    try {
      const results = await Promise.allSettled([
        call("system_chain"), // 0
        call("system_version"), // 1
        call("system_localPeerId"), // 2  (can fail)
        call("system_peers"), // 3  (can fail)
        call("chain_getHeader"), // 4
        call("chain_getFinalizedHead"), // 5
        call("system_syncState"), // 6
        call("sidechain_getStatus"), // 7
        call("sidechain_getStatus"), // 8
        call("rpc_methods"), // 9
        call("system_health"), // 10 <-- new
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
        sidechainAndMainchainStatus,
        methodsResp,
        health,
      ] = results.map(pick)

      // Si el encabezado finalizado está disponible tratamos de traerlo;
      // esta segunda llamada también puede fallar, así que la protegemos.
      let finalizedHeader: BlockHeader | null = null
      if (finalizedHeadHash) {
        try {
          finalizedHeader = await call("chain_getHeader", [finalizedHeadHash])
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
        sidechainAndMainchainStatus,
        methods: methodsResp?.methods || [],
      })

      if (health && typeof health.peers === "number") {
        setHealthPeers(health.peers)
      } else {
        setHealthPeers(null)
      }

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

  return { ...data, isLoading, lastUpdate, refresh: fetchNodeData, healthPeers }
}
