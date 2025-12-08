import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import dashboardRoutes from '@/routes/dashboard';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Foods',
        href: dashboardRoutes.foods().url,
    },
    {
        title: 'Add Food',
        href: '/dashboard/foods/create',
    },
];

type CreateFoodPageProps = {
    categories: string[];
};

type PortionSize = {
    size_name: string;
    price: number;
    sort_order?: number;
};

export default function CreateFoodPage({ categories }: CreateFoodPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        image: null as File | null,
        category: '',
        is_active: true,
        sort_order: 0,
        portion_sizes: [] as PortionSize[],
    });

    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const addPortionSize = () => {
        setData('portion_sizes', [
            ...data.portion_sizes,
            { size_name: '', price: 0, sort_order: data.portion_sizes.length },
        ]);
    };

    const removePortionSize = (index: number) => {
        setData(
            'portion_sizes',
            data.portion_sizes.filter((_, i) => i !== index)
        );
    };

    const updatePortionSize = (index: number, field: keyof PortionSize, value: any) => {
        setData(
            'portion_sizes',
            data.portion_sizes.map((size, i) =>
                i === index ? { ...size, [field]: value } : size
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/foods', {
            forceFormData: true,
            onSuccess: () => {
                router.visit(dashboardRoutes.foods().url);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Food" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={dashboardRoutes.foods().url}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Add New Food</h1>
                        <p>Create a new food item for your menu</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Main Form */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Food Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                disabled={processing}
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={data.category}
                                                onValueChange={(value) => setData('category', value)}
                                            >
                                                <SelectTrigger id="category" disabled={processing}>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.category} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sort_order">Sort Order</Label>
                                            <Input
                                                id="sort_order"
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                                min="0"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.sort_order} />
                                        </div>

                                        <div className="flex items-center space-x-2 pt-8">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                                                disabled={processing}
                                            />
                                            <Label htmlFor="is_active" className="cursor-pointer">
                                                Active (visible to customers)
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Portion Sizes */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold">Portion Sizes</CardTitle>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addPortionSize}
                                            disabled={processing}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Size
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {data.portion_sizes.length === 0 ? (
                                            <div className="text-center py-4 text-gray-500 text-sm">
                                                No portion sizes. Click "Add Size" to add one.
                                            </div>
                                        ) : (
                                            data.portion_sizes.map((size, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-3 border rounded-lg"
                                                >
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Size Name</Label>
                                                            <Input
                                                                value={size.size_name}
                                                                onChange={(e) =>
                                                                    updatePortionSize(index, 'size_name', e.target.value)
                                                                }
                                                                placeholder="e.g., Large Cooler"
                                                                disabled={processing}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Price ($)</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={size.price}
                                                                onChange={(e) =>
                                                                    updatePortionSize(
                                                                        index,
                                                                        'price',
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                placeholder="0.00"
                                                                disabled={processing}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => removePortionSize(index)}
                                                        disabled={processing}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {errors['portion_sizes'] && (
                                        <InputError message={errors['portion_sizes']} />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Image Upload */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Food Image</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {imagePreview ? (
                                        <div className="space-y-2">
                                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={removeImage}
                                                    disabled={processing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {data.image?.name || 'Image selected'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="image"
                                                className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                                            >
                                                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                                <span className="text-sm text-gray-600">Click to upload</span>
                                                <span className="text-xs text-gray-500">
                                                    PNG, JPG, GIF up to 2MB
                                                </span>
                                            </Label>
                                            <input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={processing}
                                            />
                                        </div>
                                    )}
                                    {!imagePreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById('image')?.click()}
                                            disabled={processing}
                                            className="w-full gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Choose Image
                                        </Button>
                                    )}
                                    <InputError message={errors.image} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Link href={dashboardRoutes.foods().url}>
                            <Button type="button" variant="outline" disabled={processing} className="flex-1">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing || data.portion_sizes.length === 0 || !data.name || !data.category}
                            className="flex-1 bg-green-500 text-white hover:bg-green-600"
                        >
                            {processing ? 'Creating...' : 'Create Food'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



