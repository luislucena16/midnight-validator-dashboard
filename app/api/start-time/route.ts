import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:9615/metrics")
    const text = await res.text()
    console.log("[API /api/start-time] Prometheus metrics text:\n", text)
    const lines = text.split('\n');
    const line = lines.find(l => l.trim().startsWith('substrate_process_start_time_seconds'));
    console.log("[API /api/start-time] Línea encontrada:", line);
    let startTime = null;
    let startTimeISO = null;
    if (line) {
      const parts = line.trim().split(/\s+/);
      const value = parts[1];
      if (value !== undefined) {
        startTime = parseInt(value, 10);
        startTimeISO = new Date(startTime * 1000).toISOString();
      }
    }
    return NextResponse.json({ startTime, startTimeISO })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch Prometheus metrics" }, { status: 500 })
  }
} 