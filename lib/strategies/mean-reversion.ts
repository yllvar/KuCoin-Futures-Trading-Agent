import type { StrategyParams, MarketData } from "@/lib/types"
import { BaseStrategy } from "./base-strategy"

export class MeanReversionStrategy extends BaseStrategy {
  private bollingerPeriod = 20
  private bollingerStdDev = 2
  private rsiPeriod = 14
  private rsiOverbought = 70
  private rsiOversold = 30

  constructor(params: StrategyParams) {
    super(params)
  }

  private calculateRSI(data: MarketData[], period: number): number[] {
    if (data.length < period + 1) return Array(data.length).fill(0)

    const rsi = Array(period).fill(0)
    let gains = 0
    let losses = 0

    // Calculate initial average gains and losses
    for (let i = 1; i <= period; i++) {
      const change = data[i][4] - data[i - 1][4]
      if (change > 0) gains += change
      else losses -= change
    }

    let avgGain = gains / period
    let avgLoss = losses / period

    if (avgLoss === 0) {
      rsi.push(100)
    } else {
      const rs = avgGain / avgLoss
      rsi.push(100 - 100 / (1 + rs))
    }

    // Calculate subsequent RSI values
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i][4] - data[i - 1][4]
      let currentGain = 0
      let currentLoss = 0

      if (change > 0) currentGain = change
      else currentLoss = -change

      avgGain = (avgGain * (period - 1) + currentGain) / period
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period

      if (avgLoss === 0) {
        rsi.push(100)
      } else {
        const rs = avgGain / avgLoss
        rsi.push(100 - 100 / (1 + rs))
      }
    }

    return rsi
  }

  private calculateBollingerBands(data: MarketData[], period: number, stdDev: number) {
    if (data.length < period) {
      return {
        upper: Array(data.length).fill(0),
        middle: Array(data.length).fill(0),
        lower: Array(data.length).fill(0),
      }
    }

    const middle = Array(period - 1).fill(0)
    const upper = Array(period - 1).fill(0)
    const lower = Array(period - 1).fill(0)

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const prices = slice.map((c) => c[4])
      const mean = prices.reduce((sum, price) => sum + price, 0) / period
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period
      const stdDeviation = Math.sqrt(variance)

      middle.push(mean)
      upper.push(mean + stdDeviation * stdDev)
      lower.push(mean - stdDeviation * stdDev)
    }

    return { upper, middle, lower }
  }

  public async evaluate(data: MarketData[]) {
    // Call parent evaluate to store current data
    await super.evaluate(data)

    if (data.length < Math.max(this.bollingerPeriod, this.rsiPeriod)) {
      if (!this.isBacktesting) {
        this.onLog("Not enough data for indicators calculation", "info")
      }
      return
    }

    // Calculate indicators
    const rsi = this.calculateRSI(data, this.rsiPeriod)
    const bollinger = this.calculateBollingerBands(data, this.bollingerPeriod, this.bollingerStdDev)

    const currentPrice = data[data.length - 1][4]
    const currentRSI = rsi[rsi.length - 1]
    const upperBand = bollinger.upper[bollinger.upper.length - 1]
    const lowerBand = bollinger.lower[bollinger.lower.length - 1]

    // Check stop conditions first
    if (this.checkStopConditions(currentPrice)) {
      return
    }

    // Check for mean reversion signals
    if (currentPrice > upperBand && currentRSI > this.rsiOverbought) {
      // Overbought condition
      if (!this.position || this.position.side !== "short") {
        if (this.position) {
          await this.exitPosition()
        }
        await this.enterPosition("short")
      }
    } else if (currentPrice < lowerBand && currentRSI < this.rsiOversold) {
      // Oversold condition
      if (!this.position || this.position.side !== "long") {
        if (this.position) {
          await this.exitPosition()
        }
        await this.enterPosition("long")
      }
    }
  }
}

