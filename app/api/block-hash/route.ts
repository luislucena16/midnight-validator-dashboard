import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const number = searchParams.get("number")
    if (!number) {
      console.error("[api/block-hash] Falta parámetro 'number'")
      return NextResponse.json({ error: "Missing block number" }, { status: 400 })
    }
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "chain_getBlockHash",
      params: [parseInt(number, 10)]
    })
    // TODO: change remote RPC to this -> http://127.0.0.1:9944
    const res = await fetch("https://rpc.testnet-02.midnight.network/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    })
    const data = await res.json()
    if (data.result) {
      return NextResponse.json({ hash: data.result })
    } else {
      console.error("[api/block-hash] Sin resultado para block number", number, data)
      return NextResponse.json({ error: "No result from RPC" }, { status: 404 })
    }
  } catch (err) {
    console.error("[api/block-hash] Error:", err)
    return NextResponse.json({ error: "Failed to fetch block hash" }, { status: 500 })
  }
} 