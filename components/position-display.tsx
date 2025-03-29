"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Position, MarketData } from "@/lib/types"
import { Chart, registerables } from "chart.js"
import "chartjs-adapter-date-fns" // Add the date-fns adapter

Chart.register(...registerables)

interface PositionDisplayProps {
  position: Position | null
  balance: number
  marketData: MarketData[]
  onClosePosition: () => Promise<void>
}

export default function PositionDisplay({ position, balance, marketData, onClosePosition }: PositionDisplayProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [], // Will be populated with timestamps
        datasets: [
          {
            label: "Price",
            borderColor: "#40c9ff",
            borderWidth: 2,
            pointRadius: 0,
            data: [],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            // Using a category scale instead of time scale to avoid adapter issues
            type: "category",
            ticks: {
              color: "#e6e6e6",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            ticks: {
              color: "#e6e6e6",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            labels: {
              color: "#e6e6e6",
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [])

  // Update chart when market data changes
  useEffect(() => {
    if (!chartInstance.current || marketData.length === 0) return

    const chart = chartInstance.current

    // Format timestamps for display
    const labels = marketData.map((candle) => {
      const date = new Date(candle[0])
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    })

    chart.data.labels = labels
    chart.data.datasets[0].data = marketData.map((candle) => candle[4])
    chart.update()
  }, [marketData])

  return (
    <Card className="bg-[#16213e] border-none shadow-lg">
      <CardContent className="p-6">
        <CardTitle className="text-lg mb-4 text-[#40c9ff] border-b border-gray-700 pb-2">Position & Balance</CardTitle>

        <div className="mb-4">Balance: {balance.toFixed(2)} USDT</div>

        <div className="mb-4">
          {position ? (
            <div className="p-3 border border-gray-700 rounded-md">
              <div className="font-medium">{position.side.toUpperCase()} Position</div>
              <div className="text-sm text-gray-300">Size: {position.contracts} contracts</div>
              <div className="text-sm text-gray-300">Entry: {position.entryPrice}</div>
            </div>
          ) : (
            "No active position"
          )}
        </div>

        <div className="h-[300px] mb-4">
          <canvas ref={chartRef}></canvas>
        </div>

        <Button
          onClick={onClosePosition}
          disabled={!position}
          className="w-full"
          variant={position ? "destructive" : "outline"}
        >
          Close Position
        </Button>
      </CardContent>
    </Card>
  )
}

