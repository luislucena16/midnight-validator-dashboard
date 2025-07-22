import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:9615/metrics")
    const text = await res.text()
    const lines = text.split('\n');
    const line = lines.find(l => l.trim().startsWith('substrate_sub_libp2p_is_major_syncing'));

    let status = "N/A";
    if (line) {
      // Split the line by spaces/tabs and take the second field
      const parts = line.trim().split(/\s+/);
      const value = parts[1];
      if (value !== undefined) {
        status = parseFloat(value) === 1 ? "Synced" : "Unsynced";
      }
    }
    return NextResponse.json({ status })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch Prometheus metrics" }, { status: 500 })
  }
} 