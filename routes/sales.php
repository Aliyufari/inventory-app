<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SaleController;

Route::middleware('auth')->group(function () {
    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    // Route::put('/sales/{sale}', [SaleController::class, 'update'])->name('sales.update');
    // Route::delete('/sales/{sale}', [SaleController::class, 'destroy'])->name('sales.destroy');
});
