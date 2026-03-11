import * as React from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import SuccessDialog from '@/components/success-dialog'
import CheckoutDialog from '@/components/checkout-dialog'

export default function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, updateQuantity, removeItem, total, clear } = useCartStore()
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = total()

  const handleOrderSuccess = (orderNum?: string) => {
    clear()
    onOpenChange(false)
    setCheckoutOpen(false)
    setOrderNumber(orderNum || null)
    setSuccessOpen(true)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#A67C5B] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your Cart</h2>
              <p className="text-xs text-white/80">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-slate-100">
                <ShoppingBag className="size-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-400">Add some delicious items to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="group rounded-xl bg-slate-50 p-3.5 transition-colors hover:bg-slate-100/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="rounded-full bg-white px-2 py-0.5">{item.size}</span>
                        {item.extraName && (
                          <span className="rounded-full bg-white px-2 py-0.5">{item.extraName}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#A67C5B] hover:text-[#A67C5B]"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#A67C5B] hover:text-[#A67C5B]"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-slate-900">${(item.unitPrice * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-white px-5 py-4 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (10%)</span>
                <span>${(subtotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t text-base font-bold text-slate-900">
                <span>Estimated Total</span>
                <span className="text-[#A67C5B]">${(subtotal * 1.1).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => clear()}
                className="h-11 flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                Clear Cart
              </Button>
              <Button
                onClick={() => setCheckoutOpen(true)}
                className="h-11 flex-[2] rounded-full bg-[#A67C5B] text-white font-semibold hover:bg-orange-600 shadow-lg shadow-[#A67C5B]/20"
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSuccess={handleOrderSuccess}
      />
      <SuccessDialog open={successOpen} onOpenChange={setSuccessOpen} orderNumber={orderNumber} />
    </Sheet>
  )
}
