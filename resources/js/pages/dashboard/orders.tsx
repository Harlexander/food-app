import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ShoppingCart,
    Clock,
    CheckCircle,
    Package,
    ArrowRight,
    Filter,
    Search,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Orders',
        href: '/dashboard/orders',
    },
];

type OrdersPageProps = {
    orders: {
        data: Array<{
            id: number;
            order_number: string;
            customer_name: string;
            customer_email: string;
            customer_phone: string | null;
            status: string;
            type: string;
            subtotal: number;
            tax: number;
            delivery_fee: number;
            total: number;
            items_count: number;
            created_at: string;
            scheduled_date_time: string | null;
        }>;
        links: any;
        meta: any;
    };
    statusCounts: Record<string, number>;
    filters: {
        status: string;
        type: string;
    };
};

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-600' },
    preparing: { bg: 'bg-purple-50', text: 'text-purple-600' },
    ready: { bg: 'bg-green-50', text: 'text-green-600' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-600' },
};

const typeColors: Record<string, string> = {
    pickup: 'bg-orange-100 text-orange-700',
    delivery: 'bg-blue-100 text-blue-700',
    reservation: 'bg-purple-100 text-purple-700',
};

export default function OrdersPage({ orders, statusCounts, filters }: OrdersPageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/dashboard/orders', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p>Manage and track all customer orders</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Total Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{statusCounts.all}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Pending</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Preparing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">{statusCounts.preparing}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Completed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">{statusCounts.completed}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-sm font-medium mb-2 block">Status</label>
                                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                                        <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                                        <SelectItem value="confirmed">Confirmed ({statusCounts.confirmed})</SelectItem>
                                        <SelectItem value="preparing">Preparing ({statusCounts.preparing})</SelectItem>
                                        <SelectItem value="ready">Ready ({statusCounts.ready})</SelectItem>
                                        <SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
                                        <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-sm font-medium mb-2 block">Type</label>
                                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="pickup">Pickup</SelectItem>
                                        <SelectItem value="delivery">Delivery</SelectItem>
                                        <SelectItem value="reservation">Reservation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders List */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Order List</CardTitle>
                        <CardDescription>
                            {orders.data.length} {orders.data.length === 1 ? 'order' : 'orders'} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No orders found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.data.map((order) => {
                                    const statusColor = statusColors[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
                                    return (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`p-3 rounded-lg ${statusColor.bg}`}>
                                                    <ShoppingCart className={`h-5 w-5 ${statusColor.text}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-semibold">{order.order_number}</span>
                                                        <Badge className={`${statusColor.bg} ${statusColor.text} border-0`}>
                                                            {order.status}
                                                        </Badge>
                                                        <Badge variant="outline" className={typeColors[order.type]}>
                                                            {order.type}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {order.customer_name} • {order.items_count} {order.items_count === 1 ? 'item' : 'items'} • {formatDate(order.created_at)}
                                                    </div>
                                                    {order.customer_phone && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            📞 {order.customer_phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">{formatCurrency(order.total)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatCurrency(order.subtotal)} + {formatCurrency(order.tax)} tax
                                                        {order.delivery_fee > 0 && ` + ${formatCurrency(order.delivery_fee)} delivery`}
                                                    </div>
                                                </div>
                                                <Link href={`/dashboard/orders/${order.id}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        View More
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.links && orders.links.length > 3 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {orders.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-md text-sm ${
                                            link.active
                                                ? 'bg-green-500 text-white'
                                                : link.url
                                                ? 'bg-gray-100 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


