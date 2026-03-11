import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import { Link } from '@inertiajs/react'

export default function FloatingCartButton() {
  const itemsCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))

  return (
    <div className="fixed bottom-12 right-6 z-50">
      <Link href="/cart">
        <Button
          size={'lg'}
          className="relative h-12 rounded-full bg-[#A67C5B] px-6 text-white shadow-lg shadow-[#A67C5B]/30 hover:bg-orange-600 w-full text-lg transition-transform duration-300 ease-out hover:scale-105"
        >
          <ShoppingCart className="mr-2 size-6" />Proceed to Cart
          {itemsCount > 0 && (
            <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-orange-600 shadow">
              {itemsCount}
            </span>
          )}
        </Button>
      </Link>
    </div>
  )
}
