import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChefHat,
    Plus,
    Filter,
    CheckCircle,
    XCircle,
    Trash,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [foodToDelete, setFoodToDelete] = React.useState<FoodsPageProps['foods'][0] | null>(null)
    const [isDeleting, setIsDeleting] = React.useState(false)

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

    const handleDeleteClick = (food: FoodsPageProps['foods'][0]) => {
        setFoodToDelete(food)
        setDeleteDialogOpen(true)
    };

    const handleDeleteConfirm = () => {
        if (!foodToDelete) return;

        setIsDeleting(true);
        router.delete(`/dashboard/foods/${foodToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setFoodToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Foods Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="sm:text-3xl text-2xl font-bold">Foods Management</h1>
                        <p className="text-sm text-gray-500">Manage your food inventory and menu items</p>
                    </div>
                    <Link href="/dashboard/foods/create">
                        <Button className="gap-2 bg-primary text-white hover:bg-primary/80">
                            <Plus className="h-4 w-4" />
                            Add Food
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="bg-primary/20 text-primary rounded p-2">
                                <Filter className="h-5 w-5" />
                            </div>
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

                {/* Foods Table */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        {foods.length === 0 ? (
                            <div className="text-center py-12">
                                <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No foods found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Portion Sizes
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {foods.map((food) => (
                                            <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <img src={food.image || ''} alt={food.name} className="w-10 h-10 object-cover rounded-md" />
                                                        <span className="text-sm font-semibold text-gray-900">{food.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="outline">{food.category}</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {food.portion_sizes.length > 0 ? (
                                                            food.portion_sizes.map((size) => (
                                                                <Badge key={size.id} variant="outline" className="text-xs">
                                                                    {size.size_name}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {food.is_active ? (
                                                        <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-600 border-0 flex items-center gap-1">
                                                            <XCircle className="h-3 w-3" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEdit(food)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(food)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <EditFoodDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    food={selectedFood}
                    categories={categories}
                    onSuccess={handleEditSuccess}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Food</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{foodToDelete?.name}</strong>? This action cannot be undone and will permanently delete the food item and all its portion sizes.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setFoodToDelete(null);
                                }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

