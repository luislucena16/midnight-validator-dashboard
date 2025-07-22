import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:9615/metrics")
    const text = await res.text()
    // Extracts the value of the start time process
    const match = text.match(/substrate_process_start_time_seconds\{chain="[^"]+"\}\s([0-9.]+)/)
    if (match && match[1]) {
      const startTime = parseFloat(match[1])
      const now = Date.now() / 1000 // seconds unix epoch
      const uptime = now - startTime
      const uptimeDays = uptime / 86400
      // Calculates the percentage of uptime with respect to one day
      let uptimePercent = (uptime / 86400) * 100
      if (uptimePercent > 100) uptimePercent = 100
      uptimePercent = Math.round(uptimePercent * 100) / 100 // maximum 2 decimal places
      return NextResponse.json({
        uptimeDays,
        uptimePercent
      })
    }
    return NextResponse.json({ uptimeDays: null, uptimePercent: null }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch Prometheus metrics" }, { status: 500 })
  }
} 