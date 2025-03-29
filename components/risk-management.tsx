"use client"

import { Input } from "@/components/ui/input"

interface RiskManagementProps {
  stopLoss: number
  takeProfit: number
  trailingStop: number
  onStopLossChange: (value: number) => void
  onTakeProfitChange: (value: number) => void
  onTrailingStopChange: (value: number) => void
}

export default function RiskManagement({
  stopLoss,
  takeProfit,
  trailingStop,
  onStopLossChange,
  onTakeProfitChange,
  onTrailingStopChange,
}: RiskManagementProps) {
  return (
    <div className="space-y-4">
      <Input
        type="number"
        placeholder="Stop Loss (%)"
        value={stopLoss}
        onChange={(e) => onStopLossChange(Number.parseFloat(e.target.value))}
        className="bg-[#1a1a2e] border-gray-700 text-white"
      />
      <Input
        type="number"
        placeholder="Take Profit (%)"
        value={takeProfit}
        onChange={(e) => onTakeProfitChange(Number.parseFloat(e.target.value))}
        className="bg-[#1a1a2e] border-gray-700 text-white"
      />
      <Input
        type="number"
        placeholder="Trailing Stop (%)"
        value={trailingStop}
        onChange={(e) => onTrailingStopChange(Number.parseFloat(e.target.value))}
        className="bg-[#1a1a2e] border-gray-700 text-white"
      />
    </div>
  )
}

