<?php

namespace App\Http\Controllers;

use App\Models\CategoryExtra;
use App\Models\Foods;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryExtraController extends Controller
{
    /**
     * Display a listing of category extras.
     */
    public function index(Request $request): Response
    {
        $query = CategoryExtra::orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('name');

        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $extras = $query->get()->map(function ($extra) {
            return [
                'id' => $extra->id,
                'category' => $extra->category,
                'name' => $extra->name,
                'price' => (float) $extra->price,
                'sort_order' => $extra->sort_order,
            ];
        });

        // Get categories from both foods and extras tables
        $foodCategories = Foods::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->toArray();

        $extraCategories = CategoryExtra::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->toArray();

        $categories = collect(array_merge($foodCategories, $extraCategories))
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        // Get counts per category
        $countsByCategory = CategoryExtra::select('category')
            ->selectRaw('count(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();

        return Inertia::render('dashboard/extras', [
            'extras' => $extras,
            'categories' => $categories,
            'countsByCategory' => $countsByCategory,
            'filters' => [
                'category' => $request->get('category', 'all'),
            ],
        ]);
    }

    /**
     * Store a newly created category extra.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        CategoryExtra::create([
            'category' => $validated['category'],
            'name' => $validated['name'],
            'price' => $validated['price'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->route('dashboard.extras')
            ->with('success', 'Extra created successfully!');
    }

    /**
     * Update the specified category extra.
     */
    public function update(Request $request, CategoryExtra $categoryExtra)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $categoryExtra->update([
            'category' => $validated['category'],
            'name' => $validated['name'],
            'price' => $validated['price'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Extra updated successfully!',
        ]);
    }

    /**
     * Remove the specified category extra.
     */
    public function destroy(CategoryExtra $categoryExtra)
    {
        $categoryExtra->delete();

        return redirect()->route('dashboard.extras')
            ->with('success', 'Extra deleted successfully!');
    }
}
