import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:9100/metrics")
    const text = await res.text()
    console.log("[API /api/memory] Prometheus metrics text:\n", text)
    const lines = text.split('\n');
    const totalLine = lines.find(l => l.trim().startsWith('node_memory_MemTotal_bytes'));
    const availLine = lines.find(l => l.trim().startsWith('node_memory_MemAvailable_bytes'));
    console.log("[API /api/memory] totalLine:", totalLine);
    console.log("[API /api/memory] availLine:", availLine);
    let memTotalBytes = null;
    let memAvailBytes = null;
    let memTotalGB = null;
    let memAvailGB = null;
    let memUsedPercent = null;
    if (totalLine) {
      const parts = totalLine.trim().split(/\s+/);
      if (parts[1] !== undefined) memTotalBytes = parseFloat(parts[1]);
    }
    if (availLine) {
      const parts = availLine.trim().split(/\s+/);
      if (parts[1] !== undefined) memAvailBytes = parseFloat(parts[1]);
    }
    if (memTotalBytes !== null) {
      memTotalGB = Math.round((memTotalBytes / (1024 ** 3)) * 100) / 100;
    }
    if (memAvailBytes !== null) {
      memAvailGB = Math.round((memAvailBytes / (1024 ** 3)) * 100) / 100;
    }
    if (memTotalBytes !== null && memAvailBytes !== null) {
      memUsedPercent = Math.round((1 - (memAvailBytes / memTotalBytes)) * 10000) / 100; // 2 decimales
    }
    return NextResponse.json({ memTotalBytes, memAvailBytes, memTotalGB, memAvailGB, memUsedPercent })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch Prometheus metrics" }, { status: 500 })
  }
} 