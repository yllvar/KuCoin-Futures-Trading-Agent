import type { StrategyParams, MarketData } from "@/lib/types"
import { BaseStrategy } from "./base-strategy"

export class BreakoutStrategy extends BaseStrategy {
  private rangePeriod = 20
  private confirmationPeriod = 3

  constructor(params: StrategyParams) {
    super(params)
  }

  private calculatePriceRange(data: MarketData[], period: number) {
    if (data.length < period) {
      return {
        high: Array(data.length).fill(0),
        low: Array(data.length).fill(0),
      }
    }

    const high = Array(period - 1).fill(0)
    const low = Array(period - 1).fill(0)

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const highs = slice.map((c) => c[2]) // High price
      const lows = slice.map((c) => c[3]) // Low price

      high.push(Math.max(...highs))
      low.push(Math.min(...lows))
    }

    return { high, low }
  }

  public async evaluate(data: MarketData[]) {
    // Call parent evaluate to store  low };
  }

  public async evaluate(data: MarketData[]) {
    // Call parent evaluate to store current data
    await super.evaluate(data)

    if (data.length < this.rangePeriod + this.confirmationPeriod) {
      if (!this.isBacktesting) {
        this.onLog("Not enough data for breakout detection", "info")
      }
      return
    }

    // Calculate price range
    const range = this.calculatePriceRange(data, this.rangePeriod)

    const currentPrice = data[data.length - 1][4]
    const rangeHigh = range.high[range.high.length - 1]
    const rangeLow = range.low[range.low.length - 1]

    // Check stop conditions first
    if (this.checkStopConditions(currentPrice)) {
      return
    }

    // Check for breakout signals
    if (currentPrice > rangeHigh) {
      // Potential upside breakout - need confirmation
      let confirmed = true
      for (let i = 1; i <= this.confirmationPeriod; i++) {
        if (data[data.length - i][4] <= rangeHigh) {
          confirmed = false
          break
        }
      }

      if (confirmed && (!this.position || this.position.side !== "long")) {
        if (this.position) {
          await this.exitPosition()
        }
        await this.enterPosition("long")
      }
    } else if (currentPrice < rangeLow) {
      // Potential downside breakout - need confirmation
      let confirmed = true
      for (let i = 1; i <= this.confirmationPeriod; i++) {
        if (data[data.length - i][4] >= rangeLow) {
          confirmed = false
          break
        }
      }

      if (confirmed && (!this.position || this.position.side !== "short")) {
        if (this.position) {
          await this.exitPosition()
        }
        await this.enterPosition("short")
      }
    }
  }
}

