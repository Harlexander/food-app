import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ChevronDown, ShoppingCart, User2 } from 'lucide-react'
import CartSheet from '@/components/cart-sheet'
import { useCartStore } from '@/lib/cart-store'

type NavItem = {
  label: string
  href?: string
  hasDropdown?: boolean
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Menu', href: '#' },
  { label: 'Chefs', href: '#' },
  { label: 'Contact', href: '#' },
]

export function Navbar({ active = 'Home' }: { active?: string }) {
  const [open, setOpen] = React.useState(false)
  const itemsCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/10">
      <div className="px-4 md:px-8 lg:px-16 flex items-center justify-between gap-4 px-4 py-4">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2">
          <img src="./logo.png" alt="" className='w-16 h-16' />
          <p className='text-2xl font-bold font-[Barlow]'>Veronica's Kitchen</p>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-orange-50 text-foreground/90 hover:bg-orange-100"
              aria-label="Cart"
              onClick={() => setOpen(true)}
            >
              <ShoppingCart className="size-5" />
            </Button>
            <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-orange-600 p-0 text-[10px] font-semibold">
              {String(itemsCount).padStart(2,'0')}
            </Badge>
          </div>
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
      <CartSheet open={open} onOpenChange={setOpen} />
    </header>
  )
}

export default Navbar


