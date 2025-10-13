<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth')->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/api', [ProductController::class, 'list'])->name('products.api');
    Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.delete');
    Route::get('/products/{product}/price', [ProductController::class, 'price'])->name('products.price');
});
