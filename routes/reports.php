<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/sales-reports', [ReportController::class, 'salesReport'])->name('sales.reports');
});
