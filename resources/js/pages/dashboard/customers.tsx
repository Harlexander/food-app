import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    User,
    Mail,
    Phone,
    MapPin,
    ShoppingCart,
    DollarSign,
    Calendar,
    Search,
    Filter,
    ArrowRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Customers',
        href: '/dashboard/customers',
    },
];

type CustomersPageProps = {
    customers: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            phone: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            postal_code: string | null;
            orders_count: number;
            total_spent: number;
            last_order_date: string | null;
            created_at: string;
        }>;
        links: any;
        meta: any;
    };
    stats: {
        total: number;
        with_orders: number;
        without_orders: number;
        total_spent: number;
    };
    filters: {
        search: string;
        has_orders: string;
    };
};

export default function CustomersPage({ customers, stats, filters }: CustomersPageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const [searchValue, setSearchValue] = React.useState(filters.search || '');

    const handleFilterChange = (key: string, value: string) => {
        router.get('/dashboard/customers', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', searchValue);
    };

    const clearSearch = () => {
        setSearchValue('');
        handleFilterChange('search', '');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">Customers</h1>
                    <p>Manage and view all customer information</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Total Customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">With Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.with_orders}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">No Orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-400">{stats.without_orders}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-sm">Total Revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{formatCurrency(stats.total_spent)}</div>
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
                            <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                            className="pl-10"
                                        />
                                        {searchValue && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <Button type="submit" variant="outline">
                                        Search
                                    </Button>
                                </div>
                            </form>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-sm font-medium mb-2 block">Order Status</label>
                                <Select
                                    value={filters.has_orders}
                                    onValueChange={(value) => handleFilterChange('has_orders', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Customers</SelectItem>
                                        <SelectItem value="yes">With Orders ({stats.with_orders})</SelectItem>
                                        <SelectItem value="no">No Orders ({stats.without_orders})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customers List */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Customer List</CardTitle>
                        <CardDescription>
                            {customers.data.length} {customers.data.length === 1 ? 'customer' : 'customers'} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customers.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No customers found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {customers.data.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="p-3 rounded-lg bg-green-50">
                                                <User className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold">{customer.name}</span>
                                                    {customer.orders_count > 0 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {customer.orders_count} {customer.orders_count === 1 ? 'order' : 'orders'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{customer.email}</span>
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{customer.phone}</span>
                                                        </div>
                                                    )}
                                                    {(customer.address || customer.city) && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>
                                                                {[customer.address, customer.city, customer.state]
                                                                    .filter(Boolean)
                                                                    .join(', ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Joined: {formatDate(customer.created_at)}</span>
                                                    </div>
                                                    {customer.last_order_date && (
                                                        <div className="flex items-center gap-1">
                                                            <ShoppingCart className="h-3 w-3" />
                                                            <span>Last order: {formatDate(customer.last_order_date)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {customer.orders_count > 0 ? (
                                                    <>
                                                        <div className="text-lg font-bold">
                                                            {formatCurrency(customer.total_spent)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Total spent</div>
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-gray-400">No orders yet</div>
                                                )}
                                            </div>
                                            {customer.orders_count > 0 && (
                                                <Link href={`/dashboard/orders?search=${encodeURIComponent(customer.email)}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        View Orders
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {customers.links && customers.links.length > 3 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {customers.links.map((link: any, index: number) => (
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

