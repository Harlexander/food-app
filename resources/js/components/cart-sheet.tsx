import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

export default function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, updateQuantity, removeItem, total, clear } = useCartStore()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-3 px-4">
        <SheetHeader className="border-b pb-3">
          <SheetTitle className="text-xl">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {items.length === 0 && <div className="text-sm text-muted-foreground">Your cart is empty.</div>}
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.size} • {item.category}</div>
                </div>
                <Button variant="ghost" size="icon" className="text-orange-600 hover:bg-orange-50" onClick={() => removeItem(item.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="border-orange-200 hover:bg-orange-50" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus className="size-4 text-orange-600" /></Button>
                  <div className="grid h-9 w-12 place-items-center rounded-md border bg-orange-50/40 text-orange-700">{item.quantity}</div>
                  <Button variant="outline" size="icon" className="border-orange-200 hover:bg-orange-50" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="size-4 text-orange-600" /></Button>
                </div>
                <div className="font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
        <SheetFooter className="border-t pt-3">
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-600">${total().toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-orange-200 hover:bg-orange-50" onClick={() => clear()}>Clear</Button>
              <Button className="flex-1 bg-orange-500 text-white hover:bg-orange-600">Order Now</Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


