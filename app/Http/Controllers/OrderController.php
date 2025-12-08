<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmationAdmin;
use App\Mail\OrderConfirmationCustomer;
use App\Models\Foods;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Store a new order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.size' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unitPrice' => 'required|numeric|min:0',
            'type' => 'required|in:pickup,delivery,reservation',
            'scheduled_date_time' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            
            // Guest user information (required if not authenticated)
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|string|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            
            // Delivery information (required if type is delivery)
            'delivery_address' => 'required_if:type,delivery|nullable|string|max:500',
            'delivery_city' => 'nullable|string|max:100',
            'delivery_state' => 'nullable|string|max:100',
            'delivery_postal_code' => 'nullable|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            // Get or create user
            $user = Auth::user();
            
            if (!$user) {
                // Check if user exists by email
                $user = User::where('email', $validated['customer_email'])->first();
                
                if (!$user) {
                    // Create new user with random password (they can reset it later)
                    $user = User::create([
                        'name' => $validated['customer_name'],
                        'email' => $validated['customer_email'],
                        'phone' => $validated['customer_phone'] ?? null,
                        'password' => Hash::make(Str::random(32)), // Random password
                    ]);
                } else {
                    // Update user info if provided
                    $user->update([
                        'name' => $validated['customer_name'],
                        'phone' => $validated['customer_phone'] ?? $user->phone,
                    ]);
                }
            }

            // Calculate totals
            $subtotal = collect($validated['items'])->sum(function ($item) {
                return $item['unitPrice'] * $item['quantity'];
            });
            
            $tax = $subtotal * 0.1; // 10% tax (adjust as needed)
            $deliveryFee = $validated['type'] === 'delivery' ? 5.00 : 0; // $5 delivery fee
            $total = $subtotal + $tax + $deliveryFee;

            // Generate unique order number
            $orderNumber = 'ORD-' . strtoupper(Str::random(8)) . '-' . date('Ymd');

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'type' => $validated['type'],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'delivery_fee' => $deliveryFee,
                'total' => $total,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_city' => $validated['delivery_city'] ?? null,
                'delivery_state' => $validated['delivery_state'] ?? null,
                'delivery_postal_code' => $validated['delivery_postal_code'] ?? null,
                'scheduled_date_time' => $validated['scheduled_date_time'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                // Find food by name (or you could pass food_id from frontend)
                $food = Foods::where('name', $item['name'])->first();
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'food_id' => $food?->id,
                    'food_name' => $item['name'],
                    'size_name' => $item['size'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unitPrice'],
                    'total_price' => $item['unitPrice'] * $item['quantity'],
                ]);
            }

            DB::commit();

            // Load order relationships for emails
            $order->load('items');

            // Send confirmation email to customer
            try {
                Mail::to($order->customer_email)->send(new OrderConfirmationCustomer($order));
            } catch (\Exception $e) {
                // Log email error but don't fail the order
                \Log::error('Failed to send customer confirmation email: ' . $e->getMessage());
            }

            // Send notification email to admin
            try {
                $adminEmail = env('ADMIN_EMAIL', 'admin@example.com'); // Placeholder admin email
                Mail::to($adminEmail)->send(new OrderConfirmationAdmin($order));
            } catch (\Exception $e) {
                // Log email error but don't fail the order
                \Log::error('Failed to send admin notification email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'order' => $order->load('items'),
                'message' => 'Order placed successfully!',
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
                'message' => 'Failed to place order. Please try again.',
                'errors' => ['general' => 'Failed to place order. Please try again.'],
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Display a listing of orders for admin.
     */
    public function orders(Request $request): Response
    {
        $query = Order::with(['user', 'items'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $orders = $query->paginate(20)->through(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'status' => $order->status,
                'type' => $order->type,
                'subtotal' => (float) $order->subtotal,
                'tax' => (float) $order->tax,
                'delivery_fee' => (float) $order->delivery_fee,
                'total' => (float) $order->total,
                'items_count' => $order->items->count(),
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'scheduled_date_time' => $order->scheduled_date_time?->format('Y-m-d H:i:s'),
            ];
        });

        // Get status counts for filters
        $statusCounts = [
            'all' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'preparing' => Order::where('status', 'preparing')->count(),
            'ready' => Order::where('status', 'ready')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('dashboard/orders', [
            'orders' => $orders,
            'statusCounts' => $statusCounts,
            'filters' => [
                'status' => $request->get('status', 'all'),
                'type' => $request->get('type', 'all'),
            ],
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): Response
    {
        $order->load(['user', 'items.food']);

        return Inertia::render('dashboard/order-detail', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'type' => $order->type,
                'subtotal' => (float) $order->subtotal,
                'tax' => (float) $order->tax,
                'delivery_fee' => (float) $order->delivery_fee,
                'total' => (float) $order->total,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'delivery_address' => $order->delivery_address,
                'delivery_city' => $order->delivery_city,
                'delivery_state' => $order->delivery_state,
                'delivery_postal_code' => $order->delivery_postal_code,
                'scheduled_date_time' => $order->scheduled_date_time?->format('Y-m-d H:i:s'),
                'ready_at' => $order->ready_at?->format('Y-m-d H:i:s'),
                'notes' => $order->notes,
                'admin_notes' => $order->admin_notes,
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $order->updated_at->format('Y-m-d H:i:s'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'food_name' => $item->food_name,
                        'size_name' => $item->size_name,
                        'quantity' => $item->quantity,
                        'unit_price' => (float) $item->unit_price,
                        'total_price' => (float) $item->total_price,
                    ];
                }),
                'user' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                ] : null,
            ],
        ]);
    }
}
