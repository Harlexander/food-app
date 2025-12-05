<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('order_number')->unique(); // Unique order reference/tracking number
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'ready',
                'completed',
                'cancelled'
            ])->default('pending');
            $table->enum('type', [
                'pickup',
                'delivery',
                'reservation'
            ])->default('pickup');
            
            // Pricing
            $table->decimal('subtotal', 10, 2); // Total before tax/fees
            $table->decimal('tax', 10, 2)->default(0); // Tax amount
            $table->decimal('delivery_fee', 10, 2)->default(0); // Delivery fee if applicable
            $table->decimal('total', 10, 2); // Final total amount
            
            // Contact information
            $table->string('customer_name'); // Name for the order (may differ from user)
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            
            // Delivery/Address information
            $table->text('delivery_address')->nullable(); // Full delivery address
            $table->string('delivery_city')->nullable();
            $table->string('delivery_state')->nullable();
            $table->string('delivery_postal_code')->nullable();
            
            // Scheduling for reservations/advance orders
            $table->dateTime('scheduled_date_time')->nullable(); // When order should be ready/picked up
            $table->dateTime('ready_at')->nullable(); // When order was marked as ready
            
            // Additional information
            $table->text('notes')->nullable(); // Special instructions, dietary requirements, etc.
            $table->text('admin_notes')->nullable(); // Internal notes for staff
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
