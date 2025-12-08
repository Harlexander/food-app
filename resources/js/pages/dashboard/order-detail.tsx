import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ShoppingCart,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Package,
    ArrowLeft,
    FileText,
    DollarSign,
} from 'lucide-react';

type OrderDetailProps = {
    order: {
        id: number;
        order_number: string;
        status: string;
        type: string;
        subtotal: number;
        tax: number;
        delivery_fee: number;
        total: number;
        customer_name: string;
        customer_email: string;
        customer_phone: string | null;
        delivery_address: string | null;
        delivery_city: string | null;
        delivery_state: string | null;
        delivery_postal_code: string | null;
        scheduled_date_time: string | null;
        ready_at: string | null;
        notes: string | null;
        admin_notes: string | null;
        created_at: string;
        updated_at: string;
        items: Array<{
            id: number;
            food_name: string;
            size_name: string;
            quantity: number;
            unit_price: number;
            total_price: number;
        }>;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string | null;
        } | null;
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

export default function OrderDetailPage({ order }: OrderDetailProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusColor = statusColors[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600' };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: dashboard().url },
            { title: 'Orders', href: '/dashboard/orders' },
            { title: order.order_number, href: `/dashboard/orders/${order.id}` },
        ]}>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/orders">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Orders
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Order Details</h1>
                            <p className="text-gray-600">{order.order_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={`${statusColor.bg} ${statusColor.text} border-0 text-sm px-3 py-1`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={`${typeColors[order.type]} text-sm px-3 py-1`}>
                            {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                   <div className="bg-primary/20 text-primary rounded p-2">
                                    <Package className="h-5 w-5" />
                                   </div>   
                                    Order Items
                                </CardTitle>
                                <CardDescription>{order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
                                        >
                                            <div className="flex-1">
                                                <div className="font-semibold">{item.food_name}</div>
                                                <div className="text-sm text-gray-600">
                                                    Size: {item.size_name} • Quantity: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">{formatCurrency(item.total_price)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {formatCurrency(item.unit_price)} each
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Information */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="bg-primary/20 text-primary rounded p-2">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    Order Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Order Number</div>
                                        <div className="font-semibold">{order.order_number}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Order Type</div>
                                        <div>
                                            <Badge variant="outline" className={typeColors[order.type]}>
                                                {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Placed On</div>
                                        <div className="font-semibold">{formatDateTime(order.created_at)}</div>
                                    </div>
                                    {order.scheduled_date_time && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Scheduled For</div>
                                            <div className="font-semibold">{formatDateTime(order.scheduled_date_time)}</div>
                                        </div>
                                    )}
                                    {order.ready_at && (
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Ready At</div>
                                            <div className="font-semibold">{formatDateTime(order.ready_at)}</div>
                                        </div>
                                    )}
                                </div>
                                {order.notes && (
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Customer Notes</div>
                                        <div className="p-3 bg-gray-50 rounded-lg text-sm">{order.notes}</div>
                                    </div>
                                )}
                                {order.admin_notes && (
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Admin Notes</div>
                                        <div className="p-3 bg-blue-50 rounded-lg text-sm">{order.admin_notes}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="bg-primary/20 text-primary rounded p-2">
                                        <User className="h-5 w-5" />
                                    </div>
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <User className="h-4 w-4" />
                                        Name
                                    </div>
                                    <div className="font-semibold">{order.customer_name}</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </div>
                                    <div className="font-semibold">{order.customer_email}</div>
                                </div>
                                {order.customer_phone && (
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Phone className="h-4 w-4" />
                                            Phone
                                        </div>
                                        <div className="font-semibold">{order.customer_phone}</div>
                                    </div>
                                )}
                                {order.user && (
                                    <div className="pt-4 border-t">
                                        <div className="text-xs text-gray-500 mb-2">Registered User</div>
                                        <div className="text-sm">
                                            <div className="font-medium">{order.user.name}</div>
                                            <div className="text-gray-600">{order.user.email}</div>
                                            {order.user.phone && (
                                                <div className="text-gray-600">{order.user.phone}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delivery Information */}
                        {order.type === 'delivery' && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <div className="bg-primary/20 text-primary rounded p-2">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        Delivery Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {order.delivery_address ? (
                                        <div className="space-y-2 text-sm">
                                            <div className="font-semibold">{order.delivery_address}</div>
                                            {(order.delivery_city || order.delivery_state || order.delivery_postal_code) && (
                                                <div className="text-gray-600">
                                                    {[order.delivery_city, order.delivery_state, order.delivery_postal_code]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No address provided</div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Summary */}
                        <Card className="border-0 shadow-sm bg-primary/20">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="bg-primary/20 text-primary rounded p-2">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold">{formatCurrency(order.tax)}</span>
                                </div>
                                {order.delivery_fee > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-semibold">{formatCurrency(order.delivery_fee)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-2xl font-bold text-green-600">{formatCurrency(order.total)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}



