import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore, type CartItem } from '@/lib/cart-store'
import { router } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import InputError from '@/components/input-error'

type CheckoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (orderNumber?: string) => void
}

export default function CheckoutDialog({ open, onOpenChange, onSuccess }: CheckoutDialogProps) {
  const { items, total } = useCartStore()
  const { auth } = usePage<{ auth: { user: any } }>().props
  const isAuthenticated = !!auth?.user

  const [formData, setFormData] = React.useState({
    type: 'pickup' as 'pickup' | 'delivery' | 'reservation',
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
    if (open && isAuthenticated && auth?.user) {
      setFormData(prev => ({
        ...prev,
        customer_name: auth.user.name || '',
        customer_email: auth.user.email || '',
        customer_phone: auth.user.phone || '',
      }))
    }
  }, [open, isAuthenticated, auth])

  const subtotal = total()
  const tax = subtotal * 0.1 // 10% tax
  const deliveryFee = formData.type === 'delivery' ? 5.0 : 0
  const finalTotal = subtotal + tax + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          })),
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          // Laravel validation errors format: { field: ['error1', 'error2'] }
          const formattedErrors: Record<string, string> = {}
          Object.keys(data.errors).forEach(key => {
            formattedErrors[key] = Array.isArray(data.errors[key]) 
              ? data.errors[key][0] 
              : data.errors[key]
          })
          setErrors(formattedErrors)
        } else {
          setErrors({ general: data.message || 'Failed to place order. Please try again.' })
        }
        setProcessing(false)
        return
      }

      // Success - pass order number if available
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4 text-red-800 text-sm">
              {errors.general}
            </div>
          )}

          {/* Order Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Order Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => handleChange('type', value)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="reservation">Reservation</SelectItem>
              </SelectContent>
            </Select>
            <InputError message={errors.type} />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  required
                  disabled={processing}
                />
                <InputError message={errors.customer_name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleChange('customer_email', e.target.value)}
                  required
                  disabled={processing || isAuthenticated}
                />
                <InputError message={errors.customer_email} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone Number</Label>
              <Input
                id="customer_phone"
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => handleChange('customer_phone', e.target.value)}
                disabled={processing}
              />
              <InputError message={errors.customer_phone} />
            </div>
          </div>

          {/* Delivery Information */}
          {formData.type === 'delivery' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Delivery Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="delivery_address">Address *</Label>
                <Input
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => handleChange('delivery_address', e.target.value)}
                  required={formData.type === 'delivery'}
                  disabled={processing}
                />
                <InputError message={errors.delivery_address} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_city">City</Label>
                  <Input
                    id="delivery_city"
                    value={formData.delivery_city}
                    onChange={(e) => handleChange('delivery_city', e.target.value)}
                    disabled={processing}
                  />
                  <InputError message={errors.delivery_city} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_state">State</Label>
                  <Input
                    id="delivery_state"
                    value={formData.delivery_state}
                    onChange={(e) => handleChange('delivery_state', e.target.value)}
                    disabled={processing}
                  />
                  <InputError message={errors.delivery_state} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_postal_code">Postal Code</Label>
                  <Input
                    id="delivery_postal_code"
                    value={formData.delivery_postal_code}
                    onChange={(e) => handleChange('delivery_postal_code', e.target.value)}
                    disabled={processing}
                  />
                  <InputError message={errors.delivery_postal_code} />
                </div>
              </div>
            </div>
          )}

          {/* Scheduling */}
          {(formData.type === 'pickup' || formData.type === 'reservation') && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_date_time">Preferred Date & Time</Label>
              <Input
                id="scheduled_date_time"
                type="datetime-local"
                value={formData.scheduled_date_time}
                onChange={(e) => handleChange('scheduled_date_time', e.target.value)}
                disabled={processing}
              />
              <InputError message={errors.scheduled_date_time} />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={processing}
            />
            <InputError message={errors.notes} />
          </div>

          {/* Order Summary */}
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-600">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing || items.length === 0}
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
            >
              {processing ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

