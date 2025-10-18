<?php

use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/customers', [CustomerController::class, 'list'])->name('customers.api');
    Route::get('/customers/search', [CustomerController::class, 'search'])->name('customers.search');
});
