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
        Schema::create('food_portion_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('food_id')->constrained('foods')->onDelete('cascade');
            $table->string('size_name'); // e.g., "Large Cooler", "Small Cooler", "Full Pan", etc.
            $table->decimal('price', 10, 2); // Price with 2 decimal places
            $table->integer('sort_order')->default(0); // For ordering portion sizes
            $table->timestamps();
            
            // Prevent duplicate size names for the same food
            $table->unique(['food_id', 'size_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_portion_sizes');
    }
};
