"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RiskManagement from "./risk-management"
import BacktestTab from "./backtesting/backtest-tab"
import { useBacktesting } from "@/hooks/use-backtesting"

interface StrategyParametersProps {
  symbol: string
  timeframe: string
  positionSize: number
  leverage: number
  stopLoss: number
  takeProfit: number
  trailingStop: number
  selectedStrategy: string
  isConnected: boolean
  exchange: any
  onSymbolChange: (symbol: string) => void
  onTimeframeChange: (timeframe: string) => void
  onPositionSizeChange: (size: number) => void
  onLeverageChange: (leverage: number) => void
  onStopLossChange: (stopLoss: number) => void
  onTakeProfitChange: (takeProfit: number) => void
  onTrailingStopChange: (trailingStop: number) => void
}

export default function StrategyParameters({
  symbol,
  timeframe,
  positionSize,
  leverage,
  stopLoss,
  takeProfit,
  trailingStop,
  selectedStrategy,
  isConnected,
  exchange,
  onSymbolChange,
  onTimeframeChange,
  onPositionSizeChange,
  onLeverageChange,
  onStopLossChange,
  onTakeProfitChange,
  onTrailingStopChange,
}: StrategyParametersProps) {
  const { isBacktesting, runBacktest } = useBacktesting(
    exchange,
    symbol,
    timeframe,
    positionSize,
    leverage,
    selectedStrategy as any,
    { stopLoss: stopLoss / 100, takeProfit: takeProfit / 100, trailingStop: trailingStop / 100 },
  )

  return (
    <Tabs defaultValue="parameters">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="parameters">Parameters</TabsTrigger>
        <TabsTrigger value="risk">Risk Management</TabsTrigger>
        <TabsTrigger value="backtest">Backtesting</TabsTrigger>
      </TabsList>

      <TabsContent value="parameters" className="space-y-4">
        <Select value={symbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="bg-[#1a1a2e] border-gray-700">
            <SelectValue placeholder="Select Symbol" />
          </SelectTrigger>
          <SelectContent className="bg-[#16213e] border-gray-700">
            <SelectItem value="BTC/USDT:USDT">BTC/USDT:USDT</SelectItem>
            <SelectItem value="ETH/USDT:USDT">ETH/USDT:USDT</SelectItem>
            <SelectItem value="SOL/USDT:USDT">SOL/USDT:USDT</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger className="bg-[#1a1a2e] border-gray-700">
            <SelectValue placeholder="Select Timeframe" />
          </SelectTrigger>
          <SelectContent className="bg-[#16213e] border-gray-700">
            <SelectItem value="1m">1 Minute</SelectItem>
            <SelectItem value="5m">5 Minutes</SelectItem>
            <SelectItem value="15m">15 Minutes</SelectItem>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="4h">4 Hours</SelectItem>
            <SelectItem value="1d">1 Day</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Position Size (USDT)"
          value={positionSize}
          onChange={(e) => onPositionSizeChange(Number.parseFloat(e.target.value))}
          className="bg-[#1a1a2e] border-gray-700 text-white"
        />

        <Input
          type="number"
          placeholder="Leverage (1-100)"
          min={1}
          max={100}
          value={leverage}
          onChange={(e) => onLeverageChange(Number.parseInt(e.target.value))}
          className="bg-[#1a1a2e] border-gray-700 text-white"
        />
      </TabsContent>

      <TabsContent value="risk">
        <RiskManagement
          stopLoss={stopLoss}
          takeProfit={takeProfit}
          trailingStop={trailingStop}
          onStopLossChange={onStopLossChange}
          onTakeProfitChange={onTakeProfitChange}
          onTrailingStopChange={onTrailingStopChange}
        />
      </TabsContent>

      <TabsContent value="backtest">
        <BacktestTab onRunBacktest={runBacktest} isConnected={isConnected} />
      </TabsContent>
    </Tabs>
  )
}

