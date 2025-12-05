<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): Response
    {
        $query = User::withCount('orders')
            ->orderBy('created_at', 'desc');

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by has orders
        if ($request->has('has_orders')) {
            if ($request->has_orders === 'yes') {
                $query->has('orders');
            } elseif ($request->has_orders === 'no') {
                $query->doesntHave('orders');
            }
        }

        $customers = $query->paginate(20)->through(function ($user) {
            // Get total spent efficiently
            $totalSpent = $user->orders()->sum('total');
            
            // Get last order date efficiently
            $lastOrderDate = $user->orders()->max('created_at');

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'state' => $user->state,
                'postal_code' => $user->postal_code,
                'orders_count' => $user->orders_count,
                'total_spent' => (float) $totalSpent,
                'last_order_date' => $lastOrderDate ? date('Y-m-d H:i:s', strtotime($lastOrderDate)) : null,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Get statistics
        $stats = [
            'total' => User::count(),
            'with_orders' => User::has('orders')->count(),
            'without_orders' => User::doesntHave('orders')->count(),
            'total_spent' => User::with('orders')->get()->sum(function ($user) {
                return $user->orders->sum('total');
            }),
        ];

        return Inertia::render('dashboard/customers', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'has_orders' => $request->get('has_orders', 'all'),
            ],
        ]);
    }
}

