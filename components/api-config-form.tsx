"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ApiConfigFormProps {
  onConnect: (apiKey: string, apiSecret: string, apiPassphrase: string) => Promise<void>
  isConnected: boolean
}

export default function ApiConfigForm({ onConnect, isConnected }: ApiConfigFormProps) {
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [apiPassphrase, setApiPassphrase] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!apiKey || !apiSecret || !apiPassphrase) return

    setIsConnecting(true)
    try {
      await onConnect(apiKey, apiSecret, apiPassphrase)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="bg-[#16213e] border-none shadow-lg">
      <CardContent className="p-6">
        <CardTitle className="text-lg mb-4 text-[#40c9ff] border-b border-gray-700 pb-2">API Configuration</CardTitle>
        <Input
          type="text"
          placeholder="KuCoin API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mb-4 bg-[#1a1a2e] border-gray-700 text-white"
          disabled={isConnected}
        />
        <Input
          type="password"
          placeholder="KuCoin API Secret"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          className="mb-4 bg-[#1a1a2e] border-gray-700 text-white"
          disabled={isConnected}
        />
        <Input
          type="password"
          placeholder="KuCoin API Passphrase"
          value={apiPassphrase}
          onChange={(e) => setApiPassphrase(e.target.value)}
          className="mb-4 bg-[#1a1a2e] border-gray-700 text-white"
          disabled={isConnected}
        />
        <Button
          onClick={handleConnect}
          className="w-full bg-[#40c9ff] text-black hover:bg-[#00a1e4]"
          disabled={isConnected || isConnecting || !apiKey || !apiSecret || !apiPassphrase}
        >
          {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Connect to KuCoin"}
        </Button>
      </CardContent>
    </Card>
  )
}

