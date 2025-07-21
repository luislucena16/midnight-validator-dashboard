import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:9615/metrics")
    const text = await res.text()
    console.log("[API /api/runtime] Prometheus metrics text:\n", text)
    const lines = text.split('\n');
    const sumLine = lines.find(l => l.trim().startsWith('substrate_block_verification_and_import_time_sum'));
    const countLine = lines.find(l => l.trim().startsWith('substrate_block_verification_and_import_time_count'));
    console.log("[API /api/runtime] sumLine:", sumLine);
    console.log("[API /api/runtime] countLine:", countLine);
    let sum = 0;
    let count = 0;
    if (sumLine) {
      const parts = sumLine.trim().split(/\s+/);
      if (parts[1] !== undefined) sum = parseFloat(parts[1]);
    }
    if (countLine) {
      const parts = countLine.trim().split(/\s+/);
      if (parts[1] !== undefined) count = parseFloat(parts[1]);
    }
    let runtime = 0;
    if (sum === 0 && count === 0) {
      runtime = 0;
    } else if (count !== 0) {
      runtime = sum / count;
    }
    return NextResponse.json({ runtime, sum, count })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch Prometheus metrics" }, { status: 500 })
  }
} 