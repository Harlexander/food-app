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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('food_id')->constrained('foods')->onDelete('restrict');
            $table->string('food_name'); // Snapshot of food name at time of order
            $table->string('size_name'); // Portion size name (e.g., "Large Cooler", "Full Pan")
            $table->integer('quantity'); // Quantity ordered
            $table->decimal('unit_price', 10, 2); // Price per unit at time of order (snapshot)
            $table->decimal('total_price', 10, 2); // Total price for this line item (quantity * unit_price)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
