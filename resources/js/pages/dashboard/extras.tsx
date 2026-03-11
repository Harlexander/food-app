import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Sparkles,
    Plus,
    Filter,
    Trash,
    Pencil,
    X,
    Check,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Extras',
        href: '/dashboard/extras',
    },
];

type Extra = {
    id: number;
    category: string;
    name: string;
    price: number;
    sort_order: number;
};

type ExtrasPageProps = {
    extras: Extra[];
    categories: string[];
    countsByCategory: Record<string, number>;
    filters: {
        category: string;
    };
};

export default function ExtrasPage({ extras, categories, countsByCategory, filters }: ExtrasPageProps) {
    // Add form state
    const [addCategory, setAddCategory] = React.useState('');
    const [customCategory, setCustomCategory] = React.useState('');
    const [addName, setAddName] = React.useState('');
    const [addPrice, setAddPrice] = React.useState('');
    const [isAdding, setIsAdding] = React.useState(false);

    // Edit state
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editData, setEditData] = React.useState({ category: '', name: '', price: '' });

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [extraToDelete, setExtraToDelete] = React.useState<Extra | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/dashboard/extras', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resolvedCategory = addCategory === '__custom__' ? customCategory : addCategory;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolvedCategory || !addName || !addPrice) return;

        setIsAdding(true);
        router.post('/dashboard/extras', {
            category: resolvedCategory,
            name: addName,
            price: parseFloat(addPrice),
            sort_order: 0,
        }, {
            onSuccess: () => {
                setAddCategory('');
                setCustomCategory('');
                setAddName('');
                setAddPrice('');
                setIsAdding(false);
            },
            onError: () => {
                setIsAdding(false);
            },
        });
    };

    const handleEditStart = (extra: Extra) => {
        setEditingId(extra.id);
        setEditData({
            category: extra.category,
            name: extra.name,
            price: extra.price.toString(),
        });
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditData({ category: '', name: '', price: '' });
    };

    const handleEditSave = async (id: number) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(`/dashboard/extras/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    category: editData.category,
                    name: editData.name,
                    price: parseFloat(editData.price),
                    sort_order: 0,
                }),
            });

            if (response.ok) {
                setEditingId(null);
                router.reload({ only: ['extras', 'countsByCategory'] });
            }
        } catch {
            // Silently fail
        }
    };

    const handleDeleteClick = (extra: Extra) => {
        setExtraToDelete(extra);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!extraToDelete) return;

        setIsDeleting(true);
        router.delete(`/dashboard/extras/${extraToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setExtraToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const totalExtras = extras.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Extras" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="sm:text-3xl text-2xl font-bold">Category Extras</h1>
                        <p className="text-sm text-gray-500">
                            Manage proteins, add-ons, and extras per food category
                        </p>
                    </div>
                    <Badge variant="outline" className="text-base px-4 py-2">
                        {totalExtras} extra{totalExtras !== 1 ? 's' : ''}
                    </Badge>
                </div>

                {/* Add New Extra */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="bg-primary/20 text-primary rounded p-2">
                                <Plus className="h-5 w-5" />
                            </div>
                            Add New Extra
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[180px] space-y-1.5">
                                <Label className="text-xs font-medium">Category</Label>
                                <Select value={addCategory} onValueChange={(v) => { setAddCategory(v); if (v !== '__custom__') setCustomCategory(''); }}>
                                    <SelectTrigger disabled={isAdding}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                        <SelectItem value="__custom__">+ New Category</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {addCategory === '__custom__' && (
                                <div className="flex-1 min-w-[160px] space-y-1.5">
                                    <Label className="text-xs font-medium">New Category Name</Label>
                                    <Input
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder="e.g., Drinks"
                                        disabled={isAdding}
                                        required
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-[160px] space-y-1.5">
                                <Label className="text-xs font-medium">Extra Name</Label>
                                <Input
                                    value={addName}
                                    onChange={(e) => setAddName(e.target.value)}
                                    placeholder="e.g., Grilled Chicken"
                                    disabled={isAdding}
                                    required
                                />
                            </div>
                            <div className="w-[120px] space-y-1.5">
                                <Label className="text-xs font-medium">Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={addPrice}
                                    onChange={(e) => setAddPrice(e.target.value)}
                                    placeholder="0.00"
                                    disabled={isAdding}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isAdding || !resolvedCategory || !addName || !addPrice}
                                className="gap-2 bg-primary text-white hover:bg-primary/80"
                            >
                                <Plus className="h-4 w-4" />
                                {isAdding ? 'Adding...' : 'Add Extra'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

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
                                                {category} ({countsByCategory[category] || 0})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Extras Table */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        {extras.length === 0 ? (
                            <div className="text-center py-12">
                                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No extras found</p>
                                <p className="text-sm text-gray-400 mt-1">Add your first extra using the form above</p>
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
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {extras.map((extra) => (
                                            <tr key={extra.id} className="hover:bg-gray-50 transition-colors">
                                                {editingId === extra.id ? (
                                                    <>
                                                        <td className="px-6 py-3">
                                                            <Input
                                                                value={editData.name}
                                                                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                                                className="h-9"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <Select value={editData.category} onValueChange={(v) => setEditData(prev => ({ ...prev, category: v }))}>
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {categories.map((cat) => (
                                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={editData.price}
                                                                onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                                                                className="h-9 w-24"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEditSave(extra.id)}
                                                                    className="text-green-600 hover:text-green-700 gap-1"
                                                                >
                                                                    <Check className="h-3.5 w-3.5" />
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={handleEditCancel}
                                                                    className="gap-1"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <Sparkles className="h-4 w-4 text-[#A67C5B]" />
                                                                <span className="text-sm font-semibold text-gray-900">{extra.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Badge variant="outline">{extra.category}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {formatCurrency(extra.price)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEditStart(extra)}
                                                                    className="gap-1"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteClick(extra)}
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Extra</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{extraToDelete?.name}</strong> from the <strong>{extraToDelete?.category}</strong> category? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setExtraToDelete(null);
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
