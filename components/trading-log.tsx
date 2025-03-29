"use client"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import type { LogEntry } from "@/lib/types"

interface TradingLogProps {
  logs: LogEntry[]
}

export default function TradingLog({ logs }: TradingLogProps) {
  return (
    <Card className="bg-[#16213e] border-none shadow-lg">
      <CardContent className="p-6">
        <CardTitle className="text-lg mb-4 text-[#40c9ff] border-b border-gray-700 pb-2">Trading Log</CardTitle>

        <div className="h-[300px] overflow-y-auto bg-[#1a1a2e] p-3 rounded-md font-mono text-xs">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 p-1 ${
                log.type === "info" ? "text-[#40c9ff]" : log.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              [{new Date(log.timestamp).toISOString()}] {log.message}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

