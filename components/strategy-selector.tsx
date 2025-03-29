"use client"

import type { Strategy } from "@/lib/types"

interface StrategyBoxProps {
  strategy: Strategy
  label: string
  isSelected: boolean
  onSelect: (strategy: Strategy) => void
}

function StrategyBox({ strategy, label, isSelected, onSelect }: StrategyBoxProps) {
  return (
    <div
      className={`flex-1 p-4 border rounded-md cursor-pointer transition-all ${
        isSelected ? "border-[#40c9ff] bg-[rgba(64,201,255,0.1)]" : "border-gray-700 hover:border-[#40c9ff]"
      }`}
      onClick={() => onSelect(strategy)}
    >
      {label}
    </div>
  )
}

interface StrategySelectorProps {
  selectedStrategy: Strategy
  onSelectStrategy: (strategy: Strategy) => void
}

export default function StrategySelector({ selectedStrategy, onSelectStrategy }: StrategySelectorProps) {
  return (
    <div className="flex gap-4 mb-6">
      <StrategyBox
        strategy="trend_following"
        label="Trend Following"
        isSelected={selectedStrategy === "trend_following"}
        onSelect={onSelectStrategy}
      />
      <StrategyBox
        strategy="mean_reversion"
        label="Mean Reversion"
        isSelected={selectedStrategy === "mean_reversion"}
        onSelect={onSelectStrategy}
      />
      <StrategyBox
        strategy="breakout"
        label="Breakout"
        isSelected={selectedStrategy === "breakout"}
        onSelect={onSelectStrategy}
      />
    </div>
  )
}

