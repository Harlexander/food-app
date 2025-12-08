<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #A67C5B;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .order-info {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .order-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .order-item:last-child {
            border-bottom: none;
        }
        .total {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        .highlight {
            color: #A67C5B;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://veronica.pevent.fun/wp-content/uploads/2025/11/Layer1.webp" alt="Logo" class="w-24 h-24 mx-auto mb-4">
        <h1>Order Confirmation</h1>
    </div>
    
    <div class="content">
        <p>Dear {{ $order->customer_name }},</p>
        
        <p>Thank you for your order! We have received your order and are processing it now.</p>
        
        <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> <span class="highlight">{{ $order->order_number }}</span></p>
            <p><strong>Order Type:</strong> {{ ucfirst($order->type) }}</p>
            <p><strong>Order Date:</strong> {{ $order->created_at->format('F d, Y \a\t g:i A') }}</p>
            
            @if($order->scheduled_date_time)
            <p><strong>Scheduled Date/Time:</strong> {{ $order->scheduled_date_time->format('F d, Y \a\t g:i A') }}</p>
            @endif
        </div>
        
        <div class="order-info">
            <h2>Order Items</h2>
            @foreach($order->items as $item)
            <div class="order-item">
                <strong>{{ $item->food_name }}</strong> ({{ $item->size_name }})<br>
                Quantity: {{ $item->quantity }} × ${{ number_format($item->unit_price, 2) }} = ${{ number_format($item->total_price, 2) }}
            </div>
            @endforeach
        </div>
        
        <div class="total">
            <p><strong>Subtotal:</strong> ${{ number_format($order->subtotal, 2) }}</p>
            <p><strong>Tax:</strong> ${{ number_format($order->tax, 2) }}</p>
            @if($order->delivery_fee > 0)
            <p><strong>Delivery Fee:</strong> ${{ number_format($order->delivery_fee, 2) }}</p>
            @endif
            <p style="font-size: 18px; margin-top: 10px;"><strong>Total:</strong> <span class="highlight">${{ number_format($order->total, 2) }}</span></p>
        </div>
        
        @if($order->type === 'delivery' && $order->delivery_address)
        <div class="order-info">
            <h2>Delivery Address</h2>
            <p>
                {{ $order->delivery_address }}<br>
                @if($order->delivery_city){{ $order->delivery_city }}, @endif
                @if($order->delivery_state){{ $order->delivery_state }} @endif
                @if($order->delivery_postal_code){{ $order->delivery_postal_code }}@endif
            </p>
        </div>
        @endif
        
        @if($order->notes)
        <div class="order-info">
            <h2>Special Notes</h2>
            <p>{{ $order->notes }}</p>
        </div>
        @endif
        
        <p style="margin-top: 30px;">We will contact you shortly to confirm the details and provide updates on your order. You can expect to hear from us within 15 minutes.</p>
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Thank you for choosing us!</p>
    </div>
    
    <div class="footer">
        <p>This is an automated confirmation email. Please do not reply to this email.</p>
    </div>
</body>
</html>


