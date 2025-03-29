"use client"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import type { Order } from "@/lib/types"

interface OrderHistoryProps {
  orders: Order[]
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  return (
    <Card className="bg-[#16213e] border-none shadow-lg">
      <CardContent className="p-6">
        <CardTitle className="text-lg mb-4 text-[#40c9ff] border-b border-gray-700 pb-2">Order History</CardTitle>

        <div className="max-h-[300px] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No orders yet</div>
          ) : (
            orders.map((order, index) => (
              <div
                key={index}
                className={`py-3 px-2 border-b border-gray-700 text-sm ${
                  order.side === "buy" ? "text-green-500" : "text-red-500"
                }`}
              >
                {new Date(order.timestamp).toLocaleTimeString()} -{order.side === "buy" ? " Bought " : " Sold "}
                {order.amount} {order.symbol.split("/")[0]} at {order.price}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

