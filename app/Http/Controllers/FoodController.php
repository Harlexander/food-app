<?php

namespace App\Http\Controllers;

use App\Models\Foods;
use App\Models\FoodPortionSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FoodController extends Controller
{
    /**
     * Display a listing of foods.
     */
    public function index(Request $request): Response
    {
        $query = Foods::with('portionSizes')
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('sort_order');

        // Filter by category if provided
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $foods = $query->get()->groupBy('category')->map(function ($categoryFoods) {
            return $categoryFoods->map(function ($food) {
                // Transform portion_sizes array to Record<string, number> format
                $portionSizes = $food->portionSizes->pluck('price', 'size_name')->toArray();
                
                return [
                    'id' => $food->id,
                    'name' => $food->name,
                    'description' => $food->description,
                    'image' => $food->image,
                    'category' => $food->category,
                    'portion_sizes' => $portionSizes,
                ];
            })->values()->toArray();
        })->toArray();

        return Inertia::render('index', [
            'foods' => $foods,
        ]);
    }

    /**
     * Display the specified food.
     */
    public function show(Foods $food): Response
    {
        $food->load('portionSizes');

        return Inertia::render('foods/show', [
            'food' => $food,
        ]);
    }

    /**
     * Get foods by category.
     */
    public function byCategory(string $category)
    {
        $foods = Foods::with('portionSizes')
            ->where('category', $category)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($foods);
    }

    /**
     * Display a listing of foods for admin management.
     */
    public function foods(Request $request): Response
    {
        $query = Foods::with('portionSizes')
            ->orderBy('category')
            ->orderBy('sort_order');

        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by active status if provided
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $foods = $query->get()->map(function ($food) {
            return [
                'id' => $food->id,
                'name' => $food->name,
                'description' => $food->description,
                'image' => $food->image,
                'category' => $food->category,
                'is_active' => $food->is_active,
                'sort_order' => $food->sort_order,
                'portion_sizes' => $food->portionSizes->map(function ($size) {
                    return [
                        'id' => $size->id,
                        'size_name' => $size->size_name,
                        'price' => (float) $size->price,
                    ];
                }),
            ];
        });

        // Get categories for filter
        $categories = Foods::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        // Get counts
        $counts = [
            'total' => Foods::count(),
            'active' => Foods::where('is_active', true)->count(),
            'inactive' => Foods::where('is_active', false)->count(),
        ];

        return Inertia::render('dashboard/foods', [
            'foods' => $foods,
            'categories' => $categories,
            'counts' => $counts,
            'filters' => [
                'category' => $request->get('category', 'all'),
                'status' => $request->get('status', 'all'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new food.
     */
    public function create(): Response
    {
        // Get existing categories for dropdown
        $categories = Foods::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('dashboard/foods/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created food in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'portion_sizes' => 'required|array|min:1',
            'portion_sizes.*.size_name' => 'required|string|max:255',
            'portion_sizes.*.price' => 'required|numeric|min:0',
            'portion_sizes.*.sort_order' => 'nullable|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                // Store in public/food directory (same as existing images)
                $imageDir = public_path('food');
                if (!is_dir($imageDir)) {
                    mkdir($imageDir, 0755, true);
                }
                $image->move($imageDir, $imageName);
                $imagePath = '/food/' . $imageName;
            }

            // Create food
            $food = Foods::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'image' => $imagePath,
                'category' => $validated['category'],
                'is_active' => $validated['is_active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            // Create portion sizes
            foreach ($validated['portion_sizes'] as $index => $portionSize) {
                FoodPortionSize::create([
                    'food_id' => $food->id,
                    'size_name' => $portionSize['size_name'],
                    'price' => $portionSize['price'],
                    'sort_order' => $portionSize['sort_order'] ?? $index,
                ]);
            }

            DB::commit();

            return redirect()->route('dashboard.foods')
                ->with('success', 'Food created successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Delete uploaded image if food creation failed
            if (isset($imagePath) && file_exists(public_path($imagePath))) {
                @unlink(public_path($imagePath));
            }
            
            return back()->withErrors(['general' => 'Failed to create food. Please try again.'])->withInput();
        }
    }

    /**
     * Update the specified food.
     */
    public function update(Request $request, Foods $food)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'portion_sizes' => 'required|array|min:1',
            'portion_sizes.*.id' => 'nullable|exists:food_portion_sizes,id',
            'portion_sizes.*.size_name' => 'required|string|max:255',
            'portion_sizes.*.price' => 'required|numeric|min:0',
            'portion_sizes.*.sort_order' => 'nullable|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Update food
            $food->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'image' => $validated['image'] ?? null,
                'category' => $validated['category'],
                'is_active' => $validated['is_active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            // Get existing portion size IDs
            $existingIds = $food->portionSizes->pluck('id')->toArray();
            $updatedIds = [];

            // Update or create portion sizes
            foreach ($validated['portion_sizes'] as $index => $portionSize) {
                if (isset($portionSize['id']) && in_array($portionSize['id'], $existingIds)) {
                    // Update existing
                    $size = FoodPortionSize::find($portionSize['id']);
                    $size->update([
                        'size_name' => $portionSize['size_name'],
                        'price' => $portionSize['price'],
                        'sort_order' => $portionSize['sort_order'] ?? $index,
                    ]);
                    $updatedIds[] = $portionSize['id'];
                } else {
                    // Create new
                    $size = FoodPortionSize::create([
                        'food_id' => $food->id,
                        'size_name' => $portionSize['size_name'],
                        'price' => $portionSize['price'],
                        'sort_order' => $portionSize['sort_order'] ?? $index,
                    ]);
                    $updatedIds[] = $size->id;
                }
            }

            // Delete removed portion sizes
            $idsToDelete = array_diff($existingIds, $updatedIds);
            if (!empty($idsToDelete)) {
                FoodPortionSize::whereIn('id', $idsToDelete)->delete();
            }

            DB::commit();

            // Reload relationships
            $food->load('portionSizes');

            return response()->json([
                'success' => true,
                'message' => 'Food updated successfully!',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update food. Please try again.',
                'errors' => ['general' => 'Failed to update food. Please try again.'],
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
