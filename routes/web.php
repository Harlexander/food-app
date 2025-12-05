<?php

use App\Http\Controllers\FoodController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;


Route::get('/', [FoodController::class, 'index'])->name('foods.index');

Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/orders', [OrderController::class, 'orders'])->name('dashboard.orders');
    Route::get('/dashboard/orders/{order}', [OrderController::class, 'show'])->name('dashboard.orders.show');
    Route::get('/dashboard/foods', [FoodController::class, 'foods'])->name('dashboard.foods');
    Route::get('/dashboard/foods/create', [FoodController::class, 'create'])->name('dashboard.foods.create');
    Route::post('/dashboard/foods', [FoodController::class, 'store'])->name('dashboard.foods.store');
    Route::put('/dashboard/foods/{food}', [FoodController::class, 'update'])->name('dashboard.foods.update');
    Route::get('/dashboard/customers', [CustomerController::class, 'index'])->name('dashboard.customers');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
