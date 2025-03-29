"use client"

import { useState, useCallback } from "react"
import type { Exchange, Strategy, BacktestResultData, BacktestResults } from "@/lib/types"
import { TrendFollowingStrategy } from "@/lib/strategies/trend-following"
import { MeanReversionStrategy } from "@/lib/strategies/mean-reversion"
import { BreakoutStrategy } from "@/lib/strategies/breakout"

export function useBacktesting(
  exchange: Exchange | null,
  symbol: string,
  timeframe: string,
  positionSize: number,
  leverage: number,
  selectedStrategy: Strategy,
  riskParams: { stopLoss: number; takeProfit: number; trailingStop: number },
) {
  const [isBacktesting, setIsBacktesting] = useState(false)

  const runBacktest = useCallback(
    async (days: number): Promise<BacktestResultData> => {
      if (!exchange) {
        throw new Error("Exchange not connected")
      }

      setIsBacktesting(true)

      try {
        // Calculate date range
        const now = Date.now()
        const endTime = now
        const startTime = endTime - days * 24 * 60 * 60 * 1000

        // Initialize results object
        const results: BacktestResults = {
          initialBalance: positionSize,
          currentBalance: positionSize,
          trades: [],
          maxDrawdown: 0,
          peakBalance: positionSize,
        }

        // Initialize strategy
        let backtestStrategy
        const strategyParams = {
          exchange,
          symbol,
          positionSize,
          riskParams,
          isBacktesting: true,
          backtestResults: results,
          onPositionChange: () => {},
          onOrderCreated: () => {},
          onLog: (message: string) => console.log(message),
        }

        switch (selectedStrategy) {
          case "trend_following":
            backtestStrategy = new TrendFollowingStrategy(strategyParams)
            break
          case "mean_reversion":
            backtestStrategy = new MeanReversionStrategy(strategyParams)
            break
          case "breakout":
            backtestStrategy = new BreakoutStrategy(strategyParams)
            break
        }

        // Load historical data
        console.log("Loading historical data...")
        let allCandles = []
        let currentTime = startTime

        // Fetch all candles
        while (currentTime < endTime) {
          const candleLimit = 1000 // Max candles per fetch
          const candles = await exchange.fetchOHLCV(symbol, timeframe, currentTime, candleLimit)

          if (candles.length === 0) break

          // Add to our collection
          allCandles = allCandles.concat(candles)
          currentTime = candles[candles.length - 1][0]

          // Update progress
          const progress = Math.min(100, Math.floor(((currentTime - startTime) / (endTime - startTime)) * 100))
          window.dispatchEvent(new CustomEvent("backtest-progress", { detail: { progress } }))
        }

        console.log(`Loaded ${allCandles.length} candles for backtesting`)

        // Run backtest on the data
        console.log("Running backtest...")
        const totalCandles = allCandles.length

        for (let i = 0; i < totalCandles; i++) {
          // Simulate market data updates
          const currentSlice = allCandles.slice(0, i + 1)

          // Update progress
          if (i % 100 === 0) {
            const progress = Math.floor((i / totalCandles) * 100)
            window.dispatchEvent(new CustomEvent("backtest-progress", { detail: { progress } }))
          }

          // Run strategy evaluation
          await backtestStrategy.evaluate(currentSlice)
        }

        // Close any open position at the end
        if (backtestStrategy.position) {
          await backtestStrategy.exitPosition()
        }

        // Calculate final metrics
        const totalProfit = results.currentBalance - results.initialBalance
        const profitableTrades = results.trades.filter((t) => t.profit > 0).length
        const winRate = results.trades.length > 0 ? (profitableTrades / results.trades.length) * 100 : 0
        const profitPercentage = (totalProfit / results.initialBalance) * 100

        // Calculate profit factor
        const grossProfit = results.trades.reduce((sum, trade) => (trade.profit > 0 ? sum + trade.profit : sum), 0)
        const grossLoss = Math.abs(
          results.trades.reduce((sum, trade) => (trade.profit < 0 ? sum + trade.profit : sum), 0),
        )
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Number.POSITIVE_INFINITY : 0

        // Return final results
        return {
          initialBalance: results.initialBalance,
          finalBalance: results.currentBalance,
          totalProfit,
          profitPercentage,
          winRate,
          maxDrawdown: results.maxDrawdown,
          profitFactor,
          trades: results.trades,
        }
      } catch (error) {
        console.error("Backtest error:", error)
        throw error
      } finally {
        setIsBacktesting(false)
      }
    },
    [exchange, symbol, timeframe, positionSize, leverage, selectedStrategy, riskParams],
  )

  return {
    isBacktesting,
    runBacktest,
  }
}

