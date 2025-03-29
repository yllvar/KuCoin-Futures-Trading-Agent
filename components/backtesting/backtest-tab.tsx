"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BacktestResults from "./backtest-results"
import type { BacktestResultData } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface BacktestTabProps {
  onRunBacktest: (days: number) => Promise<BacktestResultData>
  isConnected: boolean
}

export default function BacktestTab({ onRunBacktest, isConnected }: BacktestTabProps) {
  const [backtestPeriod, setBacktestPeriod] = useState(30)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BacktestResultData | null>(null)

  const handleRunBacktest = async () => {
    if (!isConnected) return

    setIsRunning(true)
    setProgress(0)
    setResults(null)

    try {
      // Set up progress listener
      window.addEventListener("backtest-progress", ((e: CustomEvent) => {
        setProgress(e.detail.progress)
      }) as EventListener)

      const results = await onRunBacktest(backtestPeriod)
      setResults(results)
    } catch (error) {
      console.error("Backtest error:", error)
    } finally {
      setIsRunning(false)
      setProgress(100)
      window.removeEventListener("backtest-progress", (() => {}) as EventListener)
    }
  }

  const handleExportResults = () => {
    if (!results) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add metrics header
    csvContent += "Metric,Value\n"
    csvContent += `Total Profit,${results.totalProfit.toFixed(2)} USDT\n`
    csvContent += `Profit Percentage,${results.profitPercentage.toFixed(2)}%\n`
    csvContent += `Total Trades,${results.trades.length}\n`
    csvContent += `Win Rate,${results.winRate.toFixed(2)}%\n`
    csvContent += `Max Drawdown,${results.maxDrawdown.toFixed(2)}%\n`
    csvContent += `Profit Factor,${results.profitFactor.toFixed(2)}\n\n`

    // Add trades header
    csvContent += "Timestamp,Side,Price,Profit,Profit %\n"

    // Add trade data
    results.trades.forEach((trade) => {
      const profitPercent = ((trade.profit / results.initialBalance) * 100).toFixed(2)
      csvContent += `${new Date(trade.timestamp).toLocaleString()},${trade.side},${trade.price.toFixed(2)},${trade.profit.toFixed(2)},${profitPercent}%\n`
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "backtest_results.csv")
    document.body.appendChild(link)

    // Trigger download
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Input
        type="number"
        placeholder="Backtest Period (Days)"
        value={backtestPeriod}
        onChange={(e) => setBacktestPeriod(Number.parseInt(e.target.value))}
        className="bg-[#1a1a2e] border-gray-700 text-white"
        min={1}
        max={365}
      />

      <div className="flex gap-4">
        <Button
          onClick={handleRunBacktest}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={isRunning || !isConnected}
        >
          {isRunning ? "Running..." : "Run Backtest"}
        </Button>
        <Button
          onClick={handleExportResults}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
          disabled={!results}
        >
          Export Results
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      {results && <BacktestResults results={results} />}
    </div>
  )
}

