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
    ChartBar,
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
            <div className="flex h-full flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="sm:text-3xl text-2xl font-bold ">Dashboard</h1>
                    <p className="text-sm text-gray-500">Monitor orders, revenue, and manage your food business efficiently.</p>
                </div>

                {/* Summary Cards - Top Row */}
                <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                    {/* Total Orders */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-green-100 text-xs md:text-sm">Total Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{stats.orders.total}</div>
                            <div className="flex items-center gap-1 text-green-100 text-xs md:text-sm">
                                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="truncate">{stats.orders.today} orders today</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Orders */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs md:text-sm">Completed Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{stats.orders.completed}</div>
                            <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="hidden sm:inline">Increased from last month</span>
                                <span className="sm:hidden">Last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Orders */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs md:text-sm">Pending Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{stats.orders.pending}</div>
                            <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="truncate">Requires attention</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Revenue */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs md:text-sm">Total Revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{formatCurrency(stats.revenue.total)}</div>
                            <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="truncate">{formatCurrency(stats.revenue.month)} this month</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Recent Orders */}
                    <Card className="lg:col-span-2 border-0 shadow-sm">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                                    <div className="bg-primary/20 text-primary rounded p-2">
                                        <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                    Recent Orders
                                </CardTitle>
                                <CardDescription className="text-xs md:text-sm">Latest order activity</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 divide-y divide-gray-100">
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
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold truncate">{order.order_number}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {order.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                                            <span className="truncate">{order.customer_name}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span>{formatDate(order.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                                    <div className="text-left sm:text-right">
                                                        <div className="text-sm md:text-base font-semibold">{formatCurrency(order.total)}</div>
                                                        <Badge className={`${statusColor.bg} ${statusColor.text} border-0 text-xs mt-1`}>
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
                            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                                <div className="bg-primary/20 text-primary rounded p-2">
                                    <UtensilsCrossed className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                Top Selling
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm">Best performing foods</CardDescription>
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
                                            className="flex items-center justify-between gap-3 p-3 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                                <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-xs md:text-sm flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold truncate">{item.food_name}</div>
                                                    <div className="text-xs text-gray-500">{item.total_quantity} sold</div>
                                                </div>
                                            </div>
                                            <div className="text-sm md:text-base font-semibold text-gray-900 flex-shrink-0">
                                                {formatCurrency(item.total_revenue)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Foods by Category */}
                    <Card className="border-0 shadow-sm md:col-span-2 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                                <div className="bg-primary/20 text-primary rounded p-2">
                                    <ChefHat className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                Foods by Category
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm">Inventory breakdown</CardDescription>
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
                                                    className="h-full bg-primary rounded-full transition-all"
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
                            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                                <div className="bg-primary/20 text-primary rounded p-2">
                                    <Activity className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-1.5 md:p-2 rounded-lg bg-white">
                                            <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-xs md:text-sm">Total Users</div>
                                            <div className="text-lg md:text-xl font-bold">{stats.users.total}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-1.5 md:p-2 rounded-lg bg-white">
                                            <ChefHat className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-xs md:text-sm">Active Foods</div>
                                            <div className="text-lg md:text-xl font-bold">{stats.foods.active}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-1.5 md:p-2 rounded-lg bg-white">
                                            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-xs md:text-sm">Today's Revenue</div>
                                            <div className="text-lg md:text-xl font-bold">{formatCurrency(stats.revenue.today)}</div>
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
