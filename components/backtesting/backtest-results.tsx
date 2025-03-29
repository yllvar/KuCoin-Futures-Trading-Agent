"use client"

import type { BacktestResultData, BacktestTrade } from "@/lib/types"

interface MetricCardProps {
  title: string
  value: string
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-[#16213e] p-3 rounded-md text-center">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="text-lg font-bold text-[#40c9ff] mt-1">{value}</div>
    </div>
  )
}

interface TradeItemProps {
  trade: BacktestTrade
  initialBalance: number
}

function TradeItem({ trade, initialBalance }: TradeItemProps) {
  const timestamp = new Date(trade.timestamp).toLocaleString()
  const profitColor = trade.profit > 0 ? "text-green-500" : "text-red-500"
  const profitPercent = ((trade.profit / initialBalance) * 100).toFixed(2)

  return (
    <div
      className={`py-2 px-3 border-b border-gray-700 text-sm flex justify-between ${
        trade.side === "buy" ? "bg-[rgba(76,175,80,0.1)]" : "bg-[rgba(220,53,69,0.1)]"
      }`}
    >
      <div>{timestamp}</div>
      <div>
        {trade.side.toUpperCase()} @ {trade.price.toFixed(2)}
      </div>
      <div className={profitColor}>
        {trade.profit > 0 ? "+" : ""}
        {trade.profit.toFixed(2)} ({profitPercent}%)
      </div>
    </div>
  )
}

interface BacktestResultsProps {
  results: BacktestResultData
}

export default function BacktestResults({ results }: BacktestResultsProps) {
  return (
    <div className="mt-4 p-4 bg-[#1a1a2e] rounded-md border border-gray-700">
      <h3 className="text-base font-medium text-[#40c9ff] mb-3">Backtest Results</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <MetricCard title="Total Profit" value={`${results.totalProfit.toFixed(2)} USDT`} />
        <MetricCard title="Profit %" value={`${results.profitPercentage.toFixed(2)}%`} />
        <MetricCard title="Total Trades" value={`${results.trades.length}`} />
        <MetricCard title="Win Rate" value={`${results.winRate.toFixed(2)}%`} />
        <MetricCard title="Max Drawdown" value={`${results.maxDrawdown.toFixed(2)}%`} />
        <MetricCard title="Profit Factor" value={`${results.profitFactor.toFixed(2)}`} />
      </div>

      <h3 className="text-base font-medium text-[#40c9ff] mb-2">Trade History</h3>
      <div className="max-h-[200px] overflow-y-auto">
        {results.trades.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No trades executed</div>
        ) : (
          results.trades.map((trade, index) => (
            <TradeItem key={index} trade={trade} initialBalance={results.initialBalance} />
          ))
        )}
      </div>
    </div>
  )
}

