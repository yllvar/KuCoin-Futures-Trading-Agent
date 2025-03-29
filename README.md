# KuCoin Futures Trading Agent

<img width="953" alt="Screenshot 2025-03-29 at 21 35 11" src="https://github.com/user-attachments/assets/7a56c4e4-c77d-4e11-8c23-cd0569dc0c30" />

A powerful, customizable trading bot for KuCoin Futures markets built with Next.js. This application allows you to implement and backtest various trading strategies on cryptocurrency futures markets.

## Features

- **Multiple Trading Strategies**:
  - Trend Following (EMA-based)
  - Mean Reversion (Bollinger Bands + RSI)
  - Breakout Trading (Price Range + Confirmation)

- **Advanced Risk Management**:
  - Stop Loss
  - Take Profit
  - Trailing Stop
  - Maximum Daily Loss

- **Comprehensive Backtesting**:
  - Test strategies against historical data
  - Detailed performance metrics
  - Trade history visualization
  - Export results to CSV

- **Real-time Trading**:
  - Live market data integration
  - Automated trade execution
  - Position management
  - Order history tracking

- **User-friendly Interface**:
  - Clean, modern UI with dark theme
  - Real-time price charts
  - Trading logs
  - Strategy configuration panels

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- KuCoin Futures API credentials (key, secret, passphrase)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yllvar/KuCoin-Futures-Trading-Agent.git
   cd KuCoin-Futures-Trading-Agent

   Thought for 2 secondsI'll create a comprehensive README.md file for the KuCoin Futures Trading Agent project:

```markdown file="README.md"
...
```

2. Install dependencies:

```shellscript
npm install
# or
yarn install
```


3. Run the development server:

```shellscript
npm run dev
# or
yarn dev
```


4. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Usage

### Connecting to KuCoin

1. Create API credentials in your KuCoin Futures account
2. Enter your API Key, Secret, and Passphrase in the API Configuration section
3. Click "Connect to KuCoin"


### Setting Up a Strategy

1. Select a trading strategy (Trend Following, Mean Reversion, or Breakout)
2. Configure trading parameters:

1. Symbol (e.g., BTC/USDT:USDT)
2. Timeframe (1m, 5m, 15m, 1h, 4h, 1d)
3. Position Size
4. Leverage



3. Set risk management parameters:

1. Stop Loss percentage
2. Take Profit percentage
3. Trailing Stop percentage





### Backtesting

1. Navigate to the Backtesting tab
2. Enter the number of days to backtest
3. Click "Run Backtest"
4. Review performance metrics:

1. Total Profit
2. Win Rate
3. Maximum Drawdown
4. Profit Factor



5. Export results to CSV for further analysis


### Live Trading

1. Configure your strategy and risk parameters
2. Click "Start Trading"
3. Monitor positions, orders, and trading logs
4. Use "Close Position" to manually exit a trade
5. Click "Stop Trading" to halt the bot


## Project Structure

```plaintext
KuCoin-Futures-Trading-Agent/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── backtesting/        # Backtesting components
│   └── ui/                 # UI components (shadcn/ui)
├── hooks/                  # Custom React hooks
│   ├── use-backtesting.tsx # Backtesting logic
│   ├── use-exchange.tsx    # Exchange connection
│   └── use-trading.tsx     # Trading logic
├── lib/                    # Utility functions and types
│   ├── strategies/         # Trading strategies
│   └── types.ts            # TypeScript type definitions
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Trading Strategies

### Trend Following

Uses Exponential Moving Averages (EMA) to identify market trends. Enters long positions when price is above fast EMA and fast EMA is above slow EMA. Enters short positions when price is below fast EMA and fast EMA is below slow EMA.

### Mean Reversion

Combines Bollinger Bands and Relative Strength Index (RSI) to identify overbought and oversold conditions. Enters short positions when price is above upper band and RSI is overbought. Enters long positions when price is below lower band and RSI is oversold.

### Breakout

Identifies price breakouts from established ranges. Enters long positions when price breaks above recent highs with confirmation. Enters short positions when price breaks below recent lows with confirmation.

## Risk Management

- **Stop Loss**: Exits position when loss reaches specified percentage
- **Take Profit**: Exits position when profit reaches specified percentage
- **Trailing Stop**: Adjusts stop loss as price moves in favorable direction
- **Max Daily Loss**: Stops trading when daily loss exceeds specified percentage


## Backtesting

The backtesting engine allows you to test strategies against historical data without risking real capital. Key metrics include:

- **Total Profit**: Absolute and percentage profit
- **Win Rate**: Percentage of profitable trades
- **Max Drawdown**: Largest peak-to-trough decline
- **Profit Factor**: Ratio of gross profit to gross loss
- **Trade History**: Complete record of all simulated trades


## Security

- API credentials are stored locally and never sent to any server
- All trading occurs directly between your browser and KuCoin
- No user data is collected or stored


## Disclaimer

This software is for educational and research purposes only. Use at your own risk. Cryptocurrency futures trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Chart.js](https://www.chartjs.org/)
- [KuCoin Futures API](https://docs.kucoin.com/futures)


