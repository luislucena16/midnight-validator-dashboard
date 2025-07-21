import { NextResponse } from "next/server"

const DEVICE = '/dev/vda1'
const FSTYPE = 'ext4'
const MOUNTPOINT = '/var/lib/docker'

function matchLine(line: string, metric: string) {
  return line.startsWith(metric)
    && line.includes(`device=\"${DEVICE}\"`)
    && line.includes(`fstype=\"${FSTYPE}\"`)
    && line.includes(`mountpoint=\"${MOUNTPOINT}\"`)
}

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:9100/metrics")
    const text = await res.text()
    console.log("[API /api/disk] Prometheus metrics text:\n", text)
    const lines = text.split('\n');
    const sizeLine = lines.find(l => matchLine(l, 'node_filesystem_size_bytes'));
    const availLine = lines.find(l => matchLine(l, 'node_filesystem_avail_bytes'));
    console.log("[API /api/disk] sizeLine:", sizeLine);
    console.log("[API /api/disk] availLine:", availLine);
    let sizeBytes = null;
    let availBytes = null;
    let usedBytes = null;
    let sizeGB = null;
    let availGB = null;
    let usedGB = null;
    let usedPercent = null;
    if (sizeLine) {
      const parts = sizeLine.trim().split(/\s+/);
      if (parts[1] !== undefined) sizeBytes = parseFloat(parts[1]);
    }
    if (availLine) {
      const parts = availLine.trim().split(/\s+/);
      if (parts[1] !== undefined) availBytes = parseFloat(parts[1]);
    }
    if (sizeBytes !== null && availBytes !== null) {
      usedBytes = sizeBytes - availBytes;
      sizeGB = Math.round((sizeBytes / (1024 ** 3)) * 100) / 100;
      availGB = Math.round((availBytes / (1024 ** 3)) * 100) / 100;
      usedGB = Math.round((usedBytes / (1024 ** 3)) * 100) / 100;
      usedPercent = Math.round((usedBytes / sizeBytes) * 10000) / 100;
    }
    return NextResponse.json({ sizeBytes, availBytes, usedBytes, sizeGB, availGB, usedGB, usedPercent })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch Prometheus metrics" }, { status: 500 })
  }
} 