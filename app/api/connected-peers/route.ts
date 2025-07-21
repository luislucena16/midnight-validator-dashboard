import { NextResponse } from "next/server"

export async function GET() {
  try {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "system_health",
      params: []
    })
    const res = await fetch("http://127.0.0.1:9944", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    })
    const data = await res.json()
    console.log("[API /api/connected-peers] RPC response:", data)
    return NextResponse.json({ peers: data.result?.peers })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch connected peers" }, { status: 500 })
  }
} 