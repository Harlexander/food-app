import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import dashboardRoutes from '@/routes/dashboard';
import {
    ChefHat,
    Package,
    Plus,
    Filter,
    Search,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditFoodDialog from '@/components/edit-food-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Foods',
        href: '/dashboard/foods',
    },
];

type FoodsPageProps = {
    foods: Array<{
        id: number;
        name: string;
        description: string | null;
        image: string | null;
        category: string;
        is_active: boolean;
        sort_order: number;
        portion_sizes: Array<{
            id: number;
            size_name: string;
            price: number;
        }>;
    }>;
    categories: string[];
    counts: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: {
        category: string;
        status: string;
    };
};

export default function FoodsPage({ foods, categories, counts, filters }: FoodsPageProps) {
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [selectedFood, setSelectedFood] = React.useState<FoodsPageProps['foods'][0] | null>(null)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/dashboard/foods', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleEdit = (food: FoodsPageProps['foods'][0]) => {
        setSelectedFood(food)
        setEditDialogOpen(true)
    };

    const handleEditSuccess = () => {
        router.reload({ only: ['foods', 'counts'] })
    };

    const foodsByCategory = React.useMemo(() => {
        const grouped: Record<string, typeof foods> = {};
        foods.forEach(food => {
            if (!grouped[food.category]) {
                grouped[food.category] = [];
            }
            grouped[food.category].push(food);
        });
        return grouped;
    }, [foods]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Foods Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Foods Management</h1>
                        <p>Manage your food inventory and menu items</p>
                    </div>
                    <Link href="/dashboard/foods/create">
                        <Button className="gap-2 bg-green-500 hover:bg-green-600">
                            <Plus className="h-4 w-4" />
                            Add Food
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Total Foods</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{counts.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{counts.active}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Inactive</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-400">{counts.inactive}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-sm font-medium mb-2 block">Category</label>
                                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-sm font-medium mb-2 block">Status</label>
                                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active ({counts.active})</SelectItem>
                                        <SelectItem value="inactive">Inactive ({counts.inactive})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Foods List */}
                {Object.keys(foodsByCategory).length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No foods found</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(foodsByCategory).map(([category, categoryFoods]) => (
                            <Card key={category} className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        {category}
                                        <Badge variant="outline" className="ml-2">
                                            {categoryFoods.length} {categoryFoods.length === 1 ? 'item' : 'items'}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {categoryFoods.map((food) => (
                                            <div
                                                key={food.id}
                                                className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold">{food.name}</h3>
                                                            {food.is_active ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                        {food.description && (
                                                            <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-xs font-medium text-gray-500">Portion Sizes:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {food.portion_sizes.map((size) => (
                                                            <Badge key={size.id} variant="outline" className="text-xs">
                                                                {size.size_name}: {formatCurrency(size.price)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex-1"
                                                        onClick={() => handleEdit(food)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className={food.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                                    >
                                                        {food.is_active ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Edit Dialog */}
                <EditFoodDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    food={selectedFood}
                    categories={categories}
                    onSuccess={handleEditSuccess}
                />
            </div>
        </AppLayout>
    );
}

