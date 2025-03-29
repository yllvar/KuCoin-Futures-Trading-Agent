export type Strategy = "trend_following" | "mean_reversion" | "breakout"

export type MarketData = [
  number, // timestamp
  number, // open
  number, // high
  number, // low
  number, // close
  number, // volume
]

export interface Position {
  side: "long" | "short"
  entryPrice: number
  entryTime: number
  contracts: number
}

export interface Order {
  id: string
  timestamp: number
  datetime: string
  symbol: string
  type: string
  side: string
  price: number
  amount: number
  cost: number
  fee: {
    cost: number
    currency: string
  }
  status: string
}

export interface LogEntry {
  message: string
  type: "info" | "success" | "error" | "warning"
  timestamp: number
}

export interface Exchange {
  fetchBalance: () => Promise<{ [key: string]: { total: number; used: number; free: number } }>
  fetchOHLCV: (symbol: string, timeframe: string, since?: number, limit?: number) => Promise<MarketData[]>
  setLeverage: (leverage: number, symbol: string) => Promise<boolean>
  createOrder: (
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price?: number | null,
    params?: any,
  ) => Promise<Order>
  loadMarkets: () => Promise<any>
}

export interface StrategyParams {
  exchange: Exchange
  symbol: string
  positionSize: number
  riskParams: {
    stopLoss: number
    takeProfit: number
    trailingStop: number
  }
  onPositionChange: (position: Position | null) => void
  onOrderCreated: (order: Order) => void
  onLog: (message: string, type?: "info" | "success" | "error" | "warning") => void
  isBacktesting?: boolean
  backtestResults?: BacktestResults
}

export interface BacktestTrade {
  timestamp: number
  side: string
  price: number
  profit: number
  status: "open" | "closed"
  exitPrice?: number
  exitTime?: number
}

export interface BacktestResults {
  initialBalance: number
  currentBalance: number
  trades: BacktestTrade[]
  maxDrawdown: number
  peakBalance: number
}

export interface BacktestResultData {
  initialBalance: number
  finalBalance: number
  totalProfit: number
  profitPercentage: number
  winRate: number
  maxDrawdown: number
  profitFactor: number
  trades: BacktestTrade[]
}

