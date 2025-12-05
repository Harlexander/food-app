<?php

namespace App\Http\Controllers;

use App\Models\Foods;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Order Statistics
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $todayOrders = Order::whereDate('created_at', today())->count();
        
        // Revenue Statistics
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
        $todayRevenue = Order::whereDate('created_at', today())
            ->where('status', '!=', 'cancelled')
            ->sum('total');
        $monthRevenue = Order::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', '!=', 'cancelled')
            ->sum('total');
        
        // Food/Inventory Statistics
        $totalFoods = Foods::count();
        $activeFoods = Foods::where('is_active', true)->count();
        $foodsByCategory = Foods::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get()
            ->pluck('count', 'category');
        
        // Order Status Breakdown
        $orderStatusBreakdown = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
        
        // Order Type Breakdown
        $orderTypeBreakdown = Order::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type');
        
        // Recent Orders (last 10)
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'status' => $order->status,
                    'type' => $order->type,
                    'total' => $order->total,
                    'created_at' => $order->created_at->format('Y-m-d H:i'),
                ];
            });
        
        // Top Selling Items
        $topSellingItems = OrderItem::select('food_name', DB::raw('sum(quantity) as total_quantity'), DB::raw('sum(total_price) as total_revenue'))
            ->groupBy('food_name')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'food_name' => $item->food_name,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });
        
        // Revenue by Day (last 7 days)
        $revenueByDay = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(sum(total), 0) as revenue'),
                DB::raw('count(*) as orders')
            )
            ->where('created_at', '>=', now()->subDays(7))
            ->where('status', '!=', 'cancelled')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($day) {
                return [
                    'date' => $day->date,
                    'revenue' => (float) $day->revenue,
                    'orders' => (int) $day->orders,
                ];
            });
        
        // User Statistics
        $totalUsers = User::count();
        $usersWithOrders = User::has('orders')->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'orders' => [
                    'total' => $totalOrders,
                    'pending' => $pendingOrders,
                    'completed' => $completedOrders,
                    'today' => $todayOrders,
                ],
                'revenue' => [
                    'total' => (float) $totalRevenue,
                    'today' => (float) $todayRevenue,
                    'month' => (float) $monthRevenue,
                ],
                'foods' => [
                    'total' => $totalFoods,
                    'active' => $activeFoods,
                    'by_category' => $foodsByCategory,
                ],
                'users' => [
                    'total' => $totalUsers,
                    'with_orders' => $usersWithOrders,
                ],
            ],
            'orderStatusBreakdown' => $orderStatusBreakdown,
            'orderTypeBreakdown' => $orderTypeBreakdown,
            'recentOrders' => $recentOrders,
            'topSellingItems' => $topSellingItems,
            'revenueByDay' => $revenueByDay,
        ]);
    }
}
