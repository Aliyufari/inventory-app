<?php

use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/customers', [CustomerController::class, 'search'])->name('customers.search');
    Route::get('/customers/api', [CustomerController::class, 'list'])->name('customers.api');
});
