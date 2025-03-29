import type { StrategyParams, Position, MarketData, BacktestResults } from "@/lib/types"

export class BaseStrategy {
  protected exchange
  protected symbol
  protected positionSize
  protected riskParams
  public position: Position | null = null
  protected isBacktesting: boolean
  protected backtestResults: BacktestResults | null
  protected currentData: MarketData[] = []
  protected onPositionChange
  protected onOrderCreated
  protected onLog

  constructor(params: StrategyParams) {
    this.exchange = params.exchange
    this.symbol = params.symbol
    this.positionSize = params.positionSize
    this.riskParams = params.riskParams
    this.isBacktesting = params.isBacktesting || false
    this.backtestResults = params.backtestResults || null
    this.onPositionChange = params.onPositionChange
    this.onOrderCreated = params.onOrderCreated
    this.onLog = params.onLog
  }

  async evaluate(data: MarketData[]) {
    // To be implemented by child classes
    this.currentData = data
  }

  async enterPosition(side: "long" | "short") {
    if (this.position) {
      if (!this.isBacktesting) {
        this.onLog("Already in a position, cannot enter new one", "info")
      }
      return
    }

    try {
      const currentPrice = this.currentData[this.currentData.length - 1][4]
      const timestamp = this.currentData[this.currentData.length - 1][0]

      if (this.isBacktesting) {
        // In backtesting mode, simulate order execution
        this.position = {
          side: side,
          entryPrice: currentPrice,
          entryTime: timestamp,
          contracts: side === "long" ? this.positionSize : -this.positionSize,
        }

        if (this.backtestResults) {
          this.backtestResults.trades.push({
            timestamp: timestamp,
            side: side,
            price: currentPrice,
            profit: 0, // Will be calculated when position is closed
            status: "open",
          })
        }

        this.onLog(`[Backtest] Entered ${side} position at ${currentPrice}`, "info")
      } else {
        // Real trading mode
        const order = await this.exchange.createOrder(
          this.symbol,
          "market",
          side === "long" ? "buy" : "sell",
          this.positionSize,
        )

        this.position = {
          side: side,
          entryPrice: order.price,
          entryTime: Date.now(),
          contracts: side === "long" ? this.positionSize : -this.positionSize,
        }

        this.onPositionChange(this.position)
        this.onOrderCreated(order)
        this.onLog(`Entered ${side} position at ${order.price}`, "success")
      }
    } catch (error) {
      this.onLog(`Failed to enter ${side} position: ${error}`, "error")
    }
  }

  async exitPosition() {
    if (!this.position) {
      if (!this.isBacktesting) {
        this.onLog("No position to exit", "info")
      }
      return
    }

    try {
      const currentPrice = this.currentData[this.currentData.length - 1][4]
      const timestamp = this.currentData[this.currentData.length - 1][0]

      if (this.isBacktesting) {
        // In backtesting mode, calculate PnL
        let pnl
        if (this.position.side === "long") {
          pnl = ((currentPrice - this.position.entryPrice) / this.position.entryPrice) * this.positionSize
        } else {
          pnl = ((this.position.entryPrice - currentPrice) / this.position.entryPrice) * this.positionSize
        }

        // Find the open trade and update it
        if (this.backtestResults) {
          const openTrade = this.backtestResults.trades.find((t) => t.status === "open")
          if (openTrade) {
            openTrade.profit = pnl
            openTrade.status = "closed"
            openTrade.exitPrice = currentPrice
            openTrade.exitTime = timestamp

            // Update current balance in results
            this.backtestResults.currentBalance += pnl

            // Update peak balance and max drawdown
            if (this.backtestResults.currentBalance > this.backtestResults.peakBalance) {
              this.backtestResults.peakBalance = this.backtestResults.currentBalance
            } else {
              const drawdown =
                ((this.backtestResults.peakBalance - this.backtestResults.currentBalance) /
                  this.backtestResults.peakBalance) *
                100
              if (drawdown > this.backtestResults.maxDrawdown) {
                this.backtestResults.maxDrawdown = drawdown
              }
            }
          }
        }

        this.onLog(`[Backtest] Exited position at ${currentPrice} (PNL: ${pnl.toFixed(2)} USDT)`, "info")
      } else {
        // Real trading mode
        const exitSide = this.position.side === "long" ? "sell" : "buy"
        const exitAmount = Math.abs(this.position.contracts)

        const order = await this.exchange.createOrder(this.symbol, "market", exitSide, exitAmount)

        const pnl =
          this.position.side === "long"
            ? ((order.price - this.position.entryPrice) / this.position.entryPrice) * 100
            : ((this.position.entryPrice - order.price) / this.position.entryPrice) * 100

        this.onOrderCreated(order)
        this.onLog(`Exited position at ${order.price} (PNL: ${pnl.toFixed(2)}%)`, "success")

        this.onPositionChange(null)
      }

      // Clear the position in both modes
      this.position = null
    } catch (error) {
      this.onLog(`Failed to exit position: ${error}`, "error")
    }
  }

  checkStopConditions(currentPrice: number): boolean {
    if (!this.position) return false

    const { stopLoss, takeProfit, trailingStop } = this.riskParams
    const entryPrice = this.position.entryPrice
    let shouldExit = false
    let reason = ""

    // Check stop loss
    if (stopLoss) {
      if (this.position.side === "long" && currentPrice <= entryPrice * (1 - stopLoss)) {
        shouldExit = true
        reason = `Stop loss triggered (${(stopLoss * 100).toFixed(1)}%)`
      } else if (this.position.side === "short" && currentPrice >= entryPrice * (1 + stopLoss)) {
        shouldExit = true
        reason = `Stop loss triggered (${(stopLoss * 100).toFixed(1)}%)`
      }
    }

    // Check take profit
    if (takeProfit && !shouldExit) {
      if (this.position.side === "long" && currentPrice >= entryPrice * (1 + takeProfit)) {
        shouldExit = true
        reason = `Take profit triggered (${(takeProfit * 100).toFixed(1)}%)`
      } else if (this.position.side === "short" && currentPrice <= entryPrice * (1 - takeProfit)) {
        shouldExit = true
        reason = `Take profit triggered (${(takeProfit * 100).toFixed(1)}%)`
      }
    }

    if (shouldExit) {
      if (!this.isBacktesting) {
        this.onLog(reason, "info")
      }
      this.exitPosition()
    }

    return shouldExit
  }
}

