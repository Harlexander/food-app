import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Plus, Trash2, Upload, X } from 'lucide-react';

type PortionSize = {
  id?: number;
  size_name: string;
  price: number;
  sort_order?: number;
};

type Food = {
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
};

type EditFoodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: Food | null;
  categories: string[];
  onSuccess: () => void;
};

export default function EditFoodDialog({ open, onOpenChange, food, categories, onSuccess }: EditFoodDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: '',
    is_active: true,
    sort_order: 0,
    portion_sizes: [] as PortionSize[],
  });

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [existingImage, setExistingImage] = React.useState<string | null>(null);
  const [removeImage, setRemoveImage] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [processing, setProcessing] = React.useState(false);

  // Initialize form data when food changes
  React.useEffect(() => {
    if (food && open) {
      setFormData({
        name: food.name || '',
        description: food.description || '',
        category: food.category || '',
        is_active: food.is_active ?? true,
        sort_order: food.sort_order || 0,
        portion_sizes:
          food.portion_sizes.map((size) => ({
            id: size.id,
            size_name: size.size_name,
            price: size.price,
            sort_order: 0,
          })) || [],
      });
      setExistingImage(food.image || null);
      setImageFile(null);
      setImagePreview(null);
      setRemoveImage(false);
      setErrors({});
      setProcessing(false);
    } else if (!open) {
      setErrors({});
      setProcessing(false);
    }
  }, [food, open]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    setRemoveImage(true);
  };

  const currentImageSrc = imagePreview || existingImage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!food) return;

    setErrors({});
    setProcessing(true);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const body = new FormData();
      body.append('_method', 'PUT');
      body.append('name', formData.name);
      body.append('description', formData.description);
      body.append('category', formData.category);
      body.append('is_active', formData.is_active ? '1' : '0');
      body.append('sort_order', String(formData.sort_order));

      if (imageFile) {
        body.append('image', imageFile);
      }
      if (removeImage) {
        body.append('remove_image', '1');
      }

      formData.portion_sizes.forEach((size, index) => {
        if (size.id) {
          body.append(`portion_sizes[${index}][id]`, String(size.id));
        }
        body.append(`portion_sizes[${index}][size_name]`, size.size_name);
        body.append(`portion_sizes[${index}][price]`, String(size.price));
        body.append(`portion_sizes[${index}][sort_order]`, String(size.sort_order ?? index));
      });

      const response = await fetch(`/dashboard/foods/${food.id}`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.keys(data.errors).forEach((key) => {
            formattedErrors[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
          });
          setErrors(formattedErrors);
        } else {
          setErrors({ general: data.message || 'Failed to update food. Please try again.' });
        }
        setProcessing(false);
        return;
      }

      // Success
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
      setProcessing(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addPortionSize = () => {
    setFormData((prev) => ({
      ...prev,
      portion_sizes: [...prev.portion_sizes, { size_name: '', price: 0, sort_order: prev.portion_sizes.length }],
    }));
  };

  const removePortionSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      portion_sizes: prev.portion_sizes.filter((_, i) => i !== index),
    }));
  };

  const updatePortionSize = (index: number, field: keyof PortionSize, value: any) => {
    setFormData((prev) => ({
      ...prev,
      portion_sizes: prev.portion_sizes.map((size, i) => (i === index ? { ...size, [field]: value } : size)),
    }));
  };

  if (!food) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Food</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{errors.general}</div>}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Food Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={processing}
                />
                <InputError message={errors.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger id="edit-category" disabled={processing}>
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
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={processing}
              />
              <InputError message={errors.description} />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Food Image</Label>
              {currentImageSrc ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border">
                    <img src={currentImageSrc} alt="Preview" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={handleRemoveImage}
                      disabled={processing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {imageFile && <p className="text-xs text-gray-500">{imageFile.name}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-image"
                    className={`flex h-32 w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${isDragging ? 'border-[#A67C5B] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <Upload className={`mb-2 h-6 w-6 ${isDragging ? 'text-[#A67C5B]' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-600">
                      {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </span>
                    <span className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</span>
                  </Label>
                  <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={processing}
                  />
                </div>
              )}
              <InputError message={errors.image} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-sort_order">Sort Order</Label>
                <Input
                  id="edit-sort_order"
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
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                  disabled={processing}
                />
                <Label htmlFor="edit-is_active" className="cursor-pointer">
                  Active (visible to customers)
                </Label>
              </div>
            </div>
          </div>

          {/* Portion Sizes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Portion Sizes</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPortionSize} disabled={processing} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Size
              </Button>
            </div>

            <div className="space-y-3">
              {formData.portion_sizes.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">No portion sizes. Click "Add Size" to add one.</div>
              ) : (
                formData.portion_sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex-1 grid grid-cols-1 gap-3 md:grid-cols-2">
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
            {errors['portion_sizes'] && <InputError message={errors['portion_sizes']} />}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing} className="flex-1">
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
  );
}
