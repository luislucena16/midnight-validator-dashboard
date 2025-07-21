import { NextResponse } from "next/server"

async function getCpuStats() {
  const fetchMetrics = async () => {
    const res = await fetch("http://127.0.0.1:9100/metrics")
    const text = await res.text()
    const lines = text.split('\n')
    const stats: Record<string, number> = {}
    for (const line of lines) {
      if (line.startsWith('node_cpu_seconds_total')) {
        const match = line.match(/^node_cpu_seconds_total\{cpu="([^"]+)",mode="([^"]+)"\} ([0-9.eE+-]+)/)
        if (match) {
          const key = `${match[1]}:${match[2]}`
          stats[key] = parseFloat(match[3])
        }
      }
    }
    return stats
  }

  const cpu1 = await fetchMetrics()
  await new Promise(res => setTimeout(res, 1000))
  const cpu2 = await fetchMetrics()

  let total = 0
  let idle = 0
  for (const key of Object.keys(cpu1)) {
    const val1 = cpu1[key]
    const val2 = cpu2[key]
    const delta = val2 - val1
    total += delta
    if (key.endsWith(":idle")) {
      idle += delta
    }
  }

  let usedPercent = null
  if (total > 0) {
    const used = total - idle
    usedPercent = Math.round((100 * used / total) * 100) / 100
  }

  return { usedPercent, total, idle }
}

export async function GET() {
  try {
    const stats = await getCpuStats()
    console.log("[API /api/cpu] CPU stats:", stats)
    return NextResponse.json(stats)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch CPU stats" }, { status: 500 })
  }
} 