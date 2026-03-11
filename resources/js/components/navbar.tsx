import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, User2 } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { Link } from '@inertiajs/react'

export function Navbar({ active = 'Home' }: { active?: string }) {
  const itemsCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/10">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className='w-16 h-16' />
          <p className='text-2xl font-bold font-[Barlow]'>Veronica's Kitchen</p>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-orange-50 text-foreground/90 hover:bg-orange-100"
              aria-label="Cart"
            >
              <ShoppingCart className="size-5" />
            </Button>
            <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-orange-600 p-0 text-[10px] font-semibold">
              {String(itemsCount).padStart(2,'0')}
            </Badge>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-orange-50 text-foreground/90 hover:bg-orange-100"
            aria-label="Account"
          >
            <User2 className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
