import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ShoppingCart,
    DollarSign,
    Package,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    ChefHat,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    UtensilsCrossed,
    Calendar,
    Activity,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type DashboardProps = {
    stats: {
        orders: {
            total: number;
            pending: number;
            completed: number;
            today: number;
        };
        revenue: {
            total: number;
            today: number;
            month: number;
        };
        foods: {
            total: number;
            active: number;
            by_category: Record<string, number>;
        };
        users: {
            total: number;
            with_orders: number;
        };
    };
    orderStatusBreakdown: Record<string, number>;
    orderTypeBreakdown: Record<string, number>;
    recentOrders: Array<{
        id: number;
        order_number: string;
        customer_name: string;
        status: string;
        type: string;
        total: number;
        created_at: string;
    }>;
    topSellingItems: Array<{
        food_name: string;
        total_quantity: number;
        total_revenue: number;
    }>;
    revenueByDay: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
};

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-600' },
    preparing: { bg: 'bg-purple-50', text: 'text-purple-600' },
    ready: { bg: 'bg-green-50', text: 'text-green-600' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-600' },
};

export default function Dashboard({
    stats,
    orderStatusBreakdown,
    orderTypeBreakdown,
    recentOrders,
    topSellingItems,
    revenueByDay,
}: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Calculate changes
    const yesterdayRevenue = revenueByDay.length >= 2 ? revenueByDay[revenueByDay.length - 2]?.revenue || 0 : 0;
    const todayRevenue = revenueByDay.length > 0 ? revenueByDay[revenueByDay.length - 1]?.revenue || stats.revenue.today : stats.revenue.today;
    const revenueChange = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : 0;

    // Calculate completion percentage
    const completionPercentage = stats.orders.total > 0 
        ? (stats.orders.completed / stats.orders.total) * 100 
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold ">Dashboard</h1>
                    <p className="">Monitor orders, revenue, and manage your food business efficiently.</p>
                </div>

                {/* Summary Cards - Top Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Orders */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-green-100 text-sm">Total Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-2">{stats.orders.total}</div>
                            <div className="flex items-center gap-1 text-green-100 text-sm">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>{stats.orders.today} orders today</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Orders */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Completed Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-2">{stats.orders.completed}</div>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>Increased from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Orders */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Pending Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-2">{stats.orders.pending}</div>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>Requires attention</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Revenue */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Total Revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-2">{formatCurrency(stats.revenue.total)}</div>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>{formatCurrency(stats.revenue.month)} this month</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Revenue Analytics */}
                    <Card className="lg:col-span-2 border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Revenue Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-end justify-between gap-2 h-48">
                                    {revenueByDay.length > 0 ? (
                                        revenueByDay.map((day, index) => {
                                            const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue));
                                            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                                            const isHighest = day.revenue === maxRevenue;
                                            
                                            return (
                                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                                    <div className="relative w-full h-full flex items-end group">
                                                        <div
                                                            className={`w-full rounded-t transition-all cursor-pointer ${
                                                                isHighest 
                                                                    ? 'bg-green-500' 
                                                                    : 'bg-green-200 hover:bg-green-300'
                                                            }`}
                                                            style={{ height: `${Math.max(height, 5)}%` }}
                                                            title={`${formatCurrency(day.revenue)} - ${day.orders} orders`}
                                                        />
                                                        {isHighest && (
                                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-green-600">
                                                                {formatCurrency(day.revenue)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-center font-medium">
                                                        {formatDate(day.date).split(' ')[0]}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No data available
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">{formatCurrency(stats.revenue.today)}</span> today
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        {revenueChange >= 0 ? (
                                            <>
                                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                <span className="text-green-600 font-medium">{Math.abs(revenueChange).toFixed(1)}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                                                <span className="text-red-600 font-medium">{Math.abs(revenueChange).toFixed(1)}%</span>
                                            </>
                                        )}
                                        <span className="text-gray-500">from yesterday</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Progress */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Order Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="relative w-40 h-40">
                                    <svg className="transform -rotate-90 w-40 h-40">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            className="text-gray-200"
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 70}`}
                                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionPercentage / 100)}`}
                                            className="text-green-500 transition-all"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-3xl font-bold">{completionPercentage.toFixed(0)}%</div>
                                        <div className="text-xs">Completed</div>
                                    </div>
                                </div>
                                <div className="space-y-2 w-full">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-gray-600">Completed</span>
                                        </div>
                                        <span className="font-semibold">{stats.orders.completed}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="text-gray-600">Pending</span>
                                        </div>
                                        <span className="font-semibold">{stats.orders.pending}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                            <span className="text-gray-600">In Progress</span>
                                        </div>
                                        <span className="font-semibold">
                                            {stats.orders.total - stats.orders.completed - stats.orders.pending}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card className="lg:col-span-2 border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                                <CardDescription>Latest order activity</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">View All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No orders yet</p>
                                    </div>
                                ) : (
                                    recentOrders.map((order) => {
                                        const statusColor = statusColors[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
                                        return (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-3 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`p-2 rounded-lg ${statusColor.bg}`}>
                                                        <ShoppingCart className={`h-4 w-4 ${statusColor.text}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold">{order.order_number}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {order.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {order.customer_name} • {formatDate(order.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="text-sm font-semibold">{formatCurrency(order.total)}</div>
                                                        <Badge className={`${statusColor.bg} ${statusColor.text} border-0 text-xs`}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Selling Items */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Top Selling Items</CardTitle>
                            <CardDescription>Best performing foods</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topSellingItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No sales data yet</p>
                                    </div>
                                ) : (
                                    topSellingItems.map((item, index) => (
                                        <div
                                            key={item.food_name}
                                            className="flex items-center justify-between p-3 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold truncate">{item.food_name}</div>
                                                    <div className="text-xs text-gray-500">{item.total_quantity} sold</div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(item.total_revenue)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Status Breakdown */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
                            <CardDescription>Breakdown by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(orderStatusBreakdown).map(([status, count]) => {
                                    const statusColor = statusColors[status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
                                    const percentage = stats.orders.total > 0 ? (count / stats.orders.total) * 100 : 0;
                                    return (
                                        <div key={status} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${statusColor.bg.replace('50', '500')}`}></div>
                                                    <span className="font-medium capitalize">{status}</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">{count}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${statusColor.bg.replace('50', '500')} rounded-full transition-all`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Foods by Category */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Foods by Category</CardTitle>
                            <CardDescription>Inventory breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(stats.foods.by_category).map(([category, count]) => {
                                    const percentage = stats.foods.total > 0 ? (count / stats.foods.total) * 100 : 0;
                                    return (
                                        <div key={category} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{category}</span>
                                                <span className="font-semibold text-gray-900">{count}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-600" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white">
                                            <Users className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm">Total Users</div>
                                            <div className="text-xl font-bold">{stats.users.total}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white">
                                            <ChefHat className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm">Active Foods</div>
                                            <div className="text-xl font-bold">{stats.foods.active}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm">Today's Revenue</div>
                                            <div className="text-xl font-bold">{formatCurrency(stats.revenue.today)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
