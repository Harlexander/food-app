import * as React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { useCartStore, type CartItem } from '@/lib/cart-store'

type PortionSizes = Record<string, number>

type Extra = {
  id: number
  name: string
  price: number
}

export type AddToCartDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  description?: string
  category: string
  portion_sizes: PortionSizes
  image?: string
  extras?: Extra[]
}

type Step = 'size' | 'extra' | 'quantity'

export default function AddToCartDialog({ open, onOpenChange, name, category, portion_sizes, image, extras }: AddToCartDialogProps) {
  const sizeNames = Object.keys(portion_sizes)
  const [selectedSize, setSelectedSize] = React.useState<string>('')
  const [selectedExtra, setSelectedExtra] = React.useState<Extra | null>(null)
  const [quantity, setQuantity] = React.useState<number>(1)
  const [step, setStep] = React.useState<Step>('size')
  const addItem = useCartStore((s: { addItem: (item: Omit<CartItem, 'id'>) => void }) => s.addItem)

  const hasExtras = extras && extras.length > 0

  // Reset internal state whenever a new product opens or dialog is reopened
  React.useEffect(() => {
    if (open) {
      setSelectedSize('')
      setSelectedExtra(null)
      setQuantity(1)
      setStep('size')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, name])

  const sizePrice = selectedSize ? Number(portion_sizes[selectedSize]) : 0
  const extraPrice = selectedExtra ? Number(selectedExtra.price) : 0
  const unitPrice = sizePrice + extraPrice
  const total = unitPrice * quantity

  const handleBack = () => {
    if (step === 'extra') setStep('size')
    else if (step === 'quantity') setStep(hasExtras ? 'extra' : 'size')
  }

  const handleNext = () => {
    if (step === 'size' && selectedSize) {
      setStep(hasExtras ? 'extra' : 'quantity')
    } else if (step === 'extra' && selectedExtra) {
      setStep('quantity')
    }
  }

  const stepLabel = step === 'size' ? 'Select Size' : step === 'extra' ? 'Select Protein' : 'Select Quantity'
  const stepNumber = step === 'size' ? 1 : step === 'extra' ? 2 : hasExtras ? 3 : 2
  const totalSteps = hasExtras ? 3 : 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 h-[90vh] 2xl:h-auto overflow-y-auto">
        <div className="grid grid-cols-1 gap-0">
          <div className="relative h-64 w-full">
            <img src={image} alt={name} className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900">{name}</h2>
              <Badge className="rounded-md bg-[#A67C5B] text-white">{category}</Badge>
            </div>

            {/* Step indicator */}
            <div className="mt-4 flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${i < stepNumber ? 'bg-[#A67C5B]' : 'bg-slate-200'}`}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2">
              {step !== 'size' && (
                <button onClick={handleBack} className="text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="size-5" />
                </button>
              )}
              <div className="text-sm font-semibold text-slate-800">
                Step {stepNumber} of {totalSteps} — {stepLabel}
              </div>
            </div>

            {/* Step: Size */}
            {step === 'size' && (
              <div className="mt-4">
                <div className="grid gap-2">
                  {sizeNames.map((size) => (
                    <label
                      key={size}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${selectedSize === size ? 'border-[#A67C5B] bg-orange-50' : ''}`}
                    >
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
                      <span className="text-slate-700">${Number(portion_sizes[size]).toFixed(2)}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-6">
                  <Button
                    className="h-12 w-full rounded-full bg-[#A67C5B] text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    disabled={!selectedSize}
                    onClick={handleNext}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Extra / Protein */}
            {step === 'extra' && hasExtras && (
              <div className="mt-4">
                <div className="grid gap-2">
                  {extras.map((extra) => (
                    <label
                      key={extra.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${selectedExtra?.id === extra.id ? 'border-[#A67C5B] bg-orange-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="extra"
                          className="size-4 accent-orange-600"
                          checked={selectedExtra?.id === extra.id}
                          onChange={() => setSelectedExtra(extra)}
                        />
                        <span className="text-base text-slate-800">{extra.name}</span>
                      </div>
                      <span className="text-slate-700">
                        + ${Number(extra.price).toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-6">
                  <Button
                    className="h-12 w-full rounded-full bg-[#A67C5B] text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    disabled={!selectedExtra}
                    onClick={handleNext}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Quantity + Add to Cart */}
            {step === 'quantity' && (
              <div className="mt-4">
                {/* Summary of selections */}
                <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Size</span>
                    <span className="font-medium text-slate-800">{selectedSize} — ${sizePrice.toFixed(2)}</span>
                  </div>
                  {selectedExtra && (
                    <div className="flex justify-between">
                      <span>Protein</span>
                      <span className="font-medium text-slate-800">
                        {selectedExtra.name} — + ${extraPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    <Minus className="size-5" />
                  </Button>
                  <div className="grid h-10 w-16 place-items-center rounded-full border text-base font-semibold">{quantity}</div>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setQuantity((q) => q + 1)}>
                    <Plus className="size-5" />
                  </Button>
                  <div className="ml-auto text-xl font-bold text-slate-900">${total.toFixed(2)}</div>
                </div>

                <div className="mt-6">
                  <Button
                    className="h-12 w-full rounded-full bg-[#A67C5B] text-base font-semibold text-white hover:bg-orange-600"
                    onClick={() => {
                      addItem({
                        name,
                        image,
                        category,
                        size: selectedSize,
                        extraName: selectedExtra?.name,
                        extraPrice: selectedExtra?.price,
                        unitPrice,
                        quantity,
                      })
                      onOpenChange(false)
                    }}
                  >
                    Add To Cart — ${total.toFixed(2)}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
