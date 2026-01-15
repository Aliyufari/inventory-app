<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/users.php';
require __DIR__ . '/stores.php';
require __DIR__ . '/categories.php';
require __DIR__ . '/products.php';
require __DIR__ . '/sales.php';
require __DIR__ . '/inventories.php';
require __DIR__ . '/customers.php';
require __DIR__ . '/reports.php';
