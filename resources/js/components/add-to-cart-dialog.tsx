import * as React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus } from 'lucide-react'
import { useCartStore, type CartItem } from '@/lib/cart-store'

type PortionSizes = Record<string, number>

export type AddToCartDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  description?: string
  category: string
  portion_sizes: PortionSizes
  image?: string
}

export default function AddToCartDialog({ open, onOpenChange, name, category, portion_sizes, image }: AddToCartDialogProps) {
  const sizeNames = Object.keys(portion_sizes)
  const [selectedSize, setSelectedSize] = React.useState<string>(sizeNames[0] ?? '')
  const [quantity, setQuantity] = React.useState<number>(1)
  const addItem = useCartStore((s: { addItem: (item: Omit<CartItem, 'id'>) => void }) => s.addItem)

  // Reset internal state whenever a new product opens or dialog is reopened
  React.useEffect(() => {
    if (open) {
      setSelectedSize(sizeNames[0] ?? '')
      setQuantity(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, name])

  React.useEffect(() => {
    if (!selectedSize && sizeNames.length) setSelectedSize(sizeNames[0])
  }, [sizeNames, selectedSize])

  const base = selectedSize ? portion_sizes[selectedSize] : 0
  const total = base * quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 h-[90vh] 2xl:h-auto  overflow-y-auto">
        <div className="grid grid-cols-1 gap-0">
          <div className="relative h-64 w-full">
            <img src={image} alt={name} className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900">{name}</h2>
              <Badge className="rounded-md bg-[#A67C5B] text-white">{category}</Badge>
            </div>
          
            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-800">Select Size</div>
              <div className="mt-3 grid gap-2">
                {sizeNames.map((size) => (
                  <label key={size} className="flex cursor-pointer items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="size"
                        className="size-4 accent-orange-600"
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize(size)}
                      />
                      <span className="text-base text-slate-800">{size}</span>
                    </div>
                    <span className="text-slate-700">+ ${Number(portion_sizes[size]).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-800">Select Quantity</div>
              <div className="mt-3 flex items-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus className="size-5" />
                </Button>
                <div className="grid h-10 w-16 place-items-center rounded-full border text-base font-semibold">{quantity}</div>
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setQuantity((q) => q + 1)}>
                  <Plus className="size-5" />
                </Button>
                <div className="ml-auto text-xl font-bold text-slate-900">${total.toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                className="h-12 w-full rounded-full bg-[#A67C5B] text-base font-semibold text-white hover:bg-orange-600"
                onClick={() => {
                  if (!selectedSize) return
                  addItem({ name, category, size: selectedSize, unitPrice: base, quantity })
                  onOpenChange(false)
                }}
              >
                Add To Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


