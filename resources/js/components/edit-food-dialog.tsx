import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import InputError from '@/components/input-error'
import { X, Plus, Trash2 } from 'lucide-react'

type PortionSize = {
    id?: number
    size_name: string
    price: number
    sort_order?: number
}

type Food = {
    id: number
    name: string
    description: string | null
    image: string | null
    category: string
    is_active: boolean
    sort_order: number
    portion_sizes: Array<{
        id: number
        size_name: string
        price: number
    }>
}

type EditFoodDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    food: Food | null
    categories: string[]
    onSuccess: () => void
}

export default function EditFoodDialog({ open, onOpenChange, food, categories, onSuccess }: EditFoodDialogProps) {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        image: '',
        category: '',
        is_active: true,
        sort_order: 0,
        portion_sizes: [] as PortionSize[],
    })

    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [processing, setProcessing] = React.useState(false)

    // Initialize form data when food changes
    React.useEffect(() => {
        if (food && open) {
            setFormData({
                name: food.name || '',
                description: food.description || '',
                image: food.image || '',
                category: food.category || '',
                is_active: food.is_active ?? true,
                sort_order: food.sort_order || 0,
                portion_sizes: food.portion_sizes.map(size => ({
                    id: size.id,
                    size_name: size.size_name,
                    price: size.price,
                    sort_order: 0,
                })) || [],
            })
            setErrors({})
            setProcessing(false)
        } else if (!open) {
            // Reset when dialog closes
            setErrors({})
            setProcessing(false)
        }
    }, [food, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!food) return

        setErrors({})
        setProcessing(true)

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            
            const response = await fetch(`/dashboard/foods/${food.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.errors) {
                    const formattedErrors: Record<string, string> = {}
                    Object.keys(data.errors).forEach(key => {
                        formattedErrors[key] = Array.isArray(data.errors[key]) 
                            ? data.errors[key][0] 
                            : data.errors[key]
                    })
                    setErrors(formattedErrors)
                } else {
                    setErrors({ general: data.message || 'Failed to update food. Please try again.' })
                }
                setProcessing(false)
                return
            }

            // Success
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setErrors({ general: 'An error occurred. Please try again.' })
            setProcessing(false)
        }
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const addPortionSize = () => {
        setFormData(prev => ({
            ...prev,
            portion_sizes: [
                ...prev.portion_sizes,
                { size_name: '', price: 0, sort_order: prev.portion_sizes.length },
            ],
        }))
    }

    const removePortionSize = (index: number) => {
        setFormData(prev => ({
            ...prev,
            portion_sizes: prev.portion_sizes.filter((_, i) => i !== index),
        }))
    }

    const updatePortionSize = (index: number, field: keyof PortionSize, value: any) => {
        setFormData(prev => ({
            ...prev,
            portion_sizes: prev.portion_sizes.map((size, i) =>
                i === index ? { ...size, [field]: value } : size
            ),
        }))
    }

    if (!food) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Food</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.general && (
                        <div className="rounded-md bg-red-50 p-4 text-red-800 text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Food Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                    disabled={processing}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                                    <SelectTrigger id="category" disabled={processing}>
                                        <SelectValue />
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
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={processing}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input
                                id="image"
                                type="text"
                                value={formData.image}
                                onChange={(e) => handleChange('image', e.target.value)}
                                placeholder="/food/example.png"
                                disabled={processing}
                            />
                            <InputError message={errors.image} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                                    min="0"
                                    disabled={processing}
                                />
                                <InputError message={errors.sort_order} />
                            </div>

                            <div className="flex items-center space-x-2 pt-8">
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleChange('is_active', checked)}
                                    disabled={processing}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (visible to customers)
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Portion Sizes */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Portion Sizes</h3>
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

                        <div className="space-y-3">
                            {formData.portion_sizes.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No portion sizes. Click "Add Size" to add one.
                                </div>
                            ) : (
                                formData.portion_sizes.map((size, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Size Name</Label>
                                                <Input
                                                    value={size.size_name}
                                                    onChange={(e) => updatePortionSize(index, 'size_name', e.target.value)}
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
                                                    onChange={(e) => updatePortionSize(index, 'price', parseFloat(e.target.value) || 0)}
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
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || formData.portion_sizes.length === 0}
                            className="flex-1 bg-green-500 text-white hover:bg-green-600"
                        >
                            {processing ? 'Updating...' : 'Update Food'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

