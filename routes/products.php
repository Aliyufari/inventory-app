<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth')->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/api', [ProductController::class, 'list'])->name('products.api');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::get('/products/{product}', [ProductController::class, 'destroy'])->name('products.delete');
});
