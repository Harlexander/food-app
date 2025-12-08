import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="sm:text-3xl text-2xl font-bold">Orders</h1>
                    <p className="text-sm text-gray-500">Manage and track all customer orders</p>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
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
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No orders found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {orders.data.map((order) => {
                                    const statusColor = 'bg-primary';
                                    return (
                                        <Link
                                            key={order.id}
                                            href={`/dashboard/orders/${order.id}`}
                                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                                                <div className="bg-primary/20 text-primary rounded p-2 flex-shrink-0">
                                                    <ShoppingCart className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="text-sm md:text-base font-semibold truncate">{order.order_number}</span>
                                                        <Badge className={`bg-primary text-white border-0 text-xs`}>
                                                            {order.status}
                                                        </Badge>
                                                        <Badge variant="outline" className={`${typeColors[order.type]} text-xs`}>
                                                            {order.type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                                                        <span className="font-medium truncate">{order.customer_name}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span>{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="text-xs sm:text-sm">{formatDate(order.created_at)}</span>
                                                    </div>
                                                    {order.customer_phone && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            📞 {order.customer_phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end md:flex-col md:items-end gap-2 md:gap-1 flex-shrink-0 md:ml-4">
                                                <div className="text-lg md:text-xl font-bold">{formatCurrency(order.total)}</div>
                                                <div className="text-xs text-gray-500 md:text-right">
                                                    <div className="hidden sm:block">
                                                        {formatCurrency(order.subtotal)} + {formatCurrency(order.tax)} tax
                                                        {order.delivery_fee > 0 && ` + ${formatCurrency(order.delivery_fee)} delivery`}
                                                    </div>
                                                    <div className="sm:hidden">
                                                        <div>{formatCurrency(order.subtotal)} subtotal</div>
                                                        <div>{formatCurrency(order.tax)} tax{order.delivery_fee > 0 && ` + ${formatCurrency(order.delivery_fee)} delivery`}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
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


