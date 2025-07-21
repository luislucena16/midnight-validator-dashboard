import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const hash = searchParams.get("hash")
    if (!hash) {
      console.error("[api/block] Falta parámetro 'hash'")
      return NextResponse.json({ error: "Missing block hash" }, { status: 400 })
    }
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "chain_getBlock",
      params: [hash]
    })
    // TODO: change remote RPC to this -> http://127.0.0.1:9944
    const res = await fetch("https://rpc.testnet-02.midnight.network", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    })
    const data = await res.json()
    if (data.result) {
      return NextResponse.json({ block: data.result.block })
    } else {
      console.error("[api/block] Sin resultado para hash", hash, data)
      return NextResponse.json({ error: "No result from RPC" }, { status: 404 })
    }
  } catch (err) {
    console.error("[api/block] Error:", err)
    return NextResponse.json({ error: "Failed to fetch block" }, { status: 500 })
  }
} 