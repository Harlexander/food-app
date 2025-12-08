import * as React from 'react';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Star } from 'lucide-react';
import AddToCartDialog from '@/components/add-to-cart-dialog';
import FloatingCartButton from '@/components/floating-cart-button';
import CartSheet from '@/components/cart-sheet';
import { useAppearance } from '@/hooks/use-appearance';
import { useCartStore } from '@/lib/cart-store';

type PortionSizes = Record<string, number>;

type FoodItem = {
    id?: number;
    name: string;
    description?: string;
    image?: string;
    category: string;
    portion_sizes: PortionSizes;
};

type FoodsData = Record<string, FoodItem[]>;

function getPrimaryPrice(portions: PortionSizes): number {
    const first = Object.values(portions)[0];
    return typeof first === 'number' ? first : 0;
}

export default function Dashboard({ foods }: { foods: FoodsData }) {
    const [selected, setSelected] = React.useState<string>('All');
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogFood, setDialogFood] = React.useState<FoodItem | null>(null);
    const [cartOpen, setCartOpen] = React.useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const { items } = useCartStore();

    // Extract categories from the foods data
    const allCategories = React.useMemo(() => {
        return foods ? Object.keys(foods) : [];
    }, [foods]);

    // Transform and filter foods based on selected category
    const filteredFoods = React.useMemo(() => {
        if (!foods) return [];
        
        const rows: FoodItem[] = [];
        for (const category of allCategories) {
            const categoryFoods = foods[category] || [];
            for (const item of categoryFoods) {
                rows.push({ ...item, category });
            }
        }
        return selected === 'All' ? rows : rows.filter((r) => r.category === selected);
    }, [foods, allCategories, selected]);

    React.useEffect(() => {
        updateAppearance('light');
    }, []);

    return (
        <div className='bg-white min-h-screen relative overflow-hidden'>
            {/* Background blur circles */}
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-[#A67C5B]/50 blur-3xl" />
            <div className="fixed bottom-0 right-1/4 h-64 w-64 rounded-full bg-orange-800/50 blur-3xl" />
            
            <Navbar active="Home" />
            <Head title="Food Menu" />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl sm:px-26 px-4 py-8 text-black">
                <div className="flex flex-col gap-2">
                    <div className="text-muted-foreground">Food Menu</div>
                    <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Barlow' }}>Popular Delicious Foods</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        onClick={() => setSelected('All')}
                        className={selected === 'All' ? 'bg-[#A67C5B] text-white' : 'border border-[#A67C5B] bg-white text-[#A67C5B]'}
                    >
                        All Menu
                    </Button>
                    {allCategories.map((category) => (
                        <Button
                            key={category}
                            onClick={() => setSelected(category)}
                            className={selected === category ? 'bg-[#A67C5B] text-white' : 'border border-[#A67C5B] bg-white text-[#A67C5B]'}
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredFoods.map((food) => {
                        const price = getPrimaryPrice(food.portion_sizes);
                        return (
                            <div key={food.id || `${food.category}:${food.name}`} className="relative">
                                {/* decorative notch/ribbon */}
                                <div className="absolute -left-3 bottom-24 h-0 w-0 border-y-8 border-y-transparent border-r-8 border-r-[#A67C5B]" />
                                <Card className="overflow-hidden rounded border-0 bg-white shadow-none border hover:shadow-lg cursor-pointer px-2 py-2 sm:p-0"  onClick={() => { setDialogFood(food); setDialogOpen(true); }}>
                                    <div className="flex gap-3 sm:block">
                                        {/* Image (left on mobile, full on larger screens) */}
                                        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-md sm:h-64 sm:w-full sm:rounded-none">
                                            <img src={food.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop'} alt={food.name} className="absolute inset-0 size-full object-cover" />
                                            <Badge className="absolute right-2 bottom-2 rounded-md bg-[#A67C5B] px-2 py-1 text-white shadow-md sm:right-4 sm:bottom-4 sm:px-4 sm:py-2">{food.category}</Badge>
                                        </div>
                                        {/* Content (right on mobile) */}
                                        <div className="flex-1 sm:block">
                                            <CardHeader className="gap-1 py-3 sm:py-4">
                                                <CardTitle className="text-lg font-extrabold text-slate-900">{food.name}</CardTitle>
                                                {food.description ? (
                                                    <CardDescription className="line-clamp-1 text-slate-500">{food.description}</CardDescription>
                                                ) : null}
                                            </CardHeader>
                                            <CardContent className='hidden'>
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={i < 4 ? 'size-4 text-[#A67C5B] fill-current' : 'size-4 text-[#A67C5B]'} />
                                                    ))}
                                                </div>
                                                <div className="mt-2 flex items-baseline gap-4 items-center">
                                                    <div className="text-2xl font-bold text-orange-600">${price.toFixed(2)}</div>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
                {dialogFood && (
                    <AddToCartDialog
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                        name={dialogFood.name}
                        category={dialogFood.category}
                        image={dialogFood.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop'}
                        portion_sizes={dialogFood.portion_sizes}
                    />
                )}
                {
                    filteredFoods.length > 0 && dialogFood && items.length > 0 && (
                        <FloatingCartButton onClick={() => setCartOpen(true)} />
                    )
                }
                <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
            </div>
        </div>
    );
}
