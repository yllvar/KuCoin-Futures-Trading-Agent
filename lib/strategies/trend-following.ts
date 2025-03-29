import type { StrategyParams, MarketData } from "@/lib/types"
import { BaseStrategy } from "./base-strategy"

export class TrendFollowingStrategy extends BaseStrategy {
  private emaFastPeriod = 12
  private emaSlowPeriod = 26
  private emaFast: number[] = []
  private emaSlow: number[] = []

  constructor(params: StrategyParams) {
    super(params)
  }

  private calculateEMA(data: MarketData[], period: number, previousEMA: number[] = []): number[] {
    const multiplier = 2 / (period + 1)
    const ema: number[] = []

    if (data.length === 0) return ema

    // If we have previous EMA values, use the last one as starting point
    const startIdx = previousEMA.length > 0 ? data.length - 1 : period - 1
    const initialValue =
      previousEMA.length > 0
        ? previousEMA[previousEMA.length - 1]
        : data.slice(0, period).reduce((sum, val) => sum + val[4], 0) / period

    for (let i = 0; i < startIdx; i++) {
      ema.push(0) // Placeholder
    }

    ema.push(initialValue)

    for (let i = startIdx + 1; i < data.length; i++) {
      const currentValue = data[i][4]
      const currentEMA = (currentValue - ema[i - 1]) * multiplier + ema[i - 1]
      ema.push(currentEMA)
    }

    return ema
  }

  public async evaluate(data: MarketData[]) {
    // Call parent evaluate to store current data
    await super.evaluate(data)

    if (data.length < Math.max(this.emaFastPeriod, this.emaSlowPeriod)) {
      if (!this.isBacktesting) {
        this.onLog("Not enough data for EMA calculation", "info")
      }
      return
    }

    // Calculate EMAs
    this.emaFast = this.calculateEMA(data, this.emaFastPeriod, this.emaFast)
    this.emaSlow = this.calculateEMA(data, this.emaSlowPeriod, this.emaSlow)

    const currentPrice = data[data.length - 1][4]
    const fastEMA = this.emaFast[this.emaFast.length - 1]
    const slowEMA = this.emaSlow[this.emaSlow.length - 1]

    // Check stop conditions first
    if (this.checkStopConditions(currentPrice)) {
      return
    }

    // Check for crossover signals
    if (currentPrice > fastEMA && fastEMA > slowEMA) {
      // Uptrend
      if (!this.position || this.position.side !== "long") {
        if (this.position) {
          await this.exitPosition()
        }
        await this.enterPosition("long")
      }
    } else if (currentPrice < fastEMA && fastEMA < slowEMA) {
      // Downtrend
      if (!this.position || this.position.side !== "short") {
        if (this.position) {
          await this.exitPosition()
        }
        await this.enterPosition("short")
      }
    }
  }
}

