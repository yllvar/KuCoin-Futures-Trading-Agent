"use client"

import { useState, useEffect, useCallback } from "react"
import type { Exchange, Strategy, Position, Order, LogEntry, MarketData } from "@/lib/types"
import { TrendFollowingStrategy } from "@/lib/strategies/trend-following"
import { MeanReversionStrategy } from "@/lib/strategies/mean-reversion"
import { BreakoutStrategy } from "@/lib/strategies/breakout"

export function useTrading(
  exchange: Exchange | null,
  symbol: string,
  timeframe: string,
  positionSize: number,
  leverage: number,
  selectedStrategy: Strategy,
  riskParams: { stopLoss: number; takeProfit: number; trailingStop: number },
) {
  // Trading state
  const [position, setPosition] = useState<Position | null>(null)
  const [tradingActive, setTradingActive] = useState<boolean>(false)
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Active strategy instance
  const [activeStrategy, setActiveStrategy] = useState<any>(null)

  // Add log entry
  const addLog = useCallback((message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        message,
        type,
        timestamp: Date.now(),
      },
    ])
  }, [])

  // Initialize market data when exchange is connected
  useEffect(() => {
    if (!exchange) return

    const fetchInitialData = async () => {
      try {
        addLog("Fetching initial market data...")
        const candles = await exchange.fetchOHLCV(symbol, timeframe)
        setMarketData(candles)
        addLog("Initial market data loaded", "success")
      } catch (error) {
        addLog(`Failed to fetch market data: ${error}`, "error")
      }
    }

    fetchInitialData()

    // Set up interval to simulate real-time data
    const interval = setInterval(() => {
      if (marketData.length === 0) return

      const lastCandle = marketData[marketData.length - 1]
      const newPrice = lastCandle[4] + (Math.random() - 0.5) * 100

      const newCandle: MarketData = [
        Date.now(),
        lastCandle[4],
        Math.max(lastCandle[4], newPrice) + Math.random() * 20,
        Math.min(lastCandle[4], newPrice) - Math.random() * 20,
        newPrice,
        Math.random() * 10,
      ]

      setMarketData((prev) => [...prev.slice(-99), newCandle])

      // Evaluate strategy if trading is active
      if (tradingActive && activeStrategy) {
        activeStrategy.evaluate([...marketData.slice(-99), newCandle])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [exchange, symbol, timeframe, addLog, marketData, tradingActive, activeStrategy])

  // Start trading
  const startTrading = useCallback(async () => {
    if (!exchange) {
      addLog("Please connect to KuCoin first", "error")
      return
    }

    if (tradingActive) {
      addLog("Trading is already active", "error")
      return
    }

    try {
      addLog(`Starting ${selectedStrategy.replace("_", " ")} strategy...`)

      // Set leverage
      await exchange.setLeverage(leverage, symbol)

      // Create strategy instance
      let strategy
      const strategyParams = {
        exchange,
        symbol,
        positionSize,
        riskParams,
        onPositionChange: setPosition,
        onOrderCreated: (order: Order) => {
          setOrderHistory((prev) => [...prev, order])
          addLog(`${order.side === "buy" ? "Bought" : "Sold"} ${order.amount} at ${order.price}`, "success")
        },
        onLog: addLog,
      }

      switch (selectedStrategy) {
        case "trend_following":
          strategy = new TrendFollowingStrategy(strategyParams)
          break
        case "mean_reversion":
          strategy = new MeanReversionStrategy(strategyParams)
          break
        case "breakout":
          strategy = new BreakoutStrategy(strategyParams)
          break
      }

      setActiveStrategy(strategy)
      setTradingActive(true)
      addLog(`${selectedStrategy.replace("_", " ")} strategy started`, "success")
    } catch (error) {
      addLog(`Failed to start trading: ${error}`, "error")
    }
  }, [exchange, symbol, timeframe, positionSize, leverage, selectedStrategy, tradingActive, addLog, riskParams])

  // Stop trading
  const stopTrading = useCallback(() => {
    if (!tradingActive) {
      addLog("Trading is not active", "error")
      return
    }

    setTradingActive(false)
    setActiveStrategy(null)
    addLog("Trading stopped", "info")
  }, [tradingActive, addLog])

  // Close position
  const closePosition = useCallback(async () => {
    if (!exchange || !position) {
      addLog("No active position to close", "error")
      return
    }

    try {
      addLog(`Closing ${position.side} position...`)

      // Create opposite order to close position
      const orderSide = position.side === "long" ? "sell" : "buy"
      const orderAmount = Math.abs(position.contracts)

      const order = await exchange.createOrder(symbol, "market", orderSide, orderAmount, null, { closeOrder: true })

      setOrderHistory((prev) => [...prev, order])
      setPosition(null)

      addLog(`Position closed at ${order.price}`, "success")

      return order
    } catch (error) {
      addLog(`Failed to close position: ${error}`, "error")
      throw error
    }
  }, [exchange, symbol, position, addLog])

  return {
    position,
    tradingActive,
    marketData,
    orderHistory,
    logs,
    startTrading,
    stopTrading,
    closePosition,
  }
}

