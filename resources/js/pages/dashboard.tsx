import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';
import { categories as categoriesMap } from '@/lib/foods';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type PortionSizes = Record<string, number>;

type FoodItem = {
    name: string;
    description?: string;
    portion_sizes: PortionSizes;
};

const allCategories = Object.keys(categoriesMap) as (keyof typeof categoriesMap)[];

function getPrimaryPrice(portions: PortionSizes): number {
    const first = Object.values(portions)[0];
    return typeof first === 'number' ? first : 0;
}

export default function Dashboard() {
    const [selected, setSelected] = React.useState<string>('All');

    const foods = React.useMemo(() => {
        const rows: Array<FoodItem & { category: string }> = [];
        for (const category of allCategories) {
            for (const item of categoriesMap[category] as FoodItem[]) {
                rows.push({ ...item, category });
            }
        }
        return selected === 'All' ? rows : rows.filter((r) => r.category === selected);
    }, [selected]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Food Menu" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2">
                    <div className="text-muted-foreground">Food Menu</div>
                    <h1 className="text-2xl font-bold tracking-tight">Popular Delicious Foods</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={selected === 'All' ? 'default' : 'outline'}
                        onClick={() => setSelected('All')}
                    >
                        All Menu
                    </Button>
                    {allCategories.map((c) => (
                        <Button
                            key={c as string}
                            variant={selected === c ? 'default' : 'outline'}
                            onClick={() => setSelected(c as string)}
                        >
                            {c as string}
                        </Button>
                    ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {foods.map((food) => {
                        const price = getPrimaryPrice(food.portion_sizes);
                        return (
                            <Card key={`${food.category}:${food.name}`} className="overflow-hidden">
                                <div className="relative h-48 w-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-rose-100 to-amber-200 dark:from-orange-900/30 dark:via-rose-900/20 dark:to-amber-900/30" />
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl">🍽️</div>
                                    <Badge className="absolute right-3 top-3">{food.category}</Badge>
                                </div>
                                <CardHeader className="gap-2">
                                    <CardTitle className="text-lg">{food.name}</CardTitle>
                                    {food.description ? (
                                        <CardDescription className="line-clamp-2">{food.description}</CardDescription>
                                    ) : null}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-amber-500">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className="size-4 fill-current" />
                                        ))}
                                        <span className="ml-1 text-xs text-muted-foreground">30</span>
                                    </div>
                                    <div className="mt-3 flex items-end gap-2">
                                        <div className="text-xl font-semibold">${price.toFixed(2)}</div>
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-between gap-2">
                                    <Button className="gap-2">
                                        <ShoppingCart className="size-4" /> add To Cart
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" aria-label="favorite">
                                            <Heart className="size-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" aria-label="view">
                                            <Eye className="size-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
