import * as React from 'react'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, X, Shield, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { useAppearance } from '@/hooks/use-appearance'
import CheckoutDialog from '@/components/checkout-dialog'
import SuccessDialog from '@/components/success-dialog'

const fallbackImage = 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clear } = useCartStore()
  const { updateAppearance } = useAppearance()
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null)
  const [removingId, setRemovingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    updateAppearance('light')
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = total()
  const tax = subtotal * 0.1
  const finalTotal = subtotal + tax

  const handleOrderSuccess = (orderNum?: string) => {
    clear()
    setCheckoutOpen(false)
    setOrderNumber(orderNum || null)
    setSuccessOpen(true)
  }

  const handleRemoveItem = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      removeItem(id)
      setRemovingId(null)
    }, 300)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-[#A67C5B]/10 blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 h-72 w-72 rounded-full bg-orange-300/15 blur-3xl" />
        <div className="absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-[#A67C5B]/8 blur-3xl" />
      </div>

      <Navbar active="Cart" />
      <Head title="Your Cart" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="group mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-[#A67C5B]"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Continue Shopping
            </Link>
            <h1
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ fontFamily: 'Barlow' }}
            >
              Your Cart
            </h1>
            <p className="mt-1 text-slate-500">
              {itemCount === 0
                ? 'No items yet'
                : `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clear()}
              className="gap-1.5 text-sm text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-3.5" />
              Clear All
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white/80 py-24 shadow-sm backdrop-blur-sm">
            <div className="relative mb-8">
              {/* Pulsing rings */}
              <div className="absolute inset-0 animate-ping rounded-full bg-[#A67C5B]/10" style={{ animationDuration: '2s' }} />
              <div className="absolute -inset-3 animate-pulse rounded-full bg-orange-100/60" style={{ animationDuration: '3s' }} />
              <div className="relative flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100">
                <ShoppingBag className="size-12 text-[#A67C5B]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Barlow' }}>
              Your cart is empty
            </h2>
            <p className="mt-2 max-w-xs text-center text-slate-500">
              Discover our delicious menu and add your favorites to get started
            </p>
            <Link href="/">
              <Button className="mt-8 h-12 rounded-full bg-[#A67C5B] px-10 text-base font-semibold text-white shadow-lg shadow-[#A67C5B]/25 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-600/25 hover:-translate-y-0.5">
                Browse Menu
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${removingId === item.id
                      ? 'scale-95 opacity-0'
                      : 'scale-100 opacity-100'
                    }`}
                  style={{
                    animation: `fadeSlideIn 0.4s ease-out ${index * 0.08}s both`,
                  }}
                >
                  <div className="flex">
                    {/* Product Image */}
                    <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden sm:h-44 sm:w-48">
                      <img
                        src={item.image || fallbackImage}
                        alt={item.name}
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Subtle edge gradient */}
                      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/90 to-transparent" />
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                {item.size}
                              </span>
                              {item.extraName && (
                                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-[#A67C5B]">
                                  + {item.extraName}
                                </span>
                              )}
                              <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="rounded-full p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 hover:scale-110"
                            aria-label="Remove item"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-[#A67C5B] hover:text-white hover:scale-105 active:scale-95"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <div className="flex size-10 items-center justify-center text-base font-bold text-slate-900">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex size-10 items-center justify-center rounded-xl bg-[#A67C5B] text-white transition-all hover:bg-orange-600 hover:scale-105 active:scale-95"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xl font-bold text-slate-900">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-slate-400">
                              ${item.unitPrice.toFixed(2)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div
                className="sticky top-28 overflow-hidden rounded-2xl bg-white/90 shadow-sm backdrop-blur-sm"
                style={{ animation: 'fadeSlideIn 0.5s ease-out 0.2s both' }}
              >
                {/* Summary header with gradient */}
                <div className="bg-gradient-to-r from-[#A67C5B] to-[#c4956a] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
                      <ShoppingBag className="size-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Order Summary</h2>
                      <p className="text-xs text-white/70">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Mini item list */}
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="mr-2 truncate text-slate-600">
                          {item.name}{' '}
                          <span className="text-slate-400">×{item.quantity}</span>
                        </span>
                        <span className="flex-shrink-0 font-semibold text-slate-800">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-5 space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tax (10%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex justify-between rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-base font-bold text-slate-900">
                      <span>Total</span>
                      <span className="text-[#A67C5B]">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Button
                    onClick={() => setCheckoutOpen(true)}
                    className="checkout-pulse mt-6 h-13 w-full rounded-full bg-[#A67C5B] text-base font-semibold text-white shadow-lg shadow-[#A67C5B]/25 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-600/25 hover:-translate-y-0.5"
                  >
                    Proceed to Checkout
                  </Button>

                  {/* Trust badge */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                    <Shield className="size-3.5" />
                    <span>Secure checkout • Fresh guarantee</span>
                  </div>

                  <Link
                    href="/"
                    className="group mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-[#A67C5B]"
                  >
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bottom checkout bar */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
          style={{ animation: 'slideUp 0.4s ease-out' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-bold text-[#A67C5B]">${finalTotal.toFixed(2)}</p>
            </div>
            <Button
              onClick={() => setCheckoutOpen(true)}
              className="h-12 flex-1 rounded-full bg-[#A67C5B] text-base font-semibold text-white shadow-lg shadow-[#A67C5B]/25 hover:bg-orange-600"
            >
              Checkout ({itemCount})
            </Button>
          </div>
        </div>
      )}

      {/* Bottom spacer for mobile sticky bar */}
      {items.length > 0 && <div className="h-24 lg:hidden" />}

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSuccess={handleOrderSuccess}
      />
      <SuccessDialog open={successOpen} onOpenChange={setSuccessOpen} orderNumber={orderNumber} />

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .checkout-pulse {
          animation: checkoutPulse 2.5s ease-in-out infinite;
        }

        @keyframes checkoutPulse {
          0%, 100% {
            box-shadow: 0 10px 15px -3px rgba(166, 124, 91, 0.25);
          }
          50% {
            box-shadow: 0 10px 25px -3px rgba(166, 124, 91, 0.4);
          }
        }
      `}</style>
    </div>
  )
}
