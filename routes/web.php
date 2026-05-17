<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NetworkController;

// Redirect root to dashboard
Route::get('/', fn() => redirect('/dashboard'));

// Auth
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

// Protected routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/networks', [NetworkController::class, 'index'])->name('networks.index');
    Route::post('/networks', [NetworkController::class, 'store'])->name('networks.store');
    Route::put('/networks/{id}', [NetworkController::class, 'update'])->name('networks.update');
    Route::delete('/networks/{id}', [NetworkController::class, 'destroy'])->name('networks.destroy');
});

