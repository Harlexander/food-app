import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Phone, Mail } from 'lucide-react'

export default function SuccessDialog({ 
  open, 
  onOpenChange,
  orderNumber 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  orderNumber?: string | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            Order Submitted Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-600">
            Thank you for your order! We have received your request and will contact you shortly to confirm the details and arrange delivery.
          </p>
          
          {orderNumber && (
            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
            </div>
          )}
          
          <div className="rounded-lg bg-orange-50 p-4">
            <div className="flex items-center justify-center gap-2 text-orange-800">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">We'll call you within 15 minutes</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-orange-700">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Check your email for order confirmation</span>
            </div>
          </div>
          
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-[#A67C5B] text-white hover:bg-orange-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
