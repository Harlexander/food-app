import * as React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/lib/cart-store'
import { usePage } from '@inertiajs/react'
import InputError from '@/components/input-error'
import { ArrowLeft, MapPin, Package, CalendarClock, Truck, User, ShoppingBag, Loader2 } from 'lucide-react'

type CheckoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (orderNumber?: string) => void
}

type Step = 'type' | 'details' | 'review'

const orderTypes = [
  { value: 'pickup' as const, label: 'Pickup', description: 'Come pick up your order', icon: Package },
  { value: 'delivery' as const, label: 'Delivery', description: 'We deliver to your door', icon: Truck },
  { value: 'reservation' as const, label: 'Reservation', description: 'Reserve for a date & time', icon: CalendarClock },
]

export default function CheckoutDialog({ open, onOpenChange, onSuccess }: CheckoutDialogProps) {
  const { items, total } = useCartStore()
  const { auth } = usePage<{ auth: { user: any } }>().props
  const isAuthenticated = !!auth?.user

  const [step, setStep] = React.useState<Step>('type')

  const [formData, setFormData] = React.useState({
    type: '' as '' | 'pickup' | 'delivery' | 'reservation',
    customer_name: auth?.user?.name || '',
    customer_email: auth?.user?.email || '',
    customer_phone: auth?.user?.phone || '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_postal_code: '',
    scheduled_date_time: '',
    notes: '',
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [processing, setProcessing] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setStep('type')
      setErrors({})
      setProcessing(false)
      setFormData(prev => ({
        ...prev,
        type: '',
        customer_name: auth?.user?.name || '',
        customer_email: auth?.user?.email || '',
        customer_phone: auth?.user?.phone || '',
        delivery_address: '',
        delivery_city: '',
        delivery_state: '',
        delivery_postal_code: '',
        scheduled_date_time: '',
        notes: '',
      }))
    }
  }, [open, auth])

  const subtotal = total()
  const tax = subtotal * 0.1
  const deliveryFee = formData.type === 'delivery' ? 5.0 : 0
  const finalTotal = subtotal + tax + deliveryFee

  const handleSubmit = async () => {
    setErrors({})
    setProcessing(true)

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

      const response = await fetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            extraName: item.extraName || null,
            extraPrice: item.extraPrice || null,
          })),
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const formattedErrors: Record<string, string> = {}
          Object.keys(data.errors).forEach(key => {
            formattedErrors[key] = Array.isArray(data.errors[key])
              ? data.errors[key][0]
              : data.errors[key]
          })
          setErrors(formattedErrors)
          // Go back to details step if there are field errors
          if (Object.keys(formattedErrors).some(k => k !== 'general')) {
            setStep('details')
          }
        } else {
          setErrors({ general: data.message || 'Failed to place order. Please try again.' })
        }
        setProcessing(false)
        return
      }

      onSuccess(data.order?.order_number)
      onOpenChange(false)
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
      setProcessing(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const canProceedToReview = () => {
    if (!formData.customer_name || !formData.customer_email) return false
    if (formData.type === 'delivery' && !formData.delivery_address) return false
    return true
  }

  const stepNumber = step === 'type' ? 1 : step === 'details' ? 2 : 3

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#A67C5B] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            {step !== 'type' && (
              <button
                onClick={() => setStep(step === 'review' ? 'details' : 'type')}
                className="rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="size-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold">Checkout</h2>
              <p className="text-sm text-white/80">Step {stepNumber} of 3</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${s <= stepNumber ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {/* Step 1: Order Type */}
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">How would you like to receive your order?</p>
              <div className="grid gap-3">
                {orderTypes.map((option) => {
                  const Icon = option.icon
                  const selected = formData.type === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleChange('type', option.value)
                        setStep('details')
                      }}
                      className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-[#A67C5B] hover:bg-orange-50/50 ${selected ? 'border-[#A67C5B] bg-orange-50/50' : 'border-slate-200'}`}
                    >
                      <div className={`flex size-12 items-center justify-center rounded-full ${selected ? 'bg-[#A67C5B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{option.label}</div>
                        <div className="text-sm text-slate-500">{option.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Contact & Delivery Details */}
          {step === 'details' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <User className="size-4" />
                <span>Your details</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="customer_name" className="text-xs font-medium text-slate-600">Full Name</Label>
                    <Input
                      id="customer_name"
                      placeholder="John Doe"
                      value={formData.customer_name}
                      onChange={(e) => handleChange('customer_name', e.target.value)}
                      disabled={processing}
                      className="h-11"
                    />
                    <InputError message={errors.customer_name} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customer_email" className="text-xs font-medium text-slate-600">Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.customer_email}
                      onChange={(e) => handleChange('customer_email', e.target.value)}
                      disabled={processing || isAuthenticated}
                      className="h-11"
                    />
                    <InputError message={errors.customer_email} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customer_phone" className="text-xs font-medium text-slate-600">Phone Number</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.customer_phone}
                    onChange={(e) => handleChange('customer_phone', e.target.value)}
                    disabled={processing}
                    className="h-11"
                  />
                  <InputError message={errors.customer_phone} />
                </div>
              </div>

              {/* Delivery Address */}
              {formData.type === 'delivery' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="size-4" />
                    <span>Delivery address</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="delivery_address" className="text-xs font-medium text-slate-600">Address</Label>
                    <Input
                      id="delivery_address"
                      placeholder="123 Main St"
                      value={formData.delivery_address}
                      onChange={(e) => handleChange('delivery_address', e.target.value)}
                      disabled={processing}
                      className="h-11"
                    />
                    <InputError message={errors.delivery_address} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="delivery_city" className="text-xs font-medium text-slate-600">City</Label>
                      <Input
                        id="delivery_city"
                        placeholder="City"
                        value={formData.delivery_city}
                        onChange={(e) => handleChange('delivery_city', e.target.value)}
                        disabled={processing}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="delivery_state" className="text-xs font-medium text-slate-600">State</Label>
                      <Input
                        id="delivery_state"
                        placeholder="State"
                        value={formData.delivery_state}
                        onChange={(e) => handleChange('delivery_state', e.target.value)}
                        disabled={processing}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="delivery_postal_code" className="text-xs font-medium text-slate-600">Zip</Label>
                      <Input
                        id="delivery_postal_code"
                        placeholder="00000"
                        value={formData.delivery_postal_code}
                        onChange={(e) => handleChange('delivery_postal_code', e.target.value)}
                        disabled={processing}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduling */}
              {(formData.type === 'pickup' || formData.type === 'reservation') && (
                <div className="space-y-1.5">
                  <Label htmlFor="scheduled_date_time" className="text-xs font-medium text-slate-600">Preferred Date & Time</Label>
                  <Input
                    id="scheduled_date_time"
                    type="datetime-local"
                    value={formData.scheduled_date_time}
                    onChange={(e) => handleChange('scheduled_date_time', e.target.value)}
                    disabled={processing}
                    className="h-11"
                  />
                  <InputError message={errors.scheduled_date_time} />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-medium text-slate-600">Special Instructions (optional)</Label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Any special requests..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={processing}
                />
              </div>

              <Button
                className="h-12 w-full rounded-full bg-[#A67C5B] text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                disabled={!canProceedToReview()}
                onClick={() => setStep('review')}
              >
                Review Order
              </Button>
            </div>
          )}

          {/* Step 3: Review & Place Order */}
          {step === 'review' && (
            <div className="space-y-5">
              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <ShoppingBag className="size-4" />
                  <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          {item.size}{item.extraName ? ` + ${item.extraName}` : ''} x {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">${(item.unitPrice * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery info summary */}
              <div className="rounded-lg border border-slate-200 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Type</span>
                  <span className="font-medium text-slate-800 capitalize">{formData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium text-slate-800">{formData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-800">{formData.customer_email}</span>
                </div>
                {formData.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-800">{formData.customer_phone}</span>
                  </div>
                )}
                {formData.type === 'delivery' && formData.delivery_address && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address</span>
                    <span className="font-medium text-slate-800 text-right max-w-[200px]">
                      {[formData.delivery_address, formData.delivery_city, formData.delivery_state, formData.delivery_postal_code].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {formData.scheduled_date_time && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled</span>
                    <span className="font-medium text-slate-800">
                      {new Date(formData.scheduled_date_time).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#A67C5B]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-full bg-[#A67C5B] text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                disabled={processing}
                onClick={handleSubmit}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    Placing Order...
                  </span>
                ) : (
                  `Place Order — $${finalTotal.toFixed(2)}`
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
