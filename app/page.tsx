"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ApiConfigForm from "@/components/api-config-form"
import StrategySelector from "@/components/strategy-selector"
import StrategyParameters from "@/components/strategy-parameters"
import PositionDisplay from "@/components/position-display"
import OrderHistory from "@/components/order-history"
import TradingLog from "@/components/trading-log"
import { useExchange } from "@/hooks/use-exchange"
import { useTrading } from "@/hooks/use-trading"
import type { Strategy } from "@/lib/types"

export default function TradingAgent() {
  const { exchange, isConnected, balance, connect } = useExchange()

  const [symbol, setSymbol] = useState<string>("BTC/USDT:USDT")
  const [timeframe, setTimeframe] = useState<string>("1h")
  const [positionSize, setPositionSize] = useState<number>(100)
  const [leverage, setLeverage] = useState<number>(10)
  const [stopLoss, setStopLoss] = useState<number>(5)
  const [takeProfit, setTakeProfit] = useState<number>(10)
  const [trailingStop, setTrailingStop] = useState<number>(2)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>("trend_following")

  const { position, tradingActive, marketData, orderHistory, logs, startTrading, stopTrading, closePosition } =
    useTrading(exchange, symbol, timeframe, positionSize, leverage, selectedStrategy, {
      stopLoss: stopLoss / 100,
      takeProfit: takeProfit / 100,
      trailingStop: trailingStop / 100,
    })

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e6e6e6]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-[#40c9ff]">KuCoin Futures Trading Agent</div>
          <div className="flex items-center">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? "bg-green-500 shadow-[0_0_10px_#4CAF50]" : "bg-red-500"}`}
            ></span>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ApiConfigForm onConnect={connect} isConnected={isConnected} />

            <Card className="bg-[#16213e] border-none shadow-lg">
              <CardContent className="p-6">
                <CardTitle className="text-lg mb-4 text-[#40c9ff] border-b border-gray-700 pb-2">
                  Strategy Configuration
                </CardTitle>

                <StrategySelector selectedStrategy={selectedStrategy} onSelectStrategy={setSelectedStrategy} />

                <StrategyParameters
                  symbol={symbol}
                  timeframe={timeframe}
                  positionSize={positionSize}
                  leverage={leverage}
                  stopLoss={stopLoss}
                  takeProfit={takeProfit}
                  trailingStop={trailingStop}
                  selectedStrategy={selectedStrategy}
                  isConnected={isConnected}
                  exchange={exchange}
                  onSymbolChange={setSymbol}
                  onTimeframeChange={setTimeframe}
                  onPositionSizeChange={setPositionSize}
                  onLeverageChange={setLeverage}
                  onStopLossChange={setStopLoss}
                  onTakeProfitChange={setTakeProfit}
                  onTrailingStopChange={setTrailingStop}
                />

                <div className="flex gap-4 mt-4">
                  <Button
                    className="w-full bg-[#40c9ff] text-black hover:bg-[#00a1e4]"
                    onClick={() => startTrading()}
                    disabled={!isConnected || tradingActive}
                  >
                    Start Trading
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => stopTrading()} disabled={!tradingActive}>
                    Stop Trading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <PositionDisplay
              position={position}
              balance={balance}
              marketData={marketData}
              onClosePosition={closePosition}
            />

            <OrderHistory orders={orderHistory} />
          </div>
        </div>

        <div className="mt-6">
          <TradingLog logs={logs} />
        </div>
      </div>
    </div>
  )
}

