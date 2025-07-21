import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:9615/metrics")
    const text = await res.text()
    const match = text.match(/substrate_block_height\{status="best"[^\n]*\s([0-9]+)/)
    if (match && match[1]) {
      return NextResponse.json({ blocksProduced: parseInt(match[1], 10) })
    }
    return NextResponse.json({ blocksProduced: null }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch Prometheus metrics" }, { status: 500 })
  }
} 