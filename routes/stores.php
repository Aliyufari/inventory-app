<?php

use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/stores', [StoreController::class, 'index'])->name('stores.index');
    Route::get('/stores/api', [StoreController::class, 'list'])->name('stores.api');
    Route::post('/stores', [StoreController::class, 'store'])->name('stores.store');
    Route::put('/stores/{store}', [StoreController::class, 'update'])->name('stores.update');
    Route::delete('/stores/{store}', [StoreController::class, 'destroy'])->name('stores.delete');
});
